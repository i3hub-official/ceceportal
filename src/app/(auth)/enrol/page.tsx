"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  CheckCircle,
  Upload,
  Loader,
  User2Icon,
  CreditCard,
  LocationEdit,
  Edit,
} from "lucide-react";

// Cache for LGAs to avoid repeated API calls
const lgaCache = new Map<string, string[]>();

// Define types for our form data
interface FormData {
  // Personal Information
  surname: string;
  firstName: string;
  otherName: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  lga: string;
  nin: string;
  phoneNumber: string;
  disability: string;
  passport: File | null;

  // Terms acceptance
  acceptedTerms: boolean;
}

export default function CandidateRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    surname: "",
    firstName: "",
    otherName: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    lga: "",
    nin: "",
    phoneNumber: "",
    disability: "",
    passport: null,

    // Terms acceptance
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [states, setStates] = useState<string[]>([]);
  const [lgas, setLgas] = useState<string[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingLgas, setIsLoadingLgas] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check cache validity on mount
  useEffect(() => {
    const checkCacheValidity = () => {
      const cachedTimestamp = localStorage.getItem("cachedTimestamp");
      if (cachedTimestamp) {
        const cacheTime = parseInt(cachedTimestamp);
        const currentTime = Date.now();
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds

        // If cache is older than 10 minutes, clear it
        if (currentTime - cacheTime > tenMinutes) {
          localStorage.removeItem("cachedStates");
          localStorage.removeItem("cachedFormData");
          localStorage.removeItem("cachedPassportPreview");
          localStorage.removeItem("cachedTimestamp");
        }
      }
    };

    checkCacheValidity();

    // Load saved form data if it exists and is still valid
    const cachedFormData = localStorage.getItem("cachedFormData");
    if (cachedFormData) {
      setFormData(JSON.parse(cachedFormData));
    }

    const cachedPassportPreview = localStorage.getItem("cachedPassportPreview");
    if (cachedPassportPreview) {
      setPassportPreview(cachedPassportPreview);
    }
  }, []);

  // Save form data to local storage with timestamp
  useEffect(() => {
    const saveDataWithTimestamp = () => {
      localStorage.setItem("cachedFormData", JSON.stringify(formData));
      localStorage.setItem("cachedTimestamp", Date.now().toString());
    };

    saveDataWithTimestamp();
  }, [formData]);

  // Save passport preview to local storage
  useEffect(() => {
    if (passportPreview) {
      localStorage.setItem("cachedPassportPreview", passportPreview);
      localStorage.setItem("cachedTimestamp", Date.now().toString());
    }
  }, [passportPreview]);

  // Fetch states data on component mount
  useEffect(() => {
    const fetchStatesData = async () => {
      setIsLoadingStates(true);
      setApiError(null);
      try {
        const cached = localStorage.getItem("cachedStates");
        if (cached) {
          setStates(JSON.parse(cached));
          return;
        }

        const res = await fetch("https://apinigeria.vercel.app/api/v1/states");
        if (!res.ok) {
          throw new Error("Failed to fetch states");
        }

        const data = await res.json();
        const statesList = data.states || [];
        setStates(statesList);
        localStorage.setItem("cachedStates", JSON.stringify(statesList));
        localStorage.setItem("cachedTimestamp", Date.now().toString());
      } catch (error) {
        console.error("Failed to load states");
        setApiError("Failed to load states data. Please try again later.");
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStatesData();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    const fetchLgasData = async () => {
      if (!formData.state) {
        setLgas([]);
        return;
      }

      if (lgaCache.has(formData.state)) {
        setLgas(lgaCache.get(formData.state) || []);
        return;
      }

      setIsLoadingLgas(true);
      setApiError(null);
      try {
        const res = await fetch(
          `https://apinigeria.vercel.app/api/v1/lga?state=${encodeURIComponent(
            formData.state
          )}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch LGAs");
        }

        const data = await res.json();
        const lgasList = data.lgas || [];
        setLgas(lgasList);
        lgaCache.set(formData.state, lgasList);
      } catch (error) {
        console.error("Failed to load LGAs");
        setApiError("Failed to load LGAs data. Please try again later.");
      } finally {
        setIsLoadingLgas(false);
      }
    };

    fetchLgasData();
  }, [formData.state]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear API error when user interacts with form
    if (apiError) {
      setApiError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          passport: "Please upload an image file",
        }));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        setErrors((prev) => ({
          ...prev,
          passport: "File size must be less than 2MB",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        passport: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPassportPreview(result);
        localStorage.setItem("cachedPassportPreview", result);
        localStorage.setItem("cachedTimestamp", Date.now().toString());
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      setErrors((prev) => ({ ...prev, passport: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.lga) newErrors.lga = "LGA is required";
    if (!formData.nin.trim()) newErrors.nin = "NIN is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.passport)
      newErrors.passport = "Passport photograph is required";

    // Validate phone number format
    if (
      formData.phoneNumber &&
      !/^(\+234|0)[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid Nigerian phone number";
    }

    // Validate NIN format (basic validation)
    if (formData.nin && !/^\d{11}$/.test(formData.nin.replace(/\s/g, ""))) {
      newErrors.nin = "NIN must be exactly 11 digits";
    }

    // Validate age (must be at least 16 years old)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 16) {
        newErrors.dateOfBirth = "You must be at least 16 years old to register";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      surname: "",
      firstName: "",
      otherName: "",
      dateOfBirth: "",
      gender: "",
      state: "",
      lga: "",
      nin: "",
      phoneNumber: "",
      disability: "",
      passport: null,
      acceptedTerms: false,
    });
    setPassportPreview(null);
    setErrors({});
    setStep(1);

    // Clear localStorage
    localStorage.removeItem("cachedFormData");
    localStorage.removeItem("cachedPassportPreview");
    localStorage.removeItem("cachedTimestamp");
  };

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Create FormData object for file upload
      const submitFormData = new FormData();

      // Append all form fields
      submitFormData.append("surname", formData.surname.trim());
      submitFormData.append("firstName", formData.firstName.trim());
      submitFormData.append("otherName", formData.otherName.trim());
      submitFormData.append("dateOfBirth", formData.dateOfBirth);
      submitFormData.append("gender", formData.gender);
      submitFormData.append("state", formData.state);
      submitFormData.append("lga", formData.lga);
      submitFormData.append("nin", formData.nin.replace(/\s/g, ""));
      submitFormData.append(
        "phoneNumber",
        formData.phoneNumber.replace(/\s/g, "")
      );
      submitFormData.append("disability", formData.disability || "None");
      submitFormData.append("acceptedTerms", formData.acceptedTerms.toString());

      // Append passport file
      if (formData.passport) {
        submitFormData.append("passport", formData.passport);
      }

      // Make API call to backend
      const response = await fetch("enrol/api/register", {
        method: "POST",
        body: submitFormData,
        // Don't set Content-Type header - let the browser set it for FormData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Registration successful
        console.log("Registration successful:", result);

        // Store registration details for success page
        const registrationDetails = {
          registrationId: result.data.registrationId,
          registrationDate: result.data.registrationDate,
          status: result.data.status,
        };

        // Store in sessionStorage (temporary storage)
        sessionStorage.setItem(
          "registrationDetails",
          JSON.stringify(registrationDetails)
        );

        // Clear form data and cache
        resetForm();

        // Move to success step
        setStep(4);
      } else {
        // Handle API errors
        if (result.errors) {
          // Validation errors from backend
          setErrors(result.errors);

          // If there are step 1 validation errors, go back to step 1
          const step1Fields = [
            "surname",
            "firstName",
            "dateOfBirth",
            "gender",
            "state",
            "lga",
            "nin",
            "phoneNumber",
            "passport",
          ];
          const hasStep1Errors = Object.keys(result.errors).some((field) =>
            step1Fields.includes(field)
          );

          if (hasStep1Errors) {
            setStep(1);
          }
        } else {
          // General error
          setApiError(result.error || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Check if it's a network error
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setApiError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setApiError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Also add this helper function to retrieve registration details on success page
  const getRegistrationDetails = () => {
    const stored = sessionStorage.getItem("registrationDetails");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Error parsing registration details:", error);
        return null;
      }
    }
    return null;
  };

  // Add this to your component to show registration details on success page
  const [registrationDetails, setRegistrationDetails] = useState<{
    registrationId: string;
    registrationDate: string;
    status: string;
  } | null>(null);

  // Add this useEffect to load registration details when reaching success step
  useEffect(() => {
    if (step === 4) {
      const details = getRegistrationDetails();
      setRegistrationDetails(details);

      // Clear the details from sessionStorage after loading
      sessionStorage.removeItem("registrationDetails");
      localStorage.removeItem("cachedFormData");
      localStorage.removeItem("cachedPassportPreview");
      localStorage.removeItem("cachedTimestamp");
    }
  }, [step]);

  const showValidationSummary = Object.keys(errors).length > 0;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <User className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Personal Information Required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Please provide accurate personal information as it appears
                      on your official documents. All fields marked with * are
                      required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}

            {showValidationSummary && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Surname *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.surname ? "border-red-500" : "border-border"
                    }`}
                    placeholder="Enter your surname"
                  />
                </div>
                {errors.surname && (
                  <p className="mt-1 text-sm text-red-500">{errors.surname}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.firstName ? "border-red-500" : "border-border"
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Other Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="text"
                    name="otherName"
                    value={formData.otherName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter other names (optional)"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.dateOfBirth ? "border-red-500" : "border-border"
                    }`}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender *
                </label>
                <div className="relative">
                  <User2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.gender ? "border-red-500" : "border-border"
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Disability
                </label>
                <div className="relative">
                  <User2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <select
                    name="disability"
                    value={formData.disability}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">No disability</option>
                    <option value="Visual">Visual impairment</option>
                    <option value="Hearing">Hearing impairment</option>
                    <option value="Physical">Physical disability</option>
                    <option value="Learning">Learning disability</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State *
                </label>
                <div className="relative">
                  <LocationEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.state ? "border-red-500" : "border-border"
                    }`}
                    disabled={isLoadingStates}
                  >
                    <option value="">Select state</option>
                    {isLoadingStates ? (
                      <option value="" disabled>
                        Loading states...
                      </option>
                    ) : (
                      states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  LGA *
                </label>
                <div className="relative">
                  <LocationEdit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <select
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.lga ? "border-red-500" : "border-border"
                    }`}
                    disabled={!formData.state || isLoadingLgas}
                  >
                    <option value="">Select LGA</option>
                    {isLoadingLgas ? (
                      <option value="" disabled>
                        Loading LGAs...
                      </option>
                    ) : (
                      lgas.map((lga) => (
                        <option key={lga} value={lga}>
                          {lga}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {errors.lga && (
                  <p className="mt-1 text-sm text-red-500">{errors.lga}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  NIN *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="tel"
                    name="nin"
                    value={formData.nin}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.nin ? "border-red-500" : "border-border"
                    }`}
                    placeholder="11-digit NIN"
                    maxLength={11}
                  />
                </div>
                {errors.nin && (
                  <p className="mt-1 text-sm text-red-500">{errors.nin}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/30 w-5 h-5" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.phoneNumber ? "border-red-500" : "border-border"
                    }`}
                    placeholder="0800 123 4567"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Passport Photograph *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="passport-upload"
                  />
                  <label
                    htmlFor="passport-upload"
                    className="cursor-pointer block"
                  >
                    {passportPreview ? (
                      <>
                        <Image
                          src={passportPreview}
                          alt="Passport preview"
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-full object-cover mb-2 mx-auto"
                        />
                        <span className="text-sm text-primary">
                          Change photo
                        </span>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-foreground/30 mb-2" />
                        <span className="text-sm text-foreground/70">
                          Click to upload passport photo
                        </span>
                        <span className="text-xs text-foreground/50">
                          Max 2MB, JPG/PNG
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.passport && (
                  <p className="mt-1 text-sm text-red-500">{errors.passport}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className="w-full bg-primary text-white py-4 px-6 rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center"
            >
              Continue to Review
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Review Your Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Please review your information carefully before proceeding
                      to terms and conditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Preview Card */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Registration Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground border-b pb-2">
                    Personal Information
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Full Name:</span>
                      <span className="font-medium">
                        {`${formData.surname} ${formData.firstName} ${formData.otherName || ""}`.trim()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-foreground/70">Date of Birth:</span>
                      <span className="font-medium">
                        {formData.dateOfBirth}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-foreground/70">Gender:</span>
                      <span className="font-medium">{formData.gender}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-foreground/70">Phone Number:</span>
                      <span className="font-medium">
                        {formData.phoneNumber}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-foreground/70">NIN:</span>
                      <span className="font-medium">{formData.nin}</span>
                    </div>

                    {formData.disability && (
                      <div className="flex justify-between">
                        <span className="text-foreground/70">Disability:</span>
                        <span className="font-medium">
                          {formData.disability}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location & Photo */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground border-b pb-2">
                    Location & Photo
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">State:</span>
                      <span className="font-medium">{formData.state}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-foreground/70">LGA:</span>
                      <span className="font-medium">{formData.lga}</span>
                    </div>

                    <div className="mt-4">
                      <span className="text-foreground/70 block mb-2">
                        Passport Photo:
                      </span>
                      {passportPreview ? (
                        <Image
                          src={passportPreview}
                          alt="Passport photo"
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Continue to Terms
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Info Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Terms and Conditions
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Please review and accept the terms and conditions to
                      complete your registration.
                    </p>
                    <br />
                    <p>Scroll down to review the full terms and conditions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {errors.acceptedTerms && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{errors.acceptedTerms}</p>
              </div>
            )}

            {/* Terms and Conditions Content */}
            <div className="bg-card rounded-lg p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Terms and Conditions
              </h3>

              <p className="mb-4">
                By submitting this form, you agree to the following terms and
                conditions:
              </p>

              <ol className="list-decimal pl-5 space-y-3">
                <li>
                  All information provided is accurate and complete to the best
                  of my knowledge.
                </li>
                <li>
                  I understand that providing false information may lead to
                  disqualification.
                </li>
                <li>
                  I consent to the collection and processing of my personal data
                  for examination purposes.
                </li>
                <li>
                  I agree to abide by all examination rules and regulations.
                </li>
                <li>
                  I understand that fees paid are non-refundable once the
                  registration is processed.
                </li>
                <li>
                  I acknowledge that examination dates and venues are subject to
                  change and will be communicated in advance.
                </li>
                <li>
                  I agree to receive communications related to my examination
                  registration.
                </li>
              </ol>

              <div className="mt-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="acceptedTerms"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    className="mt-1 mr-2"
                  />
                  <span className="text-sm">
                    I have read and agree to the terms and conditions outlined
                    above.
                  </span>
                </label>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition"
              >
                Back to Review
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Registration Successful!
            </h2>
            <p className="text-foreground/70 mb-6 max-w-md mx-auto">
              Your examination registration has been completed successfully.
            </p>

            {/* Candidate Info Card */}
            <div className="max-w-md mx-auto bg-card border border-border rounded-xl shadow-sm p-6 text-left space-y-4">
              {/* Candidate Photo */}
              <div className="flex justify-center">
                {passportPreview ? (
                  <Image
                    src={passportPreview}
                    alt="Candidate Photo"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Full Name:</span>{" "}
                  {`${formData.surname} ${formData.firstName} ${formData.otherName || ""}`.trim()}
                </p>
                <p>
                  <span className="font-semibold">Date of Birth:</span>{" "}
                  {formData.dateOfBirth || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Gender:</span>{" "}
                  {formData.gender || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Registration No:</span>{" "}
                  <strong>
                    CEC-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </strong>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 max-w-xs mx-auto mt-8">
              <button
                type="button"
                onClick={resetForm}
                className="block w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Register Another Candidate
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="block w-full border border-primary text-primary py-3 rounded-lg font-medium hover:bg-primary/10 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-4 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Back link and title section */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-primary hover:underline mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Candidate Registration
              </h1>
              <p className="text-foreground/70 text-sm">
                Register for CEC Mock Examinations
              </p>
            </div>
          </div>

          {/* Compact card layout */}
          <div className="bg-card rounded-lg shadow-md overflow-hidden">
            {/* Progress indicator header - Updated to show only 4 steps */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 flex-1">
                  {[1, 2, 3, 4].map((i) => (
                    <React.Fragment key={i}>
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          i < step
                            ? "bg-green-500 text-white"
                            : i === step
                              ? "bg-primary text-white"
                              : "bg-gray-200 text-primary/50"
                        }`}
                      >
                        {i < step ? <CheckCircle className="w-3 h-3" /> : i}
                      </div>
                      {i < 4 && (
                        <div
                          className={`w-2 h-0.5 ${
                            i < step ? "bg-green-500" : "bg-gray-200"
                          }`}
                        ></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-foreground/60">
                <span>Personal Info</span>
                <span>Review</span>
                <span>Terms</span>
                <span>Complete</span>
              </div>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmit}>
              <div className="p-4">{renderStep()}</div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
