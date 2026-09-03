import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: 'Special Needs Profiles',
    text: 'We appreciate how difficult it is for people with special needs to find a source of contact with appropriate rishta profiles — therefore we have a unique tab for a collection of profiles for people with special needs.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Made Easier & Better',
    text: "At PerfectRishta it's all about making things easier and better for you. We totally understand how challenging it can be to go through hundreds of profiles daily.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
    title: 'Smart Search Filters',
    text: 'Our website has been designed for ease of use. You can filter your search according to your need, using the selection tabs in the search tab.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'For Every Family',
    text: 'We hope to make things as easy for every applicant or their parent to find the right rishta.',
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const items = headerRef.current.querySelectorAll('.animate-item');
      gsap.fromTo(items, { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }
    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(cards, { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 50%, #FFFFFF 100%)',
        paddingTop: 'clamp(70px, 9vh, 110px)',
        paddingBottom: 'clamp(70px, 9vh, 110px)',
      }}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 z-10">
        <div className="h-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">
            Why Choose Us
          </span>
          <h2 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Designed with Care for Every Heart
          </h2>
          <div className="animate-item w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-4 opacity-0" />
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-maroon/8 bg-white p-7 sm:p-8 transition-all duration-400 hover:-translate-y-1 hover:shadow-lg opacity-0"
              style={{ boxShadow: '0 2px 12px rgba(128, 0, 32, 0.04)' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, rgba(128,0,32,0.06), rgba(212,175,55,0.08))' }}>
                {card.icon}
              </div>
              <h3 className="font-display text-lg text-deep-maroon font-normal mb-3">{card.title}</h3>
              <p className="font-body text-sm text-deep-maroon/60 leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
