"use client"

import { useState } from "react"
import PrimaryButton from "@/components/shared/PrimaryButton"

export function Step2ArtistType({ data = {},
    onUpdate ,
    onNext }) {
    const [selected, setSelected] = useState(data.artistType || "")

    const types = [
        { id: "photographer", label: "فنان (مصور)", description: "" },
        { id: "Actor", label: "فنان (ممثل)", description: "" },
    ]

    const handleSelect = (typeId) => {
        setSelected(typeId)
        onUpdate({ artistType: typeId })
    }

    const handleNext = () => {
        if (selected) {
            onNext()
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto my-20">

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {types.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleSelect(type.id)}
                        className={`rounded-lg border-2 p-6 text-center transition-all h-[95px] flex flex-col items-center justify-center relative border-gray-200 bg-white dark:bg-[#53535365] dark:border-0 }`}
                    >
                        <div className="flex items-center w-full">
                            
                            <div
                                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center border-main ${selected === type.id ? " bg-main" : "border-gray-300"
                                    }`}
                            >
                                
                            </div>
                            <span className="font-medium text-lg px-[10px]">{type.label}</span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-center">
                <PrimaryButton
                    onClick={handleNext}
                    disabled={!selected}
                    className="w-full md:w-1/2 py-6  disabled:opacity-50"
                >
                    الاختيار ثم المتابعة
                </PrimaryButton>
            </div>
        </div>
    )
}
