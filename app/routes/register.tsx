import bcrypt from "bcryptjs";
import type { ActionFunctionArgs } from "react-router";
import { Form } from "react-router";
import { redirect, useActionData } from "react-router";
import prisma from "~/utils/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    return redirect("/login");
  } catch {
    return { error: "이미 존재하는 이메일입니다." };
  }
};

export default function RegisterPage() {
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
          회원가입
        </h1>

        <Form method="post" className="space-y-5">
          {/* 이메일 입력 */}
          <div>
            <label className="block text-gray-300 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="your-email@email.com"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-gray-300 mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          {/* 닉네임 입력 */}
          <div>
            <label className="block text-gray-300 mb-1">이메일</label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="nickname"
              required
            />
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            className="w-full py-3 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            가입하기
          </button>
        </Form>

        {/* 에러 메시지 */}
        {actionData?.error && (
          <p className="mt-4 text-center text-red-400">{actionData.error}</p>
        )}

        {/* 로그인 링크 */}
        <p className="mt-4 text-center text-gray-400">
          이미 계정이 있나요?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            로그인하기
          </a>
        </p>
      </div>
    </div>
  );
}