import nodemailer from "nodemailer";
import "dotenv/config";

const appUrl =
  process.env.APP_URL ||
  "https://ominous-capybara-5g5x49wj5rgvhpx7w-5173.app.github.dev/";
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

export async function sendResetEmail(to: string, rawToken: string) {
  const resetLink = `${appUrl}/reset-password?token=${rawToken}`;
  console.log(emailPass);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: `"SuperCard Support" <${emailUser}>`,
    to,
    subject: "비밀번호 재설정 안내",
    html: `
      <p>비밀번호를 재설정하려면 아래 링크를 클릭하세요:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>이 링크는 1시간 동안 유효합니다.</p>
    `,
  });

  return resetLink;
}
