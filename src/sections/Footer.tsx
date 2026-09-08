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
        <div className="animate-footer mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-10 opacity-0">
          <a href={`mailto:${footerContent.email}`} className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-gold transition-colors duration-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            {footerContent.email}
          </a>

          <a
            href={`https://wa.me/${(footerContent.whatsapp ?? footerContent.phone).replace(/[^\d]/g, '')}?text=${encodeURIComponent('Assalamualaikum, I would like to know more about PerfectRishta services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-gold transition-colors duration-300"
            title={`Chat on WhatsApp — ${footerContent.whatsapp ?? footerContent.phone}`}
          >
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.064 2.263l.03.172c.036 1.28.628 2.87 1.96 4.267 1.33 1.395 2.877 2.162 4.378 2.54l.285.072c.87.225 1.66.18 2.263.11.645-.074 2.077-.854 2.37-1.686.296-.833.314-1.54.222-1.686-.092-.144-.33-.223-.702-.37zM27.494 8.564C24.91 4.99 20.41 3.128 15.824 3.14c-5.75.013-10.446 3.895-12.095 9.073-1.686 5.536.102 11.38 4.03 15.306L5.888 31.82l4.375-1.13a12.11 12.11 0 0 0 5.56 1.36h.004c.31 0 .614-.012.914-.032 4.73-.16 9.068-2.44 11.658-6.12 2.848-4.058 3.323-9.108 1.268-13.593a10.8 10.8 0 0 0-.23-.476zM15.855 29.056c-.242.015-.476.03-.73.03a10.3 10.3 0 0 1-4.95-1.176l-.355-.21-3.264.84.86-3.16-.23-.366a10.1 10.1 0 0 1-1.88-6.444c-.012-3.975 2.687-7.675 6.725-8.844 3.832-1.11 8.14.1 11.01 3.17 2.73 2.925 3.64 7.018 2.37 10.806-1.22 3.63-4.57 6.27-8.446 6.34z"
                fill="currentColor"
              />
            </svg>
            WhatsApp · {footerContent.whatsapp ?? footerContent.phone}
          </a>

          <a href={`tel:${(footerContent.phone ?? '').replace(/\s/g, '')}`} className="flex items-center gap-2 font-body text-sm text-white/60 hover:text-gold transition-colors duration-300">
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
