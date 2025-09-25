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
          <p className="mt-2 text-sm text-center text-foreground/70">
            Sign in to your CEC Okigwe school account
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-6">
          {verificationRequired && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Email Verification Required
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      Your account has been created, but you need to verify your
                      email address before logging in.
                    </p>
                    <div className="mt-3 space-y-2">
                      {verificationRequired.schoolEmail && (
                        <button
                          type="button"
                          onClick={() => handleResendVerification("school")}
                          className="flex items-center text-sm font-medium text-amber-700 hover:text-amber-600"
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Resend school verification email
                        </button>
                      )}
                      {verificationRequired.adminEmail && (
                        <button
                          type="button"
                          onClick={() => handleResendVerification("admin")}
                          className="flex items-center text-sm font-medium text-amber-700 hover:text-amber-600"
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
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Login failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{loginError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login"
                className="block text-sm font-medium text-foreground mb-2"
              >
                School Email or Phone Number
              </label>
              <div className="relative">
                {getLoginType() === "email" ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                )}
                <input
                  id="login"
                  name="login"
                  type="text"
                  value={loginData.login}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.login ? "border-red-500" : "border-border"
                  }`}
                  placeholder="Email address or phone number"
                />
              </div>
              {errors.login && (
                <p className="mt-1 text-sm text-red-500">{errors.login}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-border"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/30 hover:text-foreground/60"
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
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-foreground/70"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    loging in...
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
                <span className="px-2 bg-card text-foreground/70">
                  New to CEC Okigwe?
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="center"
                className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
              >
                <School className="w-5 h-5 mr-2" />
                Create school account
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-foreground/60">
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
