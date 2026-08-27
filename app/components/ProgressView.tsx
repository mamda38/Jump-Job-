"use client";

import type { ContentData } from "../types";
import { AppShell } from "./AppShell";
import { useLearning } from "./LearningProvider";

function ProgressContent({ content }: { content: ContentData }) {
  const { ready, state } = useLearning();
  const completedLessons = content.lessons.filter(
    (lesson) => state.lessons[lesson.slug]?.status === "completed",
  );
  const totalSeconds = Object.values(state.lessons).reduce(
    (sum, lesson) => sum + (lesson.readingSeconds ?? 0),
    0,
  );
  const understood = Object.values(state.lessons)
    .map((lesson) => lesson.understanding)
    .filter((value): value is number => typeof value === "number");
  const average = understood.length
    ? Math.round(understood.reduce((sum, value) => sum + value, 0) / understood.length)
    : 0;
  const dueVocabulary = content.vocabulary.filter((item) => {
    const due = state.vocabulary[item.id]?.nextReview;
    return due ? new Date(due).getTime() <= Date.now() : false;
  }).length;
  const remembered = content.vocabulary.filter((item) => {
    const status = state.vocabulary[item.id]?.status;
    return status === "remembered" || status === "mastered";
  }).length;

  const metrics = [
    ["Bài hoàn thành", `${completedLessons.length}/${content.lessons.length}`, "Mỗi bài là một bước nhỏ"],
    ["Thời gian đọc", `${Math.floor(totalSeconds / 60)} phút`, "Không tính thời gian trả lời"],
    ["Mức hiểu trung bình", average ? `${average}%` : "—", "Mục tiêu 75–85%"],
    ["Từ đã nhớ", `${remembered}/${content.vocabulary.length}`, `${dueVocabulary} mục đến hạn ôn`],
  ];

  return (
    <div className="page-wrap">
      <header className="page-header compact">
        <div>
          <span className="eyebrow">Nhìn lại để đi tiếp</span>
          <h1>Tiến độ</h1>
          <p>Dữ liệu chỉ được lưu trên trình duyệt của thiết bị này.</p>
        </div>
      </header>

      <div className="metrics-grid">
        {metrics.map(([label, value, note]) => (
          <article className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{ready ? value : "—"}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <section className="panel progress-panel">
        <div className="panel-heading">
          <div><span className="eyebrow">Lịch sử</span><h2>Các bài gần đây</h2></div>
        </div>
        <div className="progress-table" role="table" aria-label="Tiến độ từng bài">
          <div className="progress-row header" role="row">
            <span>Bài học</span><span>Trạng thái</span><span>Hiểu bài</span><span>Tra cứu</span>
          </div>
          {content.lessons.map((lesson) => {
            const item = state.lessons[lesson.slug];
            return (
              <div className="progress-row" role="row" key={lesson.slug}>
                <span><strong>{lesson.displayTitle}</strong><small>{lesson.topicLabel}</small></span>
                <span>{item?.status === "completed" ? "Đã xong" : item?.status === "in-progress" ? "Đang học" : "Chưa học"}</span>
                <span>{typeof item?.understanding === "number" ? `${item.understanding}%` : "—"}</span>
                <span>{typeof item?.lookups === "number" ? item.lookups : "—"}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel local-note">
        <span className="note-icon" aria-hidden="true">⌂</span>
        <div><strong>Riêng tư trên thiết bị</strong><p>Câu trả lời và tiến độ không được gửi tới máy chủ. Hãy dùng nút “Hỏi gia sư” khi bạn chủ động muốn chia sẻ một câu trả lời với Codex.</p></div>
      </section>
    </div>
  );
}

export function ProgressView({ content }: { content: ContentData }) {
  return <AppShell active="/progress"><ProgressContent content={content} /></AppShell>;
}
