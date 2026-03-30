"use server";

import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

export async function getAppInfo() {
  try {
    // Check if API base URL is configured
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_BASE_URL is not configured");
      return null;
    }

    const cookieStore = await cookies();
    const locale = await getLocale(); // Get locale from next-intl

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/app/about?lang=${locale}`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${cookieStore.get("auth_token")?.value || ""}`,
      },
      cache: "no-store",
    });

    // Check if response is OK
    if (!response.ok) {
      console.error(
        `Failed to fetch app info: ${response.status} ${response.statusText}`
      );
      return null;
    }

    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching app info:", error);
    // Return null or a default object instead of throwing
    return null;
  }
}
