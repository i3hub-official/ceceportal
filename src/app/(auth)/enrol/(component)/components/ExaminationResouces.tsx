import { Download, FileText } from "lucide-react";
import Link from "next/link";
export const ExaminationResources = () => {
  return (
    <div className="mt-8 bg-card rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
        <Download className="w-5 h-5 mr-2 text-primary" />
        Examination Resources
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="#"
          className="flex items-center p-4 border border-border rounded-lg hover:bg-primary/5 transition"
        >
          <FileText className="w-6 h-6 text-primary mr-3" />
          <div>
            <p className="font-medium">Examination Syllabus</p>
            <p className="text-sm text-foreground/70">PDF, 2.3MB</p>
          </div>
        </Link>
        <Link
          href="#"
          className="flex items-center p-4 border border-border rounded-lg hover:bg-primary/5 transition"
        >
          <FileText className="w-6 h-6 text-primary mr-3" />
          <div>
            <p className="font-medium">Examination Guidelines</p>
            <p className="text-sm text-foreground/70">PDF, 1.8MB</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
