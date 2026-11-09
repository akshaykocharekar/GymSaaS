import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─── Icons (line-drawn, 1.5px stroke, no fills) ──────── */
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 5-6" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* Shared faint grid used behind the hero and final CTA */
const GRID_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
  maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 100%)",
};

/* ─── Scroll reveal (respects reduced motion) ─────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Card with a soft glow that follows the cursor ───── */
function Spot({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`gm-spot ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section heading ─────────────────────────────────── */
function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl mb-10 sm:mb-14">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-orange-400 uppercase tracking-[0.18em] mb-4">
        <span className="h-px w-6 bg-orange-400/60" />
        {eyebrow}
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-white">
        {title}
      </h2>
      {children && (
        <p className="mt-4 text-stone-400 leading-relaxed sm:text-lg">{children}</p>
      )}
    </div>
  );
}

const marquee = [
  "Members",
  "Renewals",
  "UPI payments",
  "WhatsApp reminders",
  "Expiry tracking",
  "Reports",
  "Staff access",
];

export default function Landing() {
  const [showBar, setShowBar] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBar(window.scrollY > 520);
      const el = progressRef.current;
      if (el) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    { icon: <IconUsers />, title: "Member management", desc: "Register, edit, and search every member in seconds.", span: "sm:col-span-2 lg:col-span-2", wide: true },
    { icon: <IconCalendar />, title: "Expiry tracking", desc: "See who expires in 7, 15, and 30 days at a glance.", span: "", wide: false },
    { icon: <IconCard />, title: "Payment records", desc: "Record cash, UPI, and other payments. Track advances.", span: "", wide: false },
    { icon: <IconChart />, title: "Reports", desc: "Revenue, dues, plan mix, new joins, renewals.", span: "sm:col-span-2 lg:col-span-2", wide: true },
    { icon: <IconMessage />, title: "WhatsApp reminders", desc: "One-tap personalised messages for expiries and dues.", span: "", wide: false },
    { icon: <IconPhone />, title: "Mobile-first", desc: "Designed for the gym floor, not a back office desk.", span: "lg:col-span-2", wide: true },
  ];

  const compare = [
    ["Pricing", "₹1,999 one-time", "₹999/month"],
    ["Annual cost", "₹499", "₹11,988"],
    ["Per-member fees", "None", "Often"],
    ["Member limit", "500 (fair use)", "Capped by plan"],
    ["WhatsApp reminders", "Included", "Extra cost"],
    ["Setup", "Self-serve", "Demo call"],
  ];

  const steps = [
    { n: "01", title: "Register", desc: "Tell us about your gym." },
    { n: "02", title: "Get approved", desc: "Receive an activation code by email." },
    { n: "03", title: "Start trial", desc: "30 days free. Add members, plans, payments." },
    { n: "04", title: "Go live", desc: "₹1,999 licence, then ₹499/year maintenance." },
  ];

  const faqs = [
    {
      q: "Is it a one-time payment?",
      a: "The ₹1,999 licence is a one-time payment. There is also a mandatory maintenance fee of ₹499/year, which covers hosting, security updates, and support and keeps your account active. There are no monthly or per-member fees.",
    },
    {
      q: "Are there per-member charges?",
      a: "No. Add up to 500 members on the ₹1,999 licence. If you need more, write to us — we'll work something out.",
    },
    {
      q: "How does the free trial work?",
      a: "After we approve your gym, you get a 30-day trial. After 30 days, purchase the licence to keep using Palastra. Your data stays safe either way.",
    },
    {
      q: "Can I collect member payments through Palastra?",
      a: "Palastra records member payments manually — cash, UPI, or other. It doesn't process payments from your members. You keep collecting the same way you always have.",
    },
    {
      q: "How do WhatsApp reminders work?",
      a: "One-tap personalised messages open in your WhatsApp app with the text pre-filled. No API costs, no WhatsApp Business account required.",
    },
    {
      q: "Can I add staff accounts?",
      a: "Yes. One optional staff account per gym, with permissions you control. More roles are on the roadmap.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-200 antialiased selection:bg-orange-400/30 overflow-x-clip scroll-smooth">
      <style>{`
        details > summary::-webkit-details-marker { display: none; }

        @keyframes gm-marquee { to { transform: translateX(-50%); } }
        .gm-marquee { animation: gm-marquee 34s linear infinite; }

        @keyframes gm-drift { from { transform: translate3d(0,0,0); } to { transform: translate3d(48px,34px,0); } }
        .gm-aurora { animation: gm-drift 9s ease-in-out infinite alternate; }
        .gm-aurora-2 { animation: gm-drift 12s ease-in-out infinite alternate-reverse; }

        @keyframes gm-shine { from { background-position: 0% center; } to { background-position: 200% center; } }
        .gm-shine { background-size: 200% auto; animation: gm-shine 7s linear infinite; }

        .gm-spot { position: relative; }
        .gm-spot::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(249,115,22,0.16), transparent 45%);
          opacity: 0; transition: opacity .3s;
        }
        .gm-spot:hover::before { opacity: 1; }

        @media (prefers-reduced-motion: reduce) {
          .gm-marquee, .gm-aurora, .gm-aurora-2, .gm-shine { animation: none; }
        }
      `}</style>

      {/* Scroll progress */}
      <div
        ref={progressRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-orange-500 via-amber-300 to-orange-400"
      />

      {/* ─── Nav ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0c0a09]/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-white">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 text-sm font-bold shadow-md shadow-orange-500/30">
              G
            </span>
            Palastra
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link to="/login" className="px-3 py-1.5 text-sm text-stone-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-2 text-sm font-semibold bg-white text-stone-900 rounded-full hover:bg-orange-300 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        {/* background: grid + rings + drifting glows */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.35]" style={GRID_STYLE} />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000,transparent)]"
        >
          {[420, 680, 940].map((s) => (
            <div
              key={s}
              className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
              style={{ width: s, height: s }}
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(249,115,22,0.30), rgba(249,115,22,0.06) 60%, transparent)",
          }}
        />
        <div aria-hidden="true" className="gm-aurora absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div aria-hidden="true" className="gm-aurora-2 absolute -right-24 top-48 -z-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 flex flex-col items-center text-center">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
              Gym management for independent gyms in India
            </div>

            <h1 className="mt-6 text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] text-white">
              Every renewal on time.
              <br />
              <span
                className="gm-shine bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #fdba74 0%, #fb923c 25%, #fcd34d 50%, #fb923c 75%, #fdba74 100%)",
                }}
              >
                Every rupee tracked.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-stone-400 leading-relaxed max-w-xl mx-auto">
              Manage members, memberships, payments, and renewals in one
              place. Built for gym owners who&apos;d rather coach than chase
              dues.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center justify-center w-full sm:w-auto">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-orange-300 to-orange-500 px-7 py-3.5 text-[15px] font-semibold text-orange-950 shadow-lg shadow-orange-500/30 ring-1 ring-white/20 transition hover:brightness-110 active:scale-[0.98]"
              >
                Start 30-day free trial
                <IconArrow />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium text-stone-300 hover:text-white transition-colors"
              >
                Already a customer? Log in
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-3 w-full max-w-lg">
              {[
                ["₹1,999", "one-time"],
                ["₹499", "/year maintenance"],
                ["No", "monthly fees"],
              ].map(([big, small]) => (
                <div
                  key={big}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-3.5 py-3 backdrop-blur"
                >
                  <div className="text-lg sm:text-xl font-semibold text-white">{big}</div>
                  <div className="text-[11px] sm:text-xs text-stone-500 leading-tight mt-0.5">{small}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Marquee ──────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="relative overflow-hidden border-y border-white/5 bg-white/[0.015] py-4 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
      >
        <div className="gm-marquee flex w-max items-center gap-10 text-xs font-medium uppercase tracking-[0.2em] text-stone-500 sm:text-sm">
          {[...marquee, ...marquee].map((w, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {w}
              <span className="h-1 w-1 rounded-full bg-orange-400/70" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── Features ─────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 scroll-mt-16">
        <Reveal>
          <SectionHead eyebrow="What it does" title="The essentials, done well.">
            No bloated dashboards. No features you&apos;ll never use. Just the
            tools a small gym actually needs to stay organised.
          </SectionHead>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80} className={`h-full ${f.span}`}>
              <Spot className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.05] sm:p-7">
                {f.wide && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-8 -right-6 text-orange-400/[0.08] [&>svg]:h-44 [&>svg]:w-44 [&>svg]:stroke-[0.75]"
                  >
                    {f.icon}
                  </div>
                )}
                <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-400/25 to-amber-300/5 text-orange-300 shadow-lg shadow-orange-500/10 ring-1 ring-orange-400/25">
                  {f.icon}
                </div>
                <div className="relative mt-5 text-lg font-semibold text-white">{f.title}</div>
                <div className="relative mt-1.5 max-w-sm text-sm text-stone-400 leading-relaxed">{f.desc}</div>
              </Spot>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Comparison ───────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <SectionHead eyebrow="Why Palastra" title="Built for gyms, not enterprises.">
              Most gym software is priced like enterprise HR software. Palastra
              isn&apos;t.
            </SectionHead>
          </Reveal>

          <Reveal>
            <div className="max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#14110f] shadow-[0_30px_80px_-40px_rgba(249,115,22,0.35)]">
              <table className="w-full text-[13px] sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-3 sm:px-5 py-3.5 font-medium text-stone-500">&nbsp;</th>
                    <th className="text-left px-3 sm:px-5 py-3.5 font-semibold text-orange-300">Palastra</th>
                    <th className="text-left px-3 sm:px-5 py-3.5 font-medium text-stone-500">Typical SaaS</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map(([label, us, them]) => (
                    <tr key={label} className="border-b border-white/5 last:border-0">
                      <td className="px-3 sm:px-5 py-3.5 text-stone-400">{label}</td>
                      <td className="px-3 sm:px-5 py-3.5 text-white font-medium bg-orange-400/[0.06]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-orange-400 hidden sm:inline">
                            <IconCheck />
                          </span>
                          {us}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3.5 text-stone-500">{them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28 scroll-mt-16">
        <Reveal>
          <SectionHead eyebrow="Pricing" title="Honest pricing. No surprises.">
            A one-time licence fee, plus a small mandatory yearly maintenance
            fee. No monthly charges and no per-member fees.
          </SectionHead>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
          <Reveal>
            <div
              className="relative h-full rounded-3xl p-px shadow-[0_30px_90px_-30px_rgba(249,115,22,0.55)]"
              style={{ background: "linear-gradient(160deg, rgba(251,146,60,0.9), rgba(251,146,60,0.08) 45%, rgba(252,211,77,0.5))" }}
            >
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#120f0d] p-7">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-stone-400">Software licence</div>
                  <span className="rounded-full bg-orange-400/10 px-2.5 py-1 text-[11px] font-medium text-orange-300 ring-1 ring-orange-400/25">
                    Pay once
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-5xl font-semibold tracking-tight text-white">₹1,999</span>
                  <span className="text-stone-500 text-sm">one-time</span>
                </div>
                <ul className="mt-7 space-y-3.5 text-sm">
                  {[
                    "Unlimited members (500 fair-use cap)",
                    "All features, no upsells",
                    "30-day free trial after approval",
                    "No monthly fees, ever",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-stone-300">
                      <span className="text-orange-400 mt-0.5 shrink-0">
                        <IconCheck />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="mt-8 block text-center rounded-full bg-gradient-to-b from-orange-300 to-orange-500 px-5 py-3 font-semibold text-orange-950 ring-1 ring-white/20 transition hover:brightness-110 active:scale-[0.98]"
                >
                  Start free trial
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.03] p-7">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-stone-400">Annual maintenance</div>
                <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 ring-1 ring-amber-400/25">
                  Mandatory
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-5xl font-semibold tracking-tight text-white">₹499</span>
                <span className="text-stone-500 text-sm">/year</span>
              </div>
              <ul className="mt-7 space-y-3.5 text-sm">
                {[
                  "Hosting and infrastructure",
                  "Security updates",
                  "Bug fixes and support",
                  "Required to keep your account active",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-stone-300">
                    <span className="text-orange-400 mt-0.5 shrink-0">
                      <IconCheck />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-full border border-dashed border-white/10 py-3 text-center text-xs text-stone-500">
                Billed after your first year
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="mt-6 grid max-w-3xl grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {[
              ["₹1,999", "one-time licence"],
              ["₹499", "per year, mandatory"],
              ["₹0", "monthly or per-member"],
            ].map(([big, small]) => (
              <div key={big} className="px-3 py-4 text-center sm:px-5">
                <div className="text-xl font-semibold text-white sm:text-2xl">{big}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-stone-500 sm:text-xs">{small}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── How it works ─────────────────────────────── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <Reveal>
            <SectionHead eyebrow="How it works" title="Set up in under 10 minutes." />
          </Reveal>

          <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
            <div
              aria-hidden="true"
              className="absolute left-8 right-8 top-[2.6rem] hidden h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent lg:block"
            />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-[#14110f] p-6">
                  <div
                    className="text-4xl font-semibold tracking-tight bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(180deg, #fdba74, rgba(253,186,116,0.15))" }}
                  >
                    {s.n}
                  </div>
                  <div className="mt-4 font-semibold text-white">{s.title}</div>
                  <div className="mt-1.5 text-sm text-stone-400 leading-relaxed">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 scroll-mt-16">
        <Reveal>
          <SectionHead eyebrow="FAQ" title="Common questions." />
        </Reveal>

        <div className="space-y-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors open:border-orange-400/30 open:bg-white/[0.05]"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="font-medium text-white">{f.q}</span>
                <span className="mt-0.5 shrink-0 text-xl leading-none text-orange-400 transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pr-6 text-sm text-stone-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────── */}
      <section className="px-5 sm:px-8 pb-20 sm:pb-28">
        <Reveal>
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#120f0d] px-6 py-14 sm:px-14 sm:py-20 text-center sm:text-left">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-30" style={GRID_STYLE} />
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full blur-3xl"
              style={{ background: "rgba(249,115,22,0.35)" }}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full blur-3xl"
              style={{ background: "rgba(252,211,77,0.12)" }}
            />
            <h2 className="max-w-2xl text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.08] text-white">
              Ready to run a tighter gym?
            </h2>
            <p className="mt-4 text-stone-400 sm:text-lg">
              Free 30-day trial. No credit card. No monthly fees.
            </p>
            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-stone-900 shadow-lg shadow-black/30 transition hover:bg-orange-300 active:scale-[0.98]"
            >
              Register your gym
              <IconArrow />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/5 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row justify-between gap-8 text-sm text-stone-500">
          <div className="max-w-xs">
            <div className="font-semibold text-white mb-1">Palastra</div>
            <div>Built for independent gyms in India.</div>
            <div className="mt-3 text-xs text-stone-600">
              Operated by Akshay Kocharekar
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-stone-600 mb-2">Legal</div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link to="/legal/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/legal/refund" className="hover:text-white transition-colors">Refunds</Link>
                <Link to="/legal/shipping" className="hover:text-white transition-colors">Shipping</Link>
                <Link to="/legal/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-stone-600 mb-2">More</div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <a href="mailto:palastrasupport@gmail.com" className="hover:text-white transition-colors">
                  palastrasupport@gmail.com
                </a>
                <Link to="/login" className="hover:text-white transition-colors">Log in</Link>
                <Link to="/register" className="hover:text-white transition-colors">Get started</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 text-xs text-stone-600">
            © {new Date().getFullYear()} Palastra. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ─── Sticky mobile CTA ────────────────────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 md:hidden transition-transform duration-300 ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="border-t border-white/10 bg-[#0c0a09]/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 py-3.5 text-[15px] font-semibold text-orange-950 shadow-lg shadow-orange-500/20 ring-1 ring-white/20 active:scale-[0.98]"
          >
            Start 30-day free trial
          </Link>
        </div>
      </div>
    </div>
  );
}