"use client";

import { useState } from "react";
import type { ContentData, VocabularyItem } from "../types";
import { AppShell } from "./AppShell";
import { useLearning } from "./LearningProvider";

const statuses = [
  ["new", "Mới"],
  ["learning", "Đang học"],
  ["remembered", "Đã nhớ"],
  ["mastered", "Thành thạo"],
] as const;

function nextReview(status: string) {
  const days = { new: 1, learning: 3, remembered: 7, mastered: 28 }[status] ?? 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function VocabularyCard({ item }: { item: VocabularyItem }) {
  const { state, updateVocabulary } = useLearning();
  const [revealed, setRevealed] = useState(false);
  const saved = state.vocabulary[item.id] ?? {};
  const status = saved.status ?? item.sourceStatus ?? "new";

  return (
    <article className={revealed ? "vocab-card revealed" : "vocab-card"}>
      <div className="vocab-topline">
        <span className="status-pill">{statuses.find(([value]) => value === status)?.[1]}</span>
        <button className="text-button" type="button" onClick={() => setRevealed((value) => !value)}>
          {revealed ? "Ẩn nghĩa" : "Lật nghĩa"}
        </button>
      </div>
      <h2>{item.term}</h2>
      {revealed ? (
        <div className="vocab-details">
          <p className="meaning">{item.meaning}</p>
          <dl>
            <div><dt>Đi cùng</dt><dd>{item.collocation}</dd></div>
            <div><dt>Ví dụ</dt><dd>{item.example}</dd></div>
          </dl>
        </div>
      ) : (
        <p className="vocab-prompt">Thử giải thích cụm này trước khi lật nghĩa.</p>
      )}
      <label>
        Câu của tôi
        <input
          type="text"
          placeholder="Write your own sentence…"
          value={saved.example ?? ""}
          onChange={(event) => updateVocabulary(item.id, { example: event.target.value })}
        />
      </label>
      <div className="status-buttons" aria-label={`Trạng thái của ${item.term}`}>
        {statuses.map(([value, label]) => (
          <button
            className={status === value ? "selected" : ""}
            key={value}
            type="button"
            onClick={() => updateVocabulary(item.id, { status: value, nextReview: nextReview(value) })}
          >
            {label}
          </button>
        ))}
      </div>
    </article>
  );
}

function VocabularyContent({ content }: { content: ContentData }) {
  const { state } = useLearning();
  const remembered = content.vocabulary.filter((item) => {
    const status = state.vocabulary[item.id]?.status;
    return status === "remembered" || status === "mastered";
  }).length;

  return (
    <div className="page-wrap">
      <header className="page-header compact">
        <div>
          <span className="eyebrow">Nhớ trong ngữ cảnh</span>
          <h1>Từ vựng</h1>
          <p>Đoán trước, lật nghĩa sau và tự đặt một câu thật của bạn.</p>
        </div>
        <div className="date-card"><span>Đã nhớ</span><strong>{remembered}/{content.vocabulary.length} cụm</strong></div>
      </header>
      <div className="vocabulary-grid">
        {content.vocabulary.map((item) => <VocabularyCard item={item} key={item.id} />)}
      </div>
    </div>
  );
}

export function VocabularyView({ content }: { content: ContentData }) {
  return <AppShell active="/vocabulary"><VocabularyContent content={content} /></AppShell>;
}
