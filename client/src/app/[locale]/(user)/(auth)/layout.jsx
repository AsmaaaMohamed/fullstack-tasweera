"use client";
import Image from "next/image";
import { usePathname } from "@/i18n/navigation";
export default function AuthLayout({ children }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="hidden lg:flex lg:w-1/2 bg-yellow-400 items-end justify-center ">
        <div className="w-full flex justify-center">
          <Image
            src={
              pathname === "/signin" ? "/auth/camera.png" : "/auth/camera1.png"
            }
            alt="Authentication"
            width={420}
            height={560}
            className={`w-[600px] max-w-full h-auto ${
              pathname !== "/signin" ? "-translate-x-20" : ""
            }`}
            priority
          />
        </div>
      </div>
    </div>
  );
}
