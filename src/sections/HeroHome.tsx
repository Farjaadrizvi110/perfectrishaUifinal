import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

export default function HeroHome() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: 40 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.3);
    }
    if (card1Ref.current) {
      gsap.set(card1Ref.current, { opacity: 0, y: 30 });
      tl.to(card1Ref.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.6);
    }
    if (card2Ref.current) {
      gsap.set(card2Ref.current, { opacity: 0, y: 30 });
      tl.to(card2Ref.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.8);
    }
    if (card3Ref.current) {
      gsap.set(card3Ref.current, { opacity: 0, y: 30 });
      tl.to(card3Ref.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.0);
    }
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });
      tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 1.3);
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="relative w-full overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <img src="/images/hero-henna.jpg" alt="Bride and groom hands with henna" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.72) 0%, rgba(74, 4, 4, 0.55) 40%, rgba(128, 0, 32, 0.35) 100%)' }}
        />
        <img src="/images/bg-bokeh.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center text-center min-h-screen px-6 py-28">
        <h1
          ref={titleRef}
          className="font-display font-light text-white leading-tight opacity-0 px-2"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)', letterSpacing: '-0.01em' }}
        >
          The beginning of your love story
        </h1>

        <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent mx-auto mt-5 mb-8" />

        {/* Story cards */}
        <div className="max-w-[700px] w-full space-y-4 mb-10">
          <div
            ref={card1Ref}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 sm:px-8 py-5 sm:py-6 opacity-0"
          >
            <p className="font-body text-base md:text-lg text-white/90 leading-relaxed text-center">
              We appreciate how difficult it is for people with special needs to find a source of contact with appropriate rishta profiles — therefore we have a unique tab for a collection of profiles for people with special needs.
            </p>
          </div>

          <div
            ref={card2Ref}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 sm:px-8 py-5 sm:py-6 opacity-0"
          >
            <p className="font-body text-base md:text-lg text-white/90 leading-relaxed text-center">
              At PerfectRishta it's all about making things easier and better for you. We totally understand how challenging it can be to go through hundreds of profiles daily.
            </p>
          </div>

          <div
            ref={card3Ref}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md px-5 sm:px-8 py-5 sm:py-6 opacity-0"
          >
            <p className="font-body text-base md:text-lg text-white/90 leading-relaxed text-center">
              Our website has been designed for ease of use. You can filter your search according to your need, using the selection tabs in the search tab. We hope to make things as easy for every applicant or their parent to find the right rishta.
            </p>
          </div>
        </div>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 opacity-0">
          <Link
            to="/join"
            className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-105 hover:shadow-xl text-center"
            style={{ background: '#D4AF37', color: '#4A0404' }}
          >
            Add Your Profile
          </Link>
          <Link
            to="/about"
            className="px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase border border-white/50 text-white transition-all duration-400 hover:bg-white/10 hover:border-white text-center"
          >
            Learn More
          </Link>
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
