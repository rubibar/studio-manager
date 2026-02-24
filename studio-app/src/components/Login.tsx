import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'

export function Login() {
  const login = useAuthStore(s => s.login)
  const loading = useAuthStore(s => s.loading)
  const error = useAuthStore(s => s.error)

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center"
      dir="rtl"
      style={{
        background: '#09090b',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(5,150,105,0.15), transparent)',
      }}
    >
      <motion.div
        className="w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold mb-1">Studio Manager</h1>
          <p className="text-[#71717a] text-sm">Replica Animation Studio</p>
        </div>

        {/* Card */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-[20px] p-6">
          <h2 className="text-white text-[15px] font-bold text-center mb-1">
            ברוכים הבאים
          </h2>
          <p className="text-[#71717a] text-[13px] text-center mb-6">
            התחבר עם חשבון Google כדי להמשיך
          </p>

          <button
            onClick={login}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#18181b] font-medium text-[14px] rounded-[12px] px-4 py-3 hover:bg-[#f4f4f5] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#18181b] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                התחבר עם Google
              </>
            )}
          </button>

          {error && (
            <p className="text-[var(--color-red)] text-[12px] text-center mt-3">
              {error}
            </p>
          )}
        </div>

        <p className="text-[#3f3f46] text-[11px] text-center mt-6">
          גישה מוגבלת לצוות הסטודיו בלבד
        </p>
      </motion.div>
    </div>
  )
}
