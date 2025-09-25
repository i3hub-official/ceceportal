"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/(dashboard)/(component)/context/ThemeContext";
import { useLoading } from "@/app/(dashboard)/(component)/context/LoadingContext";
import { useNavigation } from "@/app/(dashboard)/(component)/context/NavigationContext";
import Sidebar from "@/app/(dashboard)/(component)/layout/Sidebar"; // Fixed import path
import Header from "@/app/(dashboard)/(component)/layout/Header";
import MainContent from "@/app/(dashboard)/(component)/layout/MainContent";
import LoadingScreen from "@/app/(dashboard)/(component)/context/LoadingScreen";

const Dashboard = () => {
  const { loading, setLoading } = useLoading();
  const { sidebarOpen, toggleSidebar } = useNavigation();

  useEffect(() => {
    // Generate random time between 1-5 seconds (1000-5000ms)
    const randomLoadingTime = Math.floor(Math.random() * 1000) + 1000;

    const timer = setTimeout(() => {
      setLoading(false);
    }, randomLoadingTime);

    return () => clearTimeout(timer);
  }, [setLoading]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />

      {/* Overlay for mobile sidebar with blur effect */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <MainContent />
      </div>
    </div>
  );
};

export default Dashboard;
