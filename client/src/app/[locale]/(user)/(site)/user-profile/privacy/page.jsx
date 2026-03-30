import { getLocale } from "next-intl/server";
import Image from "next/image";
import React from "react";

const PrivacyPage = async () => {
  const locale = await getLocale(); // Get locale from next-intl
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/privacy-policy?lang=${locale}`
  );
  // Parse the JSON response
  const data = await response.json();

  return (
    <div className="flex flex-col items-center py-6 px-4 gap-12">
      <div>
        <Image
          src="/user/profile/about.png"
          alt="about"
          width={180}
          height={78}
          className="dark:hidden"
        />
        <Image
          src="/white-logo.svg"
          alt="Logo"
          width={180}
          height={78}
          className="w-[130px] h-auto hidden dark:block"
        />
      </div>
      <div className="bg-[#f5f5f5] dark:bg-[#1C1C1D] py-6 pb-10 px-4 max-w-xl rounded-lg">
        <h4 className="text-black dark:text-white text-lg/9">
          {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h4>
        <p className="text-descriptive text-sm/9 font-medium dark:text-gray-300">
          {data?.data.content}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
