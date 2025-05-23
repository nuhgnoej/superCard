import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Your Settings | Your Journey" },
    {
      name: "description",
      content:
        "이름, 이메일 등 계정 정보를 확인하고 설정을 변경할 수 있습니다.",
    },
    {
      property: "og:title",
      content: "계정 설정 | Your Journey",
    },
    {
      property: "og:description",
      content: "계정 정보와 알림 설정을 편집해보세요.",
    },
  ];
}

export default function Page() {
  return <div>This is future setting page</div>;
}