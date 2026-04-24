import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Activity from "@/components/Activity";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { fetchActivity } from "@/lib/github";

export default async function Home() {
  const activity = await fetchActivity(8);
  const now = new Date();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero activity={activity} now={now} />
        <Work />
        <Activity items={activity} now={now} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
