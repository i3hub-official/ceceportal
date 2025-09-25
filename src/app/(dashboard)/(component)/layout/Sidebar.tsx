"use client";
import React from "react";
import { X, User } from "lucide-react";
import { useNavigation } from "../context/NavigationContext";
import { SidebarItems } from "../context/SidebarItems"; // Your array import
import SidebarItem from "../context/SidebarContext"; // Your component import

const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, setActiveMenu } = useNavigation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 bg-card/80 backdrop-blur-md border-border lg:bg-card lg:backdrop-blur-0 overflow-y-auto`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-border">
          <h2 className="text-xl font-bold text-primary">CEC ePortal</h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {SidebarItems.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer - Clickable Admin User */}
        <div className="p-4 border-border">
          <button
            onClick={() => setActiveMenu("school-profile")}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-background/80 backdrop-blur-sm lg:bg-background hover:bg-background dark:hover:bg-background transition-colors duration-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate text-foreground">
                Admin User
              </p>
              <p className="text-xs truncate text-foreground opacity-60">
                admin@school.edu
              </p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
