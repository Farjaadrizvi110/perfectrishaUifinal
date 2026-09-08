export default function WhatsAppFAB() {
  const number = '447359859455';
  const numberDisplay = '+44 7359 859455';
  const prefill = encodeURIComponent(
    'Assalamualaikum, I would like to know more about PerfectRishta services.'
  );
  const waLink = `https://wa.me/${number}?text=${prefill}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with PerfectRishta on WhatsApp at ${numberDisplay}`}
      title={`WhatsApp Us — ${numberDisplay}`}
      className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex items-center no-underline select-none"
      style={{ maxWidth: 'calc(100vw - 1.5rem)' }}
    >
      <div
        className="relative flex items-center overflow-hidden transition-all duration-300 ease-out shadow-2xl rounded-full group-hover:rounded-full rounded-full group-hover:shadow-[0_10px_40px_rgba(37,211,102,0.35)] focus-visible:outline-none focus-visible:ring-4"
        style={{
          height: '58px',
          minWidth: '58px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          transitionProperty: 'width, min-width, max-width, box-shadow, border-color, transform',
        }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full opacity-60 animate-pulse" style={{ boxShadow: '0 0 0 0 rgba(37,211,102, 0.55)' }} />

        <div className="relative flex shrink-0 items-center justify-center" style={{ width: '58px', height: '58px' }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.064 2.263l.03.172c.036 1.28.628 2.87 1.96 4.267 1.33 1.395 2.877 2.162 4.378 2.54l.285.072c.87.225 1.66.18 2.263.11.645-.074 2.077-.854 2.37-1.686.296-.833.314-1.54.222-1.686-.092-.144-.33-.223-.702-.37l-.036-.014zM27.494 8.564C24.91 4.99 20.41 3.128 15.824 3.14c-5.75.013-10.446 3.895-12.095 9.073C2.042 17.75 3.83 23.595 7.757 27.52L5.888 31.82l4.375-1.13a12.11 12.11 0 0 0 5.56 1.36h.004c.31 0 .614-.012.914-.032 4.73-.16 9.068-2.44 11.658-6.12 2.848-4.058 3.323-9.108 1.268-13.593-.073-.16-.15-.32-.23-.476zM15.855 29.056c-.242.015-.476.03-.73.03a10.3 10.3 0 0 1-4.95-1.176l-.355-.21-3.264.84.86-3.16-.23-.366a10.1 10.1 0 0 1-1.88-6.444c-.012-3.975 2.687-7.675 6.725-8.844 3.832-1.11 8.14.1 11.01 3.17 2.73 2.925 3.64 7.018 2.37 10.806-1.22 3.63-4.57 6.27-8.446 6.34l-.11.008z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <div className="overflow-hidden transition-all duration-300 ease-out whitespace-nowrap pr-5" style={{ width: 0, opacity: 0 }}>
          <div className="flex items-center gap-3 pl-1 whitespace-nowrap">
            <div className="flex flex-col items-start leading-tight">
              <span className="font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/90">
                WhatsApp Us
              </span>
              <span className="font-body text-sm font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.18)' }}>
                {numberDisplay}
              </span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFE9A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7"/><path d="M7 7h10v10"/>
            </svg>
          </div>
        </div>
      </div>

      <style>{`
        a.group:hover > div:first-child,
        a.group:focus-visible > div:first-child {
          min-width: 280px !important;
          max-width: calc(100vw - 1.5rem);
          box-shadow: 0 18px 46px rgba(18,140,126, 0.35), 0 0 0 3px rgba(212,175,55, 0.55) !important;
          transform: translateY(-1px);
        }
        a.group:hover > div:first-child > div:nth-child(3),
        a.group:focus-visible > div:first-child > div:nth-child(3) {
          width: auto !important;
          opacity: 1 !important;
        }
        @media (hover: none) and (pointer: coarse) {
          a.group > div:first-child {
            min-width: 58px !important;
          }
        }
      `}</style>
    </a>
  );
}
