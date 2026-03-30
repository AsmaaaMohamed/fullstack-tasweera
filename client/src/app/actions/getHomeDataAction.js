"use server";

import { getHomeData } from "@/lib/getHomeData";

export async function getHomeDataAction(locale = "ar") {
  const data = await getHomeData(locale);
  return data;
}