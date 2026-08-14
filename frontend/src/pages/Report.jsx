import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
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
  TrendingUp,
  TrendingDown,
  UsersRound,
  UserX,
  Target,
  AlertTriangle,
  Download,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  CircleDollarSign,
  Headphones,
  RefreshCw,
} from "lucide-react";
import { reportApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

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
  BarChart,
  Bar,
} from "recharts";

/* =========================================================
   NAVIGATION
========================================================= */

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
    path: "/report",
  },
];

/* =========================================================
   DEMO DATA
========================================================= */

const MONTHLY_DATA = [
  {
    month: "Jan",
    actual: 220,
    predicted: 260,
  },
  {
    month: "Feb",
    actual: 300,
    predicted: 340,
  },
  {
    month: "Mar",
    actual: 280,
    predicted: 300,
  },
  {
    month: "Apr",
    actual: 420,
    predicted: 400,
  },
  {
    month: "May",
    actual: 500,
    predicted: 520,
  },
  {
    month: "Jun",
    actual: 460,
    predicted: 480,
  },
];

const RISK_DATA = [
  {
    name: "High Risk",
    value: 18,
    color: "#2563eb",
  },
  {
    name: "Medium Risk",
    value: 32,
    color: "#93c5fd",
  },
  {
    name: "Low Risk",
    value: 50,
    color: "#e2e8f0",
  },
];

const CHURN_DRIVERS = [
  {
    name: "Pricing Issues",
    value: 45,
    icon: CircleDollarSign,
  },
  {
    name: "Poor Support",
    value: 30,
    icon: Headphones,
  },
  {
    name: "Competitor Offers",
    value: 25,
    icon: RefreshCw,
  },
];

const HIGH_RISK_CUSTOMERS = [
  {
    id: "CUS-10482",
    probability: "92%",
    risk: "High",
    reason: "High monthly charges",
    action: "Retention offer",
  },
  {
    id: "CUS-10831",
    probability: "88%",
    risk: "High",
    reason: "Short tenure",
    action: "Personal outreach",
  },
  {
    id: "CUS-11204",
    probability: "84%",
    risk: "High",
    reason: "Support complaints",
    action: "Priority support",
  },
  {
    id: "CUS-11672",
    probability: "79%",
    risk: "High",
    reason: "Competitor pricing",
    action: "Loyalty discount",
  },
  {
    id: "CUS-12019",
    probability: "76%",
    risk: "High",
    reason: "Month-to-month plan",
    action: "Contract upgrade",
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({ onLogout }) {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-slate-200 bg-white flex flex-col h-screen">
      {/* Brand */}

      <div className="px-5 py-5 flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
          C
        </div>

        <div>
          <h1 className="text-sm font-bold text-slate-900 leading-none">
            ChurnAI
          </h1>

          <p className="text-[10px] text-blue-600 mt-0.5">
            Telecom Analytics
          </p>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 px-3 mt-2 space-y-1">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;

          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <Icon className="h-4 w-4" />

              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}

      <div className="px-3 pb-5 space-y-1">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <Settings className="h-4 w-4" />

          Settings
        </a>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />

          Logout
        </button>
      </div>
    </aside>
  );
}

/* =========================================================
   TOP BAR
========================================================= */

function TopBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white">
      <div className="relative w-80 max-w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

        <input
          type="text"
          placeholder="Search customers, reports..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <Bell className="h-5 w-5 cursor-pointer hover:text-slate-700" />

        <HelpCircle className="h-5 w-5 cursor-pointer hover:text-slate-700" />

        <UserCircle className="h-6 w-6 cursor-pointer hover:text-slate-700" />
      </div>
    </header>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
  trend,
  trendUp,
}) {
  return (
    <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconStyle}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold ${
              trendUp ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}

            {trend}
          </div>
        )}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mt-5">
        {label}
      </p>

      <p className="text-2xl font-bold text-slate-900 mt-1">
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-1">
        {description}
      </p>
    </Card>
  );
}

/* =========================================================
   PREDICTION TREND
========================================================= */

