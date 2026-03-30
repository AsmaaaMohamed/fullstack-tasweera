"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { SignupHeader } from "@/components/artist/auth/SignUpForm/SignupHeader";
import { ProgressSteps } from "@/components/artist/auth/SignUpForm/ProgressSteps";
import { Step3CategorySelection } from "@/components/artist/auth/SignUpForm/Step3CategorySelection";
import { Step7BankInfo } from "@/components/artist/auth/SignUpForm/Step7BankInfo";
import { Step6WorkAddresses } from "@/components/artist/auth/SignUpForm/Step6WorkAddresses";
import { Step5WorkSchedule } from "@/components/artist/auth/SignUpForm/Step5WorkSchedule";
import { Step4PhotoSelection } from "@/components/artist/auth/SignUpForm/Step4PhotoSelection";
import { Step2ArtistType } from "@/components/artist/auth/SignUpForm/Step2ArtistType";

// Helper function to map onboarding stage to step number
const getStepFromStage = (stage) => {
  const stageMap = {
    role_sections: 2, // Step2ArtistType & Step3CategorySelection (posted together)
    photos: 4, // Step4PhotoSelection
    availability: 5, // Step5WorkSchedule
    location: 6, // Step6WorkAddresses
    payment: 7, // Step7BankInfo
  };
  return stageMap[stage] || 2; // Default to step 2 if unknown
};

export default function CompleteProfilePage() {
  const router = useRouter();
  // Start from step 2 (first step after signup)
  // We'll use steps 2-7 internally, but display progress as 1-6
  const [currentStep, setCurrentStep] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Step 2
    artistType: "",
    // Step 3
    selectedCategories: [],
    // Step 4
    personalPhoto: null,
    coverPhoto: null,
    portfolioPhotos: [],
    // Step 5
    workSchedule: { from: "08:00", to: "20:00" },
    workDays: [],
    // Step 6
    addresses: [],
    // Step 7
    bankName: "",
    accountNumber: "",
    document: null,
  });

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await api.get("/onboarding-status");
        const { is_onboarding_complete, onboarding_stage } = response.data.data;

        // If onboarding is complete, redirect to artist profile
        if (is_onboarding_complete && onboarding_stage === "complete") {
          router.push("/artist-profile");
          return;
        }

        // If not complete, set the current step based on onboarding stage
        if (onboarding_stage && onboarding_stage !== "complete") {
          const step = getStepFromStage(onboarding_stage);
          setCurrentStep(step);
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
        // On error, default to step 2 (role_sections)
        setCurrentStep(2);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleNextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <Step2ArtistType
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 3:
        return (
          <Step3CategorySelection
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 4:
        return (
          <Step4PhotoSelection
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 5:
        return (
          <Step5WorkSchedule
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 6:
        return (
          <Step6WorkAddresses
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      case 7:
        return (
          <Step7BankInfo
            data={formData}
            onUpdate={handleUpdateFormData}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="">
      <div className="mx-auto px-4 py-8">
        <SignupHeader />
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading your progress...
              </p>
            </div>
          </div>
        ) : (
          <>
            <ProgressSteps currentStep={currentStep} />
            {renderStep()}
          </>
        )}
      </div>
    </div>
  );
}
