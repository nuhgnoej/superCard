import type { LoaderFunctionArgs } from "react-router";
import { getUserFromSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUserFromSession(request);
  return {
    isLoggedIn: !!user,
    user, // { id, name, email } 또는 null
  };
};
