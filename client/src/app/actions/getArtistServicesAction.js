"use server";

import { cookies } from "next/headers";

/**
 * Server action to fetch artist services.
 * This uses server-side cookies and works in server components.
 */
export async function getArtistServicesAction() {
  try {
    // Check if API base URL is configured
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.error("NEXT_PUBLIC_API_BASE_URL is not configured");
      return [];
    }

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value || "";

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/artist/services`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    // Check if response is OK
    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `Failed to fetch artist services: ${response.status} ${response.statusText}`
        );
      }
      return [];
    }

    // Parse the JSON response
    const data = await response.json();

    if (data?.status === "success" && Array.isArray(data.data)) {
      return data.data;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected artist services response format:", data);
    }

    return [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist services:", error);
    }
    return [];
  }
}
