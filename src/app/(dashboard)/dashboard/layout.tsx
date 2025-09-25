// global layout
import { ThemeProvider } from "@/app/(dashboard)/(component)/context/ThemeContext";
import { LoadingProvider } from "@/app/(dashboard)/(component)/context/LoadingContext";
import { NavigationProvider } from "@/app/(dashboard)/(component)/context/NavigationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <LoadingProvider>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}