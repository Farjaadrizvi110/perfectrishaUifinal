import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LoveStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      const title = headerRef.current.querySelector('.section-title');
      if (title) {
        gsap.fromTo(title, { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
          });
      }
    }

    if (cardsRef.current) {
      const cards = cardsRef.current.children;
      gsap.fromTo(cards, { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white"
      style={{ paddingTop: 'clamp(80px, 10vh, 120px)', paddingBottom: 'clamp(80px, 10vh, 120px)' }}
    >
      {/* Soft background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-floral.jpg" alt="" className="w-full h-full object-cover opacity-[0.04]" />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h2
            className="section-title font-display font-normal text-deep-maroon opacity-0"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.01em', lineHeight: 1.1 }}
          >
            The beginning of your love story
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-5" />
        </div>

        {/* Story Cards */}
        <div ref={cardsRef} className="space-y-6">
          <div className="rounded-2xl border border-maroon/8 bg-white/80 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <p className="font-body text-base text-deep-maroon/75 leading-relaxed text-center">
              We appreciate how difficult it is for people with special needs to find a source of contact with appropriate rishta profiles — therefore we have a unique tab for a collection of profiles for people with special needs.
            </p>
          </div>

          <div className="rounded-2xl border border-maroon/8 bg-white/80 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <p className="font-body text-base text-deep-maroon/75 leading-relaxed text-center">
              At PerfectRishta it&rsquo;s all about making things easier and better for you. We totally understand how challenging it can be to go through hundreds of profiles daily.
            </p>
          </div>

          <div className="rounded-2xl border border-maroon/8 bg-white/80 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <p className="font-body text-base text-deep-maroon/75 leading-relaxed text-center">
              Our website has been designed for ease of use. You can filter your search according to your need, using the selection tabs in the search tab. We hope to make things as easy for every applicant or their parent to find the right rishta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
