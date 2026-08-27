import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "../../content";
import { LessonExperience } from "../../components/LessonExperience";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = content.lessons.find((item) => item.slug === slug);
  return { title: lesson?.displayTitle ?? "Bài học" };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = content.lessons.find((item) => item.slug === slug);
  if (!lesson) notFound();
  return <LessonExperience lesson={lesson} vocabulary={content.vocabulary} />;
}
