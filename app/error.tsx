"use client";

import { useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

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
            <h1 className="sr-only">Something went wrong</h1>
            <div className="text-fg">
              <span className="text-muted mr-2">$</span>
              render /
            </div>
            <div className="text-[#FF7B72] mt-1">
              runtime error: the page failed to render.
            </div>
            {error.digest ? (
              <div className="text-muted text-[11px] mt-1">
                digest: {error.digest}
              </div>
            ) : null}
            <div className="text-fg mt-4">
              <span className="text-muted mr-2">$</span>
              <button
                type="button"
                onClick={reset}
                className="text-fg underline-offset-4 hover:underline"
              >
                retry
              </button>
              <span className="ml-2 text-muted">{"# re-attempt render"}</span>
            </div>
            <div className="text-fg mt-2">
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
