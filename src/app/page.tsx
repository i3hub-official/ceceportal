"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  FileText,
  Users,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Download,
  School,
  UserPlus,
  FileCheck,
  BookText,
} from "lucide-react";
import AppHeader from "@/components/glob/AppHeader";

export default function ExamRegistrationLandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Chinwe O.",
      role: "SS3 Student",
      text: "The registration process was so straightforward. I completed everything in just 10 minutes!",
    },
    {
      name: "Fr. Michael A.",
      role: "School Administrator",
      text: "This system has simplified our exam preparation process tremendously. Highly recommended!",
    },
    {
      name: "Mrs. Okoro K.",
      role: "Parent",
      text: "I appreciate how easy it was to register my twins for their mock exams. The confirmation system is excellent.",
    },
  ];

  const features = [
    {
      icon: <School className="w-6 h-6" />,
      title: "School Accounts",
      description:
        "Create dedicated accounts for your school to manage all student registrations",
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Enroll Candidates",
      description: "Easily enroll multiple students with bulk upload options",
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Download Exam Slips",
      description:
        "Generate and download exam slips for all registered students",
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor registration status and payment confirmations",
    },
  ];

  const resources = [
    {
      title: "Registration Guide",
      description: "Step-by-step instructions for the registration process",
      icon: <BookText className="w-8 h-8" />,
      link: "#",
    },
    {
      title: "Syllabus Download",
      description: "Complete syllabus for all examination subjects",
      icon: <Download className="w-8 h-8" />,
      link: "#",
    },
    {
      title: "Timetable",
      description: "Examination schedule and timing details",
      icon: <Calendar className="w-8 h-8" />,
      link: "#",
    },
    {
      title: "FAQs",
      description: "Frequently asked questions and answers",
      icon: <FileText className="w-8 h-8" />,
      link: "#",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((currentTestimonial + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (currentTestimonial - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* AppHeader */}
      <AppHeader />

      {/* Hero Section */}
      <section className="relative pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-card to-background overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mt-10 mb-6 leading-tight">
                Mock eRegistration
                <span className="text-primary block text-3xl sm:text-4xl mt-2">
                  Catholic Education Commission
                </span>
              </h1>
              <p className="text-lg text-foreground/70 mb-10">
                Register for the upcoming diocesan mock examinations. Open to
                all Catholic schools in Okigwe Diocese, Imo State.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  Begin Registration
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="#resources"
                  className="px-8 py-4 rounded-lg font-semibold border border-primary text-primary hover:bg-primary/10 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Resources
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-primary/10 w-full h-64 rounded-lg blur-3xl"></div>
              </div>
              <div className="relative bg-background rounded-2xl p-8 shadow-lg mt-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Exam Registration</h2>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Exam Dates</h3>
                      <p className="text-sm text-foreground/70">
                        15th - 26th April, 2025
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Registration Deadline</h3>
                      <p className="text-sm text-foreground/70">
                        30th April, 2025
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">For Students</h3>
                      <p className="text-sm text-foreground/70">SS2 Classes</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="center"
                    className="block w-full bg-primary text-white text-center py-3 rounded-lg font-medium hover:bg-primary/90 transition"
                  >
                    Create School Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">42</div>
              <div className="text-foreground/70 mt-2">Schools Registered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2,500+</div>
              <div className="text-foreground/70 mt-2">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">14</div>
              <div className="text-foreground/70 mt-2">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-foreground/70 mt-2">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              For School Administrators
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Comprehensive tools to manage your school&apos;s exam registration
              process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 text-center group hover:shadow-lg transition"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Resources & Downloads
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Essential documents and guides for examination preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-background rounded-xl p-6 group hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {resource.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {resource.title}
                </h3>
                <p className="text-foreground/70 text-sm mb-4">
                  {resource.description}
                </p>
                <Link
                  href={resource.link}
                  className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                >
                  Download <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Register Section */}
      <section
        id="instructions"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How To Register
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Follow these simple steps to complete your mock exam registration
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <ProcessStep
              step="01"
              title="Create School Account"
              description="Register your school to access the portal"
              icon={<School className="w-8 h-8" />}
            />
            <ProcessStep
              step="02"
              title="Enroll Students"
              description="Add students individually or in bulk"
              icon={<UserPlus className="w-8 h-8" />}
            />
            <ProcessStep
              step="03"
              title="Select Subjects"
              description="Choose examination subjects for each student"
              icon={<BookOpen className="w-8 h-8" />}
            />
            <ProcessStep
              step="04"
              title="Download Exam Slips"
              description="Generate and print examination slips"
              icon={<Download className="w-8 h-8" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What People Are Saying
            </h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Feedback from students, parents, and school administrators
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-background rounded-xl p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-lg text-foreground mb-6 italic">
                  &quot;{testimonials[currentTestimonial].text}&quot;
                </p>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-foreground/70 text-sm">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 gap-3">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full hover:bg-background"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentTestimonial
                        ? "bg-primary"
                        : "bg-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full hover:bg-background"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type ProcessStepProps = {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

function ProcessStep({ step, title, description, icon }: ProcessStepProps) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
        {icon}
      </div>
      <div className="text-primary font-bold text-lg mb-2">{step}</div>
      <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}
