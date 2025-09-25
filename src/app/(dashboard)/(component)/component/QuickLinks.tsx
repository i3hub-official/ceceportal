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
    "flex flex-col items-center justify-center p-4 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-gray-800/30 shadow-sm transition-all duration-300 cursor-pointer group";

  return (
    <div className="space-y-6 mt-8">
      {/* Quick Links */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-primary/10 rounded-lg">
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
          {/* Quick Links cards (unchanged) */}
          <button
            onClick={() =>
              handleCardClick("generate-reports", "registration-summary")
            }
            className={`${cardBase} hover:bg-blue-100/60 dark:hover:bg-blue-900/40 hover:shadow-lg`}
          >
            <div className="bg-blue-100 p-3 rounded-full mb-3 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              Registration Report
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-blue-600/80 dark:group-hover:text-blue-200 transition-colors">
              Student registration summary
            </span>
          </button>

          <button
            onClick={() => handleCardClick("print-cards", "exam-cards")}
            className={`${cardBase} hover:bg-green-100/60 dark:hover:bg-green-900/40 hover:shadow-lg`}
          >
            <div className="bg-green-100 p-3 rounded-full mb-3 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-medium text-foreground group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
              Print Exam Cards
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-green-600/80 dark:group-hover:text-green-200 transition-colors">
              For MOCK examination
            </span>
          </button>

          <button
            onClick={() => handleCardClick("download-results", "score-sheets")}
            className={`${cardBase} hover:bg-purple-100/60 dark:hover:bg-purple-900/40 hover:shadow-lg`}
          >
            <div className="bg-purple-100 p-3 rounded-full mb-3 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
              <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="font-medium text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
              Results Download
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-purple-600/80 dark:group-hover:text-purple-200 transition-colors">
              MOCK exam scoresheets
            </span>
          </button>

          <button
            onClick={() => handleCardClick("analysis", "performance-analytics")}
            className={`${cardBase} hover:bg-amber-100/60 dark:hover:bg-amber-900/40 hover:shadow-lg`}
          >
            <div className="bg-amber-100 p-3 rounded-full mb-3 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
              <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
              Performance Analytics
            </span>
            <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-amber-600/80 dark:group-hover:text-amber-200 transition-colors">
              MOCK exam analysis
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
