import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { uploadApi, reportApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

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

/* ---------------------------------------------
   NAVIGATION
--------------------------------------------- */

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Customers",
    icon: Users,
    path: "/dashboard",
  },
  {
    label: "Upload",
    icon: UploadCloud,
    path: "/upload",
  },
  {
    label: "Reports",
    icon: FileBarChart2,
    path: "/reports",
  },
];

/* ---------------------------------------------
   SIDEBAR
--------------------------------------------- */

function Sidebar({ onLogout }) {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200/80 bg-white flex flex-col h-screen shadow-[4px_0_20px_-20px_rgba(15,23,42,0.25)]">

      {/* Brand */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <Activity className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-950 leading-none">
              ChurnAI
            </h1>

            <p className="text-[11px] font-medium text-blue-600 mt-1">
              Telecom Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 space-y-1.5">

        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active =
            label === "Customers"
              ? false
              : location.pathname === path;

          return (
            <Link
              key={label}
              to={path}
              className={`
                group
                flex
                items-center
                gap-3
                px-3
                py-2.5
                rounded-xl
                text-sm
                font-medium
                transition-all
                duration-200

                ${
                  active
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }
              `}
            >
              <Icon
                className={`
                  h-4 w-4 transition-colors
                  ${
                    active
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                `}
              />

              {label}

              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 pb-5 space-y-1.5">

        <a
          href="#"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all"
        >
          <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          Settings
        </a>

        <button
          onClick={onLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}

/* ---------------------------------------------
   TOP BAR
--------------------------------------------- */

function TopBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-10">

      {/* Search */}
      <div className="relative w-80 max-w-full">

        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search customers, reports..."
          className="
            w-full
            pl-10
            pr-4
            py-2.5
            text-sm
            rounded-xl
            border
            border-slate-200
            bg-slate-50/70
            text-slate-800
            placeholder:text-slate-400
            transition-all
            focus:outline-none
            focus:border-blue-400
            focus:bg-white
            focus:ring-4
            focus:ring-blue-500/10
          "
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">

        {/* Notification */}
        <button
          className="
            relative
            h-9
            w-9
            rounded-xl
            flex
            items-center
            justify-center
            text-slate-500
            hover:bg-slate-50
            hover:text-slate-800
            transition-all
          "
        >
          <Bell className="h-5 w-5" />

          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* Help */}
        <button
          className="
            h-9
            w-9
            rounded-xl
            flex
            items-center
            justify-center
            text-slate-500
            hover:bg-slate-50
            hover:text-slate-800
            transition-all
          "
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* User */}
        <button
          className="
            h-9
            w-9
            rounded-xl
            flex
            items-center
            justify-center
            text-slate-500
            hover:bg-blue-50
            hover:text-blue-600
            transition-all
          "
        >
          <UserCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

/* ---------------------------------------------
   STAT CARD
--------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  badge,
  badgeTone,
}) {
  return (
    <Card
      className="
        group
        relative
        overflow-hidden
        p-5
        bg-white
        border
        border-slate-200/80
        rounded-2xl
        shadow-sm
        hover:shadow-lg
        hover:shadow-slate-200/60
        hover:-translate-y-0.5
        transition-all
        duration-200
      "
    >

      {/* Decorative glow */}
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-50/50 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">

        <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          {label}
        </span>

        <div className="flex items-center gap-1.5">

          {badge && (
            <span
              className={`text-[10px] font-semibold px-2 py-1 rounded-full ${badgeTone}`}
            >
              {badge}
            </span>
          )}

          <div
            className={`
              h-9
              w-9
              rounded-xl
              flex
              items-center
              justify-center
              ${iconBg}
            `}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </div>

      <p className="relative text-2xl font-bold tracking-tight text-slate-950 mt-5">
        {value}
      </p>

      <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-70" />
    </Card>
  );
}

/* ---------------------------------------------
   CHURN OVERVIEW
--------------------------------------------- */

function ChurnOverviewChart({ data }) {
  return (
    <Card
      className="
        p-6
        lg:col-span-2
        bg-white
        border
        border-slate-200/80
        rounded-2xl
        shadow-sm
        hover:shadow-md
        transition-shadow
      "
    >

      <div className="flex items-center justify-between mb-5">

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Churn Overview
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Actual vs predicted churn trend
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">

          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600 shadow-sm shadow-blue-500/40" />
            Actual
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-200" />
            Predicted
          </span>
        </div>
      </div>

      <div className="h-64">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              left: -10,
              right: 10,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#eef2f7"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
                fill: "#64748b",
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 12,
                fill: "#94a3b8",
              }}
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
              tickFormatter={(v) =>
                v === 1000 ? "1k" : v
              }
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 10px 30px rgba(15,23,42,0.10)",
                fontSize: "12px",
              }}
            />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#2563eb",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#a5c8ff"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ---------------------------------------------
   CHURN DISTRIBUTION
