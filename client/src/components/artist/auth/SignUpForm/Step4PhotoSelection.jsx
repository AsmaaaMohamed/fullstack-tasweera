"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import PrimaryButton from "@/components/shared/PrimaryButton"
import { X } from "lucide-react"
import api from "@/lib/api"

export function Step4PhotoSelection({ data, onUpdate, onNext }) {
    const [personalPhoto, setPersonalPhoto] = useState(data.personalPhoto || null)
    const [coverPhoto, setCoverPhoto] = useState(data.coverPhoto || null)
    const [portfolioPhotos, setPortfolioPhotos] = useState(data.portfolioPhotos || [])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState(null)

    const personalInputRef = useRef(null)
    const coverInputRef = useRef(null)
    const portfolioInputRefs = useRef([])

    const isValidImageType = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
        return validTypes.includes(file.type.toLowerCase())
    }

    const handleFileChange = (e, type) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!isValidImageType(file)) {
                setUploadError('يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG فقط')
                return
            }
            setUploadError(null)
            if (type === "personal") {
                setPersonalPhoto(file)
                onUpdate({ ...data, personalPhoto: file })
            }
            if (type === "cover") {
                setCoverPhoto(file)
                onUpdate({ ...data, coverPhoto: file })
            }
        }
    }

    const handlePortfolioFileChange = (e, index) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!isValidImageType(file)) {
                setUploadError('يرجى اختيار صورة بصيغة JPG أو JPEG أو PNG فقط')
                return
            }
            setUploadError(null)
            const newPortfolioPhotos = [...portfolioPhotos]
            newPortfolioPhotos[index] = file
            setPortfolioPhotos(newPortfolioPhotos)
            onUpdate({ ...data, portfolioPhotos: newPortfolioPhotos })
        }
    }

    const removePortfolioPhoto = (index) => {
        const newPortfolioPhotos = [...portfolioPhotos]
        newPortfolioPhotos[index] = null
        setPortfolioPhotos(newPortfolioPhotos)
        onUpdate({ ...data, portfolioPhotos: newPortfolioPhotos })
        // Reset the input
        if (portfolioInputRefs.current[index]) {
            portfolioInputRefs.current[index].value = ''
        }
    }

    const getImagePreview = (file) => {
        if (!file) return null
        return URL.createObjectURL(file)
    }

    const handleSubmit = async () => {
        try {
            setIsUploading(true)
            setUploadError(null)

            // Create FormData for image upload
            const formData = new FormData()

            // Get files directly from input refs (File objects may not serialize properly in state)
            // Add profile picture
            if (personalInputRef.current?.files?.[0]) {
                const file = personalInputRef.current.files[0]
                console.log('Adding profile_picture:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    isFile: file instanceof File
                })
                formData.append('profile_picture', file, file.name)
            }

            // Add cover photo
            if (coverInputRef.current?.files?.[0]) {
                const file = coverInputRef.current.files[0]
                console.log('Adding cover_photo:', {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    isFile: file instanceof File
                })
                formData.append('cover_photo', file, file.name)
            }

            // Add gallery photos from each input ref
            portfolioInputRefs.current.forEach((inputRef, index) => {
                if (inputRef?.files?.[0]) {
                    const file = inputRef.files[0]
                    console.log(`Adding gallery_photos[${index}]:`, {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        isFile: file instanceof File
                    })
                    formData.append('gallery_photos[]', file, file.name)
                }
            })

            console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
                key,
                fileName: value instanceof File ? value.name : 'not a file',
                fileType: value instanceof File ? value.type : 'not a file',
                isFile: value instanceof File
            })))

            // Upload images to the backend
            // Override the default Content-Type from api instance to allow axios to set multipart/form-data automatically
            const response = await api.post('/artist-profile/uploadImages', formData, {
                headers: {
                    'Content-Type': undefined, // Remove default 'application/json' to let axios set multipart/form-data
                },
            })

            // Check if upload was successful
            if (response.data.status === 'success') {
                // Update parent component data
                onUpdate({ personalPhoto, coverPhoto, portfolioPhotos })
                // Move to next step
                onNext()
            } else {
                setUploadError('فشل تحميل الصور. يرجى المحاولة مرة أخرى.')
            }
        } catch (error) {
            console.error('Error uploading images:', error)
            console.error('Error response:', error.response?.data)
            setUploadError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الصور. يرجى المحاولة مرة أخرى.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto my-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Background */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 text-right block py-[10px] dark:text-gray-300">
                        اضافة صورة خلفية البروفايل
                    </label>
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="border-2 border-dashed border-main bg-[#F5F5F5] dark:bg-[#53535365] rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#43434365] transition-colors relative overflow-hidden"
                    >
                        {coverPhoto ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={getImagePreview(coverPhoto)}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    <span className="text-white opacity-0 hover:opacity-100 text-sm">تغيير الصورة</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-full p-2 mb-2 text-white">
                                    <Image src="/auth/icons/ep_upload-filled.svg" alt="Upload" width={32} height={32} />
                                </div>
                                <p className="text-descriptive font-medium text-sm dark:text-gray-300">قم بارفاق الملف</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "cover")}
                    />
                </div>

                {/* Personal Photo */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-600 text-right block py-[10px] dark:text-gray-300">
                        اضافة صورة الشخصية
                    </label>
                    <div
                        onClick={() => personalInputRef.current?.click()}
                        className="border-2 border-dashed border-amber-300 bg-[#F5F5F5] dark:bg-[#53535365] rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#43434365] transition-colors relative overflow-hidden"
                    >
                        {personalPhoto ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={getImagePreview(personalPhoto)}
                                    alt="Personal"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0  bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    <span className="text-white opacity-0 hover:opacity-100 text-sm">تغيير الصورة</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-full p-2 mb-2 text-white">
                                    <Image src="/auth/icons/ep_upload-filled.svg" alt="Upload" width={32} height={32} />
                                </div>
                                <p className="text-descriptive font-medium text-sm dark:text-gray-300">قم بارفاق الملف</p>
                            </>
                        )}
                    </div>
                    <input
                        ref={personalInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "personal")}
                    />
                </div>
            </div>

            {/* Work Portfolio */}
            <div className="space-y-2">
                <label className="text-sm text-gray-600 text-right block py-[10px] dark:text-gray-300">
                    صور ملف العمل (حتى 8 صور)
                </label>
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => {
                        const photo = portfolioPhotos[i]
                        return (
                            <div key={i} className="relative group">
                                <div
                                    onClick={() => !photo && portfolioInputRefs.current[i]?.click()}
                                    className={`border-2 h-[68px] w-full border-dashed border-amber-300 rounded-lg flex items-center justify-center cursor-pointer transition-all relative overflow-hidden ${photo
                                        ? 'bg-gray-100 dark:bg-[#53535365]'
                                        : 'bg-white dark:bg-[#53535365] hover:bg-gray-50 dark:hover:bg-[#43434365]'
                                        }`}
                                >
                                    {photo ? (
                                        <>
                                            <Image
                                                src={getImagePreview(photo)}
                                                alt={`Portfolio ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removePortfolioPhoto(i)
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                                type="button"
                                            >
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <span>
                                            <Image
                                                src="/auth/icons/upload-photo.svg"
                                                alt="Upload"
                                                width={24}
                                                height={24}
                                            />
                                        </span>
                                    )}
                                </div>
                                <input
                                    ref={(el) => (portfolioInputRefs.current[i] = el)}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePortfolioFileChange(e, i)}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                {uploadError && (
                    <div className="w-full md:w-1/2 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        {uploadError}
                    </div>
                )}
                <PrimaryButton
                    onClick={handleSubmit}
                    className="w-full md:w-1/2 py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    disabled={isUploading}
                >
                    {isUploading ? 'جاري التحميل...' : 'المتابعة'}
                </PrimaryButton>
            </div>
        </div>
    )
}
