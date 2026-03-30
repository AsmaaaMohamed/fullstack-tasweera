import { getAppInfo } from "@/app/actions/getAppInfo";
import Image from "next/image";

const AboutPage = async ({ params }) => {
  const data = await getAppInfo();
  const { locale } = params;

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
          {locale === "ar" ? "حول تصويرة" : "About App"}
        </h4>
        <p className="text-descriptive dark:text-gray-100 text-sm/9 font-medium ">
          {data?.data.about_app}
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
