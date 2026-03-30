import { useTranslations } from "next-intl";
import SignUpForm from "@/components/user/auth/SignUpForm";

export default function SignUpPage() {
  const t = useTranslations("Auth");

  return <SignUpForm />;
}