function PredictionChart() {
  return (
    <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Churn Prediction Trend
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Actual vs AI predicted churn volume
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Actual
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-200" />
            Predicted
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={MONTHLY_DATA}
            margin={{
              top: 10,
              right: 10,
              left: -15,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "#64748b",
              }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 8px 30px rgba(15,23,42,0.08)",
              }}
            />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#93c5fd"
              strokeWidth={3}
              strokeDasharray="6 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* =========================================================
   RISK DISTRIBUTION
========================================================= */

function RiskDistribution() {
  return (
    <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Customer Risk Distribution
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Current AI risk classification
          </p>
        </div>

        <Target className="h-5 w-5 text-blue-600" />
      </div>

      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={RISK_DATA}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={82}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              stroke="none"
            >
              {RISK_DATA.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900">
            18%
          </span>

          <span className="text-[10px] text-slate-400">
            High Risk
          </span>
        </div>
      </div>

      <div className="space-y-3 mt-2">
        {RISK_DATA.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <span className="text-xs text-slate-500">
                {item.name}
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-800">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =========================================================
   CHURN DRIVERS
========================================================= */

function ChurnDrivers() {
  return (
    <Card className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Top Churn Drivers
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Factors contributing to customer churn
          </p>
        </div>

        <Zap className="h-5 w-5 text-blue-600" />
      </div>

      <div className="space-y-5">
        {CHURN_DRIVERS.map((driver, index) => {
          const Icon = driver.icon;

          return (
            <div key={driver.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {driver.name}
                  </span>
                </div>

                <span className="text-sm font-bold text-slate-900">
                  {driver.value}%
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${driver.value}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* =========================================================
   HIGH RISK CUSTOMERS
========================================================= */

function HighRiskCustomers() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            High-Risk Customers
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            Customers requiring immediate retention action
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-xl text-xs h-9"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Customer
              </th>

              <th className="px-6 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Churn Probability
              </th>

              <th className="px-6 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Risk
              </th>

              <th className="px-6 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Primary Reason
              </th>

              <th className="px-6 py-3 text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                Recommended Action
              </th>
            </tr>
          </thead>

          <tbody>
            {HIGH_RISK_CUSTOMERS.map((customer) => (
              <tr
                key={customer.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <UsersRound className="h-4 w-4 text-slate-500" />
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {customer.id}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-900">
                    {customer.probability}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold">
                    <AlertTriangle className="h-3 w-3" />
                    {customer.risk}
                  </span>
                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {customer.reason}
                </td>

                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-blue-600">
                    {customer.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* =========================================================
   AI RECOMMENDATIONS
========================================================= */

function Recommendations() {
  return (
    <Card className="rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900">
              AI Retention Recommendations
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Recommended actions based on current churn patterns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="rounded-xl border border-white bg-white p-4">
            <ShieldCheck className="h-4 w-4 text-blue-600" />

            <p className="text-sm font-semibold text-slate-800 mt-3">
              Target high-risk users
            </p>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Prioritize customers with churn probability above 75%.
            </p>
          </div>

          <div className="rounded-xl border border-white bg-white p-4">
            <CircleDollarSign className="h-4 w-4 text-blue-600" />

            <p className="text-sm font-semibold text-slate-800 mt-3">
              Review pricing
            </p>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Offer personalized plans to customers affected by pricing.
            </p>
          </div>

          <div className="rounded-xl border border-white bg-white p-4">
            <Headphones className="h-4 w-4 text-blue-600" />

            <p className="text-sm font-semibold text-slate-800 mt-3">
              Improve support
            </p>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Proactively contact customers with repeated support issues.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* =========================================================
   REPORT PAGE
========================================================= */

export default function Report() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overview, summary] = await Promise.all([
        uploadApi.getOverview(),
        reportApi.getSummary(),
      ]);
      setOverviewData(overview);
      setSummaryData(summary);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      // Generate CSV from report data
      const csvContent = generateReportCSV(summaryData, overviewData);
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `churn_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExporting(false);
    } catch (error) {
      console.error('Export failed:', error);
      setExporting(false);
    }
  };

  const generateReportCSV = (summary, overview) => {
    const headers = ['Metric', 'Value', 'Description'];
    const rows = [
      ['Total Predictions', summary?.total_predictions || 0, 'Total number of customer predictions'],
      ['Churn Count', summary?.churn_count || 0, 'Number of customers predicted to churn'],
      ['No Churn Count', summary?.no_churn_count || 0, 'Number of customers predicted to stay'],
      ['Average Churn Probability', summary?.average_churn_probability || 0, 'Average probability of churn across all customers'],
      ['Total Customers', overview?.total_customers || 0, 'Total customers in the dataset'],
      ['High Risk Customers', overview?.churn_risk?.high || 0, 'Customers with high churn risk (>70%)'],
      ['Medium Risk Customers', overview?.churn_risk?.medium || 0, 'Customers with medium churn risk (40-70%)'],
      ['Low Risk Customers', overview?.churn_risk?.low || 0, 'Customers with low churn risk (<40%)'],
    ];

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    return csv;
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />

        <main className="p-8 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart2 className="h-4 w-4 text-blue-600" />

                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Analytics Report
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Churn Prediction Report
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Detailed analysis of customer churn risk and AI predictions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />

                <span className="text-xs font-semibold text-emerald-700">
                  Model Analysis Complete
                </span>
              </div>

              <Button
                onClick={handleExport}
                variant="outline"
                className="rounded-xl h-10"
              >
                <Download className="h-4 w-4 mr-2" />

                {exporting ? "Exporting..." : "Export Report"}
              </Button>
            </div>
          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              label="Customers Analyzed"
              value="25,480"
              description="Total records processed"
              icon={UsersRound}
              iconStyle="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="High Risk"
              value="4,280"
              description="Customers requiring attention"
              icon={AlertTriangle}
              iconStyle="bg-red-50 text-red-500"
              trend="+4.2%"
              trendUp={false}
            />

            <SummaryCard
              label="Predicted Churn"
              value="3,150"
              description="Expected customer churn"
              icon={UserX}
              iconStyle="bg-violet-50 text-violet-600"
              trend="-2.8%"
              trendUp
            />

            <SummaryCard
              label="Overall Churn Rate"
              value="12.4%"
              description="Current predicted rate"
              icon={Target}
              iconStyle="bg-emerald-50 text-emerald-600"
              trend="-1.6%"
              trendUp
            />
          </div>

          {/* =================================================
              MAIN CHARTS
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-5">
            <PredictionChart />

            <RiskDistribution />
          </div>

          {/* =================================================
              DRIVERS
          ================================================= */}

          <ChurnDrivers />

          {/* =================================================
              HIGH RISK TABLE
          ================================================= */}

          <HighRiskCustomers />

          {/* =================================================
              AI RECOMMENDATIONS
          ================================================= */}

          <Recommendations />

          {/* =================================================
              FOOTER STATUS
          ================================================= */}

          <div className="flex items-center justify-between px-1 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              Prediction model is ready
            </div>

            <p className="text-xs text-slate-400">
              Last analysis: Today
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}