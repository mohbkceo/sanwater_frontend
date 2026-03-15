import GoBacKButton from "@/components/shared_uis/gobackbutton";
import MainLayout from "@/layouts/MainLayout";
import { useEffect, useRef, useState } from "react";

const metrics = [
  { value: "15+", label: "ANNÉES D'EXPÉRIENCE", desc: "Une décennie et demie de savoir-faire" },
  { value: "94%", label: "QUALITÉ & FRAÎCHEUR", desc: "Satisfaction client garantie" },
];

function useCountUp(target, duration = 1800, isVisible) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isVisible) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    if (isNaN(numeric)) { setDisplay(target); return; }
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * numeric) + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, target, duration]);

  return display;
}

function MetricCard({ value, label, desc, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const display = useCountUp(value, 1600, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 px-8 py-10 h-full cursor-default"
        style={{
          boxShadow: "0 2px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.35s ease, transform 0.35s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.12), 0 2px 8px rgba(0,0,0,0.06)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{
            background: "linear-gradient(90deg, #0ea5e9, #38bdf8, #7dd3fc)",
            opacity: 0,
            transition: "opacity 0.35s ease",
          }}
          ref={el => {
            if (!el) return;
            el.closest(".group").addEventListener("mouseenter", () => (el.style.opacity = "1"));
            el.closest(".group").addEventListener("mouseleave", () => (el.style.opacity = "0"));
          }}
        />

        <p
          className="font-mono text-slate-900 leading-none tracking-tight mb-3"
          style={{ fontSize: "clamp(2.4rem, 5vw, 3.2rem)", fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {display}
        </p>
        <p
          className="text-xs font-bold tracking-[0.18em] text-sky-500 uppercase mb-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-sm text-slate-400 leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function About() {
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeroVisible(true); },
      { threshold: 0.2 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <MainLayout style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e0f2fe 100%)" }} className={`bg-white w-full`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>
      <GoBacKButton variant="link" className={`w-1/2 border-none px-0`} text="Retour"/>

      <section
        className="relative w-full py-28 overflow-hidden"
        
      >
        

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">

          
          <div
            ref={heroRef}
            className="max-w-3xl mx-auto text-center mb-24"
          >
            
            <div
              className="inline-flex items-center gap-2 mb-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 0.6s ease 0ms, transform 0.6s ease 0ms",
              }}
            >
              <span className="h-px w-8 bg-sky-400 block" />
              <span
                className="text-xs font-semibold tracking-[0.2em] text-sky-500 uppercase"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                À propos
              </span>
              <span className="h-px w-8 bg-sky-400 block" />
            </div>

            
            <h2
              className="text-slate-900 leading-none mb-4"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.01em",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 100ms, transform 0.7s ease 100ms",
              }}
            >
              QUI SOMMES-NOUS?
            </h2>

           
            <p
              className="text-sky-500 font-semibold mb-7 text-lg"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 200ms, transform 0.7s ease 200ms",
              }}
            >
              Solutions sanitaires de qualité depuis 2011
            </p>

            
            <div
              className="flex justify-center mb-8"
              style={{
                opacity: heroVisible ? 1 : 0,
                transition: "opacity 0.6s ease 280ms",
              }}
            >
              <div
                className="h-0.5 w-16 rounded-full"
                style={{ background: "linear-gradient(90deg, #0ea5e9, #38bdf8)" }}
              />
            </div>

            
            <p
              className="text-slate-500 leading-relaxed text-base md:text-lg"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                maxWidth: "56ch",
                margin: "0 auto",
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease 340ms, transform 0.7s ease 340ms",
              }}
            >
              <strong className="text-slate-700 font-semibold">SANWATER</strong>, fondée en 2011 à Dar El Beida (Alger),
              est spécialisée dans les accessoires sanitaires et les solutions pour salle de bains. La marque propose des
              produits de qualité à prix compétitifs, avec une large gamme de modèles, en suivant les tendances
              internationales.
            </p>
          </div>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m, i) => (
              <MetricCard key={m.label} {...m} delay={i * 100} />
            ))}
          </div>

        </div>
      </section>
    </MainLayout>
  );
}