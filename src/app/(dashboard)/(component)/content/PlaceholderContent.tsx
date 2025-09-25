import React from "react";
import {
  Users,
  ClipboardCheck,
  CreditCard,
  FileText,
  Shield,
  School,
} from "lucide-react";
import { useNavigation } from "../context/NavigationContext";

const iconMap = {
  candidates: Users,
  assessment: ClipboardCheck,
  transaction: CreditCard,
  reports: FileText,
  validation: Shield,
  "school-profile": School,
};

const PlaceholderContent = () => {
  const { activeMenu } = useNavigation();

  const getIcon = () => {
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (activeMenu.includes(key)) return Icon;
    }
    return FileText;
  };

  const IconComponent = getIcon();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {activeMenu
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </h2>
      <div className="rounded-xl p-8 text-center shadow-sm bg-card border border-border">
        <IconComponent size={48} className="mx-auto mb-4 text-primary" />
        <p className="text-foreground">
          {activeMenu
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}{" "}
          {activeMenu === "school-profile"
            ? "information and settings coming soon..."
            : activeMenu === "reports"
              ? "generation coming soon..."
              : activeMenu === "validation"
                ? "tools coming soon..."
                : "interface coming soon..."}
        </p>
      </div>
    </div>
  );
};

export default PlaceholderContent;
