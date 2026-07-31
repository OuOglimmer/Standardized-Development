import { DiaryFeed } from "@/components/blog/diary-feed";

export const metadata = {
  title: "日记",
  description: "记录日常思考与生活片段。",
};

export default function DiaryPage() {
  return <DiaryFeed />;
}
