"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Step1PhoneInput from "./ForgotPasswordSteps/Step1PhoneInput";
import Step2VerificationCode from "./ForgotPasswordSteps/Step2VerificationCode";
import Step3NewPassword from "./ForgotPasswordSteps/Step3NewPassword";
import api, { COOKIE_OPTIONS, syncAuthToken } from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { verifyOtp } = useAuth();
  const isMounted = useRef(true);

  // State declarations with cookie persistence for step
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorr, setErrorr] = useState("");

  // Check for existing reset token on mount
  useEffect(() => {
    isMounted.current = true;
    const resetToken = Cookies.get("reset_token");
    if (resetToken) {
      setStep(3);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Persist step to cookies when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      Cookies.set("forgotPasswordStep", step.toString());
    }
  }, [step]);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorr("");

    try {
      // Call the forget password endpoint
      const response = await api.post("/forget-password", {
        phone: phone,
      });
      if (response.data.success) {
        setStep(2);
      } else {
        toast.error(
          response.data.message || "Failed to send verification code"
        );
        setErrorr(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      setErrorr(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
      toast.error(
        error.response?.data?.message ||
          "An error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission
    }
    if (!isMounted.current) return;

    setLoading(true);
    setErrorr("");

    try {
      const code = verificationCode.join("");
      const response = await verifyOtp(phone, code, "reset_password");

      if (response?.success) {
        // Store the reset token in cookies for the password reset step
        if (response.reset_token) {
          Cookies.set("reset_token", response.reset_token);
          // Use a callback to ensure we have the latest state
          setStep(3);
        } else {
          console.error("No reset token in response:", response);
          toast.error("Verification successful but no reset token received");
          setErrorr("Verification successful but no reset token received");
        }
      } else {
        console.error("OTP verification failed:", response);
        toast.error(response?.message || "Invalid verification code");
        setErrorr(response?.message || "Invalid verification code");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to verify code. Please try again."
      );
      setErrorr(
        error.response?.data?.message ||
          error.message ||
          "Failed to verify code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    if (e) {
      e.preventDefault(); // Prevent default form submission
    }
    if (newPassword !== confirmPassword) {
      setErrorr("Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorr("");

    try {
      const resetToken = Cookies.get("reset_token");
      if (!resetToken) {
        toast.error(
          "Reset token not found. Please try the password reset process again."
        );
        throw new Error(
          "Reset token not found. Please try the password reset process again."
        );
      }

      const response = await api.post("/reset-password", {
        password: newPassword,
        password_confirmation: confirmPassword,
        reset_token: resetToken, // Use the stored reset token
      });
      if (response?.data?.success) {
        // Clean up the reset token from cookies
        Cookies.remove("reset_token");
        const authToken = response?.data?.token;
        Cookies.set("auth_token", authToken, COOKIE_OPTIONS);
        Cookies.set("user_type", response?.data?.user_type, COOKIE_OPTIONS);
        // Sync token to default headers
        syncAuthToken();

        toast.success("Password reset successfully");

        // Redirect to login with success message
        router.push("/artist/signin?reset=success");
      } else {
        toast.error(response?.data?.message || "Failed to reset password");
        setErrorr(response?.data?.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
      setErrorr(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setErrorr("");

    try {
      await api.post("/forget-password", {
        phone: phone,
      });
      setVerificationCode(Array(6).fill(""));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
      setErrorr(
        error.response?.data?.message ||
          "Failed to resend code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-[#1C1C1D]">
      {step === 1 && (
        <Step1PhoneInput
          phone={phone}
          setPhone={setPhone}
          onSubmit={handleStep1Submit}
          loading={loading}
          error={errorr}
        />
      )}

      {step === 2 && (
        <Step2VerificationCode
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          onResendCode={handleResendCode}
          onSubmit={handleStep2Submit}
          loading={loading}
          error={errorr}
        />
      )}

      {step === 3 && (
        <Step3NewPassword
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSubmit={handleStep3Submit}
          loading={loading}
          error={errorr}
        />
      )}
    </div>
  );
}
