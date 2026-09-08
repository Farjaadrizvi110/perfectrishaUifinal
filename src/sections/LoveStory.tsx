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
              Every love story begins with a spark&mdash;the very first hello, a shared glance, or an unexpected twist of fate that alters two lives forever.
            </p>
          </div>

          <div className="rounded-2xl border border-maroon/8 bg-white/80 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <p className="font-body text-base text-deep-maroon/75 leading-relaxed text-center">
              The magic lies in those opening chapters: the date you meet, your first conversation, the excitement and the little details that made you realize everything was about to change.
            </p>
          </div>

          <div className="rounded-2xl border border-maroon/8 bg-white/80 backdrop-blur-sm p-8 shadow-sm opacity-0">
            <p className="font-body text-base text-deep-maroon/75 leading-relaxed text-center">
              For a classic, nostalgic feel of these moments, Perfect Rishta will facilitate in the meeting of two people who are waiting to create their &lsquo;together forever&rsquo; love story.
            </p>
          </div>

          <div
            className="rounded-2xl backdrop-blur-sm p-8 shadow-sm opacity-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))',
              border: '1px solid rgba(212,175,55,0.35)',
            }}
          >
            <p className="font-body text-base text-deep-maroon leading-relaxed text-center">
              <span className="font-semibold" style={{ color: '#6B4A00' }}>
                We also cater for people with special needs.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
