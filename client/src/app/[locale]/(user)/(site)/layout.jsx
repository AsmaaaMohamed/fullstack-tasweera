import Footer from "@/components/shared/footer/Footer";
import Header from "@/components/shared/header/Header";
import { Fragment } from "react";
import { StoriesProvider } from "@/contexts/StoriesContext";
import { cookies } from "next/headers";

export default async function HomeLayout({ children }) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const isAuth = !!authToken;

  return (
    <Fragment>
      <Header />
      <StoriesProvider initialIsAuth={isAuth}>{children}</StoriesProvider>
      <Footer />
    </Fragment>
  );
}
