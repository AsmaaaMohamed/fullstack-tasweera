import api from "./api";

export async function getLikeStatus(artistId) {
  if (!artistId) throw new Error("artistId is required");
  const { data } = await api.get(`/artists/${artistId}/like-status`);
  // API returns: { status, message, liked }
  return { liked: Boolean(data?.liked) };
}

export async function toggleArtistLike(artistId) {
  if (!artistId) throw new Error("artistId is required");
  // Requires auth; interceptor adds Authorization when available
  const { data } = await api.post(`/artists/${artistId}/toggle-like`);
  return data;
}
