"use client";
import React from "react";
import { useNavigation } from "./NavigationContext";
import DashboardContent from "../../app/admin/dashboard/content/DashboardContent";
import PlaceholderContent from "../../app/admin/dashboard/content/PlaceholderContent";

// Candidate Forms
import NewCandidate from "../../app/admin/candidates/New-Candidate";
// import ModifyCandidate from "../forms/Modify-Candidate";
import ViewCandidate from "../../app/admin/candidates/View-Candidate";

// Assessment Forms
// import ComputeAssessment from "../forms/Compute-Assessment";
// import ModifyAssessment from "../forms/Modify-Assessment";
// import ViewAssessments from "../forms/View-Assessments";

// Transaction Forms
// import MakePayment from "../forms/Make-Payment";
// import ViewTransaction from "../forms/View-Transaction";
// import VerifyInvoice from "../forms/Verify-Invoice";
// import LogDispute from "../forms/Log-Dispute";

// Reports
// import PhotoCard from "../forms/Photo-Card";
// import RegistrationReport from "../formscenter-Report";
// import PerformanceReport from "../forms/Performance-Report";
// import FinancialReport from "../forms/Financial-Report";

// Validation
// import EntrySchedule from "../forms/Entry-Schedule";
// import DataValidation from "../forms/Data-Validation";
// import DocumentVerification from "../forms/Document-Verification";

const contentMap: Record<string, React.ReactNode> = {
  // Dashboard
  dashboard: <DashboardContent />,

  // Candidates
  "new-candidate": <NewCandidate />,
  "modify-candidate": <PlaceholderContent />,
  "view-candidate": <ViewCandidate />,
  "candidate-reports": <PlaceholderContent />,

  // Assessment
  "compute-assessment": <PlaceholderContent />,
  "modify-assessment": <PlaceholderContent />,
  "view-assessments": <PlaceholderContent />,
  "assessment-reports": <PlaceholderContent />,

  // Transaction
  "make-payment": <PlaceholderContent />,
  "view-transaction": <PlaceholderContent />,
  "verify-invoice": <PlaceholderContent />,
  "log-dispute": <PlaceholderContent />,

  // Reports
  "photo-card": <PlaceholderContent />,
  "registration-report": <PlaceholderContent />,
  "performance-report": <PlaceholderContent />,
  "financial-report": <PlaceholderContent />,

  // Validation
  "entry-schedule": <PlaceholderContent />,
  "data-validation": <PlaceholderContent />,
  "document-verification": <PlaceholderContent />,
};

const MainContent = () => {
  const { activeMenu } = useNavigation();

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6 bg-background transition-colors duration-300">
        <div className="container mx-auto">
          {contentMap[activeMenu] || <PlaceholderContent />}
        </div>
      </div>
    </main>
  );
};

export default MainContent;
