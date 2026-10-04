import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface PendingProfile {
  _id: string;
  id?: string;
  registrationId?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  gender: string;
  age: string;
  location: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  aboutMe?: string;
  plan?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  nationality?: string;
  ethnicity?: string;
  languages?: string;
  sect?: string;
  [k: string]: any;
}

function getProfileId(p: PendingProfile | any): string {
  return String(p._id || p.id || p.registrationId || '');
}

function suggestLoginId(p: PendingProfile | null): string {
  if (!p) return '';
  const first = (p.firstName || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 4);
  const last = (p.lastName || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 4);
  const age = (p.age || '').replace(/[^0-9]/g, '').slice(0, 2);
  const rand = Math.floor(Math.random() * 900 + 100);
  const core = [first, last, age].filter(Boolean).join('-') || `member-${rand}`;
  return `PR-${core}`.slice(0, 32);
}
function suggestPassword(): string {
  const a = Math.random().toString(36).slice(2, 6);
  const b = Math.floor(Math.random() * 9000 + 1000);
  return `${a}${b}`;
}

interface EditDialogState {
  open: boolean;
  mode: 'profile' | 'registration';
  id: string;
  loading: boolean;
  submitting: boolean;
  error: string;
  saved: boolean;
  showPassword: boolean;
  values: Record<string, any>;
}

interface DeleteDialogState {
  open: boolean;
  mode: 'profile' | 'registration';
  id: string;
  name: string;
  loginId?: string;
  loading: boolean;
  error: string;
}

interface ViewDialogState {
  open: boolean;
  mode: 'profile' | 'registration';
  id: string;
  name: string;
  loading: boolean;
  error: string;
  data: Record<string, any>;
  user?: Record<string, any>;
}

interface RejectDialogState {
  open: boolean;
  profile: PendingProfile | null;
  reason: string;
  submitting: boolean;
  error: string;
}

