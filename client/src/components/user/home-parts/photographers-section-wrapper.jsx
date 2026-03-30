import { getHomeDataAction } from "@/app/actions/getHomeDataAction";
import PhotographersSection from "./photographers-section";

export default async function PhotographersSectionWrapper({ lang = "ar" }) {
  const { photographers } = await getHomeDataAction(lang); // server action runs here
  return (
    <PhotographersSection
      photographers={photographers}
      lang={lang}
    />
  );
}