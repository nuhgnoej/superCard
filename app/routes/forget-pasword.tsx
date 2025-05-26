// app/routes/forgot-password.tsx

import type { ActionFunctionArgs } from "react-router";
import { Form } from "react-router";
import { useActionData } from "react-router";
import prisma from "~/utils/db.server";
import { sendResetEmail } from "~/utils/email.server";
import { generateToken, hashToken } from "~/utils/token.server";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Forgot Password | SuperCard" },
    {
      name: "description",
      content: "비밀번호를 초기화하세요.",
    },
  ];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const email = form.get("email") as string;
  const normalizedEmail = email.trim().toLowerCase() as string;

  console.log("inputed email: ", normalizedEmail);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    const rawToken = generateToken();
    const hashed = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        token: hashed,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = await sendResetEmail(user.email, rawToken);
    console.log("📬 이메일 발송됨:", resetLink);
  } else {
    console.log("❌ 해당 이메일로 가입된 계정이 없습니다.");
  }

  // TODO: 실제 이메일 존재 여부 및 발송 로직 구현
  return { message: "이메일이 존재한다면 재설정 링크를 보냈습니다." };
};

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div
      className="max-w-xl mx-auto p-8 mt-10 rounded-xl shadow-xl min-h-[calc(100vh-300px)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2 className="text-3xl font-semibold text-center text-white mb-6">
        비밀번호 재설정
      </h2>
      <p className="text-center text-gray-300 mb-8">
        가입하신 이메일을 입력하시면, 비밀번호 재설정 링크를 보내드립니다.
      </p>

      <Form method="post" className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white mb-1"
          >
            이메일 주소
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="example@email.com"
            className="block w-full px-4 py-3 border border-gray-300 rounded-md text-white bg-gray-800 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out"
        >
          재설정 이메일 보내기
        </button>

        {actionData?.message && (
          <p className="text-green-400 text-center mt-4">
            {actionData.message}
          </p>
        )}
      </Form>
    </div>
  );
}
