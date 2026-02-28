import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg className="absolute top-12 left-[10%] w-16 h-16 animate-[float_6s_ease-in-out_infinite]" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" fill="#2A9D8F" opacity="0.06" />
          <path d="M32 18v28M18 32h28" stroke="#2A9D8F" strokeWidth="2" opacity="0.15" strokeLinecap="round" />
        </svg>
        <svg className="absolute bottom-20 right-[8%] w-20 h-20 animate-[float_8s_ease-in-out_infinite_1s]" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="35" fill="#2A9D8F" opacity="0.04" />
          <path d="M40 20c-8 6-16 14-16 22a16 16 0 0 0 32 0c0-8-8-16-16-22z" fill="#2A9D8F" opacity="0.08" />
        </svg>
        <svg className="absolute top-[30%] right-[15%] w-10 h-10 animate-[float_5s_ease-in-out_infinite_2s]" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="5" width="30" height="30" rx="8" fill="#2A9D8F" opacity="0.06" />
        </svg>
        <svg className="absolute bottom-[35%] left-[6%] w-14 h-14 animate-[float_7s_ease-in-out_infinite_0.5s]" viewBox="0 0 56 56" fill="none">
          <path d="M28 8l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z" fill="#2A9D8F" opacity="0.06" />
        </svg>
      </div>

      {/* Animated illustration */}
      <div className="mb-8 relative z-10">
        <svg viewBox="0 0 120 120" fill="none" className="w-20 h-20 mx-auto">
          {/* Outer pulse ring */}
          <circle cx="60" cy="60" r="56" stroke="#2A9D8F" strokeWidth="1" opacity="0.15">
            <animate attributeName="r" values="50;56;50" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Background circle */}
          <circle cx="60" cy="60" r="44" fill="#E6F2F0" />
          {/* Stethoscope icon */}
          <circle cx="60" cy="52" r="12" stroke="#2A9D8F" strokeWidth="2.5" fill="none">
            <animate attributeName="stroke-opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M48 52v20a12 12 0 0 0 24 0V52" stroke="#2A9D8F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="76" r="4" fill="#2A9D8F" opacity="0.8">
            <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Heartbeat line */}
          <path d="M30 60h12l4-8 6 16 6-16 4 8h12" stroke="#2A9D8F" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
            <animate attributeName="stroke-dashoffset" from="80" to="0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="0 80;40 40;80 0" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D8E6E6] p-7 shadow-[0_12px_28px_rgba(42,157,143,0.06)] relative z-10">
        <div className="text-center mb-6">
          <h1 className="font-serif text-2xl text-[#1D3557]">Welcome</h1>
          <p className="mt-1 text-sm text-[#64748B]">Sign in or create an account</p>
        </div>

        <Suspense fallback={<p className="text-sm text-[#64748B] text-center">Loading...</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-5 text-center text-[11px] text-[#64748B] leading-relaxed">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[#2A9D8F] transition-colors">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-[#2A9D8F] transition-colors">Privacy Policy</Link>.
        </p>
      </div>

      {/* Brand */}
      <p className="mt-6 font-serif text-sm text-[#b0aaa3] relative z-10">
        <span className="text-[#2A9D8F]">Your</span>Doc
      </p>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
