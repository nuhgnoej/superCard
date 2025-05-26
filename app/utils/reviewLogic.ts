// utils/reviewLogic.ts

export type ReviewUpdateInput = {
  card: {
    id: number;
    intervalDays: number;
    box: number;
    reviewCount: number;
  };
  success: boolean;
  today?: Date;
};

export function generateReviewUpdate(input: ReviewUpdateInput): FormData {
  const { card, success } = input;
  const today = input.today || new Date();
  const todayStr = today.toISOString().split("T")[0];

  const updatedReviewCount = Number(card.reviewCount) + 1;
  const updatedBox = success
    ? Number(card.box) + 1
    : Math.max(1, Number(card.box) - 1);

  const updatedIntervalDays = success
    ? Number(card.intervalDays) + 1
    : Math.max(1, Number(card.intervalDays) - 1);

  const updatedNextReview = new Date(today);
  updatedNextReview.setDate(today.getDate() + updatedIntervalDays);

  const formData = new FormData();
  formData.append("box", String(updatedBox));
  formData.append("intervalDays", String(updatedIntervalDays));
  formData.append(
    "nextReviewAt",
    updatedNextReview.toISOString().split("T")[0]
  );
  formData.append("lastReviewAt", todayStr);
  formData.append("reviewCount", String(updatedReviewCount));

  return formData;
}
