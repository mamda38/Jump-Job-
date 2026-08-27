"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lesson, VocabularyItem } from "../types";
import { AppShell } from "./AppShell";
import type { LessonProgress } from "./LearningProvider";
import { useLearning } from "./LearningProvider";
import { MarkdownBlock } from "./MarkdownBlock";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function buildSubmissionExport(lesson: Lesson, saved: LessonProgress) {
  const ratingLabels = {
    correct: "Đúng ý",
    partial: "Đúng một phần",
    retry: "Cần làm lại",
  } as const;
  const answers = lesson.questions
    .map((question, index) => {
      const answer = saved.answers?.[question.id]?.trim() || "(chưa trả lời)";
      const rating = saved.ratings?.[question.id];
      const selfRating = rating ? `\n\nTự đánh giá: ${ratingLabels[rating]}` : "";
      return `## Câu ${index + 1}\n\n**Câu hỏi:** ${question.text}\n\n**Câu trả lời:** ${answer}${selfRating}`;
    })
    .join("\n\n");

  return `# Bài làm cần gia sư chấm\n\n**Bài:** ${lesson.displayTitle}\n**Thời gian đọc:** ${formatTime(saved.readingSeconds ?? 0)}\n**Mức hiểu tự đánh giá:** ${saved.understanding ?? "—"}%\n**Số lần tra cứu sau lượt đọc đầu:** ${saved.lookups ?? "—"}\n**Trạng thái:** ${saved.status === "completed" ? "Đã hoàn thành" : "Đang làm"}\n\n${answers}\n\n## Phần viết 2–3 câu\n\n${saved.journal?.trim() || "(chưa viết)"}\n\n---\n\nHãy chấm từng câu, giải thích điểm mạnh và lỗi quan trọng. Với câu chưa đúng, hãy gợi ý để tôi tự sửa trước, chưa đưa đáp án ngay. Sau khi tôi sửa xong, hãy cho điểm cuối và cập nhật PROGRESS.md.`;
}

