import api from "@/lib/api";

const VALID_PERIODS = ["all", "day", "week", "month", "year"];

/**
 * Fetch artist dashboard statistics for a given period.
 *
 * @param {"all" | "day" | "week" | "month" | "year"} period
 * @returns {Promise<{
 *   daily_bookings_count?: number;
 *   latest_pending_booking?: any;
 *   revenue?: { amount: number; period: string };
 * } | null>}
 */
export async function getArtistStats(period = "day") {
  const normalizedPeriod = VALID_PERIODS.includes(period) ? period : "day";

  try {
    const response = await api.get("/artist/Home", {
      params: { period: normalizedPeriod },
    });

    const data = response?.data;

    if (data?.status === "success" && data?.data) {
      return data.data;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected artist stats API response format:", data);
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist stats:", error);
    }
    return null;
  }
}
