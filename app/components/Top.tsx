import { Link } from "react-router";
import {
  Home,
  Grid,
  Book,
  Calendar,
  LogIn,
  UserPlus,
  BookOpen,
  Layers,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react"; 
import { Loader2 } from "lucide-react"; 

type TopProps = {
  isLoggedIn: boolean;
  user: {
    id: number;
    name: string | null;
    email: string;
  } | null;
};

export default function Top({ isLoggedIn, user }: TopProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoggingOut(true);

    setTimeout(() => {
      (e.target as HTMLFormElement).submit();
    }, 1500);
  };

  return (
    <div
      className="bg-gray-900 p-4 shadow-md sticky top-0 z-10"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
    >
      <nav className="flex flex-wrap justify-between items-center space-x-4">
        {/* 왼쪽 메뉴 그룹 */}
        <div className="flex space-x-4">
          {/* Home Button */}
          <Link
            to="/"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
          >
            <Home className="w-7 h-7 text-white" />
            <span className="text-white text-2xl font-extrabold leading-tight">
              SuperCard
            </span>
          </Link>

          <Link
            to="/about"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all font-extrabold"
          >
            <BookOpen className="w-5 h-5 text-white" />
            <span className="text-white text-lg">About</span>
          </Link>

          {/* Dashboard Button */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-700 transition-all font-extrabold"
          >
            <Grid className="w-5 h-5 text-white" />
            <span className="text-white text-lg">Dashboard</span>
          </Link>

          {/* New Card Button */}
          {isLoggedIn && (
            <div>
              <Link
                to="/new"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all font-extrabold"
              >
                <Plus className="w-5 h-5 text-white" />
                <span className="text-white text-lg">New Card</span>
              </Link>
            </div>
          )}

          {/* 버튼영역 시작 */}
          {isLoggedIn && (
            <div className="relative group">
              {/* Cards 버튼 */}
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-green-600 transition-all font-extrabold cursor-pointer">
                <Book className="w-5 h-5 text-white" />
                <span className="text-white text-lg whitespace-nowrap">
                  Cards
                </span>
              </div>

              {/* 드롭다운 메뉴 */}
              <div className="absolute top-full left-0 mt-0.5 flex bg-gray-900 px-2 py-1 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap min-w-max">
                <Link
                  to="/cards"
                  className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-green-700 transition-all"
                >
                  <Grid className="w-3 h-3 text-white" />
                  <span className="text-white text-xs">All Cards(Grid)</span>
                </Link>
                <Link
                  to="/today"
                  className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-green-700 transition-all"
                >
                  <Calendar className="w-3 h-3 text-white" />
                  <span className="text-white text-xs">Today</span>
                </Link>
                <Link
                  to="/cardPage"
                  className="flex items-center space-x-1 px-3 py-1 rounded hover:bg-green-700 transition-all"
                >
                  <Layers className="w-3 h-3 text-white" />
                  <span className="text-white text-xs">Card Page</span>
                </Link>
              </div>
            </div>
          )}

          {/* 버튼영역 끝 */}
        </div>

        <div className="flex space-x-4 ml-auto">
          {/* Login Button */}
          <Link
            to="/login"
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-all font-extrabold",
              { hidden: isLoggedIn }
            )}
          >
            <LogIn className="w-5 h-5 text-white" />
            <span className="text-white text-lg">Login</span>
          </Link>

          {/* Sign In Button */}
          <Link
            to="/register"
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-all font-extrabold",
              { hidden: isLoggedIn }
            )}
          >
            <UserPlus className="w-5 h-5 text-white" />
            <span className="text-white text-lg">Sign Up</span>
          </Link>
        </div>

        {/* 로그아웃 버튼 */}
        <div
          className={clsx(
            "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-white font-semibold font-pretendard tracking-tight",
            { hidden: user === null }
          )}
        >
          <Link
            to="/profile"
            className="hover:underline text-white font-semibold transition-all"
            title="user profile"
          >
            <div>환영합니다! {user?.name}님! 👋</div>
          </Link>
        </div>

        <div
          className={clsx(
            "flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-all",
            { hidden: user === null }
          )}
        >
          <form method="post" action="/logout" onSubmit={handleLogout}>
            <button
              className="relative flex items-center justify-center h-10 w-32 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50 font-extrabold"
              type="submit"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Logout
                </>
              )}
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}