import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { footerContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const section = sectionRef.current;
    if (!content || !section) return;

    const items = content.querySelectorAll('.animate-footer');
    gsap.fromTo(items,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 65%', toggleActions: 'play none none reverse' }
      });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="footer"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '80vh' }}
    >
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #4A0404 0%, #800020 50%, #4A0404 100%)' }} />
        <img src="/images/bg-bokeh.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url(/images/geometric-pattern.jpg)', backgroundSize: '150px' }} />
      </div>

      {/* Top wave */}
      <div className="absolute top-0 left-0 w-full z-[2] rotate-180">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
        </svg>
      </div>

      <div ref={contentRef} className="relative z-[3] flex flex-col items-center justify-center text-center min-h-[80vh] px-6 pt-28 pb-32">
        {/* Logo */}
        <div className="animate-footer opacity-0">
          <h2 className="font-display text-4xl md:text-5xl">
            <span className="font-light text-white">Perfect</span>
            <span className="font-medium text-gold">Rishta</span>
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent mx-auto mt-3" />
        </div>

        <h3 className="animate-footer font-display font-light text-white/90 mt-10 opacity-0" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.01em' }}>
          {footerContent.heading}
        </h3>

        <p className="animate-footer font-body text-base text-white/55 max-w-[480px] mt-4 leading-relaxed opacity-0">
          {footerContent.description}
        </p>

        <button className="animate-footer mt-8 px-10 py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-105 hover:shadow-xl opacity-0" style={{ background: '#D4AF37', color: '#4A0404' }}>
          {footerContent.cta}
        </button>

        {/* Contact details */}
        <div className="animate-footer mt-14 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 opacity-0">
          <a href={`mailto:${footerContent.email}`} className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-gold transition-colors duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            {footerContent.email}
          </a>
          <a href={`tel:${footerContent.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-gold transition-colors duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {footerContent.phone}
          </a>
        </div>

        <div className="animate-footer flex items-center gap-6 mt-8 opacity-0">
          {footerContent.social.map((social) => (
            <a key={social} href="#" className="font-body text-xs font-medium tracking-wide text-white/45 hover:text-gold transition-colors duration-300 uppercase">
              {social}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 w-full z-[4] border-t border-white/8">
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[11px] text-white/40 tracking-wide">
            {footerContent.copyright}
          </p>
          <div className="flex items-center gap-4">
            {footerContent.links.map((link, i) => (
              <span key={link} className="flex items-center gap-4">
                <a href="#" className="font-body text-[11px] text-white/40 hover:text-gold transition-colors">{link}</a>
                {i < footerContent.links.length - 1 && <span className="text-white/20">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
