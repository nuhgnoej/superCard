import { Outlet } from "react-router";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="flex flex-col">
      <div>
        <main className="transparent flex flex-grow justify-center items-start min-h-[calc(100vh-210px)] mt-4 mb-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}