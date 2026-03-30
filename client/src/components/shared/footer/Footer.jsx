import { getAppInfo } from "@/app/actions/getAppInfo";
import FooterClient from "./FooterClient";

async function Footer() {
  const data = await getAppInfo();
  return (
    <FooterClient contactInfo={data?.data.contact_info}/>
  );
}

export default Footer;
