import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function WelcomeInfo() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      gsap.fromTo(imageRef.current, { opacity: 0, x: -40, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' }
        });
    }

    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll('.animate-item');
      gsap.fromTo(items, { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: contentRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="welcome"
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 100%)',
        paddingTop: 'clamp(80px, 10vh, 120px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
      }}
    >
      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div ref={imageRef} className="relative opacity-0">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/images/hero-bg.jpg"
                alt="Muslim wedding celebration with red silk and rose petals"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-maroon/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 px-6 py-4 rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}
            >
              <p className="font-display text-2xl text-gold">500+</p>
              <p className="font-body text-xs text-white/80">Successful Matches</p>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <span className="animate-item inline-block font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon mb-4 opacity-0">
              Welcome to PerfectRishta
            </span>
            <h2 className="animate-item font-display font-normal text-deep-maroon opacity-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              UK&apos;s Trusted Islamic Marriage Bureau
            </h2>
            <div className="animate-item w-12 h-px bg-gradient-to-r from-gold/60 to-transparent my-5 opacity-0" />
            <p className="animate-item font-body text-base text-deep-maroon/65 leading-relaxed mb-4 opacity-0">
              PerfectRishta is a premium, confidential, and Islamically-guided matrimonial service dedicated to helping British Muslims find their perfect life partner. We believe that marriage is a sacred trust — a step towards completing half of your faith.
            </p>
            <p className="animate-item font-body text-base text-deep-maroon/65 leading-relaxed mb-4 opacity-0">
              Our approach is rooted in the Sunnah. We do not believe in casual introductions or superficial matching. Every profile that enters our system is personally reviewed, verified, and handled with the utmost care and respect for Islamic values.
            </p>
            <p className="animate-item font-body text-base text-deep-maroon/65 leading-relaxed opacity-0">
              Whether you are a young professional in London, a university graduate in Birmingham, or a family seeking a suitable match for your son or daughter — we are here to serve you with the same care we would give our own families.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
