// /app/routes/api/card.tsx
import { redirect } from "react-router";
import { removeCard, updateCard } from "~/utils/card-repo";
import type { Route } from "../+types/about";
import { saveImage } from "~/utils/card-repo";

export async function action({ request, params }: Route.ActionArgs) {
  const id = params.cardId;

  function removeUndefined(obj: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined)
    );
  }

  if (request.method === "DELETE") {
    try {
      if (id) {
        await removeCard(Number(id));
        return { response: "ok" };
      }
    } catch (err) {
      console.error(err);
    }
    return;
  }

  if (request.method === "PUT") {
    const isApiRequest = request.headers
      .get("accept")
      ?.includes("application/json");
    if (isApiRequest) {
      // cards.tsx
      const formData = await request.formData();

      const getOptionalNumber = (value: FormDataEntryValue | null) =>
        value === null || value === "" ? null : Number(value);

      const box = getOptionalNumber(formData.get("box"));
      const intervalDays = getOptionalNumber(formData.get("intervalDays"));
      const nextReviewAt = formData.get("nextReviewAt")?.toString() || null;
      const lastReviewAt = formData.get("lastReviewAt")?.toString() || null;
      const reviewCount = getOptionalNumber(formData.get("reviewCount"));

      const data = removeUndefined({
        box,
        intervalDays,
        nextReviewAt,
        lastReviewAt,
        reviewCount,
      });

      try {
        await updateCard(Number(id), data);
      } catch (error) {
        console.error("Error updating card:", error);
        return new Response(JSON.stringify({ ok: false }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // edit.tsx
      const formData = await request.formData();
      const getOptionalNumber = (value: FormDataEntryValue | null) =>
        value === null || value === "" ? null : Number(value);
      const title = formData.get("title")?.toString() ?? "";
      const content = formData.get("content")?.toString() ?? "";
      const answer = formData.get("answer")?.toString() || null;
      const type = formData.get("type")?.toString() || null;
      const tier = getOptionalNumber(formData.get("tier"));
      const superCard = getOptionalNumber(formData.get("superCard"));
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
}
