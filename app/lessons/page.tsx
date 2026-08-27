import type { Metadata } from "next";
import { content } from "../content";
import { LessonsView } from "../components/LessonsView";

export const metadata: Metadata = { title: "Bài học" };

export default function LessonsPage() {
  return <LessonsView content={content} />;
}
