"use client";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const locale = useLocale();
  return (
    <div className="min-h-screen flex relative">
      {/* Left side - Illustration */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full ">{children}</div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-400 items-end relative ">
        <div className={`absolute ${locale === "ar" ? "end-0" : "start-0"}`}>
          <Image
            src={
              pathname.includes("signup")
                ? "/auth/camera1.png"
                : "/auth/camera.png"
            }
            alt="Authentication"
            width={420}
            height={560}
            className={`w-[600px] max-w-full h-auto }`}
            priority
          />
        </div>
      </div>
    </div>
  );
}
