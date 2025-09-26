import { ToolCase, Printer, Send, Settings } from "lucide-react";

export default function QuickLinks() {
  const handleCardClick = (action: string, reportType?: string) => {
    console.log(
      `Action clicked: ${action}`,
      reportType ? `Report type: ${reportType}` : ""
    );
  };

  // Base for wide (rectangular) action cards
  const wideCardBase =
    "flex flex-row items-center p-4 rounded-xl backdrop-blur-md bg-background/40 dark:bg-card/30 shadow-sm transition-all duration-300 cursor-pointer group h-20 md:h-24";

  return (
    <div className="space-y-6 mt-8 mb-8">
      {/* Additional Actions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-primary-10 rounded-lg">
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
            className={`${wideCardBase} hover:bg-error-10 dark:hover:bg-error-20 hover:shadow-lg`}
          >
            <div className="bg-error-10 p-3 rounded-full mr-4 dark:bg-error-20 group-hover:bg-error-20 dark:group-hover:bg-error-30 transition-colors">
              <Send className="w-6 h-6 text-error dark:text-error-80" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-error-80 dark:group-hover:text-error-60 transition-colors">
                Send Reminders
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-error-60 dark:group-hover:text-error-40 transition-colors">
                To unregistered students
              </span>
            </div>
          </button>

          {/* Bulk Print */}
          <button
            onClick={() => handleCardClick("bulk-print", "batch-cards")}
            className={`${wideCardBase} hover:bg-secondary-10 dark:hover:bg-secondary-20 hover:shadow-lg`}
          >
            <div className="bg-secondary-10 p-3 rounded-full mr-4 dark:bg-secondary-20 group-hover:bg-secondary-20 dark:group-hover:bg-secondary-30 transition-colors">
              <Printer className="w-6 h-6 text-secondary dark:text-secondary-80" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-secondary-80 dark:group-hover:text-secondary-60 transition-colors">
                Bulk Print
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-secondary-60 dark:group-hover:text-secondary-40 transition-colors">
                Multiple exam cards
              </span>
            </div>
          </button>

          {/* Exam Settings */}
          <button
            onClick={() => handleCardClick("settings", "exam-configuration")}
            className={`${wideCardBase} hover:bg-muted-10 dark:hover:bg-muted-20 hover:shadow-lg`}
          >
            <div className="bg-muted-10 p-3 rounded-full mr-4 dark:bg-muted-20 group-hover:bg-muted-20 dark:group-hover:bg-muted-30 transition-colors">
              <Settings className="w-6 h-6 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-foreground group-hover:text-muted dark:group-hover:text-muted-foreground transition-colors">
                Exam Settings
              </span>
              <span className="text-xs text-muted-foreground mt-1 group-hover:text-muted-foreground dark:group-hover:text-muted transition-colors">
                Configure MOCK exam
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
