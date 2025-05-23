// utils/stats.ts
import type { Card } from "@prisma/client";
import { format, subDays } from "date-fns";
// import type { Card } from "./card-repo";

export function getAverageReviewInterval(cards: Card[]) {
  return cards
    .filter((card) => card.reviewCount > 1 && card.startDate && card.lastReview)
    .map((card) => {
      const interval =
        (new Date(card.lastReview!).getTime() -
          new Date(card.startDate!).getTime()) /
        (1000 * 60 * 60 * 24) /
        (card.reviewCount - 1);

      return {
        title:
          card.title.length > 15 ? card.title.slice(0, 15) + "…" : card.title,
        interval: Number(interval.toFixed(1)),
      };
    })
    .sort((a, b) => b.interval - a.interval)
    .slice(0, 10); // 평균 간격 높은 카드 Top 10
}

export function getTierDistribution(cards: Card[]) {
  const tierMap: Record<string, number> = {};

  cards.forEach((card) => {
    const tier = card.tier || "Unrated";
    tierMap[tier] = (tierMap[tier] || 0) + 1;
  });

  return Object.entries(tierMap).map(([tier, count]) => ({
    name: tier,
    value: count,
  }));
}

export function getCumulativeReviewTrend(cards: Card[]) {
  const sortedReviews = cards
    .filter((c) => c.lastReview)
    .map((c) => new Date(c.lastReview!))
    .sort((a, b) => a.getTime() - b.getTime());

  const map: Record<string, number> = {};
  let total = 0;

  sortedReviews.forEach((d) => {
    const day = format(d, "yyyy-MM-dd");
    total += 1;
    map[day] = total;
  });

  return Object.entries(map).map(([date, count]) => ({
    date: date.slice(5), // MM-DD 형식
    count,
  }));
}

export function getCardCountByBox(cards: Card[]) {
  const counts = [1, 2, 3, 4, 5].map((box) => ({
    box: `Box ${box}`,
    count: cards.filter((card) => card.box === box).length,
  }));
  return counts;
}

export function getReviewCountByDate(cards: Card[]) {
  const today = new Date();
  const dateMap: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    dateMap[dateStr] = 0;
  }

  cards.forEach((card) => {
    if (card.lastReview) {
      const reviewDate = format(new Date(card.lastReview), "yyyy-MM-dd");
      if (reviewDate in dateMap) {
        dateMap[reviewDate]++;
      }
    }
  });

  return Object.entries(dateMap).map(([date, count]) => ({
    date: date.slice(5), // MM-DD 형식으로
    count,
  }));
}