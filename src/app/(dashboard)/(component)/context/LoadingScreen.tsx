import { School } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Setting Up Your Dashboard",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-xs">
        {/* Spinning School Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-primary/10"></div>
          <div className="absolute inset-2 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <div className="flex items-center justify-center h-full">
            <School className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-foreground mb-6">
          {message}
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-muted/50 rounded-full h-2 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/70 h-full rounded-full animate-[loadingBar_2s_ease-in-out_infinite]"></div>
        </div>

        {/* Connection Message */}
        <p className="text-xs text-muted-foreground">
          Securely connected to your institution
        </p>

        {/* Inline styles for animations */}
        <style jsx>{`
          @keyframes loadingBar {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    </div>
  );
}