import { Database, PaintBucket, Server, Terminal } from "lucide-react";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About | SuperCard" },
    {
      name: "description",
      content:
        "Your Journey는 목표 달성을 위한 학습 관리 플랫폼입니다. 우리의 철학과 개발 배경을 알아보세요.",
    },
  ];
}

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="max-w-4xl rounded-2xl shadow-xl border border-gray-700 p-12 space-y-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))", // 반투명 그라데이션 배경
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // 부드러운 그림자
        }}
      >
        {/* 상단 섹션 */}
        <div className="flex flex-col md:flex-row items-center">
          {/* 자기소개 */}
          <div className="space-y-6 md:w-1/2">
            <h1 className="text-5xl font-semibold text-white font-pretendard tracking-tight">
              안녕하세요! 👋
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed font-pretendard opacity-90">
              저는{" "}
              <span className="font-semibold text-indigo-500">
                한양사이버대학교
              </span>
              <span className="font-semibold text-indigo-500">
                {" "}
                컴퓨터공학부
              </span>{" "}
              4학년입니다. 졸업 프로젝트로{" "}
              <span className="font-semibold text-indigo-500">
                학습 보조 웹 어플리케이션
              </span>
              을 개발하고 있어요. 카드를 작성하고 일정 기간마다 자동으로 복습할
              수 있도록 도와주는 웹어플리케이션입니다.
            </p>

            <h2 className="text-3xl font-semibold text-white font-pretendard tracking-tight">
              🎯 프로젝트 개요
            </h2>
            <p className="text-xl text-gray-300 font-pretendard opacity-90">
              사용자가 카드를 만들고, 일정 기간 반복적으로 학습할 수 있는
              <span className="font-semibold text-indigo-500">
                {" "}
                스마트 학습 관리 웹 서비스
              </span>
              를 만들고 있습니다.
            </p>

            <h3 className="text-2xl font-semibold text-white font-pretendard tracking-tight">
              🛠 구현 기능과 기술 스택
            </h3>
            <ul className="list-disc pl-5 space-y-3 text-gray-300 font-pretendard">
              <li className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-blue-500" />
                <span>Frontend : React + TailwindCSS</span>
              </li>
              <li className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-gray-400" />
                <span>Backend : NodeJS + React router</span>
              </li>
              <li className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-500" />
                <span>Database : SQLite + Prisma</span>
              </li>
              <li className="flex items-center space-x-2">
                <PaintBucket className="w-5 h-5 text-indigo-400" />
                <span>UI Styling : TailwindCSS + Lucide Icons</span>
              </li>
            </ul>
          </div>

          {/* 아바타 이미지 */}
          <div className="flex justify-center md:w-1/2 relative">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 bg-gray-300 rounded-full blur-sm opacity-20"></div>
              <img
                src="/avatar.gif"
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl transition-transform hover:scale-105"
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                This image was generated by DALL·E.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}