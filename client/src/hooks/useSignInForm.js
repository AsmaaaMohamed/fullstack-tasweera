import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhoneNumber } from "@/lib/phoneFormatter";

export function useSignInForm({ onSuccess } = {}) {
  const locale = useLocale();
  const router = useRouter();
  const { loginWithEmail, loginWithPhone, verifyOtp, loading, error, clearError } = useAuth();

  const [loginMethod, setLoginMethod] = useState("phone");
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    remember: false,
  });

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [phoneCountryCode, setPhoneCountryCode] = useState("+966"); // Default to saudi Arabia

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateEmailForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = locale === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    }

    if (!formData.password) {
      errors.password = locale === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePhoneForm = () => {
    const errors = {};

    if (!formData.phone.trim()) {
      errors.phone = locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmailForm()) {
      return;
    }

    clearError();
    setFormErrors({});

    const result = await loginWithEmail(
      formData.email.trim(),
      formData.password,
      formData.remember
    );

    if (result.success) {
      // Call onSuccess callback if provided, otherwise redirect to locale root
      if (typeof onSuccess === "function") {
        try {
          onSuccess();
        } catch (err) {
          // If callback throws, fall back to default navigation
          router.push("/home");
        }
      } else {
        router.push("/home");
      }
    } else {
      // Handle errors
      if (result.errors) {
        setFormErrors(result.errors);
      } else {
        setFormErrors({
          _general: result.message || (locale === "ar" ? "فشل تسجيل الدخول" : "Login failed"),
        });
      }
    }
  };

  const handlePhoneLogin = async () => {
    if (!validatePhoneForm()) {
      return;
    }

    clearError();
    setFormErrors({});

    // Format phone number with country code
    const fullPhoneNumber = formatPhoneNumber(formData.phone, phoneCountryCode);

    const result = await loginWithPhone(fullPhoneNumber);

    if (result.success) {
      // Store phone for OTP verification
      setLoginPhone(fullPhoneNumber);
      // Show OTP input
      setShowOtpInput(true);
    } else {
      // Handle errors
      if (result.errors) {
        setFormErrors(result.errors);
      } else {
        setFormErrors({
          _general: result.message || (locale === "ar" ? "فشل تسجيل الدخول" : "Login failed"),
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    if (loginMethod === "email") {
      await handleEmailLogin();
    } else {
      await handlePhoneLogin();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!otp.trim()) {
      setFormErrors({
        otp: locale === "ar" ? "رمز التحقق مطلوب" : "OTP is required",
      });
      return;
    }

    const result = await verifyOtp(loginPhone, otp.trim(), "login");

    if (result.success) {
      // Call onSuccess callback if provided, otherwise redirect to locale root
      if (typeof onSuccess === "function") {
        try {
          onSuccess();
        } catch (err) {
          router.push("/home");
        }
      } else {
        router.push("/home");
      }
    } else {
      // Handle errors
      if (result.errors) {
        setFormErrors(result.errors);
      } else {
        setFormErrors({
          otp: result.message || (locale === "ar" ? "فشل التحقق" : "Verification failed"),
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target ? e.target.value : e;
    setOtp(value);
    if (formErrors.otp) {
      setFormErrors({
        ...formErrors,
        otp: undefined,
      });
    }
  };

  const handleBackToForm = () => {
    setShowOtpInput(false);
    setOtp("");
    clearError();
  };

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
    setFormErrors({});
    clearError();
    // Reset form data when switching methods
    setFormData({
      email: "",
      phone: "",
      password: "",
      remember: false,
    });
  };

  const handleCountryChange = (country) => {
    if (country && country.dial) {
      setPhoneCountryCode(country.dial);
    }
  };

  return {
    // Login method
    loginMethod,
    setLoginMethod: handleLoginMethodChange,

    // Form data
    formData,
    handleInputChange,

    // Phone
    phoneCountryCode,
    handleCountryChange,

    // OTP
    showOtpInput,
    otp,
    loginPhone,
    handleOtpChange,
    handleOtpSubmit,
    handleBackToForm,

    // Form submission
    handleSubmit,

    // Errors
    formErrors,

    // Auth context
    loading,
    error,
    clearError,
  };
}

