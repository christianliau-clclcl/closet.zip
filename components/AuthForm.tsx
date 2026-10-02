"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { authErrorMessage, loginNotices, type LoginNotice } from "@/lib/auth-messages";
import { MAX_CLOSET_NAME, checkClosetName } from "@/lib/closet-name";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

const copy = {
  login: { title: "Welcome back", button: "Log in", busy: "Logging in…" },
  signup: { title: "Start your archive", button: "Create account", busy: "Creating account…" },
};

// One page for logging in and signing up, switched with two text tabs.
export default function AuthForm({ notice }: { notice?: LoginNotice }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [closetName, setClosetName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(authErrorMessage(error));
        setBusy(false);
        return;
      }
      // Go to the closet, and ask the server to re-render now that it can
      // see the login cookie.
      router.replace("/");
      router.refresh();
      return;
    }

    // The closet's name is optional; it's kept with the account's details.
    let name: string | null;
    try {
      name = checkClosetName(closetName);
    } catch (problem) {
      setError((problem as Error).message);
      setBusy(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: name ? { closet_name: name } : undefined,
      },
    });
    setBusy(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    // Supabase doesn't return an error for an email that's already registered;
    // it returns a user with no login methods instead.
    if (data.user && data.user.identities?.length === 0) {
      setError("An account with this email already exists.");
      return;
    }
    setSentTo(email);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  if (sentTo) {
    return (
      <div>
        <h1 className="font-serif text-title">Check your email</h1>
        <p className="mt-4 text-stone">
          We sent a confirmation link to {sentTo}. Open it in this browser to finish.
        </p>
      </div>
    );
  }

  const text = copy[mode];

  return (
    <div>
      {notice && <p className="mb-8 border-y border-rule py-3">{loginNotices[notice]}</p>}

      <div className="flex gap-6">
        {(["login", "signup"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchMode(option)}
            aria-pressed={mode === option}
            className={`cursor-pointer text-label uppercase underline-offset-4 ${
              mode === option ? "text-ink underline" : "text-stone"
            }`}
          >
            {option === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <h1 className="mt-8 font-serif text-title">{text.title}</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        {mode === "signup" && (
          <FormField
            label="Closet name"
            placeholder="e.g. Sam’s Closet"
            maxLength={MAX_CLOSET_NAME * 2}
            hint="Optional. You can name it later from the menu."
            value={closetName}
            onChange={(event) => setClosetName(event.target.value)}
          />
        )}
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 8 : undefined}
          hint={mode === "signup" ? "At least 8 characters." : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          action={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              className="cursor-pointer text-label uppercase"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />

        <div>
          {error && (
            <p role="alert" className="mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full cursor-pointer bg-ink px-5 py-3 font-medium text-cell disabled:cursor-wait"
          >
            {busy ? text.busy : text.button}
          </button>
          {mode === "login" && (
            <Link
              href="/forgot-password"
              className="mt-4 inline-block text-stone underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
