import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Work from "@/components/Work";
import Activity from "@/components/Activity";
import GitGraph from "@/components/GitGraph";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { fetchActivity, fetchContributions } from "@/lib/github";

export default async function Home() {
  const [activity, contributions] = await Promise.all([
    fetchActivity(8),
    fetchContributions(),
  ]);
  const now = new Date();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero activity={activity} now={now} />
        <Work />
        <Activity items={activity} now={now} contributions={contributions} />
        <section
          id="timeline"
          className="pt-0 pb-24 px-6 md:px-10 lg:px-16"
        >
          <p className="font-mono text-[11px] text-muted">{"// timeline"}</p>
          <div className="mt-4">
            <GitGraph />
          </div>
        </section>
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
