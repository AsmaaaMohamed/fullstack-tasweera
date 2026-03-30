import { useTranslations } from "next-intl";
import ForgotPasswordForm from "@/components/user/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");

  return <ForgotPasswordForm />;
}
