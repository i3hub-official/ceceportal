// src/app/components/ui/Loading.tsx
import { motion } from "framer-motion";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "bars";
  fullScreen?: boolean;
  overlay?: boolean;
}

export default function Loading({
  message = "Loading...",
  size = "md",
  variant = "spinner",
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  // Spinner Variant
  const SpinnerLoader = () => (
    <div className="relative">
      <div
        className={`animate-spin rounded-full border-2 border-muted ${sizeClasses[size]}`}
      />
      <div
        className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary ${sizeClasses[size]}`}
      />
    </div>
  );

  // Dots Variant
  const DotsLoader = () => {
    const dotSize = {
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-3 h-3",
      xl: "w-4 h-4",
    };

    return (
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`bg-primary rounded-full ${dotSize[size]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  // Pulse Variant
  const PulseLoader = () => (
    <motion.div
      className={`bg-primary rounded-full ${sizeClasses[size]}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );

  // Bars Variant
  const BarsLoader = () => {
    const barHeight = {
      sm: "h-6",
      md: "h-8",
      lg: "h-12",
      xl: "h-16",
    };

    const barWidth = {
      sm: "w-0.5",
      md: "w-1",
      lg: "w-1.5",
      xl: "w-2",
    };

    return (
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`bg-primary rounded-full ${barWidth[size]} ${barHeight[size]}`}
            animate={{
              scaleY: [1, 0.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader />;
      case "bars":
        return <BarsLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderLoader()}
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`text-muted-foreground font-medium ${textSizeClasses[size]}`}
        >
          {message}
        </motion.div>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <LoadingContent />
      </div>
    );
  }

  // Overlay loading
  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          <LoadingContent />
        </div>
      </div>
    );
  }

  // Default inline loading
  return (
    <div className="flex items-center justify-center p-4">
      <LoadingContent />
    </div>
  );
}

// Preset Loading Components for common use cases
export const PageLoading = () => (
  <Loading message="Loading page..." size="lg" variant="spinner" fullScreen />
);

export const ComponentLoading = ({ message }: { message?: string }) => (
  <Loading message={message} size="md" variant="dots" overlay />
);

export const ButtonLoading = () => (
  <Loading size="sm" variant="spinner" message="" />
);

export const TableLoading = () => (
  <div className="flex items-center justify-center py-12">
    <Loading message="Loading data..." size="md" variant="bars" />
  </div>
);
