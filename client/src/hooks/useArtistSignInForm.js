import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useArtistAuth } from "@/contexts/ArtistAuthContext";

export function useArtistSignInForm({ onSuccess } = {}) {
    const locale = useLocale();
    const router = useRouter();
    const { loginWithEmail, loading, error, clearError } = useArtistAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [formErrors, setFormErrors] = useState({});

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
            // Call onSuccess callback if provided, otherwise redirect to artist dashboard
            if (typeof onSuccess === "function") {
                try {
                    onSuccess();
                } catch (err) {
                    router.push("/artist/dashboard");
                }
            } else {
                router.push("/artist/dashboard");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        setFormErrors({});

        await handleEmailLogin();
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

    return {
        // Form data
        formData,
        handleInputChange,

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
