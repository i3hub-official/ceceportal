// File: src/app/admin/verify-email/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { JWTUtils } from "@/lib/utils/jwt";
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
            Email Verification
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            Loading verification page...
          </p>
        </div>
      </div>
    </div>
  );
}

// Main verification component
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const adminId = searchParams.get("adminId");

        // Check for required parameters
        if (!token || !adminId) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token or admin ID.");
          return;
        }

        // Verify the token
        const tokenData = await JWTUtils.verifyEmailToken(token);

        // Verify that the adminId in the token matches the one in the URL
        if (tokenData.entityId !== adminId) {
          setStatus("error");
          setMessage("Invalid verification link. Admin ID mismatch.");
          return;
        }

        // Make API call to update the admin's email verification status
        const response = await fetch("/api/admin/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            adminId,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(
            data.message || "Email verification failed. Please try again."
          );
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
    // Redirect after 5 seconds
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
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Email Verification
          </h2>
          <p className="text-lg text-foreground/70 mb-8">{message}</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center justify-center">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-foreground/70">
                  Please wait while we verify your email...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-600 font-medium text-center mb-4">
                  Verification successful!
                </p>
                <p className="text-foreground/70 text-center">
                  You will be redirected to the login page in 5 seconds.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium text-center mb-4">
                  Verification failed
                </p>
                <p className="text-foreground/70 text-center mb-6">{message}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 w-full">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Need help?
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
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

        <div className="text-center text-sm text-foreground/60">
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
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerificationLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
