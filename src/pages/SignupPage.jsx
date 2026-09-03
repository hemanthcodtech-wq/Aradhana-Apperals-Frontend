import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/logo.png';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, verifyOtp, loginWithGoogle, loading, error } = useAuthStore();

  const [step, setStep] = useState('form');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState('');
  const otpRefs = useRef([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault(); setLocalError('');
    const res = await signup(form.name, form.email, form.phone, form.password);
    if (res.success) setStep('otp');
    else setLocalError(res.error);
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[idx] = val; setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const nextOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        nextOtp[i] = pastedData[i];
      }
      setOtp(nextOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setLocalError('');
    const code = otp.join('');
    if (code.length < 6) return setLocalError('Enter all 6 digits');
    const res = await verifyOtp(form.email, code);
    if (res.success) navigate('/');
    else setLocalError(res.error);
  };

  const displayError = localError || error;

  const inputClass = "w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 pl-11 text-[15px] text-gray-900 focus:outline-none focus:border-[#022A21] focus:bg-white transition-all bg-gray-50 placeholder-gray-400 font-medium";

  const perks = ['Premium ethnic wear', 'Exclusive festive offers', 'Free replacements & exchanges'];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#022A21' }}>

      {/* ── GREEN HERO ── */}
      <div className="relative flex flex-col items-center pt-12 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/[0.06]" />
          <div className="absolute bottom-8 left-[-40px] w-48 h-48 rounded-full border border-indigo-600/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/[0.06] rounded-full blur-3xl" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 rounded-full bg-indigo-600/25"
              style={{ top: `${8 + i * 11}%`, left: `${5 + i * 12}%` }} />
          ))}
        </div>

        <button onClick={() => navigate('/login')}
          className="absolute top-5 left-5 z-10 flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors bg-white/[0.07] px-3 py-1.5 rounded-full border border-white/10">
          <ArrowLeft className="w-3.5 h-3.5" /> Login
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-[88px] h-[88px] rounded-[1.75rem] bg-white/[0.08] border border-white/[0.15] flex items-center justify-center overflow-hidden shadow-2xl">
              <img src={logo} alt="Aradhana Apparels" className="h-20 w-20 scale-[1.25] object-contain drop-shadow-xl" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gradient-to-br from-indigo-600 to-yellow-500 rounded-full border-[3px] border-[#022A21] flex items-center justify-center shadow-lg">
              <span className="text-white text-[9px] font-black">✦</span>
            </div>
          </div>
          <h1 className="text-white text-[22px] font-extrabold tracking-widest" style={{ fontFamily: 'inherit', letterSpacing: '0.15em' }}>
            Aradhana Apparels
          </h1>
          <p className="text-indigo-600 text-[10px] font-bold tracking-[0.25em] uppercase mt-0.5">Your Choice, From Anywhere.</p>

          {step === 'form' && (
            <div className="mt-5 space-y-2">
              {perks.map(p => (
                <div key={p} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-white/75 text-[12px] font-medium">{p}</span>
                </div>
              ))}
            </div>
          )}

          {step === 'otp' && (
            <div className="mt-5 text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-600/15 border-2 border-indigo-600/30 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7 text-indigo-600" />
              </div>
              <p className="text-white/60 text-xs font-medium">OTP sent to</p>
              <p className="text-white font-bold text-sm mt-0.5">{form.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-12 relative z-10 px-5 pt-8 pb-10 shadow-[0_-20px_60px_rgba(0,0,0,0.25)]">
        <div className="max-w-sm mx-auto">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

          {step === 'form' ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'inherit' }}>Create Account ✨</h2>
                <p className="text-[13px] text-gray-500 mt-1.5">Join thousands of happy Aradhana Apparels</p>
              </div>

              {displayError && (
                <div className="mb-5 bg-red-50 text-red-600 text-[13px] font-semibold px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-[10px] font-black shrink-0">!</span>
                  {displayError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-3.5">
                {[
                  { icon: <User className="w-4 h-4 text-gray-400" />, name: 'name', type: 'text', placeholder: 'Full name' },
                  { icon: <Mail className="w-4 h-4 text-gray-400" />, name: 'email', type: 'email', placeholder: 'Email address' },
                  { icon: <Phone className="w-4 h-4 text-gray-400" />, name: 'phone', type: 'tel', placeholder: 'Phone number (+91...)' },
                ].map(f => (
                  <div key={f.name} className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">{f.icon}</span>
                    <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                      required placeholder={f.placeholder} className={inputClass} />
                  </div>
                ))}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={handleChange} required minLength={6} placeholder="Password (min. 6 characters)" className={inputClass + ' pr-12'} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-yellow-400 text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_4px_20px_rgba(254,102,3,0.4)] hover:shadow-[0_8px_30px_rgba(254,102,3,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</> : 'Continue →'}
                </button>
              </form>

              {/* Google button below form */}
              <div className="flex items-center gap-3 mt-5 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-400 font-medium px-1">or continue with</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <button onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-2xl text-[15px] transition-all shadow-sm hover:shadow-md active:scale-[0.98] mb-5">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mt-5 mb-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-400 font-medium">Already a member?</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <Link to="/login"
                className="flex items-center justify-center w-full border-2 border-[#022A21]/15 text-gray-900 font-bold py-3.5 rounded-2xl text-[15px] hover:bg-gray-900/5 hover:border-[#022A21]/40 transition-all">
                Login
              </Link>
            </>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'inherit' }}>Verify Email 📧</h2>
                <p className="text-[13px] text-gray-500 mt-1.5">Enter the 6-digit code sent to your inbox</p>
              </div>

              {displayError && (
                <div className="mb-5 bg-red-50 text-red-600 text-[13px] font-semibold px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center text-[10px] font-black shrink-0">!</span>
                  {displayError}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      onPaste={handleOtpPaste}
                      className={`w-0 min-w-0 flex-1 h-14 sm:h-16 text-center text-2xl font-black rounded-2xl border-2 focus:outline-none transition-all duration-300
                        ${digit ? 'border-[#022A21] text-[#022A21] shadow-[0_0_0_4px_rgba(2,42,33,0.12)] bg-[#022A21]/5' : 'border-gray-200 bg-gray-50/50 text-gray-900 focus:border-[#022A21] focus:bg-white focus:shadow-[0_0_0_4px_rgba(2,42,33,0.08)]'}`}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#022A21] to-[#054335] text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_4px_20px_rgba(2,42,33,0.3)] hover:shadow-[0_8px_30px_rgba(2,42,33,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</> : 'Verify & Create Account →'}
                </button>

                <button type="button" onClick={() => { setStep('form'); setOtp(['','','','','','']); }}
                  className="flex items-center justify-center gap-1 w-full text-[13px] text-gray-400 hover:text-gray-900 font-medium transition-colors pt-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Change my details
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
