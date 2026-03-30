import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
    images: {
    domains: ["flagcdn.com","taswera.computinggate.com"],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
