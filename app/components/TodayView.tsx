"use client";

import Link from "next/link";
import type { ContentData } from "../types";
import { AppShell } from "./AppShell";
import { useLearning } from "./LearningProvider";

function TodayContent({ content }: { content: ContentData }) {
  const { ready, state } = useLearning();
  const selected =
    content.lessons.find(
      (lesson) => state.lessons[lesson.slug]?.status === "in-progress",
    ) ??
    content.lessons.find(
      (lesson) => state.lessons[lesson.slug]?.status !== "completed",
    ) ??
    content.lessons[0];
  const completed = content.lessons.filter(
    (lesson) => state.lessons[lesson.slug]?.status === "completed",
  ).length;
  const progress = content.lessons.length
    ? Math.round((completed / content.lessons.length) * 100)
    : 0;

  return (
    <div className="page-wrap dashboard-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">Buổi học tối nay</span>
          <h1>Chào buổi tối.</h1>
          <p>Một bài đọc ngắn, một bước tiến vừa đủ.</p>
        </div>
        <div className="date-card" aria-label="Thời lượng buổi học">
          <span>Thời lượng</span>
          <strong>{selected.estimatedMinutes} phút</strong>
        </div>
      </header>

      <section className="hero-study-card">
        <div className="hero-copy">
          <div className="chip-row">
            <span className="chip accent">{selected.topicLabel}</span>
            <span className="chip">{selected.wordCount || "150–300"} từ</span>
          </div>
          <p className="hero-kicker">
            {selected.kind === "assessment" ? "BƯỚC KHỞI ĐẦU" : "BÀI ĐỌC TIẾP THEO"}
          </p>
          <h2>{selected.displayTitle}</h2>
          <p>
            {selected.kind === "assessment"
              ? "Tạo đường cơ sở để những bài sau vừa sức, không quá dễ và cũng không quá tải."
              : "Đọc một lượt không dùng từ điển, sau đó trả lời bằng lời của chính bạn."}
          </p>
          <Link className="primary-button" href={`/lessons/${selected.slug}`}>
            {state.lessons[selected.slug]?.status === "in-progress"
              ? "Tiếp tục bài học"
              : "Bắt đầu bài học"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="session-ring" aria-label={`${progress}% lộ trình hiện tại`}>
          <div className="ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
            <span>{ready ? progress : 0}%</span>
            <small>hoàn thành</small>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel plan-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Lộ trình hôm nay</span>
              <h3>Nhịp học nhẹ nhàng</h3>
            </div>
            <span className="muted">20–30 phút</span>
          </div>
          <ol className="study-steps">
            <li><span>01</span><div><strong>Đọc không tra từ</strong><small>5–7 phút</small></div></li>
            <li><span>02</span><div><strong>Kiểm tra hiểu</strong><small>4–5 phút</small></div></li>
            <li><span>03</span><div><strong>Từ vựng & cấu trúc</strong><small>5–7 phút</small></div></li>
            <li><span>04</span><div><strong>Viết & hội thoại</strong><small>5 phút</small></div></li>
          </ol>
        </article>

        <article className="panel quote-panel">
          <span className="quote-mark" aria-hidden="true">“</span>
          <blockquote>
            Small progress is still progress. Tonight, just show up.
          </blockquote>
          <p>Tiến bộ nhỏ vẫn là tiến bộ. Tối nay, chỉ cần bạn bắt đầu.</p>
        </article>
      </section>
    </div>
  );
}

export function TodayView({ content }: { content: ContentData }) {
  return (
    <AppShell active="/">
      <TodayContent content={content} />
    </AppShell>
  );
}
