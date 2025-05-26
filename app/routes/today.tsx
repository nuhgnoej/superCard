// app/routes/today.tsx

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Today's Cards | SuperCard" },
    {
      name: "description",
      content: "지금까지 만든 모든 학습 카드를 확인하고 관리하세요.",
    },
  ];
}

import CardList from "~/components/CardList";
import type { Route } from "../+types/root";

export default function TodayPage() {
  return (
    <CardList
      fetchUrl={(page) => `/api/cards?page=${page}&limit=10&today=true`}
    />
  );
}
