// global layout
import { ThemeProvider } from "@/components/context/ThemeContext";
import { LoadingProvider } from "@/components/context/LoadingContext";
import { NavigationProvider } from "@/components/context/NavigationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}
