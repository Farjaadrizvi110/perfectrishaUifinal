import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LOCATIONS = [
  'London', 'Birmingham', 'Manchester', 'Bradford', 'Leeds',
  'Glasgow', 'Edinburgh', 'Cardiff', 'Bristol', 'Liverpool',
  'Sheffield', 'Leicester', 'Coventry', 'Luton', 'Blackburn', 'Slough'
];

export default function Locations() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const label = headerRef.current.querySelector('.section-label');
      const title = headerRef.current.querySelector('.section-title');

      if (label) {
        gsap.fromTo(label, { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
          });
      }

      if (title) {
        gsap.fromTo(title, { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 78%', toggleActions: 'play none none reverse' }
          });
      }
    }

    if (contentRef.current) {
      const blocks = contentRef.current.querySelectorAll('.animate-block');
      gsap.fromTo(blocks, { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="locations"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)',
        paddingTop: 'clamp(60px, 8vh, 100px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
      }}
    >
      {/* Floral background */}
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 -right-24 w-[250px] opacity-[0.04] z-0 pointer-events-none" />
      <img src="/images/bg-floral.jpg" alt="" className="absolute bottom-0 -left-20 w-[220px] opacity-[0.03] z-0 pointer-events-none rotate-180" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="section-label font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block opacity-0">
            Serving Across the UK
          </span>
          <h2 className="section-title font-display font-normal text-deep-maroon mt-4 opacity-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
            Trusted by the Muslim Community Nationwide
          </h2>
        </div>

        <div ref={contentRef} className="space-y-8">
          {/* Why Choose Us */}
          <div className="animate-block opacity-0">
            <h3 className="font-display text-lg text-deep-maroon/70 font-normal mb-4 text-center">
              Why the Muslim Community Chooses PerfectRishta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                '100% halal and Islamic approach to matchmaking',
                'Verified profiles with background checks',
                'Family involvement at every step',
                'Complete confidentiality and privacy',
                'Personal matchmaker assigned to you',
                'Serving Muslims across all UK cities',
                'GDPR compliant data protection',
                'Affordable plans for every budget',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-maroon/5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
                    <path d="M3 8L6.5 11.5L13 4.5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-body text-sm text-deep-maroon/60 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div className="animate-block opacity-0">
            <h3 className="font-display text-lg text-deep-maroon/70 font-normal mb-4 text-center">
              Areas We Serve Across the United Kingdom
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {LOCATIONS.map((loc) => (
                <span
                  key={loc}
                  className="font-body text-xs tracking-wide px-4 py-2 rounded-full bg-white border border-maroon/8 text-deep-maroon/60 hover:border-gold/40 hover:text-maroon transition-all duration-300 cursor-default"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="animate-block opacity-0 text-center">
            <h3 className="font-display text-lg text-deep-maroon/70 font-normal mb-4">
              Community We Proudly Serve
            </h3>
            <span className="inline-block font-body text-sm tracking-wide px-8 py-3 rounded-full bg-white border border-gold/30 text-deep-maroon/70">
              Muslim Community
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
