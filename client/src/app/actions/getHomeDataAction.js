"use server";

import { getHomeData } from "@/lib/getHomeData";

export async function getHomeDataAction(locale) {
  console.log("Fetching home data for locale:", locale);
  const data = await getHomeData(locale);
  return data;
}