import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A0A0F] flex items-center justify-center px-6">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-transparent opacity-30 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-red-900 via-orange-600 to-transparent opacity-20 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-900/40">
          <MessageCircle className="h-8 w-8 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#F5F1EA] leading-[1.05]">
          Let&apos;s Stay
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-300 bg-clip-text text-transparent">
            Connected
          </span>
        </h1>

        <p className="mt-5 text-[#8A8A93] text-base sm:text-lg max-w-sm">
          Real-time conversations, wherever you are. Fast, simple, and built for staying close to the people who matter.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-900/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-[#26262E] bg-[#16161C] px-7 py-3.5 font-semibold text-[#F5F1EA] transition-colors hover:bg-[#1D1D24]"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}