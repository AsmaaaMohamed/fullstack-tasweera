"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import PrimaryButton from "@/components/shared/PrimaryButton"
import { useArtistAuth } from "@/contexts/ArtistAuthContext"
import { fetchSections } from "@/lib/sections"
import { toast } from "sonner"


export function Step3CategorySelection({ data ,onUpdate,onNext }) {
    const [selectedCategories, setSelectedCategories] = useState(data.selectedCategories || [])
    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const { updateArtistRoleAndSections, loading } = useArtistAuth()

    // Fetch categories from API on mount
    useEffect(() => {
        const loadCategories = async () => {
            setCategoriesLoading(true)
            try {
                const fetchedCategories = await fetchSections()
                setCategories(fetchedCategories)
            } catch (error) {
                console.error("Error loading categories:", error)
                toast.error("Failed to load categories")
            } finally {
                setCategoriesLoading(false)
            }
        }

        loadCategories()
    }, [])

    const handleToggle = (categoryId) => {
        setSelectedCategories((prev) => {
            if (prev.includes(categoryId)) {
                return prev.filter((id) => id !== categoryId)
            } else {
                return [...prev, categoryId]
            }
        })
        // Update parent state immediately
        const newSelection = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId]
        onUpdate({ selectedCategories: newSelection })
    }

    const handleNext = async () => {
        // Get the artist type (role) from data
        const artistType = data.artistType

        if (!artistType) {
            toast.error("Artist type is required. Please go back and select your type.")
            return
        }

        if (selectedCategories.length === 0) {
            toast.error("Please select at least one category")
            return
        }

        // Submit role and section IDs to the API
        const result = await updateArtistRoleAndSections(artistType, selectedCategories)

        if (result.success) {
            // Proceed to next step on success
            onNext()
        }
        // Error handling is done in the context with toast messages
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto my-20">
            {categoriesLoading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No categories available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center space-x-2 space-x-reverse rounded-lg p-4 bg-[#FAFAFA] dark:bg-[#53535365]"
                        >
                            <Checkbox
                                id={`category-${category.id}`}
                                checked={selectedCategories.includes(category.id)}
                                onCheckedChange={() => handleToggle(category.id)}
                                className="h-6 w-6 border-gray-300 data-[state=checked]:bg-main data-[state=checked]:border-main"
                            />
                            <label
                                htmlFor={`category-${category.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 text-right pr-2 cursor-pointer"
                            >
                                {category.name}
                            </label>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-center pt-8">
                <PrimaryButton
                    onClick={handleNext}
                    disabled={selectedCategories.length === 0 || loading || categoriesLoading}
                    className="w-full md:w-1/2 py-6  disabled:opacity-50"
                >
                    {loading ? "جاري الحفظ..." : "الاختيار ثم المتابعة"}
                </PrimaryButton>
            </div>
        </div>
    )
}
