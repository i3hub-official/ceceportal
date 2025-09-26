import { Clock, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface DeadlineNoticeProps {
  deadline: string;
  className?: string;
  variant?: "simple" | "detailed";
}

// Function to get the next Saturday from a given date
const getNextSaturday = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + ((6 - result.getDay() + 7) % 7));
  return result;
};

export default function DeadlineNotice({
  deadline,
  className = "",
  variant = "simple",
}: DeadlineNoticeProps) {
  const [saturdayDeadline, setSaturdayDeadline] = useState<string>(deadline);

  // Ensure deadline is always a Saturday
  useEffect(() => {
    const initialDate = new Date(deadline);
    if (initialDate.getDay() !== 6) {
      // 6 = Saturday
      const nextSaturday = getNextSaturday(initialDate);
      setSaturdayDeadline(nextSaturday.toISOString().split("T")[0]);
    }
  }, [deadline]);

  // Calculate days until deadline
  const daysUntilDeadline = Math.ceil(
    (new Date(saturdayDeadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Format full date with day name
  const formattedDate = new Date(saturdayDeadline).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (variant === "detailed") {
    return (
      <div className="card mb-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Registration Deadline
            </p>
            <h3 className="text-2xl font-bold mt-1">{formattedDate}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Final date for registration (Saturday)
            </p>
          </div>
          <div className="bg-success-10 p-3 rounded-full dark:bg-success-20">
            <Calendar className="w-6 h-6 text-success dark:text-success-80" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-warning-10 text-warning rounded-lg dark:bg-warning-20 dark:text-warning-80">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {daysUntilDeadline} days until registration closes
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 bg-warning-10 text-warning rounded-lg dark:bg-warning-20 dark:text-warning-80 ${className}`}
    >
      <Clock className="w-4 h-4" />
      <span>
        {daysUntilDeadline} days until registration closes on Saturday
      </span>
    </div>
  );
}
