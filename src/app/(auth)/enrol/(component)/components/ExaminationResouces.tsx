import { Download, FileText } from "lucide-react";
import Link from "next/link";

export const ExaminationResources = () => {
  return (
    <div className="mt-8 card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Examination Resources
        </h3>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="#"
          className="group flex items-center p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Examination Syllabus
            </p>
            <p className="text-xs text-muted-foreground">PDF, 2.3MB</p>
          </div>
        </Link>
        <Link
          href="#"
          className="group flex items-center p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Examination Guidelines
            </p>
            <p className="text-xs text-muted-foreground">PDF, 1.8MB</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