const EDIT_FIELDS_CORE = [
  { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Aisha' },
  { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Khan' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.co.uk' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+44 7xxx...' },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
  { key: 'age', label: 'Age', type: 'text', placeholder: '26' },
  { key: 'height', label: 'Height', type: 'text', placeholder: `5'4 or 163cm` },
  { key: 'location', label: 'Location (City, Country)', type: 'text', placeholder: 'Manchester, UK' },
  { key: 'nationality', label: 'Nationality', type: 'text', placeholder: 'British Pakistani' },
  { key: 'ethnicity', label: 'Ethnicity', type: 'text', placeholder: 'Punjabi, Kashmiri...' },
  { key: 'languages', label: 'Languages Spoken', type: 'text', placeholder: 'English, Urdu, Punjabi' },
  { key: 'disability', label: 'Disability (if any)', type: 'text', placeholder: 'None' },
  { key: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['Single - Never married', 'Divorced', 'Widowed', 'Separated'] },
  { key: 'sect', label: 'Sect / Maslak', type: 'text', placeholder: 'Sunni - Hanafi' },
  { key: 'hijabi', label: 'Hijabi / Modesty (Female)', type: 'text', placeholder: 'Hijab always or Niqab on request' },
  { key: 'beardStyle', label: 'Beard / Modesty (Male)', type: 'text', placeholder: 'Full sunnah beard' },
  { key: 'religiousExpectations', label: 'Religious Practice', type: 'textarea', placeholder: '5 daily prayers, Jummah, Taraweeh...' },
  { key: 'education', label: 'Education', type: 'text', placeholder: 'MSc Computer Science' },
  { key: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Software Engineer (FinTech)' },
  { key: 'annualIncome', label: 'Annual Income', type: 'text', placeholder: '£58,000' },
  { key: 'smoker', label: 'Smoker', type: 'select', options: ['No', 'Occasionally', 'Yes - trying to quit', 'Yes'] },
  { key: 'drivingLicence', label: 'Driving Licence', type: 'select', options: ['Yes - Full UK', 'Yes - International', 'No'] },
  { key: 'willingToRelocate', label: 'Willing to Relocate', type: 'text', placeholder: 'Within North of England' },
  { key: 'hobbies', label: 'Hobbies / Interests', type: 'text', placeholder: 'Cooking, Travelling, Quran study' },
  { key: 'secondWife', label: 'Open to Second Wife (Male)', type: 'select', options: ['No', 'Yes - discussed with parents', 'Undecided'] },
] as const;

const EDIT_FIELDS_PARTNER = [
  { key: 'partnerEducation', label: 'Preferred Education', type: 'text', placeholder: 'Bachelors min, Masters preferred' },
  { key: 'partnerOccupation', label: 'Preferred Occupation', type: 'text', placeholder: 'Professional / Stable career' },
  { key: 'partnerSect', label: 'Preferred Sect / Maslak', type: 'text', placeholder: 'Sunni - Any school of thought' },
  { key: 'partnerReligiousPractice', label: 'Preferred Religious Practice', type: 'text', placeholder: 'Practicing, prays 5x...' },
  { key: 'partnerIslamicValues', label: 'Preferred Islamic Values', type: 'text', placeholder: 'Respectful, honest, loves deen...' },
  { key: 'partnerAgeRange', label: 'Preferred Age Range', type: 'text', placeholder: '26 - 32' },
  { key: 'partnerEthnicity', label: 'Preferred Ethnicity', type: 'text', placeholder: 'British Pakistani / Kashmiri / Punjabi preferred' },
  { key: 'partnerLivingArrangement', label: 'Living Arrangement', type: 'text', placeholder: 'Separate home first year then near family' },
  { key: 'partnerWillingRelocate', label: 'Willing to Relocate for Partner', type: 'text', placeholder: 'Within North of England' },
  { key: 'openToDivorcee', label: 'Open to Divorcee', type: 'select', options: ['No', 'Yes', 'Consider case by case'] },
  { key: 'openToWidow', label: 'Open to Widow(er)', type: 'select', options: ['No', 'Yes', 'Consider case by case'] },
  { key: 'acceptChildren', label: 'Accept Children from Previous', type: 'select', options: ['No', 'Yes - Any number', 'Yes - max 2', 'Undecided'] },
];

const EDIT_FIELDS_LONG = [
  { key: 'aboutMe', label: 'About Me', type: 'textarea' },
  { key: 'partnerDescription', label: 'Additional Preferences (paragraph)', type: 'textarea' },
  { key: 'otherInfo', label: 'Other Important Info', type: 'textarea' },
] as const;

const EDIT_FIELDS_ADMIN_ONLY_PROFILE = [
  { key: 'loginId', label: 'Member Login ID', type: 'text', placeholder: 'PR-SOMETHING-001' },
  { key: 'password', label: 'Change Member Password', type: 'password', placeholder: '(leave blank to keep current)' },
  { key: 'membershipTier', label: 'Plan / Tier', type: 'select', options: ['free', 'silver', 'gold', 'platinum'] },
  { key: 'membershipStatus', label: 'Account Status', type: 'select', options: ['active', 'expired', 'pending'] },
  { key: 'plan', label: 'Plan (Profile card display)', type: 'select', options: ['Free', 'Silver', 'Gold', 'Platinum'] },
  { key: 'isActive', label: 'Visible in Proposals', type: 'select', options: ['true', 'false'] },
  { key: 'isPaid', label: 'Paid Member Flag', type: 'select', options: ['true', 'false'] },
] as const;

const EDIT_FIELDS_ADMIN_ONLY_REGISTRATION = [
  { key: 'loginId', label: 'Member Login ID', type: 'text', placeholder: 'PR-SOMETHING-001' },
  { key: 'password', label: 'Change Member Password', type: 'password', placeholder: '(leave blank to keep current)' },
  { key: 'membershipTier', label: 'Plan / Tier', type: 'select', options: ['free', 'silver', 'gold', 'platinum'] },
  { key: 'membershipStatus', label: 'Account Status', type: 'select', options: ['active', 'expired', 'pending'] },
  { key: 'plan', label: 'Plan (Profile card display)', type: 'select', options: ['Free', 'Silver', 'Gold', 'Platinum'] },
  { key: 'isActive', label: 'Visible in Proposals', type: 'select', options: ['true', 'false'] },
  { key: 'isPaid', label: 'Paid Member Flag', type: 'select', options: ['true', 'false'] },
] as const;

export default function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const listRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<PendingProfile[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [generatedCred, setGeneratedCred] = useState<{ loginId: string; password: string; applicant?: string } | null>(null);
  const [copied, setCopied] = useState<'id' | 'pw' | 'both' | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [verified, setVerified] = useState<null | 'loading' | 'admin'>(null);
  const [error, setError] = useState('');

  interface AdminFilters {
    search: string;
    gender: 'any' | 'Male' | 'Female';
    plan: 'any' | 'Free' | 'Silver' | 'Gold' | 'Platinum';
    minAge: string;
    maxAge: string;
  }
  const [filters, setFilters] = useState<AdminFilters>({
    search: '', gender: 'any', plan: 'any', minAge: '', maxAge: '',
  });

  // ── Manual credentials dialog (Task 1: admin sets loginId + password HIMSELF)
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    profile: PendingProfile | null;
    loginId: string;
    password: string;
    showPw: boolean;
    error: string;
    submitting: boolean;
  }>({
    open: false, profile: null, loginId: '', password: '', showPw: false, error: '', submitting: false,
  });

  // ── Toast (success/error banner after Edit / Delete actions)
  const [toast, setToast] = useState<null | { type: 'success' | 'error'; text: string }>(null);
  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4200);
  };

  // ── Edit Profile / Registration dialog
  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false, mode: 'registration', id: '', loading: false, submitting: false,
    error: '', saved: false, showPassword: false, values: {},
  });

  const loadData = useCallback(async () => {
    setError('');
    try {
      const [pendingRes, membersRes, approvedRes, rejectedRes] = await Promise.all([
        api.admin.getRegistrations('pending'),
        api.admin.getMembers(),
        api.admin.getRegistrations('approved'),
        api.admin.getRegistrations('rejected'),
      ]);
      const pending = (pendingRes.registrations || pendingRes.profiles || pendingRes || []) as PendingProfile[];
      const approved = (approvedRes.registrations || approvedRes.profiles || approvedRes || []) as PendingProfile[];
      const rejected = (rejectedRes.registrations || rejectedRes.profiles || rejectedRes || []) as PendingProfile[];
      const members = membersRes.members || membersRes.users || membersRes || [];
      setProfiles([...pending, ...approved, ...rejected]);
      setApprovedUsers(members);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  }, []);

  const closeEditDialog = useCallback(() => {
    setEditDialog({ open: false, mode: 'registration', id: '', loading: false, submitting: false, error: '', saved: false, showPassword: false, values: {} });
  }, []);

  const openEditDialogForProfile = useCallback(async (profileId: string) => {
    setEditDialog({ open: true, mode: 'profile', id: profileId, loading: true, submitting: false, error: '', saved: false, showPassword: false, values: {} });
    try {
      const data = await api.admin.getProfile(profileId);
      const user = data.user || {};
      const profile = data.profile || {};
      const reg = data.registration || {};
      delete (user as any).password;
      delete (profile as any).password;
      delete (reg as any).password;
      const values: Record<string, any> = {};
      for (const field of EDIT_FIELDS_CORE) values[field.key] = profile[field.key] ?? reg[field.key] ?? '';
      for (const field of EDIT_FIELDS_PARTNER) values[field.key] = profile[field.key] ?? reg[field.key] ?? '';
      for (const field of EDIT_FIELDS_LONG) values[field.key] = profile[field.key] ?? reg[field.key] ?? '';
      for (const field of EDIT_FIELDS_ADMIN_ONLY_PROFILE) {
        if (field.key === 'loginId' || field.key === 'membershipTier' || field.key === 'membershipStatus') {
          values[field.key] = user[field.key] ?? '';
        } else if (field.key !== 'password') {
          values[field.key] = profile[field.key] ?? '';
        }
      }
      values.password = '';
      setEditDialog((s) => ({ ...s, loading: false, values }));
    } catch (err: any) {
      setEditDialog((s) => ({ ...s, loading: false, error: err.message || 'Failed to load profile for editing' }));
    }
  }, []);

  const openEditDialogForRegistration = useCallback(async (registrationId: string) => {
    setEditDialog({ open: true, mode: 'registration', id: registrationId, loading: true, submitting: false, error: '', saved: false, showPassword: false, values: {} });
    try {
      const data = await api.admin.getRegistration(registrationId);
      const reg = data.registration || data || {};
      const values: Record<string, any> = {};
      for (const field of EDIT_FIELDS_CORE) values[field.key] = (reg as any)[field.key] ?? '';
      for (const field of EDIT_FIELDS_PARTNER) values[field.key] = (reg as any)[field.key] ?? '';
      for (const field of EDIT_FIELDS_LONG) values[field.key] = (reg as any)[field.key] ?? '';
      for (const field of EDIT_FIELDS_ADMIN_ONLY_REGISTRATION) values[field.key] = (reg as any)[field.key] ?? '';
      setEditDialog((s) => ({ ...s, loading: false, values }));
    } catch (err: any) {
      setEditDialog((s) => ({ ...s, loading: false, error: err.message || 'Failed to load registration for editing' }));
    }
  }, []);

  const submitEditDialog = useCallback(async () => {
    if (!editDialog.id || editDialog.loading || editDialog.submitting) return;
    setEditDialog((s) => ({ ...s, submitting: true, error: '', saved: false }));
    try {
      const patch: Record<string, any> = {};
      for (const key of Object.keys(editDialog.values)) {
        const v = editDialog.values[key];
        if (key === 'isActive' || key === 'isPaid') {
          if (v === 'true') patch[key] = true;
          else if (v === 'false') patch[key] = false;
          else patch[key] = v;
          continue;
        }
        if (v === undefined || v === null) continue;
        if (v === '' && key !== 'membershipStatus' && key !== 'membershipTier') continue;
        if (typeof v === 'string') patch[key] = v;
        else patch[key] = v;
      }
      if (editDialog.mode === 'profile') {
        await api.admin.updateProfile(editDialog.id, patch);
      } else {
        await api.admin.updateRegistration(editDialog.id, patch);
      }
      setEditDialog((s) => ({ ...s, submitting: false, saved: true }));
      showToast('success', editDialog.mode === 'profile' ? 'Profile updated successfully' : 'Registration updated successfully');
      setFilters({ search: '', gender: 'any', plan: 'any', minAge: '', maxAge: '' });
      await loadData();
      setTimeout(() => closeEditDialog(), 550);
    } catch (err: any) {
      setEditDialog((s) => ({ ...s, submitting: false, error: err.message || 'Save failed' }));
    }
  }, [editDialog, loadData, closeEditDialog]);

  // ── Delete Profile / Registration dialog
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false, mode: 'registration', id: '', name: '', loginId: undefined, loading: false, error: '',
  });
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, mode: 'registration', id: '', name: '', loginId: undefined, loading: false, error: '' });
  }, []);

  // ── View Profile / Registration dialog
  const [viewDialog, setViewDialog] = useState<ViewDialogState>({
    open: false, mode: 'registration', id: '', name: '', loading: false, error: '', data: {}, user: undefined,
  });
  const closeViewDialog = useCallback(() => {
    setViewDialog({ open: false, mode: 'registration', id: '', name: '', loading: false, error: '', data: {}, user: undefined });
  }, []);
  const openViewForRegistration = useCallback(async (id: string, name: string) => {
    setViewDialog({ open: true, mode: 'registration', id, name, loading: true, error: '', data: {}, user: undefined });
    try {
      const res = await api.admin.getRegistration(id);
      const data = res.registration || res || {};
      setViewDialog((s) => ({ ...s, loading: false, data }));
    } catch (err: any) {
      setViewDialog((s) => ({ ...s, loading: false, error: err.message || 'Failed to load registration' }));
    }
  }, []);
  const openViewForProfile = useCallback(async (id: string, name: string) => {
    setViewDialog({ open: true, mode: 'profile', id, name, loading: true, error: '', data: {}, user: undefined });
    try {
      const res = await api.admin.getProfile(id);
      const data = res.profile || res.registration || res || {};
      const user = res.user || undefined;
      setViewDialog((s) => ({ ...s, loading: false, data, user }));
    } catch (err: any) {
      setViewDialog((s) => ({ ...s, loading: false, error: err.message || 'Failed to load profile' }));
    }
  }, []);
  const handleDownloadPdf = useCallback(() => {
    setTimeout(() => {
      try { window.print(); } catch {}
    }, 80);
  }, []);

  // ── Reject Registration dialog (with required reason, then HARD delete)
  const [rejectDialog, setRejectDialog] = useState<RejectDialogState>({
    open: false, profile: null, reason: '', submitting: false, error: '',
  });
  const closeRejectDialog = useCallback(() => {
    setRejectDialog({ open: false, profile: null, reason: '', submitting: false, error: '' });
  }, []);
  const openRejectDialog = useCallback((profile: PendingProfile) => {
    setRejectDialog({ open: true, profile, reason: '', submitting: false, error: '' });
  }, []);
  const submitRejectDialog = useCallback(async () => {
    if (!rejectDialog.profile) return;
    const reason = rejectDialog.reason.trim();
    if (!reason) {
      setRejectDialog((s) => ({ ...s, error: 'Please enter a rejection reason (required).' }));
      return;
    }
    const pid = getProfileId(rejectDialog.profile);
    if (!pid) {
      setRejectDialog((s) => ({ ...s, error: 'Profile has no valid id' }));
      return;
    }
    setRejectDialog((s) => ({ ...s, submitting: true, error: '' }));
    try {
      // Store the rejection reason on the registration briefly, then hard-delete
      // so the reason is captured in server logs / audit trail via update first, then delete.
      try {
        await api.admin.updateRegistration(pid, { rejectionReason: reason, status: 'rejected' });
      } catch {}
      // Now HARD DELETE so it is NEVER saved in the database (user explicit requirement).
      await api.admin.deleteRegistration(pid);
      await loadData();
      closeRejectDialog();
      showToast('success', `Registration for ${rejectDialog.profile ? (rejectDialog.profile.firstName + ' ' + rejectDialog.profile.lastName).trim() || `${rejectDialog.profile.gender}, ${rejectDialog.profile.age}` : 'applicant'} permanently rejected and removed.`);
    } catch (err: any) {
      setRejectDialog((s) => ({ ...s, submitting: false, error: err.message || 'Rejection failed' }));
    }
  }, [rejectDialog, loadData, closeRejectDialog]);
  const openDeleteForProfile = useCallback((profileId: string, name: string, loginId?: string) => {
    setDeleteDialog({ open: true, mode: 'profile', id: profileId, name, loginId, loading: false, error: '' });
  }, []);
  const openDeleteForRegistration = useCallback((registrationId: string, name: string) => {
    setDeleteDialog({ open: true, mode: 'registration', id: registrationId, name, loading: false, error: '' });
  }, []);
  const submitDeleteDialog = useCallback(async () => {
    if (!deleteDialog.id || deleteDialog.loading) return;
    setDeleteDialog((s) => ({ ...s, loading: true, error: '' }));
    try {
      if (deleteDialog.mode === 'profile') {
        const r = await api.admin.deleteProfile(deleteDialog.id);
        showToast('success', `Permanently deleted ${deleteDialog.name || 'profile'} (login ${r.loginIdRemoved || 'removed'}). Profile + User + Registration all cleaned.`);
      } else {
        await api.admin.deleteRegistration(deleteDialog.id);
        showToast('success', `Permanently deleted registration for ${deleteDialog.name || 'pending applicant'}.`);
      }
      await loadData();
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteDialog((s) => ({ ...s, loading: false, error: err.message || 'Delete failed' }));
    }
  }, [deleteDialog, loadData, closeDeleteDialog]);

  const openApproveDialog = useCallback((profile: PendingProfile) => {
    setApproveDialog({
      open: true,
      profile,
      loginId: suggestLoginId(profile),
      password: suggestPassword(),
      showPw: false,
      error: '',
      submitting: false,
    });
  }, []);

  const closeApproveDialog = useCallback(() => {
    setApproveDialog({ open: false, profile: null, loginId: '', password: '', showPw: false, error: '', submitting: false });
  }, []);

  // ── Task 1: remove embedded admin login form.
  // Validate role via /auth/me. If not token / not admin → redirect to /login.
  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      setVerified('loading');
      const token = api.getToken();
      if (!token) {
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 0);
        return;
      }
      try {
        const meData = await api.auth.me();
        if (meData.user.role !== 'admin') {
          logout();
          setTimeout(() => navigate('/login', { replace: true }), 0);
          return;
        }
        setVerified('admin');
        loadData();
      } catch {
        logout();
        setTimeout(() => navigate('/login', { replace: true }), 20);
      }
    })();
  }, [navigate, logout]);

  useEffect(() => {
    if (listRef.current && verified === 'admin') {
      gsap.fromTo(listRef.current.children, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' });
    }
  }, [activeTab, profiles, verified]);

  const handleApproveDialogSubmit = useCallback(async () => {
    const profile = approveDialog.profile;
    if (!profile) return;
    const pid = getProfileId(profile);
    if (!pid) return;

    const loginIdRaw = approveDialog.loginId.trim();
    const passwordRaw = approveDialog.password.trim();

    // Client-side pre-validation (server will also validate)
    if (loginIdRaw && !/^[A-Za-z0-9_\-]{3,32}$/.test(loginIdRaw)) {
      setApproveDialog((s) => ({ ...s, error: 'Login ID must be 3-32 letters/digits/hyphen/underscore only (no spaces).' }));
      return;
    }
    if (passwordRaw && (passwordRaw.length < 6 || passwordRaw.length > 64)) {
      setApproveDialog((s) => ({ ...s, error: 'Password must be 6-64 characters long.' }));
      return;
    }

    setApproveDialog((s) => ({ ...s, submitting: true, error: '' }));
    setApproving(pid);
    setGeneratedCred(null);
    setCopied(null);
    try {
      const payload = loginIdRaw || passwordRaw
        ? { loginId: loginIdRaw || undefined, password: passwordRaw || undefined }
        : undefined;
      const res = await api.admin.approve(pid, payload);
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || `${profile.gender}, ${profile.age} (${profile.location})`;
      setGeneratedCred({ loginId: res.credentials.loginId, password: res.credentials.password, applicant: name });
      await loadData();
      closeApproveDialog();
    } catch (err: any) {
      setApproveDialog((s) => ({ ...s, error: err.message || 'Approval failed' }));
      setError(err.message || 'Approval failed');
    } finally {
      setApproveDialog((s) => ({ ...s, submitting: false }));
      setApproving(null);
    }
  }, [approveDialog, loadData, closeApproveDialog]);

  const copyCred = (what: 'id' | 'pw' | 'both') => {
    if (!generatedCred) return;
    const text =
      what === 'id' ? generatedCred.loginId :
      what === 'pw' ? generatedCred.password :
      `Login ID: ${generatedCred.loginId}\nPassword: ${generatedCred.password}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        ta.style.width = '1px';
        ta.style.height = '1px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, text.length);
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
      }
      setCopied(what);
      setTimeout(() => setCopied(null), 2200);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => navigate('/login', { replace: true }), 20);
  };

  const filterMatch = useCallback((p: PendingProfile): boolean => {
    if (filters.gender !== 'any' && p.gender !== filters.gender) return false;
    if (filters.plan !== 'any' && p.plan !== filters.plan) return false;
    const age = parseInt((p.age || '').toString(), 10);
    if (filters.minAge && (!Number.isFinite(age) || age < parseInt(filters.minAge, 10))) return false;
    if (filters.maxAge && (!Number.isFinite(age) || age > parseInt(filters.maxAge, 10))) return false;
    const q = filters.search.trim().toLowerCase();
    if (!q) return true;
    const name = [p.firstName, p.lastName].filter(Boolean).join(' ').toLowerCase();
    const haystacks = [
      name,
      p.email,
      p.phone,
      p.location,
      p.education,
      p.occupation,
      p.nationality,
      p.ethnicity,
      p.languages,
      p.maritalStatus,
      p.sect,
      (p._id || p.id || '').toString(),
    ].map((v) => (v || '').toString().toLowerCase());
    // For approved: cross-check loginId from approvedUsers (loginId lives on User, not on PendingProfile)
    if (p.status === 'approved') {
      const pid = getProfileId(p);
      const user = approvedUsers.find((u: any) => {
        if (u.role === 'admin') return false;
        const rid = (u.registrationId?._id || u.registrationId || u.registration?._id || u.id || '').toString();
        return rid === pid || u.profileId === pid;
      });
      if (user) {
        haystacks.push((user.loginId || '').toString().toLowerCase());
        haystacks.push((user.membershipTier || '').toString().toLowerCase());
      }
    }
    return haystacks.some((s) => s.includes(q));
  }, [filters, approvedUsers]);

  const pendingProfiles = useMemo(() => profiles.filter((p) => p.status === 'pending' && filterMatch(p)), [profiles, filterMatch]);
  const approvedProfiles = useMemo(() => profiles.filter((p) => p.status === 'approved' && filterMatch(p)), [profiles, filterMatch]);
  const rejectedProfiles = useMemo(() => profiles.filter((p) => p.status === 'rejected' && filterMatch(p)), [profiles, filterMatch]);

  const totalFiltered = pendingProfiles.length + approvedProfiles.length + rejectedProfiles.length;
  const hasAnyFilter = filters.search || filters.gender !== 'any' || filters.plan !== 'any' || filters.minAge || filters.maxAge;

  if (verified === 'loading' || verified === null) {
    return (
      <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', minHeight: '100vh' }}>
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <p className="font-body text-sm text-deep-maroon/50">Verifying admin access…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #FFFFFF 50%, #FDFBF7 100%)', paddingTop: 'clamp(100px, 14vh, 160px)', paddingBottom: 'clamp(60px, 8vh, 100px)', minHeight: '100vh' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body * { visibility: hidden !important; }
          .profile-print-area, .profile-print-area * { visibility: visible !important; }
          .profile-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print, .no-print * { display: none !important; }
          .profile-print-area .print-row { display: flex; gap: 12pt; border-bottom: 0.5pt solid #d4d4d4; padding: 6pt 0; }
          .profile-print-area .print-label { width: 38%; font-weight: 600; color: #800020; font-size: 9.5pt; }
          .profile-print-area .print-value { width: 62%; font-size: 9.5pt; color: #1f2937; word-break: break-word; }
          .profile-print-area .print-section-title { font-weight: 700; color: #4A0404; font-size: 11pt; margin: 14pt 0 6pt 0; padding-bottom: 4pt; border-bottom: 1pt solid #D4AF37; }
          .profile-print-area .print-header { text-align: center; border-bottom: 2pt double #800020; padding-bottom: 10pt; margin-bottom: 10pt; }
          .profile-print-area .print-header h1 { font-size: 18pt; color: #800020; margin: 0 0 4pt 0; }
          .profile-print-area .print-header p { font-size: 10pt; color: #6b7280; margin: 0; }
        }
      `}</style>
      <img src="/images/bg-floral.jpg" alt="" className="absolute top-0 right-0 w-[300px] opacity-[0.04] z-0 pointer-events-none no-print" />

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/60 transition-all duration-300 hover:bg-maroon/5 hover:border-maroon/25 hover:text-maroon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Home
          </Link>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-xs font-medium tracking-[0.08em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 hover:border-red-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl text-deep-maroon font-light">Admin <span className="font-medium text-gold">Dashboard</span></h1>
          <p className="font-body text-sm text-deep-maroon/50 mt-2">Manage profile registrations and member approvals</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-3 rounded-xl bg-red-50 border border-red-200 text-center">
            <p className="font-body text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setGeneratedCred(null); }}
              className="px-6 py-2.5 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase transition-all duration-300 capitalize"
              style={{
                background: activeTab === tab ? '#800020' : 'rgba(128,0,32,0.06)',
                color: activeTab === tab ? '#fff' : '#800020',
              }}
            >
              {tab} ({tab === 'pending' ? pendingProfiles.length : tab === 'approved' ? approvedProfiles.length : rejectedProfiles.length})
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="mb-8 p-5 rounded-2xl border border-maroon/10 bg-white/60 backdrop-blur-sm shadow-[0_4px_30px_rgba(128,0,32,0.04)]">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon/40 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))}
              placeholder="Search by Name, Login ID, Email, Phone, Location, Education, Occupation, Sect, Nationality…"
              spellCheck={false}
              autoComplete="off"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-maroon/10 bg-white font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/70 mb-1.5">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters((s) => ({ ...s, gender: e.target.value as any }))}
                className="w-full px-3 py-2.5 rounded-lg border border-maroon/10 bg-white font-body text-xs text-deep-maroon focus:outline-none focus:border-gold/60"
              >
                <option value="any">Any</option>
                <option value="Male">Male (Groom)</option>
                <option value="Female">Female (Bride)</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/70 mb-1.5">Plan / Tier</label>
              <select
                value={filters.plan}
                onChange={(e) => setFilters((s) => ({ ...s, plan: e.target.value as any }))}
                className="w-full px-3 py-2.5 rounded-lg border border-maroon/10 bg-white font-body text-xs text-deep-maroon focus:outline-none focus:border-gold/60"
              >
                <option value="any">Any Plan</option>
                <option value="Free">Free</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/70 mb-1.5">Min Age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.minAge}
                onChange={(e) => setFilters((s) => ({ ...s, minAge: e.target.value }))}
                placeholder="18"
                className="w-full px-3 py-2.5 rounded-lg border border-maroon/10 bg-white font-body text-xs text-deep-maroon focus:outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label className="block font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-maroon/70 mb-1.5">Max Age</label>
              <input
                type="number"
                min={18}
                max={99}
                value={filters.maxAge}
                onChange={(e) => setFilters((s) => ({ ...s, maxAge: e.target.value }))}
                placeholder="80"
                className="w-full px-3 py-2.5 rounded-lg border border-maroon/10 bg-white font-body text-xs text-deep-maroon focus:outline-none focus:border-gold/60"
              />
            </div>
            <div className="lg:col-span-2 flex gap-2">
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={() => setFilters({ search: '', gender: 'any', plan: 'any', minAge: '', maxAge: '' })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-body text-[11px] font-semibold uppercase tracking-wider border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors"
                >
                  ✕ Clear Filters
                </button>
              )}
              <div className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-body text-[10px] font-semibold uppercase tracking-wider text-maroon/70 border border-maroon/10 bg-cream/50 ${!hasAnyFilter && 'lg:col-span-2'}`}>
                🔎 Showing {totalFiltered} {totalFiltered === 1 ? 'result' : 'results'}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Credentials Banner */}
        {generatedCred && (
          <div className="mb-8 p-6 rounded-3xl border-2 border-gold/40 bg-gradient-to-br from-white via-gold/5 to-white shadow-[0_20px_60px_rgba(212,175,55,0.15)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gold/8 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between gap-4 flex-col sm:flex-row">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-gold to-yellow-700 shrink-0">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#4A0404" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  <div>
                    <p className="font-body text-[11px] tracking-[0.18em] uppercase text-deep-maroon/55">✅ Approved — Credentials Generated</p>
                    {generatedCred.applicant && (
                      <p className="font-body text-sm font-semibold text-maroon mt-0.5">For: <span className="text-deep-maroon">{generatedCred.applicant}</span></p>
                    )}
                  </div>
                </div>
                <p className="font-body text-xs text-deep-maroon/50 leading-relaxed max-w-xl">
                  Share these exact credentials with the registered user (via WhatsApp / Email / Phone). They will use this Login ID + Password on the Welcome Back login page to access proposals.
                </p>
              </div>
              <button
                onClick={() => setGeneratedCred(null)}
                className="shrink-0 text-deep-maroon/40 hover:text-deep-maroon transition-colors p-1 rounded-lg hover:bg-deep-maroon/5"
                aria-label="Close banner"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-5 rounded-2xl bg-white border border-gold/20 shadow-sm group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-[10px] tracking-[0.18em] uppercase text-deep-maroon/45">Login ID</span>
                  <button
                    type="button"
                    onClick={() => copyCred('id')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors"
                    style={{ background: copied === 'id' || copied === 'both' ? 'rgba(34,197,94,0.12)' : 'rgba(128,0,32,0.06)', color: copied === 'id' || copied === 'both' ? '#15803d' : '#800020' }}
                  >
                    {copied === 'id' || copied === 'both' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-display text-2xl font-semibold tracking-wider text-deep-maroon select-all">{generatedCred.loginId}</p>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-gold/20 shadow-sm group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-[10px] tracking-[0.18em] uppercase text-deep-maroon/45">Password</span>
                  <button
                    type="button"
                    onClick={() => copyCred('pw')}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-colors"
                    style={{ background: copied === 'pw' || copied === 'both' ? 'rgba(34,197,94,0.12)' : 'rgba(128,0,32,0.06)', color: copied === 'pw' || copied === 'both' ? '#15803d' : '#800020' }}
                  >
                    {copied === 'pw' || copied === 'both' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-display text-2xl font-semibold tracking-wider text-deep-maroon select-all">{generatedCred.password}</p>
              </div>
            </div>

            <div className="relative z-10 mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <button
                type="button"
                onClick={() => copyCred('both')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                style={{ background: copied === 'both' ? 'linear-gradient(135deg, #15803d, #166534)' : 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {copied === 'both' ? '✓ Both Copied to Clipboard' : 'Copy ID + Password Together'}
              </button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔐 Test User Login (opens new tab)
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </Link>
            </div>
          </div>
        )}

        {/* Profile List */}
        <div ref={listRef} className="space-y-4">
          {activeTab === 'pending' && pendingProfiles.length === 0 && (
            <EmptyState message="No pending registrations" />
          )}
          {activeTab === 'approved' && approvedProfiles.length === 0 && (
            <EmptyState message="No approved members yet" />
          )}
          {activeTab === 'rejected' && rejectedProfiles.length === 0 && (
            <EmptyState message="No rejected registrations" />
          )}

          {(activeTab === 'pending' ? pendingProfiles : activeTab === 'approved' ? approvedProfiles : rejectedProfiles).map((profile) => {
            const pid = getProfileId(profile);
            const planColor = (profile.plan === 'Gold' ? '#D4AF37' : profile.plan === 'Platinum' ? '#E5E4E2' : '#C0C0C0') as string;
            const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
            return (
              <div key={pid || Math.random()} className="rounded-2xl border border-maroon/8 bg-white shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
                  <span className="font-display text-lg text-gold">{profile.gender === 'Male' ? 'B' : 'S'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-body text-sm font-semibold text-deep-maroon">
                      {name || `${profile.gender}, ${profile.age}`}
                      {!name && <span className="text-deep-maroon/60 font-normal"> — {profile.location}</span>}
                    </h3>
                    {profile.plan && (
                      <span className="px-2.5 py-0.5 rounded-full font-body text-[10px] font-medium shrink-0" style={{ background: planColor, color: '#4A0404' }}>{profile.plan}</span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full font-body text-[10px] font-medium border ${profile.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : profile.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                    </span>
                  </div>
                  {name && (
                    <p className="font-body text-xs text-deep-maroon/50">{profile.gender}, {profile.age} &middot; {profile.location} &middot; {profile.education || 'N/A'} &middot; {profile.occupation || 'N/A'}</p>
                  )}
                  {!name && (
                    <p className="font-body text-xs text-deep-maroon/50">{profile.education || 'N/A'} &middot; {profile.occupation || 'N/A'}</p>
                  )}
                  {(profile.email || profile.phone) && (
                    <p className="font-body text-[11px] text-deep-maroon/40 mt-1 break-words">
                      {profile.email && <>📧 {profile.email}{profile.phone && '  •  '}</>}
                      {profile.phone && <>📱 {profile.phone}</>}
                    </p>
                  )}
                  <p className="font-body text-[11px] text-deep-maroon/35 mt-1">Registered: {new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="shrink-0 flex gap-2 md:flex-col md:items-end md:min-w-[220px]">
                  {activeTab === 'pending' && (
                    <>
                      <button
                        onClick={() => openApproveDialog(profile)}
                        disabled={approving === pid}
                        className="px-5 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase transition-all duration-300 hover:scale-105 disabled:opacity-50 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}
                      >
                        {approving === pid ? 'Setting Credentials…' : '✅ Approve'}
                      </button>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => openViewForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`)}
                          className="px-3.5 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                        >
                          👁 View
                        </button>
                        <button
                          onClick={() => openEditDialogForRegistration(pid)}
                          className="px-3.5 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => openDeleteForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`)}
                          className="px-3.5 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 shrink-0"
                        >
                          🗑 Delete
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => openRejectDialog(profile)}
                        className="px-5 py-2.5 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 shrink-0"
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {activeTab === 'rejected' && (
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => openViewForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`)}
                        className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                      >
                        👁 View
                      </button>
                      <button
                        onClick={() => openEditDialogForRegistration(pid)}
                        className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => openDeleteForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`)}
                        className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 shrink-0"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                  {activeTab === 'approved' && (() => {
                    const user = approvedUsers.find((u: any) => (u.registrationId?._id || u.registrationId || '').toString() === pid || u.id === pid || u.profileId === pid || (u.registration && ((u.registration._id || u.registration.id || '').toString() === pid)));
                    const profileId = user?.profileId || '';
                    return (
                      <>
                        {user ? (
                          <div className="text-xs sm:min-w-[160px] text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-body text-deep-maroon/50">Login ID: </span>
                              <span className="font-body font-semibold text-deep-maroon select-all">{user.loginId}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-0.5">
                              <span className="font-body text-deep-maroon/50">Status: </span>
                              <span className="font-body font-semibold uppercase tracking-wider" style={{ color: user.membershipStatus === 'active' ? '#15803d' : '#b45309' }}>{user.membershipStatus || 'active'}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-0.5">
                              <span className="font-body text-deep-maroon/50">Tier: </span>
                              <span className="font-body font-semibold capitalize text-maroon">{user.membershipTier}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="font-body text-[10px] text-deep-maroon/40 italic">No login found</span>
                        )}
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          <button
                            type="button"
                            onClick={() => profileId ? openViewForProfile(String(profileId), name || `${profile.gender} ${profile.age} ${profile.location}`) : openViewForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`)}
                            className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                          >
                            👁 View
                          </button>
                          <button
                            onClick={() => profileId ? openEditDialogForProfile(String(profileId)) : openEditDialogForRegistration(pid)}
                            className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-maroon/20 text-maroon transition-all duration-300 hover:bg-maroon/5 shrink-0"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              if (profileId) openDeleteForProfile(String(profileId), name || `${profile.gender} ${profile.age} ${profile.location}`, user?.loginId);
                              else openDeleteForRegistration(pid, name || `${profile.gender} ${profile.age} ${profile.location}`);
                            }}
                            className="px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.05em] uppercase border border-red-200 text-red-600 transition-all duration-300 hover:bg-red-50 shrink-0"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Manual credentials Dialog (Task 1: admin enters Login ID + PW himself) ── */}
      {approveDialog.open && approveDialog.profile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-approve-title"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeApproveDialog} />
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-maroon/10 shadow-2xl overflow-hidden">
            <div className="relative px-6 sm:px-8 pt-7 pb-5" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/20 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <div className="flex-1 min-w-0">
                  <h2 id="admin-approve-title" className="font-display text-xl text-white font-medium">Set Login Credentials</h2>
                  <p className="font-body text-xs text-white/70 mt-1 break-words">
                    For: {[approveDialog.profile.firstName, approveDialog.profile.lastName].filter(Boolean).join(' ') || `${approveDialog.profile.gender}, ${approveDialog.profile.age}`}
                    &nbsp;·&nbsp;{approveDialog.profile.plan || 'Pending'}
                  </p>
                </div>
                <button
                  onClick={closeApproveDialog}
                  className="shrink-0 text-white/70 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
                  aria-label="Close dialog"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleApproveDialogSubmit(); }}
              className="px-6 sm:px-8 py-6 space-y-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label className="font-body text-[12px] font-semibold tracking-wide uppercase text-maroon">Admin Login ID (you choose)</label>
                  <button
                    type="button"
                    onClick={() => setApproveDialog((s) => ({ ...s, loginId: suggestLoginId(s.profile) }))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-body text-[10px] font-semibold uppercase tracking-wider text-maroon hover:bg-maroon/5 transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  value={approveDialog.loginId}
                  onChange={(e) => setApproveDialog((s) => ({ ...s, loginId: e.target.value, error: '' }))}
                  placeholder="e.g. PR-AliKhan-28 or PR-1234"
                  required
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-4 py-3 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all tracking-wide"
                />
                <p className="mt-1.5 font-body text-[10px] text-deep-maroon/45 leading-snug">
                  3-32 characters. Letters, digits, <span className="font-mono">-</span> and <span className="font-mono">_</span> only.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <label className="font-body text-[12px] font-semibold tracking-wide uppercase text-maroon">Admin Password (you choose)</label>
                  <button
                    type="button"
                    onClick={() => setApproveDialog((s) => ({ ...s, password: suggestPassword() }))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-body text-[10px] font-semibold uppercase tracking-wider text-maroon hover:bg-maroon/5 transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={approveDialog.showPw ? 'text' : 'password'}
                    value={approveDialog.password}
                    onChange={(e) => setApproveDialog((s) => ({ ...s, password: e.target.value, error: '' }))}
                    placeholder="6-64 characters"
                    required
                    minLength={6}
                    maxLength={64}
                    spellCheck={false}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setApproveDialog((s) => ({ ...s, showPw: !s.showPw }))}
                    aria-label={approveDialog.showPw ? 'Hide password' : 'Show password'}
                    title={approveDialog.showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-maroon/70 hover:text-maroon hover:bg-maroon/5 transition-colors"
                  >
                    {approveDialog.showPw ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.45 21.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.17 4.19"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 font-body text-[10px] text-deep-maroon/45 leading-snug">
                  Minimum 6 characters. You will share this password with the member after approving.
                </p>
              </div>

              {approveDialog.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="font-body text-xs text-red-600 leading-relaxed">{approveDialog.error}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-gold/5 border border-gold/20">
                <p className="font-body text-[11px] text-maroon leading-relaxed">
                  <span className="font-semibold">💡 Tip:</span> Leave any field blank and the system will auto-fill it with a safe random value.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeApproveDialog}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 hover:bg-maroon/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approveDialog.submitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}
                >
                  {approveDialog.submitting ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      Approving…
                    </>
                  ) : (
                    <>
                      ✅ Approve & Save Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast banner (Edit/Delete success/error) ── */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[120] px-5 py-3.5 rounded-2xl shadow-2xl border max-w-[90vw] sm:max-w-[520px] flex items-center gap-3"
          style={{
            background: toast.type === 'success' ? 'linear-gradient(135deg, #15803d, #166534)' : 'linear-gradient(135deg, #b91c1c, #7f1d1d)',
            borderColor: toast.type === 'success' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.18)',
            color: '#fff',
          }}
        >
          <span className="text-lg shrink-0">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <p className="font-body text-[12px] sm:text-sm font-medium leading-relaxed break-words">{toast.text}</p>
          <button onClick={() => setToast(null)} className="shrink-0 ml-1 text-white/70 hover:text-white transition-colors text-lg leading-none" aria-label="Close toast">×</button>
        </div>
      )}

      {/* ── Edit Profile / Registration dialog ── */}
      {editDialog.open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog" aria-modal="true" aria-labelledby="admin-edit-title">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={!editDialog.submitting && !editDialog.loading ? closeEditDialog : undefined} />
          <div className="relative w-full max-w-4xl my-6 rounded-3xl bg-white border border-maroon/10 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 px-6 sm:px-10 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/20 shrink-0">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h2 id="admin-edit-title" className="font-display text-xl text-white font-medium">
                      {editDialog.mode === 'profile' ? 'Edit Approved Member Profile' : 'Edit Pending / Rejected Registration'}
                    </h2>
                    <p className="font-body text-xs text-white/75 mt-1 break-words">
                      ID: <span className="font-mono text-white/90 select-all">{editDialog.id}</span>
                      &nbsp;·&nbsp; Changes are saved BOTH in Profile + Registration collections (approved) or Registration only (pending/rejected).
                    </p>
                  </div>
                </div>
                <button onClick={!editDialog.loading && !editDialog.submitting ? closeEditDialog : undefined} disabled={editDialog.loading || editDialog.submitting}
                  className="shrink-0 text-white/70 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-40" aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="px-6 sm:px-10 py-6 max-h-[72vh] overflow-y-auto space-y-7">
              {editDialog.loading && (
                <div className="text-center py-10">
                  <div className="inline-block w-8 h-8 border-2 border-maroon/15 border-t-maroon rounded-full animate-spin mb-3" />
                  <p className="font-body text-xs text-deep-maroon/50">Loading current values…</p>
                </div>
              )}
              {!editDialog.loading && (
                <>
                  {editDialog.saved && (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                      <p className="font-body text-xs text-green-800 font-semibold">✅ Changes saved successfully. Reloading dashboard data…</p>
                    </div>
                  )}
                  {editDialog.error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                      <p className="font-body text-xs text-red-700">{editDialog.error}</p>
                    </div>
                  )}

                  {/* Section 1: Core */}
                  <div>
                    <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-maroon mb-4 pb-2 border-b border-maroon/8 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#800020' }}/> Personal &amp; Contact
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {EDIT_FIELDS_CORE.map((f) => (
                        <div key={f.key}>
                          <label className="font-body text-[11px] font-semibold tracking-wide uppercase text-deep-maroon/65 mb-1.5 block">{f.label}</label>
                          {f.type === 'textarea' ? (
                            <textarea rows={2} maxLength={2000}
                              value={(editDialog.values[f.key] ?? '') as string}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all resize-y"/>
                          ) : f.type === 'select' ? (
                            <select value={(editDialog.values[f.key] ?? '') as string}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-white font-body text-sm text-deep-maroon focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all">
                              <option value="">— Select —</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type={f.type} value={(editDialog.values[f.key] ?? '') as string}
                              placeholder={f.placeholder || ''}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Partner preferences structured */}
                  <div>
                    <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-maroon mb-4 pb-2 border-b border-maroon/8 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#D4AF37' }}/> What They&apos;re Looking For
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {EDIT_FIELDS_PARTNER.map((f) => (
                        <div key={f.key}>
                          <label className="font-body text-[11px] font-semibold tracking-wide uppercase text-deep-maroon/65 mb-1.5 block">{f.label}</label>
                          {f.type === 'textarea' ? (
                            <textarea rows={2} maxLength={2000} value={(editDialog.values[f.key] ?? '') as string}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all resize-y"/>
                          ) : f.type === 'select' ? (
                            <select value={(editDialog.values[f.key] ?? '') as string}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-white font-body text-sm text-deep-maroon focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all">
                              <option value="">— Select —</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={(editDialog.values[f.key] ?? '') as string} placeholder={f.placeholder || ''}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 3: Long paragraphs */}
                  <div>
                    <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-maroon mb-4 pb-2 border-b border-maroon/8 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#8B4513' }}/> Long Descriptions
                    </h3>
                    <div className="space-y-4">
                      {EDIT_FIELDS_LONG.map((f) => (
                        <div key={f.key}>
                          <label className="font-body text-[11px] font-semibold tracking-wide uppercase text-deep-maroon/65 mb-1.5 block">{f.label}</label>
                          <textarea rows={5} maxLength={2000} value={(editDialog.values[f.key] ?? '') as string}
                            onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all resize-y"/>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section 4: Admin-only controls */}
                  <div>
                    <h3 className="font-body text-[12px] font-semibold uppercase tracking-[0.12em] text-maroon mb-4 pb-2 border-b border-maroon/8 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: '#b91c1c' }}/> Admin Controls
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(editDialog.mode === 'profile' ? EDIT_FIELDS_ADMIN_ONLY_PROFILE : EDIT_FIELDS_ADMIN_ONLY_REGISTRATION).map((f) => (
                        <div key={f.key}>
                          <label className="font-body text-[11px] font-semibold tracking-wide uppercase text-deep-maroon/65 mb-1.5 block">{f.label}</label>
                          {f.type === 'password' ? (
                            <div className="relative">
                              <input
                                type={editDialog.showPassword ? 'text' : 'password'}
                                name="new-password"
                                autoComplete="new-password"
                                data-form-type="other"
                                data-1p-ignore
                                value={(editDialog.values[f.key] ?? '') as string}
                                placeholder={f.placeholder || ''}
                                onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                                className="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"/>
                              <button type="button"
                                onClick={() => setEditDialog((s) => ({ ...s, showPassword: !s.showPassword }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-maroon/70 hover:text-maroon hover:bg-maroon/5 transition-colors"
                                aria-label={editDialog.showPassword ? 'Hide password' : 'Show password'}>
                                {editDialog.showPassword ? (
                                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.45 21.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-3.17 4.19"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                ) : (
                                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                              </button>
                            </div>
                          ) : f.type === 'select' ? (
                            <select value={(editDialog.values[f.key] ?? '') as string}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-white font-body text-sm text-deep-maroon focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all">
                              <option value="">— Select —</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={(editDialog.values[f.key] ?? '') as string}
                              placeholder={f.placeholder || ''}
                              onChange={(e) => setEditDialog((s) => ({ ...s, values: { ...s.values, [f.key]: e.target.value } }))}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all"/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="sticky bottom-0 z-10 px-6 sm:px-10 py-4 border-t border-maroon/8 bg-gradient-to-b from-white via-white to-cream/40 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button type="button" disabled={editDialog.loading || editDialog.submitting}
                onClick={closeEditDialog}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 hover:bg-maroon/5 transition-all disabled:opacity-50">
                Cancel
              </button>
              <button type="button" disabled={editDialog.loading || editDialog.submitting}
                onClick={submitEditDialog}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}>
                {editDialog.submitting ? (
                  <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…</>
                ) : (
                  <>💾 Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Profile / Registration confirmation dialog ── */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-labelledby="admin-delete-title">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={!deleteDialog.loading ? closeDeleteDialog : undefined} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-red-100 shadow-2xl overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)' }}>
              <div className="flex items-start gap-3 flex-wrap">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/20 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <h2 id="admin-delete-title" className="font-display text-xl text-white font-medium">
                    Permanently Delete{deleteDialog.mode === 'profile' ? ' Member Profile' : ' Registration'}
                  </h2>
                  <p className="font-body text-xs text-white/80 mt-1 break-words">
                    {deleteDialog.mode === 'profile' ? (
                      <>Deletes: <strong className="text-white">1) Profile</strong> (proposals visibility) +&nbsp;<strong className="text-white">2) User</strong> (their login account {deleteDialog.loginId ? `» ${deleteDialog.loginId}` : ''}) +&nbsp;<strong className="text-white">3) Registration</strong> (queue record). All 3 gone together.</>
                    ) : (
                      <>Deletes only the registration record from your dashboard — no Profile / User doc existed yet because this registration was never approved.</>
                    )}
                  </p>
                </div>
                <button onClick={!deleteDialog.loading ? closeDeleteDialog : undefined} disabled={deleteDialog.loading}
                  className="shrink-0 text-white/70 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-40" aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="font-body text-xs text-red-900 font-semibold uppercase tracking-wider mb-2">⚠️  This action cannot be undone</p>
                <p className="font-body text-[13px] text-red-800 leading-relaxed">
                  You are deleting the record for:&nbsp;
                  <span className="font-bold break-words">{deleteDialog.name || '(Unnamed profile)'}</span>
                  {deleteDialog.loginId && <> · member login <span className="font-mono break-all">{deleteDialog.loginId}</span></>}
                </p>
              </div>
              {deleteDialog.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="font-body text-xs text-red-700">{deleteDialog.error}</p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button type="button" disabled={deleteDialog.loading} onClick={closeDeleteDialog}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 hover:bg-maroon/5 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" disabled={deleteDialog.loading} onClick={submitDeleteDialog}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', color: '#fff' }}>
                  {deleteDialog.loading ? (
                    <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Deleting…</>
                  ) : (
                    <>🗑 Yes — Delete Permanently</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Registration dialog (required reason) ── */}
      {rejectDialog.open && rejectDialog.profile && (
        <div className="fixed inset-0 z-[118] flex items-center justify-center p-4"
          role="dialog" aria-modal="true" aria-labelledby="admin-reject-title">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={!rejectDialog.submitting ? closeRejectDialog : undefined} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-red-100 shadow-2xl overflow-hidden">
            <div className="px-6 sm:px-8 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)' }}>
              <div className="flex items-start gap-3 flex-wrap">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/20 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"/>
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <h2 id="admin-reject-title" className="font-display text-xl text-white font-medium">Reject Registration</h2>
                  <p className="font-body text-xs text-white/80 mt-1 break-words">
                    For:&nbsp;<span className="font-semibold text-white">
                      {[rejectDialog.profile.firstName, rejectDialog.profile.lastName].filter(Boolean).join(' ').trim() || `${rejectDialog.profile.gender}, ${rejectDialog.profile.age} · ${rejectDialog.profile.location}`}
                    </span>
                  </p>
                </div>
                <button onClick={!rejectDialog.submitting ? closeRejectDialog : undefined} disabled={rejectDialog.submitting}
                  className="shrink-0 text-white/70 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-40" aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); submitRejectDialog(); }}
              className="px-6 sm:px-8 py-6 space-y-4"
            >
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="font-body text-xs text-red-900 font-semibold uppercase tracking-wider mb-2">⚠️  Rejection is permanent</p>
                <p className="font-body text-[12px] text-red-800 leading-relaxed">
                  After confirming, the registration will be <strong>permanently removed from the database</strong> and will NOT appear in any dashboard tab.
                </p>
              </div>
              <div>
                <label className="font-body text-[11px] font-semibold tracking-wide uppercase text-maroon mb-1.5 block">
                  Rejection Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  maxLength={500}
                  value={rejectDialog.reason}
                  onChange={(e) => setRejectDialog((s) => ({ ...s, reason: e.target.value, error: '' }))}
                  placeholder="Please provide a brief reason for rejecting this profile (e.g. Incomplete info, invalid phone, duplicate registration…)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-maroon/10 bg-cream/30 font-body text-sm text-deep-maroon placeholder:text-deep-maroon/30 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all resize-y"
                />
                <p className="mt-1.5 font-body text-[10px] text-deep-maroon/45 text-right">
                  {rejectDialog.reason.length}/500 characters
                </p>
              </div>
              {rejectDialog.error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="font-body text-xs text-red-700">{rejectDialog.error}</p>
                </div>
              )}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={rejectDialog.submitting}
                  onClick={closeRejectDialog}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 hover:bg-maroon/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectDialog.submitting || !rejectDialog.reason.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', color: '#fff' }}
                >
                  {rejectDialog.submitting ? (
                    <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Rejecting…</>
                  ) : (
                    <>❌ Confirm Reject &amp; Delete</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Profile / Registration dialog + PDF download ── */}
      {viewDialog.open && (
        <div className="fixed inset-0 z-[108] flex items-start justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog" aria-modal="true" aria-labelledby="admin-view-title">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm no-print" onClick={!viewDialog.loading ? closeViewDialog : undefined} />
          <div className="relative w-full max-w-4xl my-6 rounded-3xl bg-white border border-maroon/10 shadow-2xl overflow-hidden">
            <div className="sticky top-0 z-10 px-6 sm:px-10 pt-6 pb-5 no-print" style={{ background: 'linear-gradient(135deg, #800020, #4A0404)' }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/20 shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F3E5AB" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <h2 id="admin-view-title" className="font-display text-xl text-white font-medium break-words">
                      {viewDialog.mode === 'profile' ? 'Approved Member Profile' : 'Registration Preview'}
                    </h2>
                    <p className="font-body text-xs text-white/75 mt-1 break-words">
                      <span className="font-semibold text-white/90">{viewDialog.name || '(Unnamed)'}</span>
                      &nbsp;·&nbsp; ID: <span className="font-mono text-white/90 select-all">{viewDialog.id}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-[11px] font-semibold tracking-[0.08em] uppercase bg-white text-maroon hover:bg-white/90 transition-colors shadow-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><polyline points="6 15 12 21 18 15"/></svg>
                    🖨 Download PDF
                  </button>
                  <button onClick={!viewDialog.loading ? closeViewDialog : undefined} disabled={viewDialog.loading}
                    className="shrink-0 text-white/70 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 disabled:opacity-40" aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="profile-print-area px-6 sm:px-10 py-6 max-h-[72vh] overflow-y-auto">
              <div className="print-header no-print" style={{ display: 'none' }}>
                <h1>Perfect Rishta — Profile Report</h1>
                <p>Generated {new Date().toLocaleString('en-GB')}</p>
              </div>
              <div className="print-header" aria-hidden="true">
                <h1 style={{ margin: 0, fontSize: '20px', color: '#800020', fontFamily: 'Georgia, serif' }}>Perfect Rishta</h1>
                <p style={{ margin: '4pt 0 0 0', fontSize: '9pt', color: '#6b7280' }}>
                  {viewDialog.mode === 'profile' ? 'Approved Member Profile Report' : 'Registration Review Report'}
                  &nbsp;·&nbsp; Generated {new Date().toLocaleString('en-GB')}
                </p>
              </div>
              {viewDialog.loading && (
                <div className="text-center py-10 no-print">
                  <div className="inline-block w-8 h-8 border-2 border-maroon/15 border-t-maroon rounded-full animate-spin mb-3" />
                  <p className="font-body text-xs text-deep-maroon/50">Loading profile…</p>
                </div>
              )}
              {!viewDialog.loading && viewDialog.error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 no-print">
                  <p className="font-body text-xs text-red-700">{viewDialog.error}</p>
                </div>
              )}
              {!viewDialog.loading && !viewDialog.error && (
                <div className="space-y-1">
                  {(() => {
                    const printRow = (label: string, value: any) => {
                      const v = value === undefined || value === null || value === '' ? '—' : String(value);
                      return (
                        <div className="print-row" key={label}>
                          <div className="print-label">{label}</div>
                          <div className="print-value">{v}</div>
                        </div>
                      );
                    };
                    const sectionTitle = (title: string) => (
                      <div key={title} className="print-section-title">{title}</div>
                    );
                    const v = viewDialog.data;
                    const u = viewDialog.user;
                    return (
                      <>
                        {sectionTitle(viewDialog.mode === 'profile' ? 'Member Login Credentials' : 'Registration Status')}
                        {viewDialog.mode === 'profile' && u ? (
                          <>
                            {printRow('Login ID', u.loginId)}
                            {printRow('Account Status', u.membershipStatus)}
                            {printRow('Membership Tier', u.membershipTier ? String(u.membershipTier).charAt(0).toUpperCase() + String(u.membershipTier).slice(1) : '')}
                            {printRow('Email', u.email || v.email)}
                          </>
                        ) : (
                          <>
                            {printRow('Status', v.status)}
                            {printRow('Plan / Tier', v.plan)}
                            {printRow('Submitted At', v.createdAt ? new Date(v.createdAt).toLocaleString('en-GB') : '')}
                          </>
                        )}
                        {sectionTitle('Personal & Contact')}
                        {EDIT_FIELDS_CORE.filter((f) => f.type !== 'textarea').map((f) => printRow(f.label, v[f.key]))}
                        {EDIT_FIELDS_CORE.filter((f) => f.type === 'textarea').map((f) => printRow(f.label, v[f.key]))}
                        {sectionTitle('Partner Preferences')}
                        {EDIT_FIELDS_PARTNER.map((f) => printRow(f.label, v[f.key]))}
                        {sectionTitle('Long Descriptions')}
                        {EDIT_FIELDS_LONG.map((f) => printRow(f.label, v[f.key]))}
                        {viewDialog.mode === 'profile' && (
                          <>
                            {sectionTitle('Profile Visibility')}
                            {printRow('Plan (display)', v.plan)}
                            {printRow('Visible in Proposals', v.isActive === true || v.isActive === 'true' ? 'Yes' : v.isActive === false || v.isActive === 'false' ? 'No' : '—')}
                            {printRow('Paid Member Flag', v.isPaid === true || v.isPaid === 'true' ? 'Yes' : v.isPaid === false || v.isPaid === 'false' ? 'No' : '—')}
                          </>
                        )}
                        {v.rejectionReason && (
                          <>
                            {sectionTitle('Rejection Info')}
                            {printRow('Rejection Reason', v.rejectionReason)}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 z-10 px-6 sm:px-10 py-4 border-t border-maroon/8 bg-gradient-to-b from-white via-white to-cream/40 flex items-center justify-end gap-3 no-print">
              <button type="button" disabled={viewDialog.loading}
                onClick={closeViewDialog}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full font-body text-xs font-semibold tracking-[0.08em] uppercase border border-maroon/15 text-deep-maroon/70 hover:bg-maroon/5 transition-all disabled:opacity-50">
                Close
              </button>
              <button type="button" disabled={viewDialog.loading}
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-body text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-[1.01] hover:shadow-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #800020, #4A0404)', color: '#fff' }}>
                🖨 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 rounded-2xl border border-maroon/8 bg-white">
      <p className="font-body text-sm text-deep-maroon/40">{message}</p>
    </div>
  );
}
