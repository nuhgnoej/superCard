// app/utils/session.server.ts
import { createCookieSessionStorage } from "react-router";
import prisma from "./db.server";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    secrets: [process.env.SESSION_SECRET || "insecure-default"], // ✅ 환경변수에서 로드
  },
});

// 세션 객체 가져오기
export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

// 세션에서 userId 추출
export async function getUserId(request: Request): Promise<number | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  return typeof userId === "number" ? userId : null;
}

// 세션에서 유저 정보 조회
export async function getUserFromSession(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  return user;
}

export async function getUser(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) return null;

  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
}

// 로그아웃 시 세션 파괴
export async function destroySession(request: Request) {
  const session = await getSession(request);
  return sessionStorage.destroySession(session);
}
