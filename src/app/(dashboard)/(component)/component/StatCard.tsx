export default function StatCard() {
  // Define your totals here
  const total: number = 457;
  const registered = 410; // Must be <= total
  const pending = total - registered; // Auto-calculated
  const approved = Math.min(registered, 35); // Approved cannot exceed registered

  // Utility to calculate percentage
  const calcPercent = (value: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Color mapping for Tailwind classes
  const colorMap = {
    primary: { bg: "bg-primary/20", text: "text-primary" },
    secondary: { bg: "bg-secondary/20", text: "text-secondary" },
    accent: { bg: "bg-accent/20", text: "text-accent" },
  };

  const data = [
    {
      title: "Total Candidates",
      value: total,
      change: "100%",
      color: "primary" as const,
    },
    {
      title: "Registered",
      value: registered,
      change: calcPercent(registered),
      color: "secondary" as const,
    },
    {
      title: "Pending",
      value: pending,
      change: calcPercent(pending),
      color: "accent" as const,
    },
    {
      title: "Approved",
      value: approved,
      change: calcPercent(approved),
      color: "primary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((stat, index) => {
        const colorClass = colorMap[stat.color];
        return (
          <div
            key={index}
            className="p-6 rounded-xl shadow-sm bg-card  flex flex-col"
          >
            {/* Header Row: title + badge */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground truncate">
                {stat.title}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${colorClass.bg} ${colorClass.text}`}
              >
                {stat.change}
              </span>
            </div>

            {/* Value fixed position */}
            <div className="flex-1 flex items-end">
              <p className="text-3xl font-bold text-foreground leading-none">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
