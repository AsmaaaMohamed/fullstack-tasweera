import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useArtistAuth } from "@/contexts/ArtistAuthContext";
import { fetchCountries } from "@/lib/countries";
import { fetchCities, getCityId } from "@/lib/cities";
import { getMiddleEastCountryByName } from "@/lib/middleEastCountries";
import { formatPhoneNumber } from "@/lib/phoneFormatter";
import { parseRegistrationErrors } from "@/lib/errorParser";

export function useArtistSignUpForm() {
    const locale = useLocale();
    const router = useRouter();
    const { register, loading, error, clearError } = useArtistAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        exp: "",
        password: "",
        confirmPassword: "",
    });

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedCity, setSelectedCity] = useState("");
    const [countriesLoading, setCountriesLoading] = useState(true);
    const [citiesLoading, setCitiesLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [phoneCountryCode, setPhoneCountryCode] = useState("+966"); // Default to Saudi Arabia

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
                    // Set default country to Saudi Arabia (second in the list usually)
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
    const handleCountryChange = (country) => {
        if (country && country.dial) {
            setPhoneCountryCode(country.dial);
        }
    };

    const handleCountrySelection = (countryName) => {
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

        if (!formData.exp || formData.exp.trim() === "") {
            errors.exp = locale === "ar" ? "سنوات الخبرة مطلوبة" : "Years of experience is required";
        } else if (parseInt(formData.exp) < 0) {
            errors.exp = locale === "ar" ? "سنوات الخبرة يجب أن تكون رقم موجب" : "Years of experience must be a positive number";
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
            years_of_experience: parseInt(formData.exp),
            password: formData.password,
            password_confirmation: formData.confirmPassword,
        };

        const result = await register(registrationData);

        if (result.success) {
            router.push("/artist/complete");
        } else {
            // Log the error for debugging
            console.error("Artist Registration error:", result);
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
        handleCountrySelection,
        handleCountryChange,
        handleCityChange,

        // Phone
        phoneCountryCode,

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