function LessonContent({
  lesson,
  vocabulary,
}: {
  lesson: Lesson;
  vocabulary: VocabularyItem[];
}) {
  const { state, updateLesson } = useLearning();
  const saved = state.lessons[lesson.slug] ?? {};
  const [timerRunning, setTimerRunning] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      updateLesson(lesson.slug, {
        status: "in-progress",
        readingSeconds: (saved.readingSeconds ?? 0) + 1,
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [lesson.slug, saved.readingSeconds, timerRunning, updateLesson]);

  const answeredCount = lesson.questions.filter(
    (question) => saved.answers?.[question.id]?.trim(),
  ).length;
  const canComplete = answeredCount === lesson.questions.length;

  const vocabularyForLesson = useMemo(
    () => vocabulary.filter((item) => lesson.vocabularyIds.includes(item.id)),
    [lesson.vocabularyIds, vocabulary],
  );

  function setAnswer(id: string, value: string) {
    updateLesson(lesson.slug, {
      status: "in-progress",
      answers: { ...saved.answers, [id]: value },
    });
  }

  async function copyForTutor(questionId?: string) {
    const question = lesson.questions.find((item) => item.id === questionId);
    const prompt = question
      ? `Tôi đang học bài “${lesson.displayTitle}”.\n\nCâu hỏi: ${question.text}\nCâu trả lời của tôi: ${saved.answers?.[question.id] || "(chưa trả lời)"}\n\nHãy gợi ý để tôi tự sửa trước, chưa đưa đáp án ngay.`
      : `Tôi vừa học bài “${lesson.displayTitle}”.\n\nPhần viết của tôi:\n${saved.journal || "(chưa viết)"}\n\nHãy nhận xét lỗi quan trọng, gợi ý để tôi tự sửa trước và chưa viết lại toàn bộ ngay.`;
    await navigator.clipboard.writeText(prompt);
    setCopied(questionId ?? "journal");
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function copyFullSubmission() {
    await navigator.clipboard.writeText(buildSubmissionExport(lesson, saved));
    setCopied("submission");
    window.setTimeout(() => setCopied(""), 2200);
  }

  function downloadSubmission() {
    const blob = new Blob([buildSubmissionExport(lesson, saved)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${lesson.slug}-submission.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-wrap lesson-page">
      <Link className="back-link" href="/lessons">← Quay lại bài học</Link>

      <header className="lesson-header">
        <div className="chip-row">
          <span className="chip accent">{lesson.topicLabel}</span>
          <span className="chip">{lesson.wordCount || "150–300"} từ</span>
          <span className="chip">{lesson.estimatedMinutes} phút</span>
        </div>
        <h1>{lesson.displayTitle}</h1>
        <p>
          {lesson.kind === "assessment"
            ? "Đây là điểm xuất phát, không phải một kỳ thi. Hãy làm tự nhiên nhất có thể."
            : "Đọc để hiểu ý, không cần hiểu từng từ."}
        </p>
      </header>

      {lesson.source ? (
        <section className="source-card">
          <div>
            <span className="eyebrow">Bài báo gốc · {lesson.source.publisher}</span>
            <h2>{lesson.source.originalTitle}</h2>
            <p>{lesson.source.readingRange}</p>
            <small>Xuất bản {lesson.source.publishedAt} · Truy cập {lesson.source.accessedAt}</small>
          </div>
          <a className="secondary-button" href={lesson.source.url} target="_blank" rel="noreferrer">
            Mở bài báo ↗
          </a>
        </section>
      ) : null}

      <section className="lesson-section intro-section">
        <div className="section-index">01</div>
        <div>
          <span className="eyebrow">Chuẩn bị</span>
          <h2>Trước khi đọc</h2>
          <MarkdownBlock content={lesson.introduction} />
        </div>
      </section>

      <section className="reading-card">
        <div className="reading-toolbar">
          <div>
            <span className="eyebrow">02 · Đọc</span>
            <h2>{lesson.passageTitle}</h2>
          </div>
          <div className="timer" aria-label="Đồng hồ đọc">
            <strong>{formatTime(saved.readingSeconds ?? 0)}</strong>
            <button type="button" onClick={() => setTimerRunning((value) => !value)}>
              {timerRunning ? "Tạm dừng" : saved.readingSeconds ? "Tiếp tục" : "Bắt đầu giờ"}
            </button>
            {saved.readingSeconds ? (
              <button
                className="quiet-button"
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  updateLesson(lesson.slug, { readingSeconds: 0 });
                }}
              >
                Đặt lại
              </button>
            ) : null}
          </div>
        </div>
        <div className="reading-paper">
          <MarkdownBlock content={lesson.passage} />
        </div>
      </section>

      <section className="questions-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">03 · Hiểu bài</span>
            <h2>Trả lời bằng lời của bạn</h2>
          </div>
          <span className="question-counter">{answeredCount}/{lesson.questions.length}</span>
        </div>

        <div className="question-list">
          {lesson.questions.map((question, index) => {
            const answer = saved.answers?.[question.id] ?? "";
            const hintSeen = saved.hints?.[question.id];
            const answerSeen = saved.revealed?.[question.id];
            return (
              <article className="question-card" key={question.id}>
                <div className="question-title">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{question.text}</h3>
                </div>
                <label className="sr-only" htmlFor={`${lesson.slug}-${question.id}`}>
                  Câu trả lời cho câu {index + 1}
                </label>
                <textarea
                  id={`${lesson.slug}-${question.id}`}
                  placeholder="Viết câu trả lời của bạn…"
                  value={answer}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                />
                <div className="question-actions">
                  <button
                    className="text-button"
                    type="button"
                    disabled={!answer.trim() || Boolean(hintSeen)}
                    onClick={() =>
                      updateLesson(lesson.slug, {
                        status: "in-progress",
                        hints: { ...saved.hints, [question.id]: true },
                      })
                    }
                  >
                    {hintSeen ? "Đã mở gợi ý" : "Xem gợi ý"}
                  </button>
                  <button className="text-button" type="button" onClick={() => copyForTutor(question.id)}>
                    {copied === question.id ? "Đã sao chép" : "Hỏi gia sư"}
                  </button>
                </div>
                {hintSeen ? <div className="hint-box"><strong>Gợi ý</strong><p>{question.hint}</p></div> : null}
                {hintSeen && question.answer && !answerSeen ? (
                  <button
                    className="secondary-button compare-button"
                    type="button"
                    onClick={() =>
                      updateLesson(lesson.slug, {
                        revealed: { ...saved.revealed, [question.id]: true },
                      })
                    }
                  >
                    Xem đáp án để đối chiếu
                  </button>
                ) : null}
                {answerSeen && question.answer ? (
                  <div className="answer-box">
                    <strong>Đáp án hướng dẫn</strong>
                    <p>{question.answer}</p>
                    <div className="rating-row" aria-label="Tự đánh giá câu trả lời">
                      {[
                        ["correct", "Đúng ý"],
                        ["partial", "Đúng một phần"],
                        ["retry", "Cần làm lại"],
                      ].map(([value, label]) => (
                        <button
                          className={saved.ratings?.[question.id] === value ? "selected" : ""}
                          key={value}
                          type="button"
                          onClick={() =>
                            updateLesson(lesson.slug, {
                              ratings: {
                                ...saved.ratings,
                                [question.id]: value as "correct" | "partial" | "retry",
                              },
                            })
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {vocabularyForLesson.length ? (
        <section className="lesson-section">
          <div className="section-index">04</div>
          <div>
            <span className="eyebrow">Từ vựng</span>
            <h2>{vocabularyForLesson.length} cụm trọng tâm</h2>
            <div className="term-preview">
              {vocabularyForLesson.map((item) => <span key={item.id}>{item.term}</span>)}
            </div>
            <Link className="text-link" href="/vocabulary">Luyện các cụm từ →</Link>
          </div>
        </section>
      ) : null}

      {lesson.grammar ? (
        <section className="lesson-section">
          <div className="section-index">05</div>
          <div><span className="eyebrow">Cấu trúc</span><h2>Dùng ngay trong ngữ cảnh</h2><MarkdownBlock content={lesson.grammar} /></div>
        </section>
      ) : null}

      {lesson.conversation ? (
        <section className="lesson-section">
          <div className="section-index">06</div>
          <div><span className="eyebrow">3–5 phút</span><h2>Hội thoại</h2><MarkdownBlock content={lesson.conversation} /></div>
        </section>
      ) : null}

      <section className="journal-card">
        <span className="eyebrow">Viết ngắn</span>
        <h2>Kết lại bằng 2–3 câu</h2>
        <MarkdownBlock content={lesson.writingPrompt} />
        <label className="sr-only" htmlFor={`${lesson.slug}-journal`}>Bài viết ngắn</label>
        <textarea
          id={`${lesson.slug}-journal`}
          placeholder="Write gently. You can revise later…"
          value={saved.journal ?? ""}
          onChange={(event) => updateLesson(lesson.slug, { status: "in-progress", journal: event.target.value })}
        />
        <button className="text-button" type="button" onClick={() => copyForTutor()}>
          {copied === "journal" ? "Đã sao chép" : "Sao chép để hỏi gia sư"}
        </button>
      </section>

      <section className="finish-card">
        <div>
          <span className="eyebrow">Tự đánh giá</span>
          <h2>Bạn hiểu bài khoảng bao nhiêu?</h2>
          <div className="range-row">
            <input
              aria-label="Mức hiểu bài"
              type="range"
              min="0"
              max="100"
              step="5"
              value={saved.understanding ?? 75}
              onChange={(event) => updateLesson(lesson.slug, { understanding: Number(event.target.value) })}
            />
            <strong>{saved.understanding ?? 75}%</strong>
          </div>
          <label className="lookup-field">
            Số lần tra cứu sau lượt đọc đầu
            <input
              type="number"
              min="0"
              value={saved.lookups ?? 0}
              onChange={(event) => updateLesson(lesson.slug, { lookups: Math.max(0, Number(event.target.value)) })}
            />
          </label>
        </div>
        <button
          className="primary-button"
          type="button"
          disabled={!canComplete}
          onClick={() =>
            updateLesson(lesson.slug, {
              status: "completed",
              completedAt: new Date().toISOString(),
            })
          }
        >
          {saved.status === "completed" ? "Đã hoàn thành" : "Hoàn thành bài"}
        </button>
        {!canComplete ? <small>Trả lời đủ {lesson.questions.length} câu để hoàn thành.</small> : null}
      </section>

      <section className="export-card">
        <div className="export-copy">
          <span className="eyebrow">Gửi gia sư chấm</span>
          <h2>Xuất toàn bộ bài làm</h2>
          <p>
            Gồm {answeredCount}/{lesson.questions.length} câu trả lời, thời gian đọc,
            mức hiểu, số lần tra cứu và phần viết ngắn. Đáp án hướng dẫn không được
            đưa vào bản xuất.
          </p>
        </div>
        <div className="export-actions">
          <button
            className="primary-button"
            type="button"
            disabled={answeredCount === 0}
            onClick={copyFullSubmission}
          >
            {copied === "submission" ? "Đã sao chép toàn bộ" : "Sao chép để gửi gia sư"}
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={answeredCount === 0}
            onClick={downloadSubmission}
          >
            Tải file .md
          </button>
        </div>
        <p className="export-status" aria-live="polite">
          {copied === "submission"
            ? "Bài làm đã nằm trong clipboard. Quay lại cuộc trò chuyện và dán vào để được chấm."
            : answeredCount === 0
              ? "Hãy trả lời ít nhất một câu trước khi xuất."
              : "Cách nhanh nhất: sao chép, quay lại Codex và dán vào cuộc trò chuyện."}
        </p>
      </section>
    </div>
  );
}

export function LessonExperience({ lesson, vocabulary }: { lesson: Lesson; vocabulary: VocabularyItem[] }) {
  return (
    <AppShell active="/lessons">
      <LessonContent lesson={lesson} vocabulary={vocabulary} />
    </AppShell>
  );
}
