import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Database,
  AlertTriangle,
  Wallet,
  Download,
  Filter,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Customers", icon: Users, path: "/dashboard" },
  { label: "Upload", icon: UploadCloud, path: "/upload" },
  { label: "Reports", icon: FileBarChart2, path: "/report" },
];

const STATS = [
  {
    label: "Total Records Processed",
    value: "42,850",
    footer: "100% valid data",
    icon: Database,
    iconBg: "bg-gray-100 text-gray-500",
  },
  {
    label: "High Risk Accs",
    value: "7,713",
    footer: "+2.4% vs last month",
    footerTone: "text-red-500",
    icon: AlertTriangle,
    iconBg: "bg-red-50 text-red-500",
  },
  {
    label: "Value at Risk (MRR)",
    value: "$1.24M",
    footer: "Projected monthly loss",
    icon: Wallet,
    iconBg: "bg-blue-50 text-blue-600",
  },
];

const RISK_DISTRIBUTION = [
  { name: "High", value: 18, color: "#dc2626" },
  { name: "Med", value: 42, color: "#93c5fd" },
  { name: "Low", value: 40, color: "#1d4ed8" },
];

const HIGH_RISK_CUSTOMERS = [
  {
    name: "Sarah Jenkins",
    id: "CUS-8921-A",
    tenure: "4 mos",
    contract: "Month-to-month",
    charges: "$104.50",
    probability: 92,
    initials: "SJ",
    avatarBg: "bg-pink-100 text-pink-600",
  },
  {
    name: "Michael Chen",
    id: "CUS-4432-B",
    tenure: "2 mos",
    contract: "Month-to-month",
    charges: "$89.99",
    probability: 88,
    initials: "MC",
    avatarBg: "bg-blue-100 text-blue-600",
  },
  {
    name: "TechNova Inc.",
    id: "ENT-9001-X",
    tenure: "11 mos",
    contract: "1 Year",
    charges: "$1,450.00",
    probability: 85,
    initials: "T",
    avatarBg: "bg-purple-100 text-purple-600",
  },
  {
    name: "Elena Rodriguez",
    id: "CUS-1102-Y",
    tenure: "1 mo",
    contract: "Month-to-month",
    charges: "$120.00",
    probability: 81,
    initials: "ER",
    avatarBg: "bg-orange-100 text-orange-600",
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen">
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          C
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900 leading-none">
            ChurnAI
          </h1>
          <p className="text-[10px] text-blue-600 mt-0.5">Telecom Analytics</p>
        </div>
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
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
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
          placeholder="Search..."
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

function PageHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Customer Churn Prediction Results
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Model run completed:{" "}
          <span className="text-gray-600">Today, 08:42 AM.</span>{" "}
          <span className="text-blue-600">
            Identifying accounts with high probability of attrition.
          </span>
        </p>
      </div>
      <Button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}

function StatCard({ label, value, footer, footerTone, icon: Icon, iconBg }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          {label}
        </span>
        <div className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      {footer && (
        <p className={`text-xs mt-1 ${footerTone || "text-gray-400"}`}>
          {footer}
        </p>
      )}
    </Card>
  );
}

function RiskDistributionCard() {
  return (
    <Card className="p-4">
      <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-3">
        Risk Distribution
      </h3>
      <div className="relative h-28 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={RISK_DISTRIBUTION}
              dataKey="value"
              innerRadius={38}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {RISK_DISTRIBUTION.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-gray-900">18%</span>
          <span className="text-[9px] text-gray-400 text-center leading-tight">
            High Risk
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
        {RISK_DISTRIBUTION.map((r) => (
          <span key={r.name} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: r.color }}
            />
            {r.name}
          </span>
        ))}
      </div>
    </Card>
  );
}

function ProbabilityBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
      <AlertTriangle className="h-3 w-3" />
      {value}%
    </span>
  );
}

function HighRiskTable() {
  const [filter, setFilter] = useState("");

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-blue-600">
          Customers at High Risk
        </h3>
        <div className="relative w-48">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter IDs..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase border-b border-gray-100">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Tenure</th>
              <th className="py-2 pr-4">Contract</th>
              <th className="py-2 pr-4">Monthly Charges</th>
              <th className="py-2 pr-4">Churn Probability</th>
            </tr>
          </thead>
          <tbody>
            {HIGH_RISK_CUSTOMERS.filter((c) =>
              c.id.toLowerCase().includes(filter.toLowerCase())
            ).map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${c.avatarBg}`}
                    >
                      {c.initials}
                    </div>
                    <span className="font-medium text-gray-800">
                      {c.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-blue-600">{c.id}</td>
                <td className="py-3 pr-4 text-gray-600">{c.tenure}</td>
                <td className="py-3 pr-4 text-gray-600">{c.contract}</td>
                <td className="py-3 pr-4 text-gray-800 font-medium">
                  {c.charges}
                </td>
                <td className="py-3 pr-4">
                  <ProbabilityBadge value={c.probability} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Showing 1-4 of {HIGH_RISK_CUSTOMERS.length + 7709}
      </p>
    </Card>
  );
}

export default function Report() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />
        <main className="p-8 space-y-6">
          <PageHeader />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
            <RiskDistributionCard />
          </div>

          <HighRiskTable />
        </main>
      </div>
    </div>
  );
}