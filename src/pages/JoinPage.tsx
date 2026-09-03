import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ProfileForm {
  // Personal
  gender: string;
  dob: string;
  age: string;
  height: string;
  languages: string;
  location: string;
  nationality: string;
  ethnicity: string;
  disability: string;
  // Religious
  religion: string;
  sect: string;
  hijabi: string;
  beardStyle: string;
  religiousExpectations: string;
  // Education & Employment
  education: string;
  occupation: string;
  annualIncome: string;
  // Lifestyle
  smoker: string;
  drivingLicence: string;
  willingToRelocate: string;
  hobbies: string;
  // Marital
  maritalStatus: string;
  secondWife: string;
  // About
  aboutMe: string;
  // Looking For
  partnerEducation: string;
  partnerOccupation: string;
  partnerSect: string;
  partnerReligiousPractice: string;
  partnerIslamicValues: string;
  partnerAgeRange: string;
  partnerEthnicity: string;
  partnerLivingArrangement: string;
  partnerWillingRelocate: string;
  openToDivorcee: string;
  openToWidow: string;
  acceptChildren: string;
  partnerDescription: string;
  otherInfo: string;
  confirmInfo: boolean;
}

const initialForm: ProfileForm = {
  gender: '', dob: '', age: '', height: '', languages: '', location: '', nationality: '', ethnicity: '', disability: '',
  religion: '', sect: '', hijabi: '', beardStyle: '', religiousExpectations: '',
  education: '', occupation: '', annualIncome: '',
  smoker: '', drivingLicence: '', willingToRelocate: '', hobbies: '',
  maritalStatus: '', secondWife: '',
  aboutMe: '',
  partnerEducation: '', partnerOccupation: '', partnerSect: '', partnerReligiousPractice: '', partnerIslamicValues: '', partnerAgeRange: '', partnerEthnicity: '', partnerLivingArrangement: '', partnerWillingRelocate: '', openToDivorcee: '', openToWidow: '', acceptChildren: '', partnerDescription: '', otherInfo: '',
  confirmInfo: false,
};

