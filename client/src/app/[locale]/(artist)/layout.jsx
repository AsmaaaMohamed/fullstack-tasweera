import { ArtistAuthProvider } from "@/contexts/ArtistAuthContext";
import { StoriesProvider } from "@/contexts/StoriesContext";

export default function ArtistRootLayout({ children }) {
  return (
    <ArtistAuthProvider>
      <StoriesProvider useArtistEndpoint={true}>{children}</StoriesProvider>
    </ArtistAuthProvider>
  );
}
