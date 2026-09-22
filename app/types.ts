export type Question = {
  id: string;
  text: string;
  hint: string;
  answer: string;
};

export type Lesson = {
  slug: string;
  kind: "assessment" | "lesson" | "review";
  title: string;
  displayTitle: string;
  topic: string;
  topicLabel: string;
  sourceStatus: string;
  estimatedMinutes: string;
  wordCount: number;
  introduction: string;
  passageTitle: string;
  passage: string;
  questions: Question[];
  source: null | {
    publisher: string;
    originalTitle: string;
    url: string;
    publishedAt: string;
    accessedAt: string;
    readingRange: string;
  };
  vocabularyIds: string[];
  grammar: string;
  conversation: string;
  writingPrompt: string;
};

export type VocabularyItem = {
  id: string;
  lessonKey: string;
  term: string;
  meaning: string;
  collocation: string;
  example: string;
  sourceStatus: string;
};

export type ContentData = {
  generatedAt: string;
  lessons: Lesson[];
  vocabulary: VocabularyItem[];
};
