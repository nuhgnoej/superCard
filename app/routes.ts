import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/home.tsx"),
    route("about", "./routes/about.tsx"),
    route("new", "./routes/new.tsx"),
    route("cards", "./routes/cards.tsx"),
    route("today", "./routes/today.tsx"),
    route("dashboard", "./routes/dashboard.tsx"),
    route("login", "./routes/login.tsx"),
    route("register", "./routes/register.tsx"),
    route("/forget-pasword", "./routes/forget-pasword.tsx"),
    route("card/:cardId", "./routes/cardId.tsx"),
    route("edit/:cardId", "./routes/edit.tsx"),
    route("api/card/:cardId", "./routes/api/card.tsx"),
    route("logout", "./routes/logout.tsx"),
    route("profile", "./routes/profile.tsx"),
    route("cardPage", "./routes/cardPage.tsx"),
    route("api/cards", "./routes/api/card-page.tsx"),
    route("reset-password", "./routes/reset-password.tsx"),
  ]),
] satisfies RouteConfig;
