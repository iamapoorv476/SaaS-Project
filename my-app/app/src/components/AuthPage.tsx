"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/billing/supabase/client";

const inputStyles =
  "w-full rounded-[3px] border border-[#1C1A15]/20 bg-white px-4 py-3 text-[15px] text-[#1C1A15] placeholder:text-[#8A8577] transition-colors focus:outline-none focus:border-[#1C1A15] focus:ring-2 focus:ring-[#F2DF4E]";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const fillDemo = () => {
    setEmail("demo@projectflow.ai");
    setPassword("demo123456");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push(redirectTo || "/dashboard/redirect");
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split("@")[0],
            },
          },
        });

        if (error) {
          setError(error.message);
        } else {
          // Auto sign in immediately after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            setError(signInError.message);
          } else {
            router.push(redirectTo || "/dashboard/redirect");
            router.refresh();
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F5EF] px-4 py-10">
      {/* Wordmark — a way back home */}
      <Link href="/" className="mb-10 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1C1A15]">
          <span className="[font-family:var(--font-display),ui-serif,Georgia,serif] text-sm font-semibold text-[#F2DF4E]">
            P
          </span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-[#1C1A15]">
          ProjectFlow
        </span>
      </Link>

      <div className="relative w-full max-w-sm">
        {/* Demo credentials — tilted annotation chip, signin only */}
        {isSignin && (
          <button
            type="button"
            onClick={fillDemo}
            className="absolute -top-4 right-4 z-10 rotate-2 cursor-pointer rounded-[3px] bg-[#F2DF4E] px-3 py-1.5 font-mono text-[11px] font-medium text-[#1C1A15] shadow-[3px_3px_0_#1C1A15] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1A15]"
          >
            recruiter? → use demo account
          </button>
        )}

        {/* The card */}
        <div className="rounded-lg border border-[#1C1A15] bg-white p-8 shadow-[6px_6px_0_#1C1A15]">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8A8577]">
            {isSignin ? "welcome back" : "create your workspace"}
          </p>
          <h1 className="mb-7 text-3xl text-[#1C1A15] [font-family:var(--font-display),ui-serif,Georgia,serif] font-medium">
            {isSignin ? "Sign in." : "Sign up."}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignin && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[#6F6A5C]"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputStyles}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[#6F6A5C]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyles}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[#6F6A5C]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyles}
                required
                minLength={4}
              />
            </div>

            {error && (
              <div className="rounded-[3px] border border-[#C43C2E]/40 bg-[#C43C2E]/5 px-4 py-3">
                <p className="text-sm text-[#A32E22]">{error}</p>
              </div>
            )}

            {message && (
              <div className="rounded-[3px] border border-[#2E7D4F]/40 bg-[#2E7D4F]/5 px-4 py-3">
                <p className="text-sm text-[#256B42]">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-[3px] bg-[#1C1A15] px-7 py-3 text-[15px] font-semibold text-[#F7F5EF] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2742D6] disabled:cursor-not-allowed disabled:bg-[#8A8577] disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing {isSignin ? "in" : "up"}...
                </span>
              ) : isSignin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        {/* Switch signin/signup */}
        <p className="mt-6 text-center text-sm text-[#57534A]">
          {isSignin ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isSignin ? "/signup" : "/signin"}
            className="font-medium text-[#2742D6] underline decoration-[#2742D6]/40 underline-offset-4 transition-colors hover:decoration-[#2742D6]"
          >
            {isSignin ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}