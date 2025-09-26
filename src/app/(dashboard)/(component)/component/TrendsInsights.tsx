// components/dashboard/TrendsInsights.tsx
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Download } from "lucide-react";

const mockData = [
  { day: "Mon", registrations: 40, completed: 35, pending: 5 },
  { day: "Tue", registrations: 65, completed: 58, pending: 7 },
  { day: "Wed", registrations: 52, completed: 45, pending: 7 },
  { day: "Thu", registrations: 80, completed: 72, pending: 8 },
  { day: "Fri", registrations: 70, completed: 63, pending: 7 },
  { day: "Sat", registrations: 90, completed: 85, pending: 5 },
  { day: "Sun", registrations: 60, completed: 52, pending: 8 },
];

const subjectData = [
  { subject: "Mathematics", score: 78 },
  { subject: "English", score: 85 },
  { subject: "Science", score: 72 },
  { subject: "History", score: 68 },
  { subject: "Geography", score: 75 },
];

const statusData = [
  { name: "Completed", value: 410, color: "var(--primary)" },
  { name: "Pending", value: 47, color: "var(--muted-foreground)" },
];

export default function TrendsInsights() {
  const [timeRange, setTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState("registrations");

  return (
    <div className="card mt-8 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Trends & Insights
            </h3>
            <p className="text-sm text-muted-foreground">
              Registration activity overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted-10 dark:bg-muted-20 rounded-lg p-1">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
          </div>

          <button className="p-2 rounded-lg border border-border hover:bg-muted-10 dark:hover:bg-muted-20 transition-colors">
            <Download className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-muted-10 dark:bg-muted-20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Registrations</p>
            <span className="text-xs px-2 py-1 bg-primary-10 text-primary rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">457</p>
          <div className="h-[1px] bg-border my-3"></div>
          <p className="text-xs text-muted-foreground">
            <span className="text-success font-medium">410 completed</span> •
            <span className="ml-1">47 pending</span>
          </p>
        </div>

        <div className="bg-muted-10 dark:bg-muted-20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Avg. Daily Registrations
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">65</p>
          <div className="h-[1px] bg-border my-3"></div>
          <p className="text-xs text-muted-foreground">
            Peak: <span className="font-medium">90 on Saturday</span>
          </p>
        </div>

        <div className="bg-muted-10 dark:bg-muted-20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">89.7%</p>
          <div className="h-[1px] bg-border my-3"></div>
          <p className="text-xs text-muted-foreground">
            Above target of <span className="font-medium">85%</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center bg-muted-10 dark:bg-muted-20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === "registrations"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Registrations
          </button>
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              activeTab === "performance"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Performance
          </button>
        </div>
      </div>

      {activeTab === "registrations" ? (
        <>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mockData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-30)" />
                <XAxis
                  dataKey="day"
                  stroke="currentColor"
                  tick={{ className: "text-sm fill-muted-foreground" }}
                />
                <YAxis
                  stroke="currentColor"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="var(--primary)"
                  fill="var(--primary-10)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--success)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Registration Status
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {statusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Daily Breakdown
              </h4>
              <div className="space-y-3">
                {mockData.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-foreground">{day.day}</span>
                    <div className="flex-1 mx-3">
                      <div className="relative h-2 bg-muted-20 dark:bg-muted-30 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-primary rounded-full"
                          style={{
                            width: `${(day.registrations / 90) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {day.registrations}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-30)" />
              <XAxis
                dataKey="subject"
                stroke="currentColor"
                tick={{ className: "text-sm fill-muted-foreground" }}
              />
              <YAxis
                stroke="currentColor"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <Bar
                dataKey="score"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
