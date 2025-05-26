// utils/reviewLogic.ts
export type ReviewResult = "easy" | "good" | "hard" | "fail";

export type ReviewUpdateInput = {
  card: {
    id: number;
    intervalDays: number;
    box: number;
    reviewCount: number;
    easeFactor?: number | null;
  };
  result: ReviewResult;
  today?: Date;
};

export function generateReviewUpdate(input: ReviewUpdateInput): FormData {
  const { card, result } = input;
  const today = input.today || new Date();
  const todayStr = today.toISOString().split("T")[0];

  const scoreMap: Record<ReviewResult, number> = {
    easy: 5,
    good: 4,
    hard: 3,
    fail: 2,
  };
  const score = scoreMap[result];

  const prevEF = card.easeFactor ?? 2.5;
  let easeFactor = prevEF - 0.8 + 0.28 * score - 0.02 * score * score;
  easeFactor = Math.max(1.3, easeFactor);

  let intervalDays: number;
  if (score < 3) {
    intervalDays = 1;
  } else if (card.reviewCount === 0) {
    intervalDays = 1;
  } else if (card.reviewCount === 1) {
    intervalDays = 6;
  } else {
    intervalDays = Math.round(card.intervalDays * easeFactor);
  }

  const nextReview = new Date(today);
  nextReview.setDate(today.getDate() + intervalDays);

  const reviewCount = Number(card.reviewCount) + 1;
  const box =
    score >= 3 ? Number(card.box) + 1 : Math.max(1, Number(card.box) - 1);

  const formData = new FormData();
  formData.append("box", String(box));
  formData.append("intervalDays", String(intervalDays));
  formData.append("easeFactor", String(easeFactor));
  formData.append("nextReviewAt", nextReview.toISOString().split("T")[0]);
  formData.append("lastReviewAt", todayStr);
  formData.append("reviewCount", String(reviewCount));

  return formData;
}
