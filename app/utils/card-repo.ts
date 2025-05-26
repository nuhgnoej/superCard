// app/utils/card-repo.ts
import path from "path";
import fs from "fs";
import prisma from "./db.server";

export type CardProp = {
  title: string;
  content: string;
  answer: string;
  userId: number;
  image?: string;
  type?: string;
  tier?: number;
  box?: number;
  superCardId?: number | null;
  class?: string;
};

type NewCardInput = {
  title: string;
  content: string;
  answer?: string;
  image?: string;
  type?: string;
  tier?: number;
  box?: number;
  superCardId?: number | null;
  class?: string;
  reviewCount?: number;
  intervalDays?: number;
  easeFactor?: number;
  lastReviewAt: string;
  nextReviewAt: string;
  userId: number;
  deckId?: number | null;
};

const now = new Date().toISOString();

export const makeCard = (card: CardProp) => {
  return {
    ...card,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewAt: now,
    lastReviewAt: now,
  };
};

export async function setCard(card: NewCardInput) {
  return await prisma.card.create({
    data: {
      title: card.title,
      content: card.content,
      answer: card.answer ?? "",
      image: card.image ?? null,
      type: card.type ?? null,
      tier: card.tier ?? null,
      box: card.box ?? null,
      superCardId: card.superCardId ?? null,
      class: card.class ?? null,
      reviewCount: card.reviewCount ?? 0,
      intervalDays: card.intervalDays ?? 1,
      easeFactor: card.easeFactor ?? 2.5,
      lastReviewAt: new Date(card.lastReviewAt),
      nextReviewAt: new Date(card.nextReviewAt),
      userId: card.userId,
      deckId: card.deckId ?? null,
    },
  });
}

export async function removeCard(id: number) {
  return await prisma.card.delete({
    where: { id },
  });
}

// export async function updateCard(id: number, data: any) {
//   return await prisma.card.update({
//     where: { id },
//     data: {
//       title: data.title,
//       content: data.content,
//       answer: data.answer ?? "",
//       image: data.image ?? null,
//       type: data.type ?? null,
//       tier: data.tier ?? null,
//       box: data.box ? Number(data.box) : null,
//       superCardId: data.superCard ?? null,
//       reviewCount: data.reviewCount ?? 0,
//       intervalDays: data.reviewInterval
//         ? Number(data.reviewInterval)
//         : 1,
//       easeFactor: 2.5, // optional: 유지 or 계산 로직
//       lastReviewAt: data.lastReview ? new Date(data.lastReview) : new Date(),
//       nextReviewAt: data.nextReview ? new Date(data.nextReview) : new Date(),
//     },
//   });
// }

export async function updateCard(id: number, data: any) {
  const updateData: Record<string, any> = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.answer !== undefined) updateData.answer = data.answer ?? "";
  if (data.image !== undefined) updateData.image = data.image ?? null;
  if (data.type !== undefined) updateData.type = data.type ?? null;
  if (data.tier !== undefined) updateData.tier = data.tier ?? null;
  if (data.box !== undefined) updateData.box = Number(data.box);
  if (data.superCard !== undefined)
    updateData.superCardId = data.superCard ?? null;
  if (data.reviewCount !== undefined)
    updateData.reviewCount = Number(data.reviewCount);
  if (data.intervalDays !== undefined)
    updateData.intervalDays = Number(data.intervalDays);
  if (data.easeFactor !== undefined)
    updateData.easeFactor = Number(data.easeFactor);
  if (data.lastReviewAt !== undefined)
    updateData.lastReviewAt = new Date(data.lastReviewAt);
  if (data.nextReviewAt !== undefined)
    updateData.nextReviewAt = new Date(data.nextReviewAt);

  return await prisma.card.update({
    where: { id },
    data: updateData,
  });
}

export const saveImage = async (file: File): Promise<string> => {
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  const buffer = await file.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));

  return `/uploads/${filename}`;
};

export async function getCardsPaginated(
  userId: number,
  limit: number,
  offset: number
) {
  return prisma.card.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    skip: offset,
    take: limit,
  });
}

export async function getTodayCardsPaginated(
  userId: number,
  limit: number,
  offset: number
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return prisma.card.findMany({
    where: {
      userId,
      nextReviewAt: {
        lt: tomorrow,
      },
    },
    orderBy: { createdAt: "asc" },
    skip: offset,
    take: limit,
  });
}

/**
 * 로그인한 사용자의 모든 카드를 가져옵니다
 * @param userId 로그인한 유저의 ID
 */
export async function getCardsAll(userId: number) {
  return await prisma.card.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCardById(cardId: number, userId: number) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  // 🔒 권한 체크: 현재 로그인한 유저의 카드가 맞는지
  if (card.userId !== userId) {
    throw new Error("Unauthorized access to this card");
  }

  return card;
}
