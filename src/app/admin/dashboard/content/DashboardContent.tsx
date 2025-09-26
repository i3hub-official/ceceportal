import React from "react";
import StatCard from "../component/StatCard";
import RecentActivity from "../component/RecentActivity";
import QuickLinks from "../component/QuickLinks";
import QuickLinksX from "../component/QuickLinksX";
import DeadlineNotice from "../component/DeadlineNotice";
import TrendInsights from "../component/TrendsInsights";
import UpcomingEvents from "../component/UpcomingEvents";

const DashboardContent = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Welcome to Dashboard
        </h2>
        <p className="text-muted-foreground">
          Overview of your school management system
        </p>
      </div>

      <DeadlineNotice
        deadline="2025-10-30"
        className="my-4"
        variant="detailed"
      />

      <StatCard />
      <TrendInsights />
      <RecentActivity />
      <QuickLinks />
      <QuickLinksX />
      <UpcomingEvents />
    </div>
  );
};

export default DashboardContent;
