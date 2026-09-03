import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { faqContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        const text = (title as HTMLElement).textContent || '';
        const words = text.split(' ');
        (title as HTMLElement).innerHTML = words.map(w =>
          `<span class="inline-block overflow-hidden mr-[0.25em]"><span class="word-inner inline-block">${w}</span></span>`
        ).join('');
        const inners = title.querySelectorAll('.word-inner');
        gsap.fromTo(inners, { opacity: 0, y: 50, rotateX: -20 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 78%', toggleActions: 'play none none reverse' }
          });
      }
    }

    if (itemsRef.current) {
      const items = itemsRef.current.children;
      gsap.fromTo(items, { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: itemsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white"
      style={{ paddingTop: 'clamp(80px, 10vh, 120px)', paddingBottom: 'clamp(80px, 10vh, 120px)' }}
    >
      {/* Watercolor background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-abstract.jpg" alt="" className="w-full h-full object-cover opacity-[0.08]" />
      </div>

      <div className="relative z-10 max-w-[800px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span className="section-label font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block opacity-0">
            Common Questions
          </span>
          <h2 className="section-title font-display font-normal text-deep-maroon mt-4 opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.01em', lineHeight: 1.1, perspective: '800px' }}>
            Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Items */}
        <div ref={itemsRef} className="space-y-4">
          {faqContent.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-maroon/8 bg-white/80 backdrop-blur-sm overflow-hidden transition-all duration-300 opacity-0"
              style={{
                boxShadow: openIndex === index ? '0 4px 20px rgba(128, 0, 32, 0.06)' : 'none',
                borderColor: openIndex === index ? 'rgba(212, 175, 55, 0.4)' : undefined,
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left group"
              >
                <span className="font-display text-lg text-deep-maroon font-normal group-hover:text-maroon transition-colors duration-300">
                  {faq.question}
                </span>
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: openIndex === index ? 'linear-gradient(135deg, #800020, #4A0404)' : 'rgba(128, 0, 32, 0.06)',
                    transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1V13M1 7H13" stroke={openIndex === index ? '#F3E5AB' : '#800020'} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-400"
                style={{
                  maxHeight: openIndex === index ? '300px' : '0px',
                  opacity: openIndex === index ? 1 : 0,
                }}
              >
                <div className="px-5 pb-5">
                  <div className="w-full h-px bg-gradient-to-r from-maroon/10 via-gold/30 to-transparent mb-4" />
                  <p className="font-body text-sm text-deep-maroon/60 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-10 opacity-0" ref={(el) => {
          if (el) {
            gsap.fromTo(el, { opacity: 0, y: 20 }, {
              opacity: 1, y: 0, duration: 0.6,
              scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' }
            });
          }
        }}>
          <p className="font-body text-sm text-deep-maroon/50">
            Still have questions?{' '}
            <a href="#footer" className="text-maroon font-medium hover:text-gold transition-colors duration-300">
              Get in touch with our team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
