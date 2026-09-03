import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aboutContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title: aboutContent.features[0].title,
    desc: aboutContent.features[0].description,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: aboutContent.features[1].title,
    desc: aboutContent.features[1].description,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: aboutContent.features[2].title,
    desc: aboutContent.features[2].description,
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#800020" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    title: aboutContent.features[3].title,
    desc: aboutContent.features[3].description,
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const parasRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Image reveal
    if (leftRef.current) {
      gsap.fromTo(leftRef.current, { opacity: 0, x: -80, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' }
        });
    }

    // Heading word-by-word reveal
    if (headingRef.current) {
      const text = headingRef.current.textContent || '';
      const words = text.split(' ');
      headingRef.current.innerHTML = words.map(w =>
        `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="word-inner inline-block">${w}</span></span>`
      ).join('');
      const inners = headingRef.current.querySelectorAll('.word-inner');
      gsap.fromTo(inners, { opacity: 0, y: 50, rotateX: -30 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }

    // Paragraphs fade in
    if (parasRef.current) {
      const paras = parasRef.current.querySelectorAll('p');
      gsap.fromTo(paras, { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: parasRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    // Badge pop in
    if (badgeRef.current) {
      gsap.fromTo(badgeRef.current, { opacity: 0, scale: 0, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: badgeRef.current, start: 'top 85%', toggleActions: 'play none none reverse' }
        });
    }

    // Feature cards
    if (featuresRef.current) {
      const cards = featuresRef.current.children;
      gsap.fromTo(cards, { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full bg-white overflow-hidden"
      style={{ paddingTop: 'clamp(80px, 12vh, 140px)', paddingBottom: 'clamp(80px, 12vh, 140px)' }}
    >
      {/* Watercolor background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-abstract.jpg" alt="" className="w-full h-full object-cover opacity-15" />
      </div>

      {/* Corner floral decorations */}
      <img src="/images/bg-floral.jpg" alt="" className="absolute -top-20 -right-32 w-[400px] opacity-[0.07] z-0 rotate-12 pointer-events-none" />
      <img src="/images/bg-floral.jpg" alt="" className="absolute -bottom-32 -left-24 w-[350px] opacity-[0.06] z-0 -rotate-45 pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Label */}
        <div className="text-center mb-12">
          <span className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block">
            {aboutContent.label}
          </span>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: Image */}
          <div ref={leftRef} className="relative opacity-0 lg:sticky lg:top-32">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/about-couple.jpg"
                alt="Muslim couple at their wedding ceremony in the UK"
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '3/4' }}
                loading="lazy"
              />
              <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gold rounded-tl-lg" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gold rounded-br-lg" />
            </div>
            <div
              ref={badgeRef}
              className="absolute -bottom-6 -right-4 lg:-right-8 px-6 py-4 rounded-xl shadow-xl opacity-0"
              style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}
            >
              <p className="font-display text-3xl text-gold font-normal">{aboutContent.badge.number}</p>
              <p className="font-body text-xs text-white/80 tracking-wide">{aboutContent.badge.text}</p>
            </div>
          </div>

          {/* Right: Rich Content */}
          <div>
            <h2
              ref={headingRef}
              className="font-display font-normal text-deep-maroon leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.01em', perspective: '800px' }}
            >
              {aboutContent.heading}
            </h2>

            <div ref={parasRef}>
              {aboutContent.paragraphs.map((para, i) => (
                <p
                  key={i}
                  className={`font-body text-base text-deep-maroon/65 leading-relaxed opacity-0 ${i === 0 ? 'mt-6' : 'mt-4'}`}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Quranic quote */}
            <div
              className="flex items-center gap-4 mt-8 opacity-0"
              ref={(el) => {
                if (el) {
                  gsap.fromTo(el, { opacity: 0, x: -20 }, {
                    opacity: 1, x: 0, duration: 0.7,
                    scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
                  });
                }
              }}
            >
              <div className="w-12 h-px bg-gradient-to-r from-maroon/60 to-gold" />
              <p className="font-display italic text-lg text-maroon/50">
                &ldquo;{aboutContent.quote}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div
          ref={featuresRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-maroon/8 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-gold/40 hover:shadow-lg transition-all duration-400 text-center opacity-0"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="font-display text-lg text-deep-maroon font-normal">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-deep-maroon/55 mt-2 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* SEO Content Block - Hidden visually but readable by search engines */}
        <div className="sr-only" aria-hidden="true">
          <h3>Why Choose PerfectRishta - UK's Leading Islamic Marriage Bureau</h3>
          <p>PerfectRishta is the UK's most trusted Islamic marriage bureau, serving British Muslims across London, Birmingham, Manchester, Bradford, Leeds, Glasgow, Cardiff, Bristol, Liverpool, Sheffield, Leicester, Coventry, Luton, Blackburn, and Slough. We specialise in halal matchmaking for Pakistani Muslims, Indian Muslims, Bangladeshi Muslims, Somali Muslims, Arab Muslims, Turkish Muslims, and all Muslim communities in the UK.</p>
          <p>Unlike dating apps, PerfectRishta offers traditional, family-involved Islamic matchmaking. Every profile is personally verified through home visits and reference checks. We prioritise Islamic values, complete privacy, and family involvement at every step.</p>
        </div>
      </div>
    </section>
  );
}
