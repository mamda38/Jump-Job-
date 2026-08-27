import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Night English home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Night English/);
  assert.match(html, /Chào buổi tối/);
  assert.match(html, /Bài đánh giá đầu vào/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("generated content includes lessons and vocabulary without exposing answer-key navigation", async () => {
  const content = JSON.parse(
    await readFile(new URL("../app/generated-content.json", import.meta.url), "utf8"),
  );
  assert.equal(content.lessons.length, 2);
  assert.equal(content.vocabulary.length, 8);
  assert.ok(content.lessons.every((lesson) => !lesson.slug.includes("answer-key")));
  assert.equal(content.lessons[0].questions.length, 7);
  assert.equal(content.lessons[1].source.publisher, "Associated Press (AP)");
});

test("all primary routes render", async () => {
  for (const pathname of ["/lessons", "/vocabulary", "/progress", "/lessons/baseline-assessment"]) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
  }
});

test("local-storage contract and reset confirmation remain explicit", async () => {
  const provider = await readFile(new URL("../app/components/LearningProvider.tsx", import.meta.url), "utf8");
  assert.match(provider, /english-learning:v1/);
  assert.match(provider, /window\.confirm/);
  assert.match(provider, /window\.localStorage/);
});

test("lesson submissions can be copied or downloaded without exporting answer keys", async () => {
  const lesson = await readFile(new URL("../app/components/LessonExperience.tsx", import.meta.url), "utf8");
  assert.match(lesson, /buildSubmissionExport/);
  assert.match(lesson, /Sao chép để gửi gia sư/);
  assert.match(lesson, /Tải file \.md/);
  assert.match(lesson, /application\/octet-stream|text\/markdown/);
  assert.doesNotMatch(lesson, /question\.answer.*buildSubmissionExport/s);
});
