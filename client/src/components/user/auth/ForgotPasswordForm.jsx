"use client";

import { Link } from "@/i18n/navigation";

export default function ForgotPasswordForm() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-[#1C1C1D]">
      <h2 className="text-xl font-semibold mb-3 dark:text-white">Password reset unavailable</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Password reset is temporarily unavailable until the new reset flow is added.
      </p>
      <Link href="/signin" className="mt-4 inline-block text-sm text-orange-500 hover:text-orange-600">
        Back to sign in
      </Link>
    </div>
  );
}