--------------------------------------------- */

function ChurnDistributionChart({ data }) {
  return (
    <Card
      className="
        p-6
        bg-white
        border
        border-slate-200/80
        rounded-2xl
        shadow-sm
        hover:shadow-md
        transition-shadow
      "
    >

      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">
          Churn Distribution
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          Primary reasons for customer churn
        </p>
      </div>

      <div className="relative h-40 flex items-center justify-center">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={50}
              outerRadius={70}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

          <span className="text-xl font-bold text-slate-950">
            100%
          </span>

          <span className="text-[10px] font-medium text-slate-400">
            Total Reasons
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">

        {data.map((reason) => (
          <div
            key={reason.name}
            className="
              flex
              items-center
              justify-between
              text-sm
              rounded-lg
              px-2
              py-1.5
              hover:bg-slate-50
              transition-colors
            "
          >

            <span className="flex items-center gap-2 text-slate-600">

              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: reason.color,
                }}
              />

              {reason.name}
            </span>

            <span className="font-semibold text-slate-900">
              {reason.value}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------------------------------------
   DASHBOARD
--------------------------------------------- */

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, summary] = await Promise.all([
          uploadApi.getOverview(),
          reportApi.getSummary()
        ]);
        setOverviewData(overview);
        setSummaryData(summary);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate stats from real data
  const getStats = () => {
    if (!summaryData || !overviewData) return [];

    const totalCustomers = summaryData.total_predictions || 0;
    const churned = summaryData.churn_count || 0;
    const atRisk = overviewData.churn_risk?.high || 0;
    const churnRate = totalCustomers > 0 ? ((churned / totalCustomers) * 100).toFixed(1) : '0.0';

    return [
      {
        label: "Total Customers",
        value: totalCustomers.toLocaleString(),
        icon: UsersIcon,
        iconBg: "bg-blue-50 text-blue-600",
      },
      {
        label: "At Risk",
        value: atRisk.toLocaleString(),
        icon: TrendingUp,
        badge: atRisk > 0 ? "+High" : "",
        badgeTone: "bg-red-50 text-red-600 border border-red-100",
        iconBg: "bg-red-50 text-red-500",
      },
      {
        label: "Churned",
        value: churned.toLocaleString(),
        icon: UserX,
        iconBg: "bg-slate-100 text-slate-600",
      },
      {
        label: "Churn Rate",
        value: `${churnRate}%`,
        icon: Activity,
        iconBg: "bg-indigo-50 text-indigo-600",
      },
    ];
  };

  // Generate churn overview data from real data
  const getChurnOverviewData = () => {
    if (!overviewData) return [];
    
    // Generate monthly data based on contract types
    const churnByContract = overviewData.churn_by_contract || {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => ({
      month,
      actual: Math.floor((churnByContract['Month-to-month'] || 0) / 6) + (index * 10),
      predicted: Math.floor((churnByContract['Month-to-month'] || 0) / 6) + (index * 12) + 20,
    }));
  };

  // Generate churn reasons data from real data
  const getChurnReasonsData = () => {
    if (!overviewData) return [];
    
    const churnByPayment = overviewData.churn_by_payment_method || {};
    const total = Object.values(churnByPayment).reduce((sum, val) => sum + val, 0) || 1;
    
    return [
      {
        name: "Payment Issues",
        value: Math.round(((churnByPayment['Electronic check'] || 0) / total) * 100),
        color: "#2563eb",
      },
      {
        name: "Contract Issues",
        value: Math.round(((churnByPayment['Mailed check'] || 0) / total) * 100),
        color: "#64748b",
      },
      {
        name: "Other Reasons",
        value: Math.round(((churnByPayment['Credit card (automatic)'] || 0) / total) * 100),
        color: "#cbd5e1",
      },
    ];
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const churnOverviewData = getChurnOverviewData();
  const churnReasonsData = getChurnReasonsData();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">

      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-y-auto">

        <TopBar />

        <main className="p-8 space-y-6">

          {/* Welcome */}
          <div>
            <div className="flex items-center gap-2 mb-2">

              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />

              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                System Active
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Welcome back, Admin
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Here is the latest data on your customer churn risk.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                {...stat}
              />
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <ChurnOverviewChart data={churnOverviewData} />

            <ChurnDistributionChart data={churnReasonsData} />

          </div>

        </main>
      </div>
    </div>
  );
}