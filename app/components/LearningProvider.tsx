"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type LessonProgress = {
  status?: "not-started" | "in-progress" | "completed";
  answers?: Record<string, string>;
  hints?: Record<string, boolean>;
  revealed?: Record<string, boolean>;
  ratings?: Record<string, "correct" | "partial" | "retry">;
  readingSeconds?: number;
  understanding?: number;
  lookups?: number;
  journal?: string;
  completedAt?: string;
};

export type VocabularyProgress = {
  status?: "new" | "learning" | "remembered" | "mastered";
  example?: string;
  nextReview?: string;
};

type LearningState = {
  version: 1;
  lessons: Record<string, LessonProgress>;
  vocabulary: Record<string, VocabularyProgress>;
};

type LearningContextValue = {
  ready: boolean;
  state: LearningState;
  updateLesson: (slug: string, patch: Partial<LessonProgress>) => void;
  updateVocabulary: (id: string, patch: Partial<VocabularyProgress>) => void;
  resetAll: () => void;
};

const STORAGE_KEY = "english-learning:v1";
const emptyState: LearningState = { version: 1, lessons: {}, vocabulary: {} };
const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LearningState;
        if (parsed.version === 1) setState(parsed);
      }
    } catch {
      // A malformed local value should never block a study session.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const updateLesson = useCallback(
    (slug: string, patch: Partial<LessonProgress>) => {
      setState((current) => ({
        ...current,
        lessons: {
          ...current.lessons,
          [slug]: { ...current.lessons[slug], ...patch },
        },
      }));
    },
    [],
  );

  const updateVocabulary = useCallback(
    (id: string, patch: Partial<VocabularyProgress>) => {
      setState((current) => ({
        ...current,
        vocabulary: {
          ...current.vocabulary,
          [id]: { ...current.vocabulary[id], ...patch },
        },
      }));
    },
    [],
  );

  const resetAll = useCallback(() => {
    if (!window.confirm("Xóa toàn bộ câu trả lời và tiến độ trên thiết bị này?")) {
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    setState(emptyState);
  }, []);

  const value = useMemo(
    () => ({ ready, state, updateLesson, updateVocabulary, resetAll }),
    [ready, resetAll, state, updateLesson, updateVocabulary],
  );

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) throw new Error("useLearning must be used inside LearningProvider");
  return context;
}
