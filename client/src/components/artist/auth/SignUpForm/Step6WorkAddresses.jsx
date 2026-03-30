"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PrimaryButton from "@/components/shared/PrimaryButton"
import api from "@/lib/api"
import { fetchCities } from "@/lib/cities"
import { fetchRegions } from "@/lib/regions"

export function Step6WorkAddresses({ data, onUpdate, onNext }) {
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    // State for dynamic options
    const [cities, setCities] = useState([])
    const [regions, setRegions] = useState([])
    const [isLoadingCities, setIsLoadingCities] = useState(false)
    const [isLoadingRegions, setIsLoadingRegions] = useState(false)

    // Get country_id from registration data (or fallback to addresses if needed)
    // The user specified we use country_id from registration response
    // We assume data.country_id is available, otherwise default to 1 (Egypt) or check addresses
    const countryId = data.country_id || data.addresses?.[0]?.country_id || 1
    // Get selected values
    const cityId = data.addresses?.[0]?.city_id || ""
    const regionId = data.addresses?.[0]?.region_id || ""

    // Fetch cities on mount (using fixed countryId)
    useEffect(() => {
        const loadCities = async () => {
            if (!countryId) return

            try {
                setIsLoadingCities(true)
                const citiesData = await fetchCities(countryId)
                setCities(citiesData)
            } catch (error) {
                console.error("Failed to load cities:", error)
            } finally {
                setIsLoadingCities(false)
            }
        }
        loadCities()
    }, [countryId])

    // Fetch regions when city changes
    useEffect(() => {
        const loadRegions = async () => {
            if (!cityId) {
                setRegions([])
                return
            }

            try {
                setIsLoadingRegions(true)
                const regionsData = await fetchRegions(cityId)
                setRegions(regionsData)
            } catch (error) {
                console.error("Failed to load regions:", error)
                setRegions([])
            } finally {
                setIsLoadingRegions(false)
            }
        }
        loadRegions()
    }, [cityId])

    const validateForm = () => {
        const newErrors = {}
        if (!cityId) newErrors.city = "المدينة مطلوبة"
        if (!regionId) newErrors.region = "المنطقة مطلوبة"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            return
        }

        try {
            setIsSubmitting(true)
            setSubmitError(null)

            const locationData = {
                country_id: parseInt(countryId),
                city_id: parseInt(cityId),
                region_id: parseInt(regionId)
            }

            // Submit to API using PUT method
            const response = await api.put('/artist-profile/artist-location', locationData)


            // Check if successful
            if (response.data.status === 'success') {
                // Update parent component
                onUpdate({
                    addresses: [{
                        country_id: countryId,
                        city_id: cityId,
                        region_id: regionId
                    }]
                })
                // Move to next step
                onNext()
            } else {
                setSubmitError('فشل في حفظ الموقع. يرجى المحاولة مرة أخرى.')
            }
        } catch (error) {
            console.error('Error submitting location:', error)
            setSubmitError(error.response?.data?.message || 'حدث خطأ أثناء حفظ الموقع. يرجى المحاولة مرة أخرى.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateAddress = (field, value) => {
        const newAddresses = [...(data.addresses || [{}])]
        if (!newAddresses[0]) newAddresses[0] = {}

        // Ensure country_id is preserved
        newAddresses[0].country_id = countryId

        if (field === "city") {
            newAddresses[0].city_id = value
            // Reset region when city changes
            newAddresses[0].region_id = ""
        } else if (field === "region") {
            newAddresses[0].region_id = value
        }

        onUpdate({ addresses: newAddresses })

        // Clear errors
        if (field === "city" && errors.city) setErrors(prev => ({ ...prev, city: "" }))
        if (field === "region" && errors.region) setErrors(prev => ({ ...prev, region: "" }))
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto my-20">
            <h2 className="text-sm font-medium mb-4">اضافة عناوين العمل</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* City Selection */}
                <div className="space-y-2">
                    <label className="text-sm text-descriptive dark:text-gray-300 font-medium block">المدينة</label>
                    <Select
                        value={cityId?.toString()}
                        onValueChange={(val) => handleUpdateAddress("city", val)}
                        disabled={isLoadingCities}
                    >
                        <SelectTrigger className="w-full bg-[#F5F5F5] dark:bg-[#53535365] dark:hover:bg-[#53535365] text-descriptive dark:text-gray-300 border-0 rounded-xl !h-[55px] text-right flex-row-reverse">
                            <SelectValue placeholder={isLoadingCities ? "جاري التحميل..." : "قم باختيار المدينة"} />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                </div>

                {/* Region Selection */}
                <div className="space-y-2">
                    <label className="text-sm text-descriptive dark:text-gray-300 font-medium block">المنطقة</label>
                    <Select
                        value={regionId?.toString()}
                        onValueChange={(val) => handleUpdateAddress("region", val)}
                        disabled={!cityId || isLoadingRegions}
                    >
                        <SelectTrigger className="w-full bg-[#F5F5F5] dark:bg-[#53535365] dark:hover:bg-[#53535365] text-descriptive dark:text-gray-300 border-0 rounded-xl !h-[55px] text-right flex-row-reverse">
                            <SelectValue placeholder={isLoadingRegions ? "جاري التحميل..." : "قم باختيار المنطقة"} />
                        </SelectTrigger>
                        <SelectContent align="end">
                            {regions.map((region) => (
                                <SelectItem key={region.id} value={region.id.toString()}>
                                    {region.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.region && <p className="text-xs text-red-500">{errors.region}</p>}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                {submitError && (
                    <div className="w-full md:w-1/2 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        {submitError}
                    </div>
                )}
                <PrimaryButton
                    onClick={handleSubmit}
                    className="w-full md:w-1/2 mx-auto py-6 rounded-xl mt-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'جاري الحفظ...' : 'المتابعة'}
                </PrimaryButton>
            </div>
        </div>
    )
}
