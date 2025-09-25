// SidebarContext.tsx
"use client";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigation } from "./NavigationContext";

interface SidebarContextProps {
  item: {
    id: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    hasSubmenu?: boolean;
    submenu?: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }>;
  };
}

const SidebarContext: React.FC<SidebarContextProps> = ({ item }) => {
  const {
    activeMenu,
    activeParent,
    setActiveMenu,
    setActiveParent,
    forceMenuUpdate,
  } = useNavigation();

  const Icon = item.icon;
  const isExpanded = activeParent === item.id;

  // Check if any submenu item is active
  const isAnySubmenuActive = item.submenu?.some(
    (subItem) => subItem.id === activeMenu
  );

  // Parent is active if itself or any child is active
  const isParentActive = activeMenu === item.id || isAnySubmenuActive;

  const handleParentClick = () => {
    forceMenuUpdate(); // ✅ Force update on every click

    if (item.hasSubmenu) {
      // Toggle the parent expansion
      setActiveParent(isExpanded ? null : item.id);
    } else {
      setActiveMenu(item.id);
      setActiveParent(null); // close any open submenu
    }
  };

  const handleSubmenuClick = (subItemId: string) => {
    forceMenuUpdate(); // ✅ Force update on every click
    setActiveMenu(subItemId);
    // Don't close the parent when selecting a child
  };

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={handleParentClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
          isParentActive
            ? "text-white shadow-md bg-primary"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-foreground"
        }`}
      >
        <div className="flex items-center space-x-3">
          <Icon width={20} height={20} />
          <span className="font-medium">{item.label}</span>
        </div>
        {item.hasSubmenu && (
          <div>
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </div>
        )}
      </button>

      {/* Submenu items */}
      {item.hasSubmenu && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.submenu?.map((subItem) => {
            const SubIcon = subItem.icon;
            const isSubmenuActive = activeMenu === subItem.id;

            return (
              <button
                key={subItem.id}
                onClick={() => handleSubmenuClick(subItem.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                  isSubmenuActive
                    ? "text-white font-medium bg-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <SubIcon width={16} height={16} />
                <span className="text-sm">{subItem.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarContext;
