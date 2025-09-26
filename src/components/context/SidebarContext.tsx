"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigation } from "./NavigationContext";
import { LucideProps } from "lucide-react";

// Accepts either a normal SVG component or a Lucide icon
export type IconType =
  | React.ComponentType<React.SVGProps<SVGSVGElement>>
  | React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;

export type SidebarSubItem = {
  id: string;
  label: string;
  icon: IconType;
};

export type SidebarItemProps = {
  id: string;
  label: string;
  icon: IconType;
  hasSubmenu?: boolean;
  submenu?: SidebarSubItem[];
};

interface SidebarContextProps {
  item: SidebarItemProps;
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

  const isAnySubmenuActive = item.submenu?.some(
    (subItem) => subItem.id === activeMenu
  );

  const isParentActive = activeMenu === item.id || isAnySubmenuActive;

  const handleParentClick = () => {
    forceMenuUpdate();

    if (item.hasSubmenu) {
      setActiveParent(isExpanded ? null : item.id);
    } else {
      setActiveMenu(item.id);
      setActiveParent(null);
    }
  };

  const handleSubmenuClick = (subItemId: string) => {
    forceMenuUpdate();
    setActiveMenu(subItemId);
  };

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={handleParentClick}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 transition-theme ${
          isParentActive
            ? "text-white shadow-md bg-primary"
            : "text-foreground hover:bg-muted-10 dark:hover:bg-muted-20"
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
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 transition-theme ${
                  isSubmenuActive
                    ? "text-white font-medium bg-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted-10 dark:hover:bg-muted-20"
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
