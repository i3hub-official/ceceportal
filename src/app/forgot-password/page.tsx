"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import VerificationInput from "./components/VerificationInput";

// Define form data type
type FormData = {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
};

// Define step type
type Step = 1 | 2 | 3 | 4;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    token: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isTokenVerified, setIsTokenVerified] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Handle token changes
  const handleTokenChange = useCallback(
    (token: string) => {
      setFormData((prev) => ({
        ...prev,
        token,
      }));

      // Clear token error if exists
      if (errors.token) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.token;
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Auto-submit once token reaches exactly 6 digits
  useEffect(() => {
    if (
      formData.token.trim().length === 6 &&
      !isTokenVerified &&
      !isSubmitting
    ) {
      verifyTokenLogic();
    }
  }, [formData.token, isTokenVerified, isSubmitting]);

  // Validation functions
  const validateEmail = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email]);

  const validateToken = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const token = formData.token.trim();

    if (!token) {
      newErrors.token = "Verification token is required";
    } else if (token.length !== 6) {
      newErrors.token = "Token must be exactly 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.token]);

  const validatePassword = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.password, formData.confirmPassword]);

  // Form submission handlers
  const handleSendToken = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (validateEmail()) {
        setIsSubmitting(true);

        // Simulate API call to send token
        setTimeout(() => {
          setIsSubmitting(false);
          setStep(2);
          startCountdown(120);
        }, 1500);
      }
    },
    [validateEmail]
  );

  const verifyTokenLogic = useCallback(() => {
    if (validateToken()) {
      setIsSubmitting(true);

      // Simulate API call to verify token
      setTimeout(() => {
        setIsSubmitting(false);
        setIsTokenVerified(true);

        // Move to next step after a brief delay
        setTimeout(() => setStep(3), 1000);
      }, 1500);
    }
  }, [validateToken]);

  const handleVerifyToken = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      verifyTokenLogic();
    },
    [verifyTokenLogic]
  );

  const handleResetPassword = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (validatePassword()) {
        setIsSubmitting(true);

        // Simulate API call to reset password
        setTimeout(() => {
          setIsSubmitting(false);
          setStep(4);
        }, 1500);
      }
    },
    [validatePassword]
  );

  // Countdown timer
  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resendToken = useCallback(() => {
    if (countdown > 0) return;

    setIsSubmitting(true);

    // Simulate API call to resend token
    setTimeout(() => {
      setIsSubmitting(false);
      setIsTokenVerified(false);
      setFormData((prev) => ({ ...prev, token: "" }));
      startCountdown(120);
    }, 1000);
  }, [countdown, startCountdown]);

  // Format time for countdown display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Step rendering
  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="alert alert-primary mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary-foreground">
                    Reset your password
                  </h3>
                  <div className="mt-2 text-sm text-primary-foreground/80">
                    <p>
                      Enter your school&apos;s email address and we&apos;ll send
                      you a verification token to reset your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                School Email Address *
              </label>
              <div className="input-group">
                <Mail className="input-icon-left" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                  placeholder="school@example.com"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="form-error">
                  {errors.email}
                </p>
              )}
            </div>

            <button
              onClick={(e) =>
                handleSendToken({
                  preventDefault: () => {},
                } as React.FormEvent<HTMLFormElement>)
              }
              disabled={isSubmitting}
              className="btn btn-primary w-full"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending token...
                </>
              ) : (
                "Send Verification Token"
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="alert alert-primary mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-primary-foreground">
                    Check your email
                  </h3>
                  <div className="mt-2 text-sm text-primary-foreground/80">
                    <p>
                      We&apos;ve sent a 6-digit verification token to{" "}
                      <strong>{formData.email}</strong>. Enter it below to reset
                      your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Verification Token *</label>
              <VerificationInput
                value={formData.token}
                onChange={handleTokenChange}
                verified={isTokenVerified}
                aria-required="true"
                aria-invalid={!!errors.token}
                aria-describedby={errors.token ? "token-error" : undefined}
              />
              {errors.token && (
                <p id="token-error" className="form-error text-center">
                  {errors.token}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {countdown > 0
                  ? `Resend token in ${formatTime(countdown)}`
                  : "Didn't receive the token?"}
              </span>
              <button
                type="button"
                onClick={resendToken}
                disabled={countdown > 0 || isSubmitting}
                className="text-primary font-medium hover:text-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={isSubmitting}
              >
                Resend Token
              </button>
            </div>

            <button
              onClick={() => verifyTokenLogic()}
              disabled={isSubmitting || formData.token.length !== 6}
              className="btn btn-primary w-full"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Verify Token"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setIsTokenVerified(false);
                setFormData((prev) => ({ ...prev, token: "" }));
              }}
              className="btn btn-outline w-full"
            >
              Back to Email Entry
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="alert alert-success mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-success-foreground">
                    Token Verified Successfully
                  </h3>
                  <div className="mt-2 text-sm text-success-foreground/80">
                    <p>Please create a new password for your school account.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                New Password *
              </label>
              <div className="input-group">
                <Lock className="input-icon-left" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input pr-12 ${errors.password ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                  placeholder="Enter new password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="form-error">
                  {errors.password}
                </p>
              )}
              <p className="form-helper">
                Password must be at least 8 characters long.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password *
              </label>
              <div className="input-group">
                <Lock className="input-icon-left" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`form-input pr-12 ${errors.confirmPassword ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                  placeholder="Confirm new password"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={
                    errors.confirmPassword ? "confirmPassword-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="form-error">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <form onSubmit={handleResetPassword}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Resetting password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your school account password has been successfully reset. You can
              now log in with your new password.
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <Link href="/login" className="btn btn-primary w-full">
                Proceed to Login
              </Link>
              <Link href="/" className="btn btn-outline w-full">
                Return to Home
              </Link>
            </div>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  }, [
    step,
    formData,
    errors,
    isSubmitting,
    countdown,
    isTokenVerified,
    showPassword,
    showConfirmPassword,
    handleInputChange,
    handleTokenChange,
    handleSendToken,
    verifyTokenLogic,
    handleResetPassword,
    resendToken,
    formatTime,
  ]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-primary hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="mt-2 text-3xl font-bold text-center text-foreground">
            {step === 1
              ? "Reset Password"
              : step === 2
                ? "Verify Token"
                : step === 3
                  ? "Create New Password"
                  : "Password Reset"}
          </h2>
          <p className="mt-2 text-sm text-center text-muted-foreground">
            {step === 1
              ? "Enter your school email to receive a verification token"
              : step === 2
                ? "Enter the 6-digit token sent to your email"
                : step === 3
                  ? "Create a strong new password for your account"
                  : "Your password has been successfully reset"}
          </p>
        </div>

        <div className="card">{renderStep()}</div>

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
