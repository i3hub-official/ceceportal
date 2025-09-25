import type { Metadata } from "next";
import "./globals.css";

import { HeaderProvider } from "@/contexts/HeaderContext";

export const metadata: Metadata = {
  title: "CEC Portal - eRegistration",
  description: "Catholic Education Commission Portal by I3Hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent white flash before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem("theme");
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased"
        style={{
          fontFamily: "var(--font-sans)",
        }}
      >
        <HeaderProvider>
          <main className="pt-15">{children}</main>
          {/* <Footer /> */}
        </HeaderProvider>
      </body>
    </html>
  );
}
