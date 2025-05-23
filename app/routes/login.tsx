import { useState } from "react";
import { Form, redirect, useActionData } from "react-router";
import type { Route } from "../+types/root";
import bcrypt from "bcryptjs";
import { sessionStorage } from "~/utils/session.server";
import prisma from "~/utils/db.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  console.log("Login Attempt:", email, '"', password);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    console.log("Login Failed");
    return { error: "이메일 또는 비밀번호가 틀렸습니다." };
  }

  // 세션 생성
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  session.set("userId", user.id);

  console.log("Login Success! Redirecting...");

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
};

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex items-center justify-center">
      <div
        className="p-8 rounded-lg shadow-lg w-96"
        style={{
          background:
            "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          로그인
        </h1>

        <Form method="post" className="space-y-4">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-white">이메일</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="your-email@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-white">비밀번호</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            로그인
          </button>
        </Form>

        {/* 에러 메시지 */}
        {actionData?.error && (
          <p className="mt-4 text-center text-red-400">{actionData.error}</p>
        )}

        {/* 추가 링크 (회원가입 & 비밀번호 찾기) */}
        <div className="mt-6 text-center text-gray-400 space-y-2">
          <p>
            계정이 없으신가요?{" "}
            <a href="/register" className="text-blue-400 hover:underline">
              회원가입
            </a>
          </p>
          <p>
            비밀번호를 잊으셨나요?{" "}
            <a href="/forget" className="text-blue-400 hover:underline">
              비밀번호 찾기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}