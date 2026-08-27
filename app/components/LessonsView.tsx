"use client";

import Link from "next/link";
import type { ContentData } from "../types";
import { AppShell } from "./AppShell";
import { useLearning } from "./LearningProvider";

function LessonsContent({ content }: { content: ContentData }) {
  const { state } = useLearning();

  return (
    <div className="page-wrap">
      <header className="page-header compact">
        <div>
          <span className="eyebrow">Thư viện nhỏ</span>
          <h1>Bài học</h1>
          <p>Mỗi bài là một buổi tập trung 20–30 phút.</p>
        </div>
      </header>

      <div className="lesson-list">
        {content.lessons.map((lesson, index) => {
          const progress = state.lessons[lesson.slug];
          const status = progress?.status ?? lesson.sourceStatus;
          const answered = Object.values(progress?.answers ?? {}).filter(Boolean).length;
          return (
            <Link className="lesson-card" href={`/lessons/${lesson.slug}`} key={lesson.slug}>
              <span className="lesson-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="lesson-main">
                <div className="chip-row">
                  <span className="chip accent">{lesson.topicLabel}</span>
                  <span className={`status-dot ${status}`}>{statusLabel(status)}</span>
                </div>
                <h2>{lesson.displayTitle}</h2>
                <p>{lesson.questions.length} câu hỏi · {lesson.estimatedMinutes} phút</p>
                {answered > 0 ? (
                  <div className="mini-progress">
                    <span style={{ width: `${(answered / lesson.questions.length) * 100}%` }} />
                  </div>
                ) : null}
              </div>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "completed") return "Đã hoàn thành";
  if (status === "in-progress") return "Đang học";
  return "Chưa bắt đầu";
}

export function LessonsView({ content }: { content: ContentData }) {
  return (
    <AppShell active="/lessons">
      <LessonsContent content={content} />
    </AppShell>
  );
}
