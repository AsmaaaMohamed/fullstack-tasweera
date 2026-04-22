import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCountries } from "@/lib/countries";
import { fetchCities, getCityId } from "@/lib/cities";
import { getMiddleEastCountryByName } from "@/lib/middleEastCountries";
import { formatPhoneNumber } from "@/lib/phoneFormatter";
import { parseRegistrationErrors } from "@/lib/errorParser";

export function useSignUpForm() {
  const locale = useLocale();
  const router = useRouter();
  const { register, verifyOtp, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [registrationPhone, setRegistrationPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+966"); // Default to saudi Arabia

  // Load cities when country changes
  const loadCities = async (countryId) => {
    if (!countryId) return;

    setCitiesLoading(true);
    setSelectedCity(""); // Reset city selection
    try {
      const fetchedCities = await fetchCities(countryId);
      setCities(fetchedCities);
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      setCountriesLoading(true);
      try {
        const fetchedCountries = await fetchCountries();
        if (fetchedCountries && fetchedCountries.length > 0) {
          setCountries(fetchedCountries);
          // Set default country to saudi Arabia (first in the list)
          const defaultCountry = fetchedCountries[1];
          setSelectedCountry(defaultCountry);
          // Get dial code from middleEastCountries by country name
          const countryData = getMiddleEastCountryByName(defaultCountry.name);
          setPhoneCountryCode(countryData?.dial || "+966");
          // Load cities for default country
          if (defaultCountry.id) {
            loadCities(defaultCountry.id);
          }
        } else {
          console.warn("No countries fetched from API");
          setCountries([]);
        }
      } catch (error) {
        console.error("Error loading countries:", error);
        setCountries([]);
      } finally {
        setCountriesLoading(false);
      }
    };

    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle country change
  const handleCountryChange = (countryName) => {
    const country = countries.find((c) => c.name === countryName);
    if (country) {
      setSelectedCountry(country);
      // Get dial code from middleEastCountries by country name
      const countryData = getMiddleEastCountryByName(country.name);
      setPhoneCountryCode(countryData?.dial || "+20");
      loadCities(country.id);
      // Clear city error if any
      if (formErrors.city) {
        setFormErrors({ ...formErrors, city: undefined });
      }
    }
  };

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = locale === "ar" ? "الاسم مطلوب" : "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email =
        locale === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email =
        locale === "ar" ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    }

    if (!formData.phone.trim()) {
      errors.phone =
        locale === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    }

    if (!selectedCity) {
      errors.city = locale === "ar" ? "المدينة مطلوبة" : "City is required";
    }

    if (!formData.password) {
      errors.password =
        locale === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (formData.password.length < 8) {
      errors.password =
        locale === "ar"
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword =
        locale === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    // Map country and city to IDs
    if (!selectedCountry) {
      setFormErrors({
        ...formErrors,
        city:
          locale === "ar" ? "يرجى اختيار الدولة" : "Please select a country",
      });
      return;
    }

    const countryId = selectedCountry.id;
    const cityId = getCityId(selectedCity, cities);

    if (!cityId) {
      setFormErrors({
        ...formErrors,
        city: locale === "ar" ? "يرجى اختيار المدينة" : "Please select a city",
      });
      return;
    }

    // Format phone number with country code
    const fullPhoneNumber = formatPhoneNumber(formData.phone, phoneCountryCode);

    // Prepare registration data
    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: fullPhoneNumber,
      country_id: countryId,
      city_id: cityId,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    };

    const result = await register(registrationData);

    if (result.success) {
      // Store phone for OTP verification (use the formatted phone number)
      setRegistrationPhone(fullPhoneNumber);
      // Show OTP input
      setShowOtpInput(true);
    } else {
      // Log the error for debugging
      console.error("Registration error:", result);
      console.error("API errors:", result.errors);
      console.error("Full error response:", result.fullError);

      // Parse errors using the error parser utility
      const apiErrors = parseRegistrationErrors(result);
      
      if (Object.keys(apiErrors).length > 0) {
        setFormErrors(apiErrors);
      } else {
        // If no field-specific errors, show general error
        console.error("No field-specific errors found in response");
      }
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

    const result = await verifyOtp(registrationPhone, otp.trim(), "register");

    if (result.success) {
      // Redirect to home page after successful registration and OTP verification
      router.push("/home");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: undefined,
      });
    }
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    if (formErrors.city) {
      setFormErrors({ ...formErrors, city: undefined });
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target ? e.target.value : e;
    setOtp(value);
    if (formErrors.otp) {
      setFormErrors({ ...formErrors, otp: undefined });
    }
  };

  const handleBackToForm = () => {
    setShowOtpInput(false);
    setOtp("");
    clearError();
  };

  return {
    // Form data
    formData,
    setFormData,
    handleInputChange,
    
    // Countries and cities
    countries,
    cities,
    selectedCountry,
    selectedCity,
    countriesLoading,
    citiesLoading,
    handleCountryChange,
    handleCityChange,
    
    // Phone
    phoneCountryCode,
    
    // OTP
    showOtpInput,
    otp,
    registrationPhone,
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

