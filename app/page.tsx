import { content } from "./content";
import { TodayView } from "./components/TodayView";

export default function Home() {
  return <TodayView content={content} />;
}
