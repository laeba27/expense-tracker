import Link from "next/link";
import { Wallet, BarChart3, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main className="w-full bg-slate-950 text-white flex flex-col">
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
  <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center">
    
    {/* Logo */}
    <Link
      href="/"
      className="flex items-center gap-3 group"
    >
      <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition">
        <Wallet className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
      </div>
      <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        ExpenseTracker
      </span>
    </Link>

    {/* Desktop Actions */}
    <div className="ml-auto hidden md:flex items-center gap-6">
      <Link
        href="/auth/login"
        className="text-slate-400 hover:text-white transition font-medium relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all hover:after:w-full"
      >
        Login
      </Link>

      <Link
        href="/auth/register"
        className="relative inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 transition shadow-lg shadow-emerald-500/30"
      >
        Get Started
      </Link>
    </div>

    {/* Mobile Menu Button */}
    <button className="ml-auto md:hidden p-2 rounded-lg hover:bg-white/10 transition">
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</nav>


      {/* ============ HERO SECTION ============ */}
      <section className="w-full pt-56 pb-48 px-8 lg:px-16">
        <div className="w-full max-w-6xl mx-auto text-center">
          <div className="mb-12 inline-block">
            <span className="px-5 py-3 text-sm font-semibold rounded-full bg-slate-900/80 border border-slate-700 text-emerald-400">
              ✨ Modern Expense Tracking
            </span>
          </div>

          <h1 className="text-7xl lg:text-8xl font-black tracking-tighter mb-10 leading-tight">
            <span className="block mb-4">Control your</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              money effortlessly
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-slate-400 max-w-4xl mx-auto mb-16 leading-relaxed font-light">
            Track every expense, understand your spending patterns, and make smarter financial decisions with our clean, secure, and beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link
              href="/auth/register"
              className="group px-12 py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Start Tracking Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </span>
            </Link>
            <Link
              href="/auth/login"
              className="px-12 py-5 rounded-xl border-2 border-slate-600 text-white font-bold text-lg hover:border-emerald-400 hover:text-emerald-400 transition-all"
            >
              Already a member? Login
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-20 flex flex-wrap justify-center gap-10 pt-12 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-400">No credit card needed</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-400">5-minute signup</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-400">Free forever</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DIVIDER ============ */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* ============ FEATURES SECTION ============ */}
      <section className="w-full py-48 px-8 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-6xl lg:text-7xl font-black mb-8 leading-tight">
              Everything you need
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Powerful features designed for simplicity. Everything from tracking to insights, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Feature
              icon={<Wallet className="w-8 h-8" />}
              title="Smart Tracking"
              text="Log expenses instantly with categories, tags, and beautifully organized records."
            />
            <Feature
              icon={<BarChart3 className="w-8 h-8" />}
              title="Deep Analytics"
              text="Crystal clear insights with interactive charts and detailed spending breakdowns."
            />
            <Feature
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Bank-Level Security"
              text="Military-grade encryption, JWT auth, and privacy-first architecture."
            />
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="w-full py-48 px-8 lg:px-16 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-28">
            <h2 className="text-6xl lg:text-7xl font-black mb-8">
              How it works
            </h2>
            <p className="text-xl text-slate-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-12">
            <Step
              step="1"
              title="Create your account"
              text="Sign up in under 2 minutes. No credit card needed. Verify your email and you're ready to go."
            />
            <Step
              step="2"
              title="Start logging expenses"
              text="Add expenses with amount, category, description. Organize everything beautifully."
            />
            <Step
              step="3"
              title="Get financial insights"
              text="See stunning analytics, track trends, and make smarter spending decisions."
            />
          </div>
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section className="w-full py-32 px-8 lg:px-16">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Stat number="10K+" label="Active Users" />
            <Stat number="100%" label="Secure & Encrypted" />
            <Stat number="Real-time" label="Instant Updates" />
            <Stat number="Free" label="Forever Plan" />
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="w-full py-48 px-8 lg:px-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 backdrop-blur-xl p-20 text-center">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 blur-3xl"></div>
            </div>

            <h2 className="text-6xl lg:text-7xl font-black mb-8 relative z-10 leading-tight">
              Ready to master your money?
            </h2>
            <p className="text-xl lg:text-2xl text-slate-400 mb-12 relative z-10">
              Join thousands of users taking control of their finances.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-14 py-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 relative z-10"
            >
              Start Free Today
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="w-full border-t border-slate-800 px-8 lg:px-16 py-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold">ExpenseTracker</span>
              </div>
              <p className="text-slate-500 text-sm">
                Smart expense tracking for modern money management.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-emerald-400 transition">Features</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Security</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-emerald-400 transition">About</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="#" className="hover:text-emerald-400 transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© 2024 ExpenseTracker. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-slate-400 transition">Twitter</Link>
              <Link href="#" className="hover:text-slate-400 transition">GitHub</Link>
              <Link href="#" className="hover:text-slate-400 transition">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ============ COMPONENTS ============ */

function Feature({ icon, title, text }) {
  return (
    <div className="group p-12 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-all hover:bg-slate-900/80">
      <div className="w-14 h-14 text-emerald-400 mb-8 group-hover:scale-125 transition">{icon}</div>
      <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-400 transition">{title}</h3>
      <p className="text-slate-400 text-lg leading-relaxed">{text}</p>
    </div>
  );
}

function Step({ step, title, text }) {
  return (
    <div className="flex gap-10 items-start">
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center font-bold text-2xl">
          {step}
        </div>
      </div>
      <div className="pt-2">
        <h4 className="text-2xl font-bold mb-3">{title}</h4>
        <p className="text-slate-400 text-lg leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="text-center p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition">
      <div className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
        {number}
      </div>
      <p className="text-slate-400 text-lg">{label}</p>
    </div>
  );
}