export default function JoinPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const plan = localStorage.getItem('perfectrishta_selected_plan');
    if (plan) setSelectedPlan(plan);

    if (headerRef.current) {
      const items = headerRef.current.querySelectorAll('.animate-item');
      gsap.fromTo(items, { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 75%', toggleActions: 'play none none reverse' }
        });
    }
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: formRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
        });
    }
    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="font-display text-lg text-maroon font-normal mb-5 pb-3 border-b border-maroon/10 flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-maroon to-deep-maroon flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-gold" />
      </span>
      {title}
    </h3>
  );

  const FieldRow = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
  );

  const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
    <label className="block font-body text-sm font-medium text-deep-maroon/70 mb-2">
      {children}{required && <span className="text-maroon ml-0.5">*</span>}
    </label>
  );

  const Input = ({ name, value, onChange, placeholder, required, type = 'text' }: any) => (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
    />
  );

  const Select = ({ name, value, onChange, options, required }: any) => (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all appearance-none cursor-pointer"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const TextArea = ({ name, value, onChange, placeholder, rows = 3 }: any) => (
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all resize-none"
    />
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(localStorage.getItem('perfectrishta_profiles') || '[]');
    const newProfile = {
      ...form,
      id: Date.now().toString(),
      plan: selectedPlan || 'Free',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    existing.push(newProfile);
    localStorage.setItem('perfectrishta_profiles', JSON.stringify(existing));
    setSubmitted(true);
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)',
        paddingTop: 'clamp(100px, 14vh, 160px)',
        paddingBottom: 'clamp(60px, 8vh, 100px)',
        minHeight: '100vh',
      }}
    >
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none" />
      <div className="relative z-10 max-w-[800px] mx-auto px-6">
        <div className="flex justify-start mb-6">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
        </div>
        {/* Header */}
        <div ref={headerRef} className="text-center mb-10">
          <div className="animate-item mb-5 opacity-0">
            <h1 className="font-display text-3xl text-deep-maroon">
              <span className="font-light">Perfect</span>
              <span className="font-medium text-gold">Rishta</span>
            </h1>
            <p className="font-body text-xs tracking-[0.3em] uppercase text-deep-maroon/50 mt-1">PROFILE</p>
          </div>
          <p className="animate-item font-body text-sm text-deep-maroon/55 max-w-[540px] mx-auto leading-relaxed opacity-0">
            Please fill in the details below as accurately and honestly as possible. This information will help us find a suitable match, In Sha Allah.
          </p>
        </div>

        {/* Selected Plan */}
        {selectedPlan && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-gold/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-body text-sm font-medium text-deep-maroon">Selected Plan: <span className="text-maroon font-semibold">{selectedPlan}</span></span>
              <Link to="/" className="font-body text-xs text-maroon/60 hover:text-maroon underline ml-1">Change</Link>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="rounded-2xl border border-maroon/10 bg-white shadow-lg p-10 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #D4AF37, #c49b27)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4A0404" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 className="font-display text-3xl text-deep-maroon font-light mb-3">Thank You for Registering!</h3>
            <p className="font-body text-sm text-deep-maroon/60 max-w-[400px] mx-auto leading-relaxed mb-2">
              Your profile has been submitted successfully. Our team will carefully review your information.
            </p>
            <p className="font-body text-sm text-deep-maroon/60 max-w-[400px] mx-auto leading-relaxed mb-6">
              We will approve your profile after inspection and get back to you within <strong className="text-maroon">48 hours</strong>, In Sha Allah.
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-px bg-gold/40" />
              <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
              <div className="w-8 h-px bg-gold/40" />
            </div>
            <p className="font-body text-xs text-deep-maroon/40 mb-6">
              Once approved, you will receive your Login ID and Password via email. You can then sign in to view and connect with proposals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-8 py-3 rounded-full font-body text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}
              >
                Back to Home
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 rounded-full font-body text-xs font-semibold tracking-[0.1em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border border-maroon/8 bg-white shadow-sm p-5 sm:p-8 md:p-10 space-y-10 opacity-0">

            {/* Personal Information */}
            <div>
              <SectionTitle title="Personal Information" />
              <div className="space-y-5">
                <FieldRow>
                  <div>
                    <Label required>Gender</Label>
                    <Select name="gender" value={form.gender} onChange={handleChange} required options={[
                      { value: '', label: 'Select gender' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                    ]} />
                  </div>
                  <div>
                    <Label required>Date of Birth</Label>
                    <Input type="date" name="dob" value={form.dob} onChange={handleChange} required />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label required>Age</Label>
                    <Input type="number" name="age" value={form.age} onChange={handleChange} placeholder="Your age" required />
                  </div>
                  <div>
                    <Label>Height</Label>
                    <Input name="height" value={form.height} onChange={handleChange} placeholder="e.g. 5ft 8in / 173cm" />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Languages Spoken</Label>
                    <Input name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. English, Urdu, Arabic" />
                  </div>
                  <div>
                    <Label required>Location</Label>
                    <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. London, Birmingham" required />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Nationality</Label>
                    <Input name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. British, Pakistani" />
                  </div>
                  <div>
                    <Label>Ethnicity</Label>
                    <Input name="ethnicity" value={form.ethnicity} onChange={handleChange} placeholder="e.g. Punjabi, Bengali" />
                  </div>
                </FieldRow>
                <div>
                  <Label>Disability (if any)</Label>
                  <Input name="disability" value={form.disability} onChange={handleChange} placeholder="N/A or describe" />
                </div>
              </div>
            </div>

            {/* Religious Information */}
            <div>
              <SectionTitle title="Religious Information" />
              <div className="space-y-5">
                <FieldRow>
                  <div>
                    <Label>Religion</Label>
                    <Input name="religion" value={form.religion} onChange={handleChange} placeholder="e.g. Islam" />
                  </div>
                  <div>
                    <Label>Sect</Label>
                    <Input name="sect" value={form.sect} onChange={handleChange} placeholder="e.g. Sunni, Shia" />
                  </div>
                </FieldRow>
                {form.gender === 'Female' && (
                  <div>
                    <Label>Hijabi / Non-Hijabi</Label>
                    <Select name="hijabi" value={form.hijabi} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Hijabi', label: 'Hijabi' },
                      { value: 'Non-Hijabi', label: 'Non-Hijabi' },
                      { value: 'Niqabi', label: 'Niqabi' },
                    ]} />
                  </div>
                )}
                {form.gender === 'Male' && (
                  <div>
                    <Label>Beard Style</Label>
                    <Select name="beardStyle" value={form.beardStyle} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Short', label: 'Short' },
                      { value: 'Stylish', label: 'Stylish' },
                      { value: 'According to Sunnah', label: 'According to Sunnah' },
                      { value: 'No beard', label: 'No beard' },
                    ]} />
                  </div>
                )}
                <div>
                  <Label>Religious Expectations</Label>
                  <TextArea name="religiousExpectations" value={form.religiousExpectations} onChange={handleChange} placeholder="Describe your religious expectations..." rows={2} />
                </div>
              </div>
            </div>

            {/* Education & Employment */}
            <div>
              <SectionTitle title="Education & Employment" />
              <div className="space-y-5">
                <FieldRow>
                  <div>
                    <Label>Education</Label>
                    <Input name="education" value={form.education} onChange={handleChange} placeholder="e.g. Bachelor's, Master's, PhD" />
                  </div>
                  <div>
                    <Label>Occupation</Label>
                    <Input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Doctor, Engineer, Teacher" />
                  </div>
                </FieldRow>
                <div>
                  <Label>Annual Income</Label>
                  <Input name="annualIncome" value={form.annualIncome} onChange={handleChange} placeholder="e.g. £30,000 - £50,000" />
                </div>
              </div>
            </div>

            {/* Lifestyle */}
            <div>
              <SectionTitle title="Lifestyle" />
              <div className="space-y-5">
                <FieldRow>
                  <div>
                    <Label>Smoker / Non-Smoker</Label>
                    <Select name="smoker" value={form.smoker} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Non-smoker', label: 'Non-smoker' },
                      { value: 'Occasional', label: 'Occasional' },
                      { value: 'Smoker', label: 'Smoker' },
                    ]} />
                  </div>
                  <div>
                    <Label>Driving Licence</Label>
                    <Select name="drivingLicence" value={form.drivingLicence} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                      { value: 'Learning', label: 'Learning' },
                    ]} />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Willing to Relocate</Label>
                    <Select name="willingToRelocate" value={form.willingToRelocate} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                      { value: 'Flexible', label: 'Flexible' },
                    ]} />
                  </div>
                  <div>
                    <Label>Hobbies & Interests</Label>
                    <Input name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="e.g. Reading, Cooking, Travel" />
                  </div>
                </FieldRow>
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <SectionTitle title="Marital Status" />
              <div className="space-y-5">
                <div>
                  <Label required>Marital Status</Label>
                  <Select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} required options={[
                    { value: '', label: 'Select marital status' },
                    { value: 'Single', label: 'Single' },
                    { value: 'Divorced', label: 'Divorced' },
                    { value: 'Widowed', label: 'Widowed' },
                  ]} />
                </div>
                {form.maritalStatus === 'Single' && (
                  <div>
                    <Label>If previously married, are you looking for a second wife?</Label>
                    <Select name="secondWife" value={form.secondWife} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'N/A', label: 'N/A' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]} />
                  </div>
                )}
              </div>
            </div>

            {/* About Me */}
            <div>
              <SectionTitle title="About Me" />
              <TextArea name="aboutMe" value={form.aboutMe} onChange={handleChange} placeholder="Tell us about yourself, your personality, values, and what makes you unique..." rows={5} />
            </div>

            {/* What I am looking for */}
            <div>
              <SectionTitle title="What I am Looking for in my Partner" />
              <div className="space-y-5">
                <FieldRow>
                  <div>
                    <Label>Education Level</Label>
                    <Input name="partnerEducation" value={form.partnerEducation} onChange={handleChange} placeholder="e.g. Bachelor's, Any" />
                  </div>
                  <div>
                    <Label>Preferred Occupation</Label>
                    <Input name="partnerOccupation" value={form.partnerOccupation} onChange={handleChange} placeholder="e.g. Professional, Any" />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Preferred / Required Sect</Label>
                    <Input name="partnerSect" value={form.partnerSect} onChange={handleChange} placeholder="e.g. Sunni, No preference" />
                  </div>
                  <div>
                    <Label>Preferred Level of Religious Practice</Label>
                    <Input name="partnerReligiousPractice" value={form.partnerReligiousPractice} onChange={handleChange} placeholder="e.g. Practicing, Moderate" />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Preferred Age Range</Label>
                    <Input name="partnerAgeRange" value={form.partnerAgeRange} onChange={handleChange} placeholder="e.g. 25 - 35" />
                  </div>
                  <div>
                    <Label>Preferred Ethnicity / Nationality</Label>
                    <Input name="partnerEthnicity" value={form.partnerEthnicity} onChange={handleChange} placeholder="e.g. Open, Same background" />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Preferred Living Arrangements</Label>
                    <Select name="partnerLivingArrangement" value={form.partnerLivingArrangement} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Joint family', label: 'Joint family' },
                      { value: 'Separate', label: 'Separate' },
                      { value: 'Flexible', label: 'Flexible' },
                    ]} />
                  </div>
                  <div>
                    <Label>Willing to Relocate?</Label>
                    <Select name="partnerWillingRelocate" value={form.partnerWillingRelocate} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                      { value: 'Only to specific locations', label: 'Only to specific locations' },
                    ]} />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Open to a Divorcee?</Label>
                    <Select name="openToDivorcee" value={form.openToDivorcee} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]} />
                  </div>
                  <div>
                    <Label>Open to a Widow / Widower?</Label>
                    <Select name="openToWidow" value={form.openToWidow} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]} />
                  </div>
                </FieldRow>
                <FieldRow>
                  <div>
                    <Label>Accept someone with Children?</Label>
                    <Select name="acceptChildren" value={form.acceptChildren} onChange={handleChange} options={[
                      { value: '', label: 'Select' },
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]} />
                  </div>
                </FieldRow>
                <div>
                  <Label>Describe what you are looking for</Label>
                  <TextArea name="partnerDescription" value={form.partnerDescription} onChange={handleChange} placeholder="Describe your ideal partner and what qualities matter most to you..." rows={4} />
                </div>
                <div>
                  <Label>Any other information</Label>
                  <TextArea name="otherInfo" value={form.otherInfo} onChange={handleChange} placeholder="Any additional details you'd like to share..." rows={2} />
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="pt-4 border-t border-maroon/10">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmInfo"
                  checked={form.confirmInfo}
                  onChange={handleChange}
                  required
                  className="mt-1 w-4 h-4 rounded border-maroon/20 text-maroon focus:ring-gold/30"
                />
                <span className="font-body text-sm text-deep-maroon/60 leading-relaxed">
                  By submitting this form I confirm that the information I have provided is correct and I am willing to share this information to any potential families.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-full font-body text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-400 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#FFFFFF' }}
              >
                {selectedPlan ? `Register Now — ${selectedPlan}` : 'Register Now'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
