import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { membershipContent, paymentDetails } from '@/content/seoContent';

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

        {/* Bank Payment Notice */}
        <div className="mt-8 max-w-[720px] mx-auto rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/5 via-white to-ivory/60 p-5 sm:p-7 text-left">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A0404" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
                <line x1="6" y1="15" x2="10" y2="15"/>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="font-display text-base text-deep-maroon font-medium">
                Secure Bank Transfer — Pay After Registering
              </h4>
              <p className="font-body text-xs sm:text-sm text-deep-maroon/65 leading-relaxed">
                Once you complete your registration form, please pay your selected membership fee via bank transfer using the details below. Remember to use your <strong className="text-maroon">full name</strong> as the payment reference. After payment, share the transfer screenshot on WhatsApp for confirmation — we will then approve your profile within 48 hours, In Sha Allah.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 bg-white/70 rounded-xl p-4 border border-maroon/8">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-deep-maroon/40">Bank</p>
                  <p className="font-body text-sm font-semibold text-deep-maroon">{paymentDetails.bankName}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-deep-maroon/40">Account Name</p>
                  <p className="font-body text-xs sm:text-sm font-semibold text-deep-maroon break-words">{paymentDetails.accountName}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-deep-maroon/40">Sort Code</p>
                  <p className="font-mono text-sm font-semibold text-maroon tracking-wider">{paymentDetails.sortCode}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-deep-maroon/40">Account Number</p>
                  <p className="font-mono text-sm font-semibold text-maroon tracking-wider">{paymentDetails.accountNumber}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`${paymentDetails.confirmWhatsAppLink}?text=${encodeURIComponent(`Assalamualaikum Team Perfect Rishta, I would like to confirm my membership fee payment. JazakAllah Khair.`)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-wider uppercase text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" stroke="none">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Share Screenshot on WhatsApp {paymentDetails.confirmWhatsApp}
                </a>
                <span className="font-body text-[11px] text-deep-maroon/45">
                  Quote your full name as payment reference
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* End Bank Payment Notice */}
      </div>
    </section>
  );
}
