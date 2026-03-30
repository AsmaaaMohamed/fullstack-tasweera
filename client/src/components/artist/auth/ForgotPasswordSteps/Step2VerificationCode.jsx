"use client";
import { useRef, useEffect } from "react";
import PrimaryInput from "@/components/shared/PrimaryInput";

export default function Step2VerificationCode({
  verificationCode,
  setVerificationCode,
  onResendCode,
  onSubmit,
  loading,
  error,
}) {
  const inputRefs = useRef([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handlePaste = (e, index) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (paste.length > 0 && /^\d+$/.test(paste)) {
      const newCode = [...verificationCode];
      const pasteDigits = paste.split("").slice(0, 6 - index);

      pasteDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setVerificationCode(newCode);

      // Focus next available input or submit
      const nextIndex = Math.min(index + pasteDigits.length, 5);
      if (nextIndex < 5 && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeChange = (index, value, e) => {
    if (value && isNaN(value)) return;

    const newCode = [...verificationCode];

    // If pasting multiple digits, handle them all
    if (value && value.length > 1) {
      const digits = value.split("").slice(0, 6 - index);
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      setVerificationCode(newCode);

      // Move focus to the next available input or submit
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6 && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
      return;
    }

    // Handle single digit input
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input if there's a value and not the last input
    if (value && index < 5) {
      // Small timeout to ensure the input is updated before focusing
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 10);
    } else if (
      !value &&
      e.nativeEvent.inputType === "deleteContentBackward" &&
      index > 0
    ) {
      // Only move to previous on backspace if the current input is empty
      setTimeout(() => {
        inputRefs.current[index - 1]?.focus();
      }, 10);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Code</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4 dark:text-gray-300!">
        Enter the verification code sent to your phone
      </p>
      <div className="flex justify-between space-x-2 mb-4">
        {verificationCode.map((digit, index) => (
          <PrimaryInput
            key={index}
            id={`verification-${index}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value, e)}
            onKeyDown={(e) => {
              // Move to previous input on backspace when at the start of an input
              if (
                e.key === "Backspace" &&
                !verificationCode[index] &&
                index > 0
              ) {
                e.preventDefault();
                inputRefs.current[index - 1]?.focus();
              }
              // Call the original handleKeyDown for other key events
              handleKeyDown(e, index);
            }}
            onFocus={(e) => {
              // Select all text when focusing on an input
              e.target.select();
            }}
            onPaste={(e) => handlePaste(e, index)}
            ref={(el) => (inputRefs.current[index] = el)}
            className="w-12 h-12 text-center"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            required
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onResendCode}
        disabled={loading}
        className="text-sm text-primary hover:underline dark:text-primary dark:hover:underline"
      >
        Resend Code
      </button>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 mt-4 dark:bg-[#363636] dark:hover:bg-[#363636]"
      >
        {loading ? "Verifying..." : "Verify Code"}
      </button>
    </form>
  );
}
