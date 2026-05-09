import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPassword({ userList }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  function handleRequest(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      // Simulate checking if email exists
      const exists = (userList || []).some((u) => u.email === email.trim())
      if (!exists) {
        setError('No account found with that email address.')
        setLoading(false)
        return
      }
      setLoading(false)
      setSubmitted(true)
      toast.success('Reset instructions sent to your email (simulated).')
    }, 600)
  }

  function handleReset(e) {
    e.preventDefault()
    setError('')
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    toast.success('Password reset successfully! You can now log in.')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-md bg-white border border-[#e5e2e1] p-8 md:p-12 relative flex flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#747878] hover:text-[#111111] transition-colors mb-2 w-fit"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
          <h1
            className="text-3xl font-bold text-[#111111]"
            style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em' }}
          >
            {submitted ? 'Reset Password' : 'Forgot Password?'}
          </h1>
          <p className="text-sm text-[#444748]" style={{ fontFamily: "'Inter', sans-serif" }}>
            {submitted
              ? 'Enter your new password below.'
              : "Enter your email and we'll send you reset instructions."}
          </p>
        </header>

        {submitted ? (
          /* ── Step 2: Set new password ── */
          <form onSubmit={handleReset} className="flex flex-col gap-6">
            {/* Simulated email confirmation banner */}
            <div className="flex items-center gap-3 bg-[#f1edec] border border-[#e5e2e1] p-4">
              <Mail size={16} className="text-[#747878] flex-shrink-0" />
              <p className="text-xs text-[#444748]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Reset link sent to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <p className="text-xs text-[#ba1a1a] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" style={{ fontFamily: "'Manrope', sans-serif" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors border border-[#111111]"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Reset Password
            </button>
          </form>
        ) : (
          /* ── Step 1: Enter email ── */
          <form onSubmit={handleRequest} className="flex flex-col gap-6">
            {error && (
              <p className="text-xs text-[#ba1a1a] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-widest" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#333] transition-colors border border-[#111111] disabled:opacity-50"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {loading ? 'Sending…' : 'Send Reset Instructions'}
            </button>

            <p className="text-center text-sm text-[#444748]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Remember it?{' '}
              <Link to="/login" className="text-[#111111] font-semibold underline decoration-1 underline-offset-4 hover:text-[#6b38d4] transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
