import type { Metadata } from "next";
import { content } from "../content";
import { ProgressView } from "../components/ProgressView";

export const metadata: Metadata = { title: "Tiến độ" };

export default function ProgressPage() {
  return <ProgressView content={content} />;
}
