import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/glob/AppHeader"; // Import your header component
import { HeaderProvider } from "@/components/context/HeaderContext";
import Footer from "@/components/glob/Footer";

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
        className="antialiased bg-background text-foreground"
        style={{
          fontFamily: "var(--font-sans)",
        }}
      >
        <HeaderProvider>
          <AppHeader /> {/* Add your header component here */}
          <main className="pt-[73px] min-h-screen">
            {" "}
            {/* Use the actual nav height value from CSS */}
            {children}
          </main>
          <Footer />
        </HeaderProvider>
      </body>
    </html>
  );
}
