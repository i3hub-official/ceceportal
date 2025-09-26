"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  School,
  AlertCircle,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { notifySuccess, notifyError } from "@/components/ui/notifications";

export default function LoginPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({
    login: "", // Can be email or phone
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [verificationRequired, setVerificationRequired] = useState<{
    schoolEmail: boolean;
    adminEmail: boolean;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (loginError) setLoginError("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!loginData.login) newErrors.login = "Email or phone number is required";
    if (!loginData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setLoginError("");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Check if email verification is required
          if (data.verificationRequired) {
            setVerificationRequired(data.verificationRequired);
            setIsSubmitting(false);
            return;
          }

          // Successful login - redirect to dashboard
          notifySuccess("Login successful!");
          router.push("/dashboard");
        } else {
          // Login failed
          setLoginError(
            data.message || "Invalid login credentials. Please try again."
          );
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Login error:", error);
        setLoginError("An error occurred. Please try again later.");
        setIsSubmitting(false);
      }
    }
  };

  const handleResendVerification = async (type: "school" | "admin") => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: loginData.login,
          type,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        notifySuccess(
          `${type === "school" ? "School" : "Admin"} verification email resent successfully!`
        );
      } else {
        notifyError(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      notifyError("Failed to resend verification email");
    }
  };

  // Determine if the login input is likely an email or phone number
  const getLoginType = () => {
    if (!loginData.login) return null;

    // Simple check: if it contains @, it's probably an email
    // Otherwise, assume it's a phone number
    return loginData.login.includes("@") ? "email" : "phone";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="mt-2 text-3xl font-bold text-center text-foreground">
            School Login
          </h2>
          <p className="mt-2 text-sm text-center text-muted-foreground">
            Sign in to your CEC Okigwe school account
          </p>
        </div>

        <div className="card">
          {verificationRequired && (
            <div className="mb-6 alert alert-warning">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-warning-foreground" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-warning-foreground">
                    Email Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-warning-foreground/80">
                    <p>
                      Your account has been created, but you need to verify your
                      email address before logging in.
                    </p>
                    <div className="mt-3 space-y-2">
                      {verificationRequired.schoolEmail && (
                        <button
                          type="button"
                          onClick={() => handleResendVerification("school")}
                          className="flex items-center text-sm font-medium text-warning-foreground hover:text-warning-foreground/80"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Resend school verification email
                        </button>
                      )}
                      {verificationRequired.adminEmail && (
                        <button
                          type="button"
                          onClick={() => handleResendVerification("admin")}
                          className="flex items-center text-sm font-medium text-warning-foreground hover:text-warning-foreground/80"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Resend admin verification email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loginError && (
            <div className="mb-6 alert alert-error">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-error-foreground" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-foreground">
                    Login failed
                  </h3>
                  <div className="mt-2 text-sm text-error-foreground/80">
                    <p>{loginError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login" className="form-label">
                School Email or Phone Number
              </label>
              <div className="input-group">
                {getLoginType() === "email" ? (
                  <Mail className="input-icon-left" />
                ) : (
                  <Phone className="input-icon-left" />
                )}
                <input
                  id="login"
                  name="login"
                  type="text"
                  value={loginData.login}
                  onChange={handleInputChange}
                  className={`form-input ${errors.login ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                  placeholder="Email address or phone number"
                />
              </div>
              {errors.login && <p className="form-error">{errors.login}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <Lock className="input-icon-left" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={handleInputChange}
                  className={`form-input pr-12 ${errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="form-checkbox"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-muted-foreground"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    logging in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  New to CEC Okigwe?
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="center"
                className="btn btn-outline inline-flex items-center"
              >
                <School className="w-5 h-5 mr-2" />
                Create school account
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact the CEC support team at{" "}
            <a
              href="mailto:support@cecokigwe.org"
              className="text-primary hover:underline"
            >
              support@cecokigwe.org
            </a>{" "}
            or call{" "}
            <a
              href="tel:+2348034567890"
              className="text-primary hover:underline"
            >
              +234 803 456 7890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
