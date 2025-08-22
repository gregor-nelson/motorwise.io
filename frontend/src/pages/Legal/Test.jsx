import React, { useEffect, useRef, useState } from "react";

/**
 * PremiumVehicleReports (Framer-free)
 * - EmotionArc: animated ambient blobs via CSS keyframes
 * - IdentityBadge: subtle fade-in
 * - RiskPulse: one-time pulse on mount
 * - RevealCard: blur->clarity when scrolled into view (IntersectionObserver)
 * - ConfidenceMeter: width transition when scrolled into view (IntersectionObserver)
 *
 * Notes:
 * - Respects prefers-reduced-motion (animations disabled automatically)
 * - No external libs required
 * - Icons assume Phosphor icon font is available globally (as in your current code)
 */

function EmotionArc() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* Danger blob (Fear) */}
      <div
        className="absolute -top-24 -right-24 w-[48rem] h-[48rem] rounded-full blur-3xl pvri-anim pvri-fade-in"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(254,242,242,0.9), transparent 70%)",
        }}
      />
      {/* Trust blob (Relief) */}
      <div
        className="absolute top-1/3 left-1/4 w-[42rem] h-[42rem] rounded-full blur-3xl pvri-anim pvri-rotate-slow"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(239,246,255,0.9), transparent 70%)",
        }}
      />
      {/* Success blob (Empowerment) */}
      <div
        className="absolute bottom-[-8rem] right-1/3 w-[44rem] h-[44rem] rounded-full blur-3xl pvri-anim pvri-float-slow"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(240,253,244,0.9), transparent 70%)",
        }}
      />
    </div>
  );
}

function IdentityBadge({ label = "Verified Buyer IQ", score = 92 }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-neutral-900 text-neutral-50 shadow-lg mt-4 pvri-anim pvri-fade-in-up">
      <i className="ph ph-seal-check text-yellow-400" aria-hidden="true" />
      <span className="text-xs font-medium tracking-wide">{label}</span>
      <span className="text-xs font-semibold bg-yellow-400/10 text-yellow-300 px-2 py-0.5 rounded">
        {score}
      </span>
    </div>
  );
}

function RiskPulse({ headline }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-700 mt-4 pvri-anim pvri-pulse-once">
      <i className="ph ph-warning-circle" aria-hidden="true" />
      <span className="text-xs font-semibold">{headline}</span>
    </div>
  );
}

function ConfidenceMeter({ value = 86 }) {
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    // Start at 0 width until visible
    el.style.width = "0%";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.width = `${value}%`;
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="w-full max-w-md rounded-xl bg-neutral-100 p-3 shadow-inner mt-6">
      <div className="flex justify-between text-xs text-neutral-600 mb-1">
        <span>Risk</span>
        <span>Confidence</span>
      </div>
      <div className="h-3 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 pvri-transition"
          style={{ width: "0%", transition: "width 800ms cubic-bezier(.22,1,.36,1)" }}
        />
      </div>
      <div className="mt-2 text-sm font-semibold text-green-700">
        {value}% Buyer Confidence
      </div>
      <p className="text-xs text-neutral-500 mt-0.5">
        You walk in prepared — not persuaded.
      </p>
    </div>
  );
}

function RevealCard({ title, lead, detail, accent = "blue", icon }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const border =
    {
      blue: "border-blue-600",
      red: "border-red-600",
      green: "border-green-600",
      purple: "border-purple-600",
      yellow: "border-yellow-600",
    }[accent] || "border-blue-600";

  return (
    <div
      ref={ref}
      className={`p-6 rounded-lg border-l-4 ${border} bg-white/70 border border-neutral-200 shadow-sm backdrop-blur pvri-transition ${
        visible ? "opacity-100 pvri-blur-0" : "opacity-60 pvri-blur"
      }`}
      style={{
        transition: "opacity 500ms ease, filter 500ms ease, transform 500ms ease",
      }}
    >
      <div className="flex items-start mb-3">
        <i className={`ph ${icon} text-lg mr-2 mt-0.5`} aria-hidden="true" />
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
      </div>
      <div className="text-sm text-neutral-800 leading-relaxed mb-3">{lead}</div>
      <div className="text-xs text-neutral-500">{detail}</div>
    </div>
  );
}

