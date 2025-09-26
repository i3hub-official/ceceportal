"use client";
import {
  Home,
  Users,
  ClipboardCheck,
  CreditCard,
  User,
  FileText,
  CheckSquare,
  Calendar,
  Shield,
  Send,
  Settings,
  BarChart3,
} from "lucide-react";

export const SidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    hasSubmenu: false,
  },
  {
    id: "candidates",
    label: "Candidates",
    icon: Users,
    hasSubmenu: true,
    submenu: [
      { id: "new-candidate", label: "New Candidate", icon: User },
      { id: "modify-candidate", label: "Modify Candidate", icon: Settings },
      { id: "view-candidate", label: "View Candidate", icon: FileText },
      { id: "candidate-reports", label: "Candidate Reports", icon: BarChart3 },
    ],
  },
  {
    id: "assessment",
    label: "Assessment",
    icon: ClipboardCheck,
    hasSubmenu: true,
    submenu: [
      {
        id: "compute-assessment",
        label: "Compute Assessment",
        icon: CheckSquare,
      },
      { id: "modify-assessment", label: "Modify Assessment", icon: Settings },
      { id: "view-assessments", label: "View Assessments", icon: FileText },
      {
        id: "assessment-reports",
        label: "Assessment Reports",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "transaction",
    label: "Transaction",
    icon: CreditCard,
    hasSubmenu: true,
    submenu: [
      { id: "make-payment", label: "Make a Payment", icon: CreditCard },
      { id: "view-transaction", label: "View Transaction", icon: FileText },
      { id: "verify-invoice", label: "Verify an Invoice", icon: Shield },
      { id: "log-dispute", label: "Log Dispute", icon: Send },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    hasSubmenu: true,
    submenu: [
      { id: "photo-card", label: "Photo Card", icon: User },
      {
        id: "registration-report",
        label: "Registration Report",
        icon: FileText,
      },
      {
        id: "performance-report",
        label: "Performance Report",
        icon: BarChart3,
      },
      { id: "financial-report", label: "Financial Report", icon: CreditCard },
    ],
  },
  {
    id: "validation",
    label: "Validation",
    icon: Shield,
    hasSubmenu: true,
    submenu: [
      { id: "entry-schedule", label: "Entry Schedule", icon: Calendar },
      { id: "data-validation", label: "Data Validation", icon: CheckSquare },
      {
        id: "document-verification",
        label: "Document Verification",
        icon: Shield,
      },
    ],
  },
];
