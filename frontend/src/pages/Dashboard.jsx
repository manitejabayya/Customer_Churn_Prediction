import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  FileBarChart2,
  Settings,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  UserCircle,
  Users as UsersIcon,
  TrendingUp,
  UserX,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Customers", icon: Users, path: "/dashboard" },
  { label: "Upload", icon: UploadCloud, path: "/upload" },
  { label: "Reports", icon: FileBarChart2, path: "/report" },
];

const STATS = [
  {
    label: "Total Customers",
    value: "25,480",
    icon: UsersIcon,
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    label: "At Risk",
    value: "4,280",
    icon: TrendingUp,
    badge: "+4.2%",
    badgeTone: "bg-red-50 text-red-500",
    iconBg: "bg-red-50 text-red-500",
  },
  {
    label: "Churned",
    value: "3,150",
    icon: UserX,
    iconBg: "bg-gray-100 text-gray-500",
  },
  {
    label: "Churn Rate",
    value: "12.4%",
    icon: Activity,
    iconBg: "bg-blue-50 text-blue-600",
  },
];

const CHURN_OVERVIEW = [
  { month: "Jan", actual: 220, predicted: 260 },
  { month: "Feb", actual: 300, predicted: 340 },
  { month: "Mar", actual: 280, predicted: 300 },
  { month: "Apr", actual: 420, predicted: 400 },
  { month: "May", actual: 500, predicted: 520 },
  { month: "Jun", actual: 460, predicted: 480 },
];

const CHURN_REASONS = [
  { name: "Pricing Issues", value: 45, color: "#2563eb" },
  { name: "Poor Support", value: 30, color: "#64748b" },
  { name: "Competitor", value: 25, color: "#cbd5e1" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen">
      <div className="px-5 py-5">
        <h1 className="text-lg font-bold text-gray-900 leading-none">
          ChurnAI
        </h1>
        <p className="text-[11px] text-blue-600 mt-1">Telecom Analytics</p>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <Settings className="h-4 w-4" />
          Settings
        </a>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      <div className="relative w-80 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers, reports..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>
      <div className="flex items-center gap-4 text-gray-500">
        <Bell className="h-5 w-5 cursor-pointer hover:text-gray-700" />
        <HelpCircle className="h-5 w-5 cursor-pointer hover:text-gray-700" />
        <UserCircle className="h-6 w-6 cursor-pointer hover:text-gray-700" />
      </div>
    </header>
  );
}

function StatCard({ label, value, icon: Icon, iconBg, badge, badgeTone }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${badgeTone}`}
            >
              {badge}
            </span>
          )}
          <div className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
    </Card>
  );
}

function ChurnOverviewChart() {
  return (
    <Card className="p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-blue-600">Churn Overview</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" /> Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-200" /> Predicted
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CHURN_OVERVIEW} margin={{ left: -10, right: 10 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#2563eb" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#2563eb" }}
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
              tickFormatter={(v) => (v === 1000 ? "1k" : v)}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#bfdbfe"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ChurnDistributionChart() {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-blue-600 mb-4">
        Churn Distribution
      </h3>
      <div className="relative h-40 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CHURN_REASONS}
              dataKey="value"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {CHURN_REASONS.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900">100%</span>
          <span className="text-[10px] text-gray-400">Total Reasons</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {CHURN_REASONS.map((reason) => (
          <div
            key={reason.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-gray-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: reason.color }}
              />
              {reason.name}
            </span>
            <span className="font-semibold text-gray-900">
              {reason.value}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />
        <main className="p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, Admin
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Here is the latest data on your customer churn risk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChurnOverviewChart />
            <ChurnDistributionChart />
          </div>
        </main>
      </div>
    </div>
  );
}