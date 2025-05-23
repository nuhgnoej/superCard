// app/routes/api/cards.ts
import { getSession } from "~/utils/session.server";

import type { LoaderFunctionArgs } from "react-router";
import { getCardsPaginated, getTodayCardsPaginated } from "~/utils/card-repo";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;

  const today = url.searchParams.get("today") === "true";

  let cards;
  if (today === true) {
    cards = await getTodayCardsPaginated(userId, limit, offset);
  } else {
    cards = await getCardsPaginated(userId, limit, offset);
  }
  return cards;
};