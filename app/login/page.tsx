import { signIn } from "@/auth";
import { TrendingUp } from "lucide-react";

export default function LoginPage() {
  return (
    // fixed overlay covers the Sidebar/TopBar that the root layout renders
    <div className="fixed inset-0 bg-slate-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm space-y-6 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">CreditCycle</h1>
          <p className="text-sm text-slate-500 mt-1">Personal card manager</p>
        </div>

        {/* Google sign-in — server action triggers OAuth redirect */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/cards" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        <p className="text-xs text-slate-400">Access restricted to authorised users</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
