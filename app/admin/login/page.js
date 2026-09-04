import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center px-5 py-10 sm:px-6">
      <div className="w-full max-w-sm">
        <p className="font-display italic text-2xl text-ink">
          Evermore <span className="not-italic text-copper">Design</span>
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-widest2 text-ink/45">
          Studio Admin
        </p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
