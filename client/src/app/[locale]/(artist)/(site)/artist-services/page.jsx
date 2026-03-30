import Container from "@/components/shared/Container";
import MyServicesClient from "@/components/artist/my-services/MyServicesClient";
import { getArtistServicesAction } from "@/app/actions/getArtistServicesAction";

export default async function MyServicesPage() {
  // Fetch artist services from API using server action
  const servicesData = await getArtistServicesAction();

  // Map API response to component format
  const services = servicesData.map((service) => ({
    id: service.Service_id,
    title: service.Service_name,
    price: service.Service_price?.toString() || "0",
    image: service.Service_photo_url || "/user/profile/default-user.jpg",
    requests: service.Service_bookings_count ?? null,
  }));

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    console.log("Fetched services data:", servicesData);
    console.log("Mapped services:", services);
  }

  return (
    <main className="bg-white dark:bg-[#363636] min-h-screen py-8">
      <Container>
        <MyServicesClient services={services} />
      </Container>
    </main>
  );
}
