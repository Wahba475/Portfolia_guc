import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoleDashboardPath } from '../utils/roleRoutes'

export default function Login({ onLogin, currentUser }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser) navigate(getRoleDashboardPath(currentUser.role))
  }, [currentUser, navigate])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = onLogin(email, password)
      if (result.success) {
        toast.success('Welcome back!')
        navigate(getRoleDashboardPath(result.user?.role))
      } else {
        setError(result.error)
        toast.error(result.error)
        setLoading(false)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#747878] hover:text-[#111111] transition-colors bg-white px-3 py-2 border border-[#e5e2e1] hover:bg-[#f1edec]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={12} /> Back to Home
      </Link>

      {/* Login Container - Paper Style */}
      <main className="w-full max-w-md bg-white border border-[#e5e2e1] p-8 md:p-12 relative flex flex-col gap-8 rounded-none mt-12 md:mt-0">
        {/* Header */}
        <header className="flex flex-col gap-2 text-center">
          <h1
            className="text-4xl font-bold text-[#111111]"
            style={{ fontFamily: "'Newsreader', serif", letterSpacing: '-0.02em', lineHeight: '1.1' }}
          >
            Welcome back
          </h1>
          <p
            className="text-base text-[#444748]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Log in to your Portfolia account.
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {error && (
            <div className="flex items-center gap-2 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] p-3 text-sm rounded-none">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs font-bold text-[#111111] uppercase tracking-widest"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#111111] uppercase tracking-widest"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#444748] hover:text-[#111111] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border-0 border-b border-[#e5e2e1] py-2 px-0 pr-10 focus:ring-0 focus:border-[#111111] text-base text-[#111111] placeholder:text-[#c4c7c7] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#747878] hover:text-[#111111] transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111111] text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:bg-[#333] active:translate-y-0.5 border border-[#111111] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p
              className="text-center text-sm text-[#444748]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#111111] font-semibold underline decoration-1 underline-offset-4 hover:text-[#6b38d4] transition-colors inline-flex items-center gap-1"
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                Register <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </form>


      </main>
    </div>
  )
}
