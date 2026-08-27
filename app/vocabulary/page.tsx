import type { Metadata } from "next";
import { content } from "../content";
import { VocabularyView } from "../components/VocabularyView";

export const metadata: Metadata = { title: "Từ vựng" };

export default function VocabularyPage() {
  return <VocabularyView content={content} />;
}
