import { AuthPage } from "@/app/src/components/AuthPage"
import { Suspense } from "react";

export default function SigninPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />}>
      <AuthPage isSignin={true} />
    </Suspense>
  );
}