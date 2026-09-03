import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { membershipContent } from '@/content/seoContent';

gsap.registerPlugin(ScrollTrigger);

const PLANS = [
  { name: membershipContent.plans[0].name, price: membershipContent.plans[0].price, period: membershipContent.plans[0].period, features: membershipContent.plans[0].features, highlighted: false },
  { name: membershipContent.plans[1].name, price: membershipContent.plans[1].price, period: membershipContent.plans[1].period, features: membershipContent.plans[1].features, highlighted: true },
  { name: membershipContent.plans[2].name, price: membershipContent.plans[2].price, period: membershipContent.plans[2].period, features: membershipContent.plans[2].features, highlighted: false },
];

export default function Membership() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleSelectPlan = (planName: string) => {
    localStorage.setItem('perfectrishta_selected_plan', planName);
  };

  useEffect(() => {
    // Header animations
    if (headerRef.current) {
      const label = headerRef.current.querySelector('.section-label');
      const title = headerRef.current.querySelector('.section-title');
      const desc = headerRef.current.querySelector('.section-desc');

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
          { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.05, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 78%', toggleActions: 'play none none reverse' }
          });
      }

      if (desc) {
        gsap.fromTo(desc, { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power2.out',
            scrollTrigger: { trigger: desc, start: 'top 85%', toggleActions: 'play none none reverse' }
          });
      }
    }

    // Cards animation with stagger
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(card, { opacity: 0, y: 60, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: i * 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%', toggleActions: 'play none none reverse' }
        });
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <section
      id="membership"
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ paddingTop: 'clamp(80px, 10vh, 120px)', paddingBottom: 'clamp(80px, 10vh, 120px)' }}
    >
      {/* Floral watercolor background */}
      <div className="absolute inset-0 z-0">
        <img src="/images/bg-floral.jpg" alt="" className="w-full h-full object-cover opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-ivory/50 to-white" />
      </div>

      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 z-10">
        <div className="h-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-14">
          <span className="section-label font-body text-xs font-semibold tracking-[0.25em] uppercase text-maroon inline-block opacity-0">
            {membershipContent.label}
          </span>
          <h2 className="section-title font-display font-normal text-deep-maroon mt-4 opacity-0" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.01em', lineHeight: 1.1, perspective: '800px' }}>
            {membershipContent.heading}
          </h2>
          <p className="section-desc font-body text-base text-deep-maroon/55 max-w-[520px] mx-auto mt-4 leading-relaxed opacity-0">
            {membershipContent.description}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map((plan, index) => (
            <div key={plan.name} ref={(el) => { cardsRef.current[index] = el; }} className="relative opacity-0">
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="font-body text-[10px] font-semibold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960C)' }}>
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className="h-full p-8 lg:p-10 rounded-2xl border text-center transition-all duration-400 hover:-translate-y-1"
                style={{
                  background: plan.highlighted ? 'linear-gradient(180deg, #FFFFFF 0%, #FFFEF8 100%)' : '#FFFFFF',
                  borderColor: plan.highlighted ? 'rgba(212, 175, 55, 0.5)' : 'rgba(128, 0, 32, 0.1)',
                  boxShadow: plan.highlighted ? '0 8px 40px rgba(128, 0, 32, 0.08), 0 0 0 1px rgba(212, 175, 55, 0.2)' : '0 2px 12px rgba(128, 0, 32, 0.04)',
                }}
              >
                <h3 className="font-display text-xl text-deep-maroon font-normal">{plan.name}</h3>
                <div className="mt-4">
                  <span className="font-display font-light text-maroon" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.2rem)' }}>{plan.price}</span>
                </div>
                <p className="font-body text-sm text-deep-maroon/50 mt-1 mb-6">{plan.period}</p>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-6" />
                <ul className="text-left space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="font-body text-sm text-deep-maroon/65 flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0">
                        <path d="M3 8L6.5 11.5L13 4.5" stroke={plan.highlighted ? '#D4AF37' : '#800020'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/join"
                  onClick={() => handleSelectPlan(plan.name)}
                  className="block w-full mt-8 py-3.5 rounded-full font-body text-sm font-semibold tracking-[0.08em] uppercase transition-all duration-400 hover:shadow-lg hover:scale-[1.02] text-center"
                  style={{
                    background: plan.highlighted ? 'linear-gradient(135deg, #800020, #4A0404)' : 'transparent',
                    color: plan.highlighted ? '#FFFFFF' : '#800020',
                    border: plan.highlighted ? 'none' : '1.5px solid rgba(128, 0, 32, 0.2)',
                  }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center font-body text-xs text-deep-maroon/35 mt-10 tracking-wide">
          {membershipContent.note}
        </p>
      </div>
    </section>
  );
}
