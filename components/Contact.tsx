import SectionHeading from "./SectionHeading";
import ContactObject from "./ContactObject";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 md:px-10 lg:px-16">
      <SectionHeading caption="// get in touch" title="Let's talk" />
      <p
        className="font-sans text-[15px] text-muted mt-4"
        style={{ lineHeight: 1.6, maxWidth: 520 }}
      >
        Open to contract work, financial services projects, and AI-driven
        builds that move revenue. Remote friendly. Press{" "}
        <kbd className="font-mono text-[11px] hairline px-1 py-0.5 rounded">⌘ K</kbd>{" "}
        anywhere to jump around.
      </p>
      <div className="mt-8 max-w-[640px]">
        <ContactObject />
      </div>
    </section>
  );
}
