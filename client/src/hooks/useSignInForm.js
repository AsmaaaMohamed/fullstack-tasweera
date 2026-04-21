import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useSignInForm({ onSuccess } = {}) {
  const locale = useLocale();
  const router = useRouter();
  const { loginWithEmail, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateEmailForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = locale === "ar" ? "Email is required" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = locale === "ar" ? "Invalid email format" : "Invalid email format";
    }

    if (!formData.password) {
      errors.password = locale === "ar" ? "Password is required" : "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    if (!validateEmailForm()) {
      return;
    }

    const result = await loginWithEmail(
      formData.email.trim(),
      formData.password,
      formData.remember
    );

    if (result.success) {
      if (typeof onSuccess === "function") {
        try {
          onSuccess();
        } catch (err) {
          router.push("/home");
        }
      } else {
        router.push("/home");
      }
    } else if (result.errors) {
      setFormErrors(result.errors);
    } else {
      setFormErrors({
        _general: result.message || "Login failed",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  return {
    formData,
    handleInputChange,
    handleSubmit,
    formErrors,
    loading,
    error,
    clearError,
  };
}
