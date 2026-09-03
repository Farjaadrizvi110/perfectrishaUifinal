import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroProps {
  onNavigate: (id: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (decorRef.current) {
      tl.to(decorRef.current, { opacity: 0.6, scale: 1, duration: 1.5, ease: 'power3.out' }, 0);
    }
    if (labelRef.current) {
      gsap.set(labelRef.current, { opacity: 0, y: 20 });
      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.4);
    }
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: 40 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 0.5);
    }
    if (subtitleRef.current) {
      gsap.set(subtitleRef.current, { opacity: 0, y: 20 });
      tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8);
    }
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });
      tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.0);
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative w-full overflow-hidden" style={{ height: '100vh' }}>
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        {/* Silk base image */}
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Bokeh overlay for dreamy effect */}
        <img
          src="/images/bg-bokeh.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.7) 0%, rgba(74, 4, 4, 0.55) 40%, rgba(128, 0, 32, 0.25) 100%)',
          }}
        />
      </div>

      {/* Floating petal decorations */}
      <div ref={decorRef} className="absolute inset-0 z-[1] opacity-0 scale-95 pointer-events-none">
        <img
          src="/images/bg-floral.jpg"
          alt=""
          className="absolute -top-10 -right-20 w-[500px] h-auto opacity-30 rotate-12"
        />
        <img
          src="/images/bg-floral.jpg"
          alt=""
          className="absolute -bottom-20 -left-20 w-[400px] h-auto opacity-20 -rotate-45"
        />
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center text-center h-full px-6">
        <span
          ref={labelRef}
          className="font-body text-xs font-medium tracking-[0.3em] uppercase text-light-gold"
        >
          UK&apos;s Trusted Islamic Marriage Bureau
        </span>

        <h1
          ref={titleRef}
          className="font-display font-light text-white mt-6 leading-[0.95] text-shadow-gold"
          style={{ fontSize: 'clamp(3rem, 7vw, 6.5rem)', letterSpacing: '-0.02em' }}
        >
          Where Faith Meets
          <br />
          <span className="font-normal" style={{ color: '#F3E5AB' }}>Your Perfect Match</span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg text-white/90 mt-6 max-w-[560px] leading-relaxed"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.2)' }}
        >
          A premium, confidential, and Islamically-guided matrimonial service
          for British Muslims seeking a blessed union
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={() => onNavigate('about')}
            className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-105 hover:shadow-xl"
            style={{ background: '#D4AF37', color: '#4A0404' }}
          >
            Begin Your Journey
          </button>
          <button
            onClick={() => onNavigate('membership')}
            className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase border border-white/50 text-white transition-all duration-400 hover:bg-white/10 hover:border-white"
          >
            View Plans
          </button>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full z-[3]">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
