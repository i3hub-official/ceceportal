// components/dashboard/UpcomingEvents.tsx
import { Calendar } from "lucide-react";

const mockEvents = [
  { date: "2025-09-10", title: "Registration Deadline" },
  { date: "2025-09-15", title: "MOCK Exam - Physics" },
  { date: "2025-09-16", title: "MOCK Exam - English" },
  { date: "2025-09-18", title: "MOCK Exam - Chemistry" },
  { date: "2025-09-22", title: "MOCK Exam - Biology" },
  { date: "2025-09-25", title: "MOCK Exam - Mathematics" },
  { date: "2025-10-01", title: "Results Release" },
  { date: "2025-10-05", title: "Parent-Teacher Meeting" },
];

export default function UpcomingEvents() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Upcoming Events
          </h3>
          <p className="text-sm text-muted-foreground">
            Important dates to remember
          </p>
        </div>
      </div>

      <ul className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
        {mockEvents.map((event, i) => (
          <li
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors"
          >
            <div className="text-sm font-medium text-primary min-w-[80px]">
              {new Date(event.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </div>
            <hr className="border-l border-muted h-6" />
            <span className="text-sm text-foreground">{event.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
