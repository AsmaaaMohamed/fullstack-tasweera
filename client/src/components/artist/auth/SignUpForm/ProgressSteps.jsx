import { cn } from "@/lib/utils"
import { MapPin, Clock, Images, CreditCard } from "lucide-react"
const STEPS = [
    { id: "photo", label: "إضافة صورة", icon: Images },
    { id: "hours", label: "ساعات العمل", icon: Clock },
    { id: "address", label: "العنوان", icon: MapPin },
    { id: "payment", label: "وسائل الدفع", icon: CreditCard },
]

export function ProgressSteps({ currentStep, direction = "ltr" }) {
    // Map internal step (4-7) to visual step (1-4)
    // If currentStep is less than 4, we might not show this progress bar or show step 0
    const visualStep = currentStep - 3;

    if (visualStep < 1) return null // Don't show on first 3 steps

    return (
        // <div className="mb-12 max-w-md mx-auto">
        //     <div className="flex items-center justify-between relative">
        //         {/* Background Line */}
        //         <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />

        //         {/* Active Line */}
        //         <div
        //             className="absolute right-0 top-1/2 h-0.5 -translate-y-1/2 bg-amber-500 transition-all duration-300"
        //             style={{ width: `${((visualStep - 1) / (STEPS.length - 1)) * 100}%` }}
        //         />

        //         {STEPS.map((step) => (
        //             <div key={step.number} className="relative z-10 flex flex-col items-center bg-white dark:bg-background px-2">
        //                 <div
        //                     className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${visualStep >= step.number
        //                         ? " bg-main text-white"
        //                         : " bg-[#EFEFF0] dark:bg-gray-800 text-gray-400"
        //                         }`}
        //                 >
        //                     <span className="text-lg">{step.icon}</span>
        //                 </div>
        //                 <span className={`mt-2 text-xs font-medium ${visualStep >= step.number ? "text-foreground" : "text-muted-foreground"
        //                     }`}>
        //                     {step.label}
        //                 </span>
        //             </div>
        //         ))}
        //     </div>
        // </div>
        <div className={cn("w-full py-8 max-w-md mx-auto", direction === "rtl" && "rtl")} >
            {/* Progress Container */}
            <div className="relative flex items-center justify-between">
                {/* Connecting Lines */}
                {STEPS.map((step, index) => {
                    if (index === STEPS.length - 1) return null

                    const isCompleted = index < visualStep - 1
                    const lineColor = isCompleted || index < visualStep - 1 ? "bg-main" : "bg-[#E3E3E3] dark:bg-descriptive"

                    return (
                        <div
                            key={`line-${step.id}`}
                            className={cn("absolute h-0.5 transition-all duration-300", lineColor)}
                            style={{
                                left: `${(index + 0.5) * (100 / STEPS.length)}%`,
                                right: `${(STEPS.length - index - 1.5) * (100 / STEPS.length)}%`,
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}
                        />
                    )
                })}

                {/* Step Circles */}
                {STEPS.map((step, index) => {
                    const stepNumber = index + 1 // Steps are 1-indexed (1, 2, 3, 4)
                    const isCompleted = stepNumber < visualStep
                    const isActive = stepNumber === visualStep
                    const IconComponent = step.icon

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative z-20">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 flex-shrink-0",
                                    isActive || isCompleted ? "bg-main text-white dark:text-gray-200" : "bg-[#EFEFF0] text-[#8C8C91] dark:bg-descriptive dark:text-gray-300",
                                )}
                            >
                                <IconComponent size={24} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Labels */}
            <div className="flex items-start justify-between gap-2 mt-4">
                {STEPS.map((step, index) => (
                    <div key={`label-${step.id}`} className="flex-1 text-center">
                        <p
                            className={cn(
                                "text-xs font-medium transition-colors text-[#334155] dark:text-gray-300 duration-300"
                            )}
                        >
                            {step.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
