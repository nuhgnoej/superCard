// app/routes/index.tsx
import { redirect } from "react-router";

export const loader = async () => {
  return redirect("/home"); // 또는 "/dashboard", "/login" 등
};