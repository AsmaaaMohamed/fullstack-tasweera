import { useLocale } from "next-intl";
export default function OtherInfo({
  skills = [],
  statistics = {},
  email,
  phone,
}) {
  const locale = useLocale();
  const mappedStats = [
    {
      label: locale === "ar" ? "نسبة الاعمال المكتملة" : "Completion Rate",
      value:
        statistics?.completed_booking_percentage != null
          ? `${statistics.completed_booking_percentage}%`
          : "—",
      color:
        statistics?.completed_booking_percentage >= 70
          ? "bg-green-500"
          : statistics?.completed_booking_percentage >= 40
          ? "bg-yellow-500"
          : "bg-red-500",
    },
    {
      label:
        locale === "ar"
          ? "متوسط سرعة الرد على الاستفسارت"
          : "Average Response Rate",
      value: statistics?.fast_response_rate || "—",
      color: "bg-green-500",
    },
    {
      label: locale === "ar" ? "الاعمال التي تم انجازها" : "Completed Works",
      value:
        statistics?.completed_bookings != null
          ? `${statistics.completed_bookings} عمل`
          : "—",
      color: "bg-green-500",
    },
    {
      label:
        locale === "ar"
          ? "الاعمال التي لم يتم انجازها أو التفت"
          : "Cancelled Works",
      value:
        statistics?.cancelled_bookings != null
          ? `${statistics.cancelled_bookings} عمل`
          : "—",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Right Column - Skills and Statistics */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8">
          {/* Skills Section */}
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-300 dark:text-white">
              {locale === "ar" ? "المهارات" : "Skills"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && (
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {locale === "ar"
                    ? "لا توجد مهارات متاحة"
                    : "No skills available"}
                </p>
              )}
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-[#6F4E37] text-white rounded-md px-4 py-2 text-sm md:text-base whitespace-nowrap"
                >
                  {typeof skill === "string" ? skill : skill?.name}
                </span>
              ))}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-300 dark:text-white">
              {locale === "ar" ? "احصائيات" : "Statistics"}
            </h3>
            <div className="flex flex-col gap-4 p-4 bg-gray-100 dark:bg-[#2c2c2c] rounded-md w-full lg:w-2/3">
              {(!statistics || Object.keys(statistics).length === 0) && (
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {locale === "ar"
                    ? "لا توجد احصائيات متاحة"
                    : "No statistics available"}
                </p>
              )}
              {mappedStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4 w-full">
                  <span className="text-sm md:text-base font-medium text-foreground dark:text-white text-right flex-1">
                    {stat.label}
                  </span>
                  <span
                    className={`${stat.color} text-white rounded-md px-4 py-2 text-sm md:text-base font-medium whitespace-nowrap`}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Verifications Section - Left */}
        <div className="lg:w-[400px] space-y-3 lg:translate-x-12">
          <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-300 dark:text-white">
            {locale === "ar" ? "توثيقات" : "Verifications"}
          </h3>
          <div className="flex flex-col gap-3">
            <div className="bg-[#fbc04b] rounded-md px-4 py-3 text-sm md:text-base  text-[#cf8c05]">
              <span className="font-medium">
                {locale === "ar" ? "البريد الالكتروني: " : "Email: "}
              </span>
              <span>{email || "—"}</span>
            </div>
            <div className="bg-[#fbc04b] rounded-md px-4 py-3 text-sm md:text-base  text-[#cf8c05]">
              <span className="font-medium">
                {locale === "ar" ? "رقم الهاتف: " : "Phone: "}
              </span>
              <span>{phone || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
