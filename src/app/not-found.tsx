// import GridShape from "@/components/common/GridShape";
import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-background">
      {/* <GridShape /> */}
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-foreground text-title-md xl:text-title-2xl">
          ERROR
        </h1>

        {/* Custom 404 Design with CSS */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-12 mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-card border-4 border-border">
            <span className="text-3xl font-bold text-primary">4</span>
          </div>
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-card border-4 border-border">
            <span className="text-3xl font-bold text-secondary">0</span>
          </div>
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-card border-4 border-border">
            <span className="text-3xl font-bold text-accent">4</span>
          </div>
        </div>

        <p className="mt-10 mb-6 text-base text-foreground/80 sm:text-lg">
          We can&apos;t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground shadow-theme-xs hover:bg-primary hover:text-white transition-colors duration-200"
        >
          Back to Home Page
        </Link>
      </div>
    </div>
  );
}
