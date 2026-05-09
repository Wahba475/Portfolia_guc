import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Building2, BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    desc: 'Build your portfolio and find internships.',
  },
  {
    id: 'employer',
    label: 'Employer',
    icon: Building2,
    desc: 'Post internships and discover talent.',
  },
  {
    id: 'instructor',
    label: 'Instructor',
    icon: BookOpen,
    desc: 'Guide students and review their work.',
  },
]

function Step1({ selected, onSelect, onNext }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h2
          className="text-3xl font-bold text-[#111111]"
          style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}
        >
          I am a…
        </h2>
        <p className="text-base text-[#444748]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Choose your role to get started.
        </p>
      </header>
      <div className="flex flex-col gap-4">
        {roles.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-4 px-4 py-4 border text-left transition-colors rounded-none
              ${selected === id
                ? 'border-[#111111] bg-[#f7f3f2]'
                : 'border-[#e5e2e1] bg-white hover:border-[#111111]'
              }`}
          >
            <span
              className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border border-[#e5e2e1]
                ${selected === id ? 'bg-[#111111] border-[#111111]' : 'bg-[#f1edec]'}`}
            >
              <Icon size={20} className={selected === id ? 'text-white' : 'text-[#747878]'} />
            </span>
            <div>
              <p
                className="text-base font-bold text-[#111111]"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                {label}
              </p>
              <p className="text-sm text-[#747878]">{desc}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!selected}
        className="w-full bg-[#111111] text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:bg-[#333] active:translate-y-0.5 border border-[#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        Continue
      </button>
    </div>
  )
}

function Field({ id, label, type = 'text', value, onChange, placeholder }) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#111111] uppercase tracking-widest"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {label}
        </label>
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPw ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            tabIndex={-1}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#111111] transition-colors"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  )
}

function Step2({ role, onSubmit, onBack }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    university: '', major: '', gpa: '',
    company: '', position: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function validate() {
    if (!form.name || !form.email || !form.password) return 'Name, email and password are required.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (role === 'student' && !form.university) return 'University is required.'
    if (role === 'employer' && !form.company) return 'Company is required.'
    if (role === 'instructor' && !form.department) return 'Department is required.'
    return null
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      const payload = { name: form.name, email: form.email, password: form.password, role, skills: [] }
      if (role === 'student') {
        Object.assign(payload, { university: form.university, major: form.major, gpa: form.gpa })
      } else if (role === 'employer') {
        Object.assign(payload, { company: form.company, position: form.position })
      } else {
        Object.assign(payload, { department: form.department })
      }
      onSubmit(payload)
    }, 400)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h2
          className="text-3xl font-bold text-[#111111]"
          style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}
        >
          Create account
        </h2>
        <p className="text-base text-[#444748] capitalize" style={{ fontFamily: "'Inter', sans-serif" }}>
          Registering as a <strong>{role}</strong>.
        </p>
      </header>

      {error && (
        <div className="flex items-center gap-2 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] p-3 text-sm rounded-none">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Field id="name" label="Full Name" value={form.name} onChange={set('name')} placeholder="Ahmed Hassan" />
        <Field id="reg-email" label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <Field id="reg-password" label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters" />

        {role === 'student' && (
          <>
            <Field id="university" label="University" value={form.university} onChange={set('university')} placeholder="German University in Cairo" />
            <Field id="major" label="Major" value={form.major} onChange={set('major')} placeholder="Computer Science" />
            <Field id="gpa" label="GPA (optional)" value={form.gpa} onChange={set('gpa')} placeholder="3.8" />
          </>
        )}
        {role === 'employer' && (
          <>
            <Field id="company" label="Company" value={form.company} onChange={set('company')} placeholder="TechCorp Egypt" />
            <Field id="position" label="Your Position" value={form.position} onChange={set('position')} placeholder="HR Manager" />
          </>
        )}
        {role === 'instructor' && (
          <Field id="department" label="Department" value={form.department} onChange={set('department')} placeholder="Computer Science" />
        )}
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 border border-[#e5e2e1] text-[#444748] py-3 px-4 text-xs font-bold uppercase tracking-widest hover:border-[#111111] hover:text-[#111111] transition-colors"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-2/3 bg-[#111111] text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:bg-[#333] active:translate-y-0.5 border border-[#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {loading ? 'Creating…' : 'Register'}
        </button>
      </div>
    </form>
  )
}

export default function Register({ onRegister, currentUser }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')

  useEffect(() => {
    if (currentUser) navigate('/dashboard')
  }, [currentUser, navigate])

  function handleRegister(payload) {
    onRegister(payload)
    toast.success('Account created! Welcome to Portfolia.')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header outside the box for consistency with the rest */}
      <div className="w-full max-w-md mb-8 flex flex-col items-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="w-7 h-7 rounded-sm bg-[#111111] flex items-center justify-center">
            <span className="text-white text-sm font-bold" style={{ fontFamily: "'Newsreader', serif" }}>P</span>
          </span>
          <span className="text-xl font-semibold text-[#111111]" style={{ fontFamily: "'Newsreader', serif" }}>
            Portfolia
          </span>
        </Link>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-none transition-all duration-300
                ${step >= s ? 'bg-[#111111] w-8' : 'bg-[#e5e2e1] w-4'}`}
            />
          ))}
        </div>
      </div>

      {/* Register Container - Paper Style */}
      <main className="w-full max-w-md bg-white border border-[#e5e2e1] p-8 md:p-12 relative flex flex-col gap-8 rounded-none">
        {step === 1
          ? <Step1 selected={role} onSelect={setRole} onNext={() => setStep(2)} />
          : <Step2 role={role} onSubmit={handleRegister} onBack={() => setStep(1)} />
        }
      </main>
      
      <p className="text-center text-sm text-[#444748] mt-8" style={{ fontFamily: "'Inter', sans-serif" }}>
        Already have an account?{' '}
        <Link to="/login" className="text-[#111111] font-semibold underline decoration-1 underline-offset-4 hover:text-[#6b38d4] transition-colors" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
