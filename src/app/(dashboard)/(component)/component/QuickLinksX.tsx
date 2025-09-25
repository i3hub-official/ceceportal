import {
  Link2,
  Link2OffIcon,
  LucideLink2,
  ToolCase,
  Printer,
  Send,
  Settings,
} from "lucide-react";

export default function QuickLinks() {
  const handleCardClick = (action: string, reportType?: string) => {
    console.log(
      `Action clicked: ${action}`,
      reportType ? `Report type: ${reportType}` : ""
    );
  };

  // Base for wide (rectangular) action cards
  const wideCardBase =
    "flex flex-row items-center p-4 rounded-xl backdrop-blur-md bg-white/40 dark:bg-gray-800/30 shadow-sm transition-all duration-300 cursor-pointer group h-20 md:h-24";

  return (
    <div className="space-y-6 mt-8 mb-8">
      {/* Additional Actions */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ToolCase className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Additional Actions
            </h3>
            <p className="text-sm text-muted-foreground">Other common tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Send Reminders */}
          <button
            onClick={() =>
              handleCardClick("send-reminders", "pending-registrations")
            }
            className={`${wideCardBase} hover:bg-red-100/60 dark:hover:bg-red-900/40 hover:shadow-lg`}
          >
            <div className="bg-red-100 p-3 rounded-full mr-4 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
              <Send className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
                Send Reminders
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-red-600/80 dark:group-hover:text-red-200 transition-colors">
                To unregistered students
              </span>
            </div>
          </button>

          {/* Bulk Print */}
          <button
            onClick={() => handleCardClick("bulk-print", "batch-cards")}
            className={`${wideCardBase} hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 hover:shadow-lg`}
          >
            <div className="bg-indigo-100 p-3 rounded-full mr-4 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
              <Printer className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                Bulk Print
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-indigo-600/80 dark:group-hover:text-indigo-200 transition-colors">
                Multiple exam cards
              </span>
            </div>
          </button>

          {/* Exam Settings */}
          <button
            onClick={() => handleCardClick("settings", "exam-configuration")}
            className={`${wideCardBase} hover:bg-gray-100/60 dark:hover:bg-gray-900/40 hover:shadow-lg`}
          >
            <div className="bg-gray-100 p-3 rounded-full mr-4 dark:bg-gray-900/30 group-hover:bg-gray-200 dark:group-hover:bg-gray-800/50 transition-colors">
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                Exam Settings
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-gray-600/80 dark:group-hover:text-gray-200 transition-colors">
                Configure MOCK exam
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
