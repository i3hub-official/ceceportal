import {
  BookOpen,
  FileText,
  BarChart3,
  Download,
  Link2Icon,
} from "lucide-react";

export default function QuickLinks() {
  const handleCardClick = (action: string, reportType?: string) => {
    console.log(
      `Action clicked: ${action}`,
      reportType ? `Report type: ${reportType}` : ""
    );
  };

  const cardBase =
    "flex flex-col items-center justify-center p-4 rounded-xl backdrop-blur-md bg-background/40 dark:bg-card/30 shadow-sm transition-all duration-300 cursor-pointer group";

  return (
    <div className="space-y-6 mt-8">
      {/* Quick Links */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-primary-10 rounded-lg">
            <Link2Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Quick Links
            </h3>
            <p className="text-sm text-muted-foreground">
              Access important tools and actions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Registration Report Card */}
          <button
            onClick={() =>
              handleCardClick("generate-reports", "registration-summary")
            }
            className={`${cardBase} hover:bg-secondary-10 dark:hover:bg-secondary-20 hover:shadow-lg`}
          >
            <div className="bg-secondary-10 p-3 rounded-full mb-3 dark:bg-secondary-20 group-hover:bg-secondary-20 dark:group-hover:bg-secondary-30 transition-colors">
              <FileText className="w-6 h-6 text-secondary dark:text-secondary-80" />
            </div>
            <span className="font-medium text-foreground group-hover:text-secondary-80 dark:group-hover:text-secondary-60 transition-colors">
              Registration Report
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-secondary-60 dark:group-hover:text-secondary-40 transition-colors">
              Student registration summary
            </span>
          </button>

          {/* Print Exam Cards */}
          <button
            onClick={() => handleCardClick("print-cards", "exam-cards")}
            className={`${cardBase} hover:bg-success-10 dark:hover:bg-success-20 hover:shadow-lg`}
          >
            <div className="bg-success-10 p-3 rounded-full mb-3 dark:bg-success-20 group-hover:bg-success-20 dark:group-hover:bg-success-30 transition-colors">
              <BookOpen className="w-6 h-6 text-success dark:text-success-80" />
            </div>
            <span className="font-medium text-foreground group-hover:text-success-80 dark:group-hover:text-success-60 transition-colors">
              Print Exam Cards
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-success-60 dark:group-hover:text-success-40 transition-colors">
              For MOCK examination
            </span>
          </button>

          {/* Results Download */}
          <button
            onClick={() => handleCardClick("download-results", "score-sheets")}
            className={`${cardBase} hover:bg-accent-10 dark:hover:bg-accent-20 hover:shadow-lg`}
          >
            <div className="bg-accent-10 p-3 rounded-full mb-3 dark:bg-accent-20 group-hover:bg-accent-20 dark:group-hover:bg-accent-30 transition-colors">
              <Download className="w-6 h-6 text-accent dark:text-accent-80" />
            </div>
            <span className="font-medium text-foreground group-hover:text-accent-80 dark:group-hover:text-accent-60 transition-colors">
              Results Download
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-accent-60 dark:group-hover:text-accent-40 transition-colors">
              MOCK exam scoresheets
            </span>
          </button>

          {/* Performance Analytics */}
          <button
            onClick={() => handleCardClick("analysis", "performance-analytics")}
            className={`${cardBase} hover:bg-warning-10 dark:hover:bg-warning-20 hover:shadow-lg`}
          >
            <div className="bg-warning-10 p-3 rounded-full mb-3 dark:bg-warning-20 group-hover:bg-warning-20 dark:group-hover:bg-warning-30 transition-colors">
              <BarChart3 className="w-6 h-6 text-warning dark:text-warning-80" />
            </div>
            <span className="font-medium text-foreground group-hover:text-warning-80 dark:group-hover:text-warning-60 transition-colors">
              Performance Analytics
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-warning-60 dark:group-hover:text-warning-40 transition-colors">
              MOCK exam analysis
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
