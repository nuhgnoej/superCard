// app/routes/reset-password.tsx
import bcrypt from "bcryptjs";
import { Form, useSearchParams, useActionData, type ActionFunctionArgs, redirect } from "react-router";
import prisma from "~/utils/db.server";
import { hashToken } from "~/utils/token.server";

export const loader = () => {
  return null;
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const token = form.get("token") as string;
  const newPassword = form.get("password") as string;

  if (!token || !newPassword) {
    return { error: "입력값이 올바르지 않습니다.", status: 400 };
  }

  const hashed = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashed },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return { error: "토큰이 유효하지 않거나 만료되었습니다.", status: 400 };
  }

  // 비밀번호 해싱 후 저장
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // 토큰 삭제
  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });

  return redirect("/login?reset=success");
};
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const actionData = useActionData() as
    | { error?: string; status?: number }
    | undefined;

  return (
    <div className="max-w-xl mx-auto p-8 mt-10 rounded-xl shadow-xl bg-gray-800 text-white">
      <h2 className="text-2xl font-bold text-center mb-6">비밀번호 재설정</h2>

      {actionData?.error && (
        <p className="text-red-400 text-center mb-4">{actionData.error}</p>
      )}

      <Form method="post" className="space-y-6">
        <input type="hidden" name="token" value={token} />

        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            새 비밀번호
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            placeholder="새 비밀번호"
            className="w-full px-4 py-3 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-400"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md transition"
        >
          비밀번호 변경하기
        </button>
      </Form>
    </div>
  );
}
