// utils/getCardStats.ts

import type { Card } from "@prisma/client";

export function getCardStats(cards: Card[]) {
  const total = cards.length;
  const today = new Date();

  const todayReviews = cards.filter(
    (card) => new Date(card.nextReviewAt) <= today
  ).length;

  const averageReviewCount =
    total > 0
      ? cards.reduce((acc, card) => acc + (card.reviewCount || 0), 0) / total
      : 0;

  const boxStats: Record<number, number> = {};
  cards.forEach((card) => {
    const currentCardBox = card.box ?? 1;
    boxStats[currentCardBox] = (boxStats[currentCardBox] || 0) + 1;
  });

  const lastReviewed =
    cards.length > 0
      ? new Date(
          Math.max(...cards.map((c) => new Date(c.lastReviewAt).getTime()))
        )
      : null;

  const nextReview =
    cards.length > 0
      ? new Date(
          Math.min(...cards.map((c) => new Date(c.nextReviewAt).getTime()))
        )
      : null;

  return {
    total,
    todayReviews,
    averageReviewCount,
    boxStats,
    lastReviewed,
    nextReview,
  };
}