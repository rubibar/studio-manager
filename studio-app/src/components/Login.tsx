import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────
   Noise Overlay
   ───────────────────────────────────────────── */
function NoiseOverlay() {
  return <div className="noise-overlay" />
}

/* ─────────────────────────────────────────────
   Floating Navbar
   ───────────────────────────────────────────── */
function FloatingNavbar({
  scrolled,
  onSignInClick,
}: {
  scrolled: boolean
  onSignInClick: () => void
}) {
  return (
    <nav
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        flex items-center justify-between gap-8
        rounded-full px-6 py-3
        transition-all duration-500 ease-out
        ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl border border-[#D2D2D7] shadow-lg'
            : 'bg-transparent border border-transparent'
        }
      `}
    >
      <span
        className={`
          text-sm font-bold tracking-tight whitespace-nowrap
          transition-colors duration-500
          ${scrolled ? 'text-[#1D1D1F]' : 'text-[#F5F5F7]'}
        `}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Replica Studio
      </span>

      <button
        onClick={onSignInClick}
        className="
          bg-[var(--color-accent)] text-white text-xs font-bold
          rounded-full px-5 py-2
          hover:bg-[var(--color-accent-hover)] transition-colors duration-200
          whitespace-nowrap cursor-pointer
        "
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Sign In
      </button>
    </nav>
  )
}

/* ─────────────────────────────────────────────
   Hero Section — "The Opening Shot"
   ───────────────────────────────────────────── */
function HeroSection({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  return (
    <section
      ref={heroRef}
      className="hero-section relative min-h-[100dvh] flex flex-col justify-end overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://picsum.photos/id/1040/1920/1080)',
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />

      {/* Content */}
      <div className="relative z-10 px-8 md:px-16 pb-24 md:pb-32 max-w-4xl">
        <p
          className="hero-text text-4xl md:text-6xl tracking-tighter font-bold leading-tight text-[#F5F5F7]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Manage the
        </p>

        <h1
          className="hero-text text-6xl md:text-[8rem] italic leading-[0.9] mt-2 text-[#F5F5F7]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Studio.
        </h1>

        <p
          className="hero-text text-lg mt-6 text-[#A1A1A6]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Task management built for precision
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Brand Story Section
   ───────────────────────────────────────────── */
function BrandStorySection() {
  return (
    <section className="brand-story bg-black py-32 px-8 md:px-16">
      <div className="max-w-4xl mx-auto">
        <p
          className="story-line text-xl mb-8 text-[#A1A1A6]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Most studios manage by deadline.
        </p>

        <p className="story-line text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          <span className="text-[#F5F5F7]" style={{ fontFamily: "var(--font-sans)" }}>
            We manage by{' '}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", color: 'var(--color-accent)' }}>
            signal.
          </span>
        </p>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Login Card Section
   ───────────────────────────────────────────── */
function LoginCardSection({
  loginRef,
  login,
  loading,
  error,
}: {
  loginRef: React.RefObject<HTMLElement | null>
  login: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <section
      ref={loginRef}
      className="login-section bg-[var(--color-surface-2)] py-32 px-8"
    >
      <div className="max-w-md mx-auto">
        <div
          className="login-card glass-card p-8"
        >
          <h2
            className="text-xl font-bold mb-1 text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Sign in to Studio Manager
          </h2>

          <p
            className="text-sm mb-8 text-[var(--color-text-tertiary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Replica Animation Studio
          </p>

          <button
            onClick={login}
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-3
              bg-white text-[#1D1D1F] font-medium text-sm
              rounded-[12px] px-4 py-3.5
              border border-[var(--color-border)]
              hover:bg-[#F5F5F7] transition-colors duration-200
              disabled:opacity-50 cursor-pointer
            "
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {error && (
            <p
              className="text-sm text-center mt-4"
              style={{ fontFamily: "var(--font-mono)", color: 'var(--color-red)' }}
            >
              {error}
            </p>
          )}

          <p
            className="text-xs text-center mt-6 text-[var(--color-text-tertiary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Team access only
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   Footer
   ───────────────────────────────────────────── */
function FooterSection() {
  return (
    <footer className="bg-black rounded-t-[4rem] py-16 px-8 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3
            className="text-lg font-bold mb-2 text-[#F5F5F7]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Replica Studio
          </h3>
          <p
            className="text-sm leading-relaxed text-[#A1A1A6]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Animation studio management platform.
            <br />
            Built for creative teams.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-green)] opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-green)]" />
            </span>
            <span
              className="text-sm text-[#F5F5F7]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              System Operational
            </span>
          </div>
          <p
            className="text-xs text-[#A1A1A6]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            All services running
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <span
            className="text-xs text-[#636366]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            v3.0 — Apple Clarity
          </span>
          <span
            className="text-xs text-[#636366]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Built with React + Firebase
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#38383A]">
        <p
          className="text-xs text-[#636366]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          &copy; {new Date().getFullYear()} Replica Animation Studio. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

/* ═════════════════════════════════════════════
   LOGIN — Main Component
   ═════════════════════════════════════════════ */
export function Login() {
  const login = useAuthStore(s => s.login)
  const loading = useAuthStore(s => s.loading)
  const error = useAuthStore(s => s.error)

  const heroRef = useRef<HTMLElement>(null)
  const loginRef = useRef<HTMLElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)

  const handleSignInClick = () => {
    loginRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 40,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
      })

      gsap.from('.story-line', {
        scrollTrigger: {
          trigger: '.brand-story',
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      })

      gsap.from('.login-card', {
        scrollTrigger: {
          trigger: '.login-section',
          start: 'top 70%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative" dir="rtl">
      <NoiseOverlay />
      <FloatingNavbar scrolled={scrolled} onSignInClick={handleSignInClick} />
      <HeroSection heroRef={heroRef} />
      <BrandStorySection />
      <LoginCardSection
        loginRef={loginRef}
        login={login}
        loading={loading}
        error={error}
      />
      <FooterSection />
    </div>
  )
}
