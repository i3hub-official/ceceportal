// src/app/center/verify-email/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Loading component
function VerificationLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            School Email Verification
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Loading verification page...
          </p>
        </div>
      </div>
    </div>
  );
}

// Main verification component
function VerifyCenterEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your school email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const schoolId = searchParams.get("schoolId");

        if (!token) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token.");
          return;
        }

        // Make API call to backend route
        const response = await fetch("/api/center/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, schoolId }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(`Your school email for ${data.schoolName || "your school"} has been successfully verified!`);
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An error occurred during email verification."
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  useEffect(() => {
    if (status !== "loading") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              {status === "loading" ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : status === "success" ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            School Email Verification
          </h2>
          <p className="text-lg text-muted-foreground mb-8">{message}</p>
        </div>

        <div className="card">
          <div className="flex flex-col items-center justify-center">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">
                  Please wait while we verify your email...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <p className="text-success font-medium text-center mb-4">
                  Verification successful!
                </p>
                <p className="text-muted-foreground text-center">
                  You will be redirected to the login page in 5 seconds.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-error" />
                </div>
                <p className="text-error font-medium text-center mb-4">
                  Verification failed
                </p>
                <p className="text-muted-foreground text-center mb-6">
                  {message}
                </p>
                <div className="alert alert-warning w-full">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-warning-foreground" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-warning-foreground">
                        Need help?
                      </h3>
                      <div className="mt-2 text-sm text-warning-foreground/80">
                        <p>
                          If you continue to have issues, please contact our
                          support team at{" "}
                          <a
                            href="mailto:support@cecokigwe.org"
                            className="text-primary hover:underline"
                          >
                            support@cecokigwe.org
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            You will be automatically redirected to the login page in 5 seconds.
          </p>
          <p className="mt-2">
            If you are not redirected,{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              click here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function Page() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <VerifyCenterEmailContent />
    </Suspense>
  );
}