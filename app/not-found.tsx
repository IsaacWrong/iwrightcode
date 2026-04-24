import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "404 — iwrightcode_",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex-1 flex items-center px-6 md:px-10 lg:px-16 py-24">
        <div
          className="w-full max-w-[680px] overflow-hidden"
          style={{
            background: "#010409",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
          }}
        >
          <div
            className="flex items-center py-[10px] px-[14px] bg-bg"
            style={{ borderBottom: "0.5px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-[6px]" aria-hidden="true">
              <span
                className="inline-block rounded-full"
                style={{ width: 11, height: 11, background: "#FF5F57" }}
              />
              <span
                className="inline-block rounded-full"
                style={{ width: 11, height: 11, background: "#FEBC2E" }}
              />
              <span
                className="inline-block rounded-full"
                style={{ width: 11, height: 11, background: "#28C840" }}
              />
            </div>
            <span className="flex-1 text-center font-mono text-[11px] text-muted">
              ~/iwrightcode — zsh
            </span>
            <span className="w-[42px]" aria-hidden="true" />
          </div>
          <div
            className="font-mono text-[13px] md:text-[14px]"
            style={{ padding: "22px 22px", lineHeight: 1.8 }}
          >
            <div className="text-fg">
              <span className="text-muted mr-2">$</span>
              cd /the-page-you-wanted
            </div>
            <div className="text-[#FF7B72] mt-1">
              zsh: cd: no such file or directory: /the-page-you-wanted
            </div>
            <div className="text-fg mt-4">
              <span className="text-muted mr-2">$</span>
              status
            </div>
            <div className="text-muted">
              404 — the route did not match any handler.
            </div>
            <div className="text-fg mt-4">
              <span className="text-muted mr-2">$</span>
              <Link
                href="/"
                className="text-fg underline-offset-4 hover:underline"
              >
                cd ~
              </Link>
              <span className="ml-2 text-muted">{"# return home"}</span>
            </div>
            <div className="mt-4 inline-flex items-center text-muted">
              <span className="mr-2">$</span>
              <span
                className="inline-block bg-fg animate-blink"
                style={{ width: 8, height: 14 }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
