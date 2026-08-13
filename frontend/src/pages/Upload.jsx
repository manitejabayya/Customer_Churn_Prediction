import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
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
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Customers", icon: Users, path: "/dashboard" },
  { label: "Upload", icon: UploadCloud, path: "/upload" },
  { label: "Reports", icon: FileBarChart2, path: "/report" },
];

const ACCEPTED_TYPES = [".csv", ".xlsx", ".xls"];
const MAX_SIZE_MB = 25;

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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DropZone({ onFiles, isDragging, setIsDragging }) {
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        onFiles(Array.from(e.dataTransfer.files));
      }
    },
    [onFiles, setIsDragging]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl py-16 px-6 cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50/60"
          : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30"
      }`}
    >
      <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <UploadCloud className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-gray-800">
        Drag & drop your customer data file here
      </p>
      <p className="text-xs text-gray-400 mt-1">
        or click to browse — {ACCEPTED_TYPES.join(", ")} up to {MAX_SIZE_MB}MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

function statusMeta(status) {
  switch (status) {
    case "uploading":
      return { icon: Loader2, tone: "text-blue-500", spin: true, label: "Uploading..." };
    case "success":
      return { icon: CheckCircle2, tone: "text-green-500", label: "Ready to process" };
    case "error":
      return { icon: AlertCircle, tone: "text-red-500", label: "Invalid file" };
    default:
      return { icon: FileSpreadsheet, tone: "text-gray-400", label: "" };
  }
}

function FileRow({ file, onRemove }) {
  const { icon: Icon, tone, spin, label } = statusMeta(file.status);

  return (
    <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">
            {formatBytes(file.size)}
            {file.error ? ` · ${file.error}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`flex items-center gap-1.5 text-xs font-medium ${tone}`}>
          <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />
          {label}
        </span>
        <button
          onClick={() => onRemove(file.id)}
          className="text-gray-300 hover:text-gray-500"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file) => {
    const ext = `.${file.name.split(".").pop().toLowerCase()}`;
    if (!ACCEPTED_TYPES.includes(ext)) {
      return "Unsupported file type";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Exceeds ${MAX_SIZE_MB}MB limit`;
    }
    return null;
  };

  const handleFiles = (incoming) => {
    const newEntries = incoming.map((file) => {
      const error = validateFile(file);
      return {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        status: error ? "error" : "uploading",
        error,
      };
    });

    setFiles((prev) => [...prev, ...newEntries]);

    // Simulate upload completion for valid files.
    // Replace with your real upload call (e.g. POST to /api/uploads).
    newEntries
      .filter((f) => f.status === "uploading")
      .forEach((f) => {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((item) =>
              item.id === f.id ? { ...item, status: "success" } : item
            )
          );
        }, 1200);
      });
  };

  const handleRemove = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const readyCount = files.filter((f) => f.status === "success").length;
  const hasReadyFiles = readyCount > 0;

  const handleProcess = () => {
    // Replace with your real "run prediction model" call
    console.log(
      "Processing files:",
      files.filter((f) => f.status === "success").map((f) => f.name)
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <TopBar />
        <main className="p-8 space-y-6 max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload a customer data file to run churn predictions on your
              latest dataset.
            </p>
          </div>

          <Card className="p-6">
            <DropZone
              onFiles={handleFiles}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />

            {files.length > 0 && (
              <div className="mt-6 space-y-2">
                {files.map((file) => (
                  <FileRow key={file.id} file={file} onRemove={handleRemove} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-gray-400">
                {files.length === 0
                  ? "No files added yet"
                  : `${readyCount} of ${files.length} file(s) ready`}
              </p>
              <Button
                disabled={!hasReadyFiles}
                onClick={handleProcess}
                className="bg-black hover:bg-gray-800 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Run Predictions
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}