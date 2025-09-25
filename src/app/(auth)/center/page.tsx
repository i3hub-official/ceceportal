"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  School,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  Download,
  User,
  Search,
  ClipboardList,
  Loader2,
    Shield,
  AlertCircle,
    CreditCard,
} from "lucide-react";

interface CenterResponse {
  success: boolean;
  data?: {
    id: string;
    number: string;
    name: string;
    address: string;
    state: string;
    lga: string;
    isActive: boolean;
    isRegistered?: boolean;
  };
  message: string;
  error?: string;
}

interface NINLookupResponse {
  success: boolean;
  data?: {
    exists: boolean;
    nin: string;
    name?: string;
    email?: string;
    phone?: string;
    verified?: boolean;
    schoolsManaged?: number;
    isPrincipal?: boolean;
  };
  message: string;
  error?: string;
}

export default function SchoolRegistrationPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // NIN verification states
  const [ninExists, setNinExists] = useState(false);
  const [isVerifyingNin, setIsVerifyingNin] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);
    const [ninData, setNinData] = useState<NINLookupResponse["data"] | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Center number verification
    centerNumber: "",

    // Step 2: School information (pre-filled from verification)
    centerId: "",
    centerName: "",
    state: "",
    lga: "",
    schoolEmail: "",
    schoolPhone: "",
    schoolAddress: "",

    // Step 3: Administrator information
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    adminNin: "", // Added NIN field
    password: "",
    confirmPassword: "",
    adminId: "", // For existing admins

    // Additional information
    schoolType: "",
    principalName: "",
    principalPhone: "",
    examOfficerPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Special handling for NIN field - clear other fields and re-verify
    if (name === "adminNin" && ninVerified) {
      // Clear prefilled fields and reset verification status
      setFormData((prev) => ({
        ...prev,
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminId: "",
      }));
      setNinVerified(false);
      setNinExists(false);
      setNinData(null);
    }
  };

  // Enhanced center verification - check database first, then external API
  const verifyCenterNumber = async () => {
    if (!formData.centerNumber) {
      setErrors({ centerNumber: "Center number is required" });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      // Single endpoint that checks database first, then does external lookup if needed
      const response = await fetch(
        `/api/center/center-lookup?number=${encodeURIComponent(formData.centerNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: CenterResponse = await response.json();

      if (response.ok && data.success) {
        if (data.data?.isRegistered) {
          // Center is already registered in our database
          setErrors({
            centerNumber:
              "This center is already registered. If you believe this is an error, please contact the Catholic Education Commission for assistance.",
          });
          return;
        }

        // Center not registered, proceed with pre-filling form data
        const centerData = data.data;

        // Pre-fill the form with school data from API if centerData is defined
        if (centerData) {
          setFormData((prev) => ({
            ...prev,
            centerId: centerData.id,
            centerName: centerData.name,
            state: centerData.state,
            lga: centerData.lga,
            schoolAddress: centerData.address,
          }));
        }

        setIsVerified(true);
        setStep(2);
      } else {
        const errorMessage =
          data.message || "Invalid center number. Please check and try again.";
        setErrors({
          centerNumber: errorMessage,
        });
      }
    } catch (error) {
      console.error("Center verification error:", error);
      setErrors({
        centerNumber:
          "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // NIN lookup function
  const lookupNin = async () => {
    if (!formData.adminNin) {
      setErrors({
        adminNin: "NIN is required",
      });
      return;
    }

    setIsVerifyingNin(true);
    setErrors({});

    try {
      const response = await fetch("/api/admin/nin-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin: formData.adminNin,
        }),
      });

      const data: NINLookupResponse = await response.json();

      if (response.ok && data.success) {
        if (data.data?.exists) {
          // Admin exists - check if they're a principal
          if (data.data.isPrincipal) {
            setErrors({
              adminNin:
                "This user is registered as a principal and cannot manage additional schools. Please use a different administrator account.",
            });
            return;
          }

          // Pre-fill admin data and lock NIN field
          setNinExists(true);
          setNinData(data.data);
          setFormData((prev) => ({
            ...prev,
            adminId: data.data?.nin || "", // Use NIN as ID for existing users
            adminName: data.data?.name || "",
            adminEmail: data.data?.email || "",
            adminPhone: data.data?.phone || "",
          }));
        } else {
          // New admin - NIN doesn't exist in database
          setNinExists(false);
          setNinData(null);
        }
        setNinVerified(true);
      } else {
        setErrors({
          adminNin: data.message || "NIN lookup failed",
        });
      }
    } catch (error) {
      console.error("NIN lookup error:", error);
      setErrors({
        adminNin: "Network error. Please try again.",
      });
    } finally {
      setIsVerifyingNin(false);
    }
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolEmail)
      newErrors.schoolEmail = "School email is required";
    if (!formData.schoolPhone)
      newErrors.schoolPhone = "School phone is required";
    if (!formData.schoolAddress)
      newErrors.schoolAddress = "School address is required";
    if (!formData.schoolType) newErrors.schoolType = "School type is required";
    if (!formData.principalName)
      newErrors.principalName = "Principal name is required";
    if (!formData.principalPhone)
      newErrors.principalPhone = "Principal phone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!ninVerified) {
      newErrors.ninVerification = "Please verify NIN details first";
      setErrors(newErrors);
      return false;
    }

    if (!ninExists) {
      // New admin - require all fields
      if (!formData.adminName) newErrors.adminName = "Admin name is required";
      if (!formData.adminEmail)
        newErrors.adminEmail = "Admin email is required";
      if (!formData.adminPhone)
        newErrors.adminPhone = "Admin phone is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    } else {
      // Existing admin - only require password
      if (!formData.password) newErrors.password = "Password is required";
    }

    if (!formData.adminNin) newErrors.adminNin = "NIN is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const registrationData = {
        // School information
        centerId: formData.centerId,
        centerNumber: formData.centerNumber,
        centerName: formData.centerName,
        state: formData.state,
        lga: formData.lga,
        schoolEmail: formData.schoolEmail,
        schoolPhone: formData.schoolPhone,
        schoolAddress: formData.schoolAddress,
        schoolType: formData.schoolType,
        principalName: formData.principalName,
        principalPhone: formData.principalPhone,
        examOfficerPhone: formData.examOfficerPhone,

        // Admin information
        adminId: formData.adminId || null,
        adminNin: formData.adminNin,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPhone: formData.adminPhone,
        password: formData.password,
        existingAdmin: ninExists,
      };

      const response = await fetch("/api/center/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(4);
      } else {
        let errorMessage =
          data.message || "Registration failed. Please try again.";

        switch (response.status) {
          case 400:
            errorMessage =
              data.message ||
              "Invalid data provided. Please check your information.";
            break;
          case 409:
            if (data.message?.includes("already registered")) {
              errorMessage = data.message;
            } else if (data.message?.includes("principal")) {
              errorMessage =
                "This principal is already managing a school. One principal can only manage one school.";
            } else {
              errorMessage =
                "This center is already registered. Please contact support.";
            }
            break;
          case 500:
            errorMessage =
              "Server error. Please try again later or contact support.";
            break;
        }

        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        submit:
          "An unexpected error occurred. Please try again or contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-card dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex flex-col xs:flex-row xs:items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 xs:h-6 xs:w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg xs:text-base md:text-lg font-semibold text-foreground mb-2">
                    Center Number Verification
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Please enter your school&apos;s center number assigned by
                    the Catholic Education Commission. We&apos;ll first check if
                    this center is already registered in our system.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground mb-2">
                Center Number *
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  name="centerNumber"
                  value={formData.centerNumber}
                  onChange={handleInputChange}
                  disabled={isVerifying}
                  className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base ${
                    errors.centerNumber
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input hover:border-primary/30"
                  }`}
                  placeholder="Enter your center number"
                />
              </div>
              {errors.centerNumber && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-2">
                  <p className="text-sm text-destructive flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{errors.centerNumber}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={verifyCenterNumber}
              disabled={isVerifying || !formData.centerNumber}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-base"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying Center...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Verify Center Number
                </>
              )}
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Center Verification Success */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800 rounded-xl p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                    Center Verified Successfully
                  </h3>
                  <div className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium w-20">Center:</span>
                      <span className="font-bold">{formData.centerNumber}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-20">Name:</span>
                      <span className="font-bold truncate">
                        {formData.centerName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium w-20">Location:</span>
                      <span className="font-bold">
                        {formData.state}, {formData.lga}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* School Configuration */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground flex items-center">
                <School className="w-5 h-5 mr-2 text-primary" />
                School Configuration
              </h4>

              {/* School Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  School Type *
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-base ${
                    errors.schoolType
                      ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input hover:border-primary/30"
                  }`}
                >
                  <option value="">Select school type</option>
                  <option value="Secondary">Senior Secondary School</option>
                  <option value="Seminary">Seminary School</option>
                </select>
                {errors.schoolType && (
                  <p className="text-sm text-destructive flex items-center mt-1">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                    {errors.schoolType}
                  </p>
                )}
              </div>

              {/* School Email - No Verification Button */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  School Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="email"
                    name="schoolEmail"
                    value={formData.schoolEmail}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                      errors.schoolEmail
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-input hover:border-primary/30"
                    }`}
                    placeholder="school@example.com"
                  />
                </div>
                {errors.schoolEmail && (
                  <p className="text-sm text-destructive flex items-center mt-1">
                    <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                    {errors.schoolEmail}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Email verification will be required after registration
                </p>
              </div>

              {/* Other School Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    School Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="tel"
                      name="schoolPhone"
                      value={formData.schoolPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                        errors.schoolPhone
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input hover:border-primary/30"
                      }`}
                      placeholder="+234 800 123 4567"
                    />
                  </div>
                  {errors.schoolPhone && (
                    <p className="text-sm text-destructive flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                      {errors.schoolPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    School Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                    <textarea
                      name="schoolAddress"
                      value={formData.schoolAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none ${
                        errors.schoolAddress
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input hover:border-primary/30"
                      }`}
                      placeholder="Enter complete school address"
                    />
                  </div>
                  {errors.schoolAddress && (
                    <p className="text-sm text-destructive flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                      {errors.schoolAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Principal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Principal&apos;s Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      name="principalName"
                      value={formData.principalName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                        errors.principalName
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input hover:border-primary/30"
                      }`}
                      placeholder="Enter principal's full name"
                    />
                  </div>
                  {errors.principalName && (
                    <p className="text-sm text-destructive flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                      {errors.principalName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Principal&apos;s Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="tel"
                      name="principalPhone"
                      value={formData.principalPhone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                        errors.principalPhone
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "border-input hover:border-primary/30"
                      }`}
                      placeholder="+234 800 123 4567"
                    />
                  </div>
                  {errors.principalPhone && (
                    <p className="text-sm text-destructive flex items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                      {errors.principalPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-border gap-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setIsVerified(false);
                }}
                className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-200"
              >
                Back to Verification
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200"
              >
                Continue to Admin Setup
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Administrator Setup
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Enter administrator&apos;s NIN to verify existing account or
                create new administrator.
              </p>
            </div>

            {/* NIN Verification Section */}
            {!ninVerified && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Administrator NIN Verification
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Enter the administrator&apos;s National Identification Number
                  (NIN) to check if they already have an account.
                </p>

                <div>
                  <label className="block text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    National Identification Number (NIN) *
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-5 h-5" />
                      <input
                        type="text"
                        name="adminNin"
                        value={formData.adminNin}
                        onChange={handleInputChange}
                        maxLength={11}
                        className="w-full pl-10 pr-4 py-3 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 bg-white dark:bg-green-950/50 text-sm"
                        placeholder="Enter 11-digit NIN"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={lookupNin}
                      disabled={
                        isVerifyingNin ||
                        !formData.adminNin ||
                        formData.adminNin.length !== 11
                      }
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                    >
                      {isVerifyingNin ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Lookup NIN"
                      )}
                    </button>
                  </div>
                </div>

                {errors.adminNin && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
                    <p className="text-sm text-destructive flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{errors.adminNin}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Admin Details Form */}
            {ninVerified && (
              <>
                {/* Existing Admin Notice */}
                {ninExists && ninData && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          Existing Administrator Found
                        </h4>
                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                          <p>
                            <span className="font-medium">NIN:</span>{" "}
                            {formData.adminNin}
                          </p>
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {ninData.name}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {ninData.email}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            {ninData.phone}
                          </p>
                          <p>
                            <span className="font-medium">
                              Schools Managed:
                            </span>{" "}
                            {ninData.schoolsManaged || 0}
                          </p>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          This administrator will be linked to this school. Only
                          enter your password below.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* New Admin Notice */}
                {!ninExists && (
                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <User className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          New Administrator Account
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                          <span className="font-medium">NIN:</span>{" "}
                          {formData.adminNin}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          This will be a new administrator account. Please
                          complete all details below. Email verification will be
                          required after registration.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* NIN Field - Locked after verification */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    National Identification Number (NIN) *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type="text"
                      name="adminNin"
                      value={formData.adminNin}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-muted/30 text-foreground"
                      placeholder="NIN verified"
                      readOnly={false} // Allow changes but will trigger re-verification
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changing NIN will clear all prefilled data and require
                    re-verification
                  </p>
                </div>

                {/* Admin Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Administrator Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        type="text"
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleInputChange}
                        disabled={ninExists}
                        className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                          ninExists ? "bg-muted/30 text-muted-foreground" : ""
                        } ${
                          errors.adminName
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-input hover:border-primary/30"
                        }`}
                        placeholder="Enter administrator's full name"
                      />
                    </div>
                    {errors.adminName && (
                      <p className="text-sm text-destructive flex items-center mt-1">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                        {errors.adminName}
                      </p>
                    )}
                  </div>

                  {/* Admin Email - No Verification Button */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        type="email"
                        name="adminEmail"
                        value={formData.adminEmail}
                        onChange={handleInputChange}
                        disabled={ninExists}
                        className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                          ninExists ? "bg-muted/30 text-muted-foreground" : ""
                        } ${
                          errors.adminEmail
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-input hover:border-primary/30"
                        }`}
                        placeholder="admin@example.com"
                      />
                    </div>
                    {errors.adminEmail && (
                      <p className="text-sm text-destructive flex items-center mt-1">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                        {errors.adminEmail}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Email verification will be required after registration
                    </p>
                  </div>

                  {/* Admin Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        type="tel"
                        name="adminPhone"
                        value={formData.adminPhone}
                        onChange={handleInputChange}
                        disabled={ninExists}
                        className={`w-full pl-10 pr-4 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                          ninExists ? "bg-muted/30 text-muted-foreground" : ""
                        } ${
                          errors.adminPhone
                            ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                            : "border-input hover:border-primary/30"
                        }`}
                        placeholder="+234 800 123 4567"
                      />
                    </div>
                    {errors.adminPhone && (
                      <p className="text-sm text-destructive flex items-center mt-1">
                        <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                        {errors.adminPhone}
                      </p>
                    )}
                  </div>

                  {/* Password Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-10 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                            errors.password
                              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                              : "border-input hover:border-primary/30"
                          }`}
                          placeholder={
                            ninExists
                              ? "Enter your password"
                              : "Create a secure password"
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive flex items-center mt-1">
                          <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {!ninExists && (
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-10 py-3 border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                              errors.confirmPassword
                                ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                                : "border-input hover:border-primary/30"
                            }`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
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
                          <p className="text-sm text-destructive flex items-center mt-1">
                            <span className="w-1.5 h-1.5 bg-destructive rounded-full mr-2"></span>
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Password Requirements for New Admins */}
                  {!ninExists && (
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <h4 className="font-semibold text-warning-foreground mb-2 text-sm">
                        Password Requirements:
                      </h4>
                      <ul className="text-xs text-warning-foreground/80 space-y-1">
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                          Minimum 8 characters long
                        </li>
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                          Mix of uppercase and lowercase letters recommended
                        </li>
                        <li className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                          Include numbers and special characters for better
                          security
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        required
                        className="mt-0.5 rounded text-primary focus:ring-primary border-border"
                      />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        By proceeding, I acknowledge that I have read and agree
                        to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline font-medium"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline font-medium"
                        >
                          Privacy Policy
                        </Link>
                        . I understand that email verification is required
                        before the account becomes active.
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Navigation and Submit */}
            <div className="flex flex-col-reverse md:flex-row justify-between pt-6 border-t border-border gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all duration-200"
              >
                Back to School Info
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !ninVerified}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </button>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errors.submit}</span>
                </p>
              </div>
            )}

            {/* NIN Verification Error */}
            {errors.ninVerification && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{errors.ninVerification}</span>
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Registration Submitted Successfully!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-base leading-relaxed">
              Your school registration has been submitted. Please check your
              email to verify your accounts. You will not be able to log in
              until both the school and administrator emails are verified.
            </p>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center justify-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Verification Required
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>
                    Check your school email ({formData.schoolEmail}) for
                    verification link
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>
                    Check your admin email ({formData.adminEmail}) for
                    verification link
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>
                    Both emails must be verified before you can log in
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-foreground mb-3">
                What Happens Next?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Verify both email addresses
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Log in to your administrator dashboard
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                  Begin registering students for exams
                </li>
              </ul>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <Link
                href="/login"
                className="block w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200"
              >
                Go to Login Page
              </Link>
              <Link
                href="/"
                className="block w-full border border-primary text-primary py-3 px-6 rounded-lg font-semibold hover:bg-primary/5 transition-all duration-200"
              >
                Return to Home
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Note: After registration is complete, no changes can be made to
              school or administrator details. Please contact support if you
              need to make any modifications.
            </p>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-16 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              School Registration
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Register your school for the Catholic Education Commission Mock
              Examinations
            </p>

            {/* Progress indicator */}
            <div className="mt-6">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4].map((i) => (
                  <React.Fragment key={i}>
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 ${
                        i < step
                          ? "bg-green-600 text-white shadow-md scale-105"
                          : i === step
                            ? "bg-primary text-primary-foreground shadow-md scale-105"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? (
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <span className="font-bold text-sm md:text-base">
                          {i}
                        </span>
                      )}
                      {i === step && (
                        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></div>
                      )}
                    </div>
                    {i < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all duration-500 ${
                          i < step ? "bg-green-600" : "bg-muted"
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs md:text-sm font-medium px-2">
                <span
                  className={
                    step >= 1 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  Verify Center
                </span>
                <span
                  className={
                    step >= 2 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  School Info
                </span>
                <span
                  className={
                    step >= 3 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  Admin Setup
                </span>
                <span
                  className={
                    step >= 4 ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  Complete
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {renderStep()}
          </form>
        </div>

        {step < 4 && (
          <div className="mt-6 bg-card/60 backdrop-blur-sm rounded-xl shadow-md border border-border/50 p-4">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Registration Resources
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="#"
                className="group flex items-center p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Examination Regulations
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rules and guidelines • PDF, 2.1MB
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