// === Page === //
export default function PremiumVehicleReportsTest() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 bg-white text-neutral-900 relative overflow-hidden min-h-screen">
      {/* Local CSS for animations and reduced motion */}
      <style>{`
        /* ------------ Reduced Motion ------------- */
        @media (prefers-reduced-motion: reduce) {
          .pvri-anim { animation: none !important; }
          .pvri-transition { transition: none !important; }
        }

        /* ------------ Keyframes ------------- */
        @keyframes pvri-fade-in {
          0% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pvri-fade-in-up {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pvri-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pvri-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pvri-pulse {
          0%   { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(220,38,38,0.45); }
          60%  { transform: scale(1); box-shadow: 0 0 0 12px rgba(220,38,38,0); }
          100% { transform: scale(0.98); box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }

        /* ------------ Helpers ------------- */
        .pvri-fade-in { animation: pvri-fade-in 900ms ease-out forwards; }
        .pvri-fade-in-up { animation: pvri-fade-in-up 600ms ease-out forwards; }
        .pvri-rotate-slow { animation: pvri-rotate 20s linear infinite; }
        .pvri-float-slow { animation: pvri-float 6s ease-in-out infinite; }
        .pvri-pulse-once { animation: pvri-pulse 1.6s ease-out 1; }

        /* Blur utility (to avoid relying on Tailwind's backdrop filter timing) */
        .pvri-blur { filter: blur(6px); transform: translateZ(0); }
        .pvri-blur-0 { filter: blur(0px); transform: translateZ(0); }
      `}</style>

      <EmotionArc />

      <div className="relative z-10">
        {/* Hero */}
        <header className="mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-2xl lg:text-3xl font-semibold text-neutral-900 leading-tight tracking-tight mb-3">
            <i className="ph ph-shield-check text-2xl mr-3 text-blue-600" aria-hidden="true"></i>
            Professional Vehicle Intelligence
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed max-w-3xl">
            Never hand your savings to a thief. Access the same deep intelligence
            trusted by police, dealers, and investigators — so you see through
            the lies and buy with certainty.
          </p>
          <IdentityBadge />
          <RiskPulse headline="£2.3B lost to UK vehicle fraud each year — not on your watch." />
        </header>

        {/* Protection Layer - Addresses Primary Fears */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          <RevealCard
            title="Verify a Vehicle’s True Identity"
            lead="Cut through the noise with official DVLA verification."
            detail="Never buy a stolen, written-off, or illegally modified vehicle."
            accent="blue"
            icon="ph-shield-check"
          />
          <RevealCard
            title="Spot Odometer Fraud Instantly"
            lead="Forensic mileage analysis exposes rollbacks in seconds."
            detail="Protect your wallet from the £800M UK mileage scam market."
            accent="red"
            icon="ph-warning-circle"
          />
        </div>

        {/* Professional Analysis - Builds Credibility */}
        <header className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-2">
            <i className="ph ph-database text-2xl mr-2 text-blue-600" aria-hidden="true"></i>
            Professional Repair Intelligence
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Know what mechanics already know. Access the bulletins and hidden
            issues trusted by BMW, Mercedes, and Audi service networks.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          <RevealCard
            title="Repair Insights at Your Fingertips"
            lead="See the same data pro garages use before they even lift the hood."
            detail="Recall info, service bulletins, and hidden issues across all UK models."
            accent="purple"
            icon="ph-wrench"
          />
          <RevealCard
            title="Reveal True Vehicle Usage"
            lead="Understand how hard a car has really been worked."
            detail="Detect commercial use, high stress periods, and storage time via advanced patterns."
            accent="green"
            icon="ph-chart-line"
          />
        </div>

        {/* Empowerment - Delivers Confidence */}
        <header className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-2">
            <i className="ph ph-target text-2xl mr-2 text-green-600" aria-hidden="true"></i>
            Buy With Complete Confidence
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Walk away smiling — the power’s yours. Compare against 40M+ UK
            records and know your exact market position before you negotiate.
          </p>
        </header>
        <ConfidenceMeter value={92} />

        {/* Data Sources */}
        <header className="mt-20 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-2">
            <i className="ph ph-database text-2xl mr-2 text-purple-600" aria-hidden="true"></i>
            Professional-Grade Data Sources
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Every insight comes from official government records, pro repair
            systems, and industry-leading databases. No guesswork — just truth.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
          <RevealCard
            title="DVLA Official Records"
            lead="The very source police and border agents use."
            detail="Real-time government integration ensures legitimacy."
            accent="blue"
            icon="ph-shield-check"
          />
          <RevealCard
            title="Complete MOT Intelligence"
            lead="40M+ MOT records decoded for patterns and anomalies."
            detail="Expose hidden issues traditional reports miss."
            accent="green"
            icon="ph-magnifying-glass"
          />
          <RevealCard
            title="AutoData Professional Database"
            lead="What premium garages already trust."
            detail="Recall + repair intelligence across all UK vehicles."
            accent="purple"
            icon="ph-database"
          />
          <RevealCard
            title="Advanced Fraud Detection"
            lead="Proven fraud prevention heuristics."
            detail="Odometer tampering, false identities, hidden histories revealed."
            accent="red"
            icon="ph-detective"
          />
        </div>

        {/* Delivery */}
        <header className="mt-20 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 mb-2">
            <i className="ph ph-lightning text-2xl mr-2 text-yellow-600" aria-hidden="true"></i>
            Professional Intelligence Delivery
          </h2>
          <p className="text-sm text-neutral-600 max-w-2xl">
            Instant web analysis. Enterprise-grade APIs. Legal-standard PDFs.
            Even interactive 3D visualizations. Choose the format that empowers
            you most.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <RevealCard
            title="Instant Pro Analysis"
            lead="Deep insights delivered in under 30 seconds."
            detail="Arrive at every viewing armed with professional-level knowledge."
            accent="green"
            icon="ph-clock"
          />
          <RevealCard
            title="Enterprise-Grade API"
            lead="Plug intelligence directly into your business."
            detail="Ideal for retailers, dealer groups, and fleet operators."
            accent="blue"
            icon="ph-code"
          />
          <RevealCard
            title="Comprehensive PDF Docs"
            lead="Legal and financial standard reports."
            detail="Trusted for verification by banks, insurers, and solicitors."
            accent="red"
            icon="ph-file-pdf"
          />
          <RevealCard
            title="Advanced Visualizations"
            lead="See complex data come alive."
            detail="Interactive 3D insights reveal truths static reports can’t."
            accent="purple"
            icon="ph-cube"
          />
        </div>
      </div>
    </div>
  );
}
