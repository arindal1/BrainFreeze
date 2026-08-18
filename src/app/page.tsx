import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Protocol } from "@/components/marketing/Protocol";
import { Agents } from "@/components/marketing/Agents";
import { Brief } from "@/components/marketing/Brief";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Protocol />
        <Agents />
        <Brief />
      </main>
      <Footer />
    </>
  );
}