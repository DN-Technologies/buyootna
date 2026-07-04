import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureGrid from "@/components/FeatureGrid";
import ShowcaseCarousel from "@/components/ShowcaseCarousel";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero />
        <FeatureGrid />
        <ShowcaseCarousel />
      </main>
      <Footer />
    </>
  );
}
