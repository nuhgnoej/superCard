// /app/routes/api/card.tsx
import { redirect } from "react-router";
import { removeCard, updateCard } from "~/utils/card-repo";
import type { Route } from "../+types/about";
import { saveImage } from "~/utils/card-repo";

export async function action({ request, params }: Route.ActionArgs) {
  const id = params.cardId;

  if (request.method === "DELETE") {
    try {
      if (id) {
        await removeCard(Number(id));
      }
    } catch (err) {
      console.error(err);
    }
    return redirect("/cards");
  }

  if (request.method === "PUT") {
    const formData = await request.formData();

    const getOptionalNumber = (value: FormDataEntryValue | null) =>
      value === null || value === "" ? null : Number(value);

    const title = formData.get("title")?.toString() ?? "";
    const content = formData.get("content")?.toString() ?? "";
    const answer = formData.get("answer")?.toString() || null;
    const type = formData.get("type")?.toString() || null;
    const tier = getOptionalNumber(formData.get("tier"));
    const superCard = getOptionalNumber(formData.get("superCard"));
    const reviewCount = getOptionalNumber(formData.get("reviewCount"));
    const box = formData.get("box")?.toString() || null;
    const reviewInterval = formData.get("reviewInterval")?.toString() || null;
    const nextReview = formData.get("nextReview")?.toString() || null;
    const lastReview = formData.get("lastReview")?.toString() || null;

    const file = formData.get("image");
    let image = null;

    if (file instanceof File && file.size > 0) {
      image = await saveImage(file);
    }

    const data = {
      title,
      content,
      tier,
      answer,
      superCard,
      box,
      reviewInterval,
      nextReview,
      lastReview,
      reviewCount,
      image,
      type,
    };

    try {
      if (id) {
        await updateCard(Number(id), data);
      }
    } catch (err) {
      console.error("Error updating card:", err);
    }

    return redirect("/cards");
  }
}