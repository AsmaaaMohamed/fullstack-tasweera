import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Londrina_Outline } from "next/font/google";
import { Montserrat } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const londrina = Londrina_Outline({
  subsets: ["latin"],
  weight: ["400"], // اختياري
  variable: "--font-londrina", // علشان تستخدمه في الـ CSS
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // اختياري
  variable: "--font-montserrat", // علشان تستخدمه في الـ CSS
});
export default async function LocaleLayout({ children, params }) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={montserrat.variable + " " + londrina.variable}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <AuthProvider>
            <CategoriesProvider>
              <ChatProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster
                    position="bottom-right"
                    expand={true}
                    theme="light"
                    richColors
                  />
                </ThemeProvider>
              </ChatProvider>
            </CategoriesProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
