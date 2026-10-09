import LandingPage from "./[locale]/page";
import { defaultLocale } from "@/i18n/config";

export default function RootPage() {
  return <LandingPage params={Promise.resolve({ locale: defaultLocale })} />;
}
