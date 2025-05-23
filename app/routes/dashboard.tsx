import {
  AlarmClock,
  Archive,
  BarChart2,
  CalendarCheck,
  Layers,
} from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import {
  getAverageReviewInterval,
  getCardCountByBox,
  getCumulativeReviewTrend,
  getReviewCountByDate,
  getTierDistribution,
} from "~/utils/stat";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from "recharts";
import DashboardSwiper from "~/components/DashboardSwiper";
import type { Route } from "../+types/root";
import NewCardFloatingButton from "~/components/NewCardFloatingButton";
import { Link } from "react-router";
import prisma from "~/utils/db.server";
import { getCardsAll } from "~/utils/card-repo";
import { getCardStats } from "~/utils/getCardStat";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | SuperCard" },
    {
      name: "description",
      content:
        "총 카드 수, 복습 일정, 학습 추이 등 나의 학습 현황을 한눈에 확인하세요.",
    },
  ];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return redirect("/login");
  }

  const cards = await getCardsAll(userId);
  const stats = getCardStats(cards ?? []);
  const reviewTrendData = getReviewCountByDate(cards ?? []);
  const boxData = getCardCountByBox(cards ?? []);

  return {
    name: user.name,
    email: user.email,
    stats,
    reviewTrendData,
    boxData,
    cumulativeTrend: getCumulativeReviewTrend(cards ?? []),
    tierDistribution: getTierDistribution(cards ?? []),
    reviewIntervals: getAverageReviewInterval(cards ?? []),
  };
};

export default function Dashboard() {
  const {
    name,
    email,
    stats,
    reviewTrendData,
    boxData,
    cumulativeTrend,
    tierDistribution,
    reviewIntervals,
  } = useLoaderData<typeof loader>();

  const slides = [
    {
      title: "📅 일별 복습 추이",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reviewTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#60a5fa"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "📦 Box 분포",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={boxData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="box" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="count" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "🧠 누적 복습량",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cumulativeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f472b6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "🏅 티어별 카드 수",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tierDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#60a5fa"
              label={({ name, value }) => `${name}: ${value}`}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: "📈 평균 복습 간격 (Top 10)",
      content: (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={reviewIntervals}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis type="number" stroke="#ccc" unit="일" />
            <YAxis
              type="category"
              dataKey="title"
              stroke="#ccc"
              width={120}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="interval" fill="#facc15" />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-8 transparent">
      <div
        className="max-w-4xl mx-auto rounded-2xl shadow p-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <header className="mb-6 border-b pb-4">
          <h1 className="text-2xl text-white font-bold">📊 Dashboard</h1>
          <Link
            to="/settings"
            className="hover:underline text-white  transition-all"
            title="user profile"
          >
            <p className="text-white">
              환영합니다, {name} ({email})님!
            </p>
          </Link>
        </header>

        <main className="space-y-10">
          {/* 카드 통계 위젯들 */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-4">
              📈 학습 통계
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DashboardCard
                title="총 카드 수"
                value={`${stats.total}개`}
                icon={<Layers size={28} />}
              />
              <DashboardCard
                title="오늘 복습할 카드"
                value={`${stats.todayReviews}개`}
                icon={<AlarmClock size={28} />}
              />
              <DashboardCard
                title="평균 복습 횟수"
                value={`${stats.averageReviewCount.toFixed(1)}회`}
                icon={<BarChart2 size={28} />}
              />
              <DashboardCard
                title="다음 복습 예정"
                value={
                  stats.nextReview ? stats.nextReview.toLocaleDateString() : "-"
                }
                icon={<CalendarCheck size={28} />}
              />
              <DashboardCard
                title="마지막 복습일"
                value={
                  stats.lastReviewed
                    ? stats.lastReviewed.toLocaleDateString()
                    : "-"
                }
                icon={<Archive size={28} />}
              />
            </div>
          </section>

          {/* 박스 분포 */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-4">
              📦 박스 분포
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.entries(stats.boxStats).map(([box, count]) => (
                <DashboardCard
                  key={box}
                  title={`Box ${box}`}
                  value={`${count}개`}
                />
              ))}
            </div>
          </section>

          {/* 🔥 일별 복습 수 그래프 */}
          <section>
            <h2 className="text-white text-lg font-semibold mb-4">
              📅 최근 복습 추이
            </h2>
            <DashboardSwiper slides={slides} />
          </section>
        </main>
      </div>
      <NewCardFloatingButton />
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md border border-white/20 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-300">{title}</h2>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        {icon && <div className="text-white/50">{icon}</div>}
      </div>
    </div>
  );
}