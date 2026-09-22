import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const learningRoot = path.join(root, "english-learning");

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return { data: {}, body: raw };
  const end = raw.indexOf("\n---\n", 4);
  if (end < 0) return { data: {}, body: raw };
  const data = {};
  for (const line of raw.slice(4, end).split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    data[key] = value;
  }
  return { data, body: raw.slice(end + 5) };
}

function firstHeading(body) {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Untitled";
}

function section(body, headingPatterns) {
  const lines = body.split("\n");
  let start = -1;
  let level = 0;
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    if (headingPatterns.some((pattern) => pattern.test(match[2]))) {
      start = index + 1;
      level = match[1].length;
      break;
    }
  }
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,3})\s+/);
    if (match && match[1].length <= level) {
      end = index;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}

function orderedItems(value) {
  return value
    .split("\n")
    .map((line) => line.match(/^\d+\.\s+(.+)$/)?.[1]?.trim())
    .filter(Boolean);
}

function field(body, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^- ${escaped}:\\s*(.+)$`, "mi"))?.[1]?.trim() ?? "";
}

function cleanSlug(file) {
  return file.replace(/\.md$/i, "").toLowerCase();
}

function topicLabel(topic, kind) {
  if (kind === "assessment") return "Đánh giá";
  if (kind === "review") return "Ôn tập";
  return { society: "Xã hội", economy: "Kinh tế", life: "Đời sống" }[topic] ?? "Bài đọc";
}

async function readMarkdownFiles(directory) {
  const names = (await readdir(directory)).filter(
    (name) => name.endsWith(".md") && name !== "TEMPLATE.md",
  );
  return Promise.all(
    names.map(async (name) => ({
      name,
      raw: await readFile(path.join(directory, name), "utf8"),
    })),
  );
}

const vocabularyFiles = await readMarkdownFiles(
  path.join(learningRoot, "vocabulary"),
);
const vocabulary = vocabularyFiles.flatMap(({ name, raw }) => {
  const lessonKey = cleanSlug(name).replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const blocks = raw.split(/^##\s+\d+\.\s+/m).slice(1);
  return blocks.map((block, index) => {
    const [termLine, ...rest] = block.split("\n");
    const details = rest.join("\n");
    return {
      id: `${lessonKey}:${index + 1}`,
      lessonKey,
      term: termLine.trim(),
      meaning: field(details, "Nghĩa"),
      collocation: field(details, "Collocation"),
      example: field(details, "Câu ví dụ"),
      sourceStatus: field(details, "Trạng thái") || "new",
    };
  });
});

const answerRaw = await readFile(
  path.join(
    learningRoot,
    "reviews",
    "answer-keys",
    "BASELINE-ASSESSMENT-KEY.md",
  ),
  "utf8",
);
const answerSection = section(answerRaw, [/Tiêu chí chấm/i]);
const baselineAnswers = orderedItems(answerSection);

const baselineRaw = await readFile(
  path.join(learningRoot, "reviews", "BASELINE-ASSESSMENT.md"),
  "utf8",
);
const baselineParsed = parseFrontmatter(baselineRaw);
const baselineQuestions = orderedItems(
  section(baselineParsed.body, [/Câu hỏi/i]),
);
const baselineHints = [
  "Hãy so sánh ý ở đoạn mở đầu với kết luận để xác định mục đích của tác giả.",
  "Quay lại đoạn đầu và tìm các lợi ích được liệt kê cho cả doanh nghiệp lẫn khách hàng.",
  "Tìm câu chứa cụm “without a bank account” và diễn đạt lại bằng lời của bạn.",
  "Đọc hai câu sau cụm “public option” và chú ý nhóm người có nguy cơ bị loại trừ.",
  "Hai phía bất đồng về cách làm, nhưng đều muốn hệ thống thanh toán phục vụ người dùng và doanh nghiệp.",
  "Nhìn vào cụm “being excluded” ngay sau từ cần đoán.",
  "Đặt từ này đối lập với tình huống hệ thống kỹ thuật số không dùng được.",
];

const baseline = {
  slug: "baseline-assessment",
  kind: "assessment",
  title: baselineParsed.data.title || firstHeading(baselineParsed.body),
  displayTitle: "Bài đánh giá đầu vào",
  topic: "assessment",
  topicLabel: "Đánh giá",
  sourceStatus: baselineParsed.data.status || "not-started",
  estimatedMinutes: baselineParsed.data.estimated_minutes || "20-25",
  wordCount: Number(baselineParsed.data.word_count || 0),
  introduction: section(baselineParsed.body, [/Hướng dẫn/i]),
  passageTitle:
    baselineParsed.body.match(/^###\s+(.+)$/m)?.[1]?.trim() ?? "Reading",
  passage: section(baselineParsed.body, [/Bài đọc/i]),
  questions: baselineQuestions.map((text, index) => ({
    id: `q${index + 1}`,
    text,
    hint: baselineHints[index] || "Tìm từ khóa trong câu hỏi rồi quay lại đoạn có cùng ý.",
    answer: baselineAnswers[index] || "",
  })),
  source: null,
  vocabularyIds: [],
  grammar: "",
  conversation: "",
  writingPrompt: "Tóm tắt bài đọc bằng 2–3 câu tiếng Anh.",
};

const journalFiles = await readMarkdownFiles(path.join(learningRoot, "journal"));
const journals = new Map(
  journalFiles.map(({ name, raw }) => [
    cleanSlug(name).replace(/^\d{4}-\d{2}-\d{2}-/, ""),
    section(raw, [/Yêu cầu/i]) || section(raw, [/Bài viết đầu tiên/i]),
  ]),
);

const lessonFiles = await readMarkdownFiles(path.join(learningRoot, "lessons"));
const lessonAnswerFiles = await readMarkdownFiles(
  path.join(learningRoot, "reviews", "answer-keys"),
);
const lessonAnswerKeys = new Map(
  lessonAnswerFiles.map(({ name, raw }) => {
    const key = cleanSlug(name).replace(/-key$/, "");
    return [
      key,
      {
        hints: orderedItems(section(raw, [/Gợi ý/i])),
        answers: orderedItems(section(raw, [/Đáp án/i])),
      },
    ];
  }),
);
const lessons = lessonFiles.map(({ name, raw }) => {
  const parsed = parseFrontmatter(raw);
  const slug = cleanSlug(name);
  const lessonKey = [...new Set(vocabulary.map((item) => item.lessonKey))].find(
    (key) => slug.includes(key),
  );
  const sourceSection = section(parsed.body, [/Nguồn/i]);
  const questions = orderedItems(
    section(parsed.body, [/Kiểm tra hiểu/i]),
  );
  const readingSection = section(parsed.body, [/^(?:\d+\.\s*)?Đọc(?:\s+—.*)?$/i]);
  const adaptedPassageTitle = readingSection.match(/^###\s+(.+)$/m)?.[1]?.trim();
  const passage = adaptedPassageTitle
    ? readingSection.replace(/^[\s\S]*?^###\s+.+\r?\n+/m, "").trim()
    : readingSection;
  const lessonAnswerKey = lessonAnswerKeys.get(slug);
  const genericHints = [
    "Tập trung vào cách lịch làm việc này khác với khung giờ cố định.",
    "Tìm đoạn nói về những thay đổi sau đại dịch và cách làm việc linh hoạt.",
    "Tìm một ví dụ liên quan đến chăm sóc bản thân hoặc gia đình.",
    "Chú ý phần giải thích điều gì xảy ra với ý tưởng khi ta tạm dừng một nhiệm vụ.",
    "Suy nghĩ về việc phối hợp nhóm, khả năng phản hồi và cách đo hiệu suất.",
  ];
  return {
    slug,
    kind: "lesson",
    title: parsed.data.title || firstHeading(parsed.body),
    displayTitle: firstHeading(parsed.body).replace(/^Bài (?:mẫu|học):\s*/i, ""),
    topic: parsed.data.topic || "life",
    topicLabel: topicLabel(parsed.data.topic, "lesson"),
    sourceStatus: parsed.data.status || "not-started",
    estimatedMinutes: parsed.data.estimated_minutes || "20-30",
    wordCount: Number(parsed.data.word_count || 250),
    introduction: section(parsed.body, [/Trước khi đọc/i]),
    passageTitle: adaptedPassageTitle || "Đọc tại nguồn",
    passage,
    questions: questions.map((text, index) => ({
      id: `q${index + 1}`,
      text,
      hint:
        lessonAnswerKey?.hints[index] ||
        genericHints[index] ||
        "Tìm đoạn có từ khóa tương ứng trong bài nguồn.",
      answer: lessonAnswerKey?.answers[index] || "",
    })),
    source: {
      publisher: field(sourceSection, "Nhà xuất bản"),
      originalTitle: field(sourceSection, "Tiêu đề gốc"),
      url: field(sourceSection, "URL"),
      publishedAt: field(sourceSection, "Ngày xuất bản"),
      accessedAt: field(sourceSection, "Ngày truy cập"),
      readingRange: field(sourceSection, "Phạm vi đọc"),
    },
    vocabularyIds: vocabulary
      .filter((item) => item.lessonKey === lessonKey)
      .map((item) => item.id),
    grammar: section(parsed.body, [/Cấu trúc/i]),
    conversation: section(parsed.body, [/Hội thoại/i]),
    writingPrompt:
      journals.get(lessonKey) || section(parsed.body, [/Viết$/i]),
  };
});

const reviewFiles = (await readMarkdownFiles(path.join(learningRoot, "reviews"))).filter(
  ({ name }) => /^\d{4}-\d{2}-\d{2}-.*\.md$/i.test(name),
);
const reviews = reviewFiles.map(({ name, raw }) => {
  const parsed = parseFrontmatter(raw);
  const slug = cleanSlug(name);
  const reviewAnswerKey = lessonAnswerKeys.get(slug);
  const questions = orderedItems(section(parsed.body, [/Câu hỏi/i]));
  return {
    slug,
    kind: "review",
    title: parsed.data.title || firstHeading(parsed.body),
    displayTitle: firstHeading(parsed.body).replace(/^Buổi ôn:\s*/i, ""),
    topic: "review",
    topicLabel: topicLabel("review", "review"),
    sourceStatus: parsed.data.status || "not-started",
    estimatedMinutes: parsed.data.estimated_minutes || "20-25",
    wordCount: Number(parsed.data.word_count || 0),
    introduction: section(parsed.body, [/Hướng dẫn/i]),
    passageTitle: "Nội dung ôn",
    passage: section(parsed.body, [/Nội dung ôn/i]),
    questions: questions.map((text, index) => ({
      id: `q${index + 1}`,
      text,
      hint:
        reviewAnswerKey?.hints[index] ||
        "Hãy nhớ lại ngữ cảnh của bài cũ trước khi mở lại nội dung.",
      answer: reviewAnswerKey?.answers[index] || "",
    })),
    source: null,
    vocabularyIds: [],
    grammar: section(parsed.body, [/Cấu trúc/i]),
    conversation: section(parsed.body, [/Hội thoại/i]),
    writingPrompt: section(parsed.body, [/Viết/i]),
  };
});

const output = {
  generatedAt: new Date().toISOString(),
  lessons: [baseline, ...lessons, ...reviews],
  vocabulary,
};

await mkdir(path.join(root, "app"), { recursive: true });
await writeFile(
  path.join(root, "app", "generated-content.json"),
  `${JSON.stringify(output, null, 2)}\n`,
  "utf8",
);

console.log(
  `Synced ${output.lessons.length} lessons and ${output.vocabulary.length} vocabulary items.`,
);
