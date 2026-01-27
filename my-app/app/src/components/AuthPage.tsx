"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/billing/supabase/client";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log("Supabase client:", supabase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          router.push("/dashboard");
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
          setMessage("Account created! Please check your email to verify.");
          
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
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
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-8 m-2 bg-gray-800 rounded-xl shadow-2xl w-96 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          {isSignin ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isSignin && (
            <div className="p-2">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div className="p-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="p-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              minLength={4}
            />
          </div>

          {error && (
            <div className="p-3 m-2 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 m-2 bg-green-900/50 border border-green-500 rounded-lg">
              <p className="text-green-300 text-sm text-center">{message}</p>
            </div>
          )}

          <div className="pt-4 p-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg p-3 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : isSignin ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>

        <div className="pt-2 text-center">
          <Link
            href={isSignin ? "/signup" : "/signin"}
            className="text-blue-400 hover:text-blue-300 hover:underline text-sm transition-colors"
          >
            {isSignin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}