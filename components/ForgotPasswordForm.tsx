"use client";

import Link from "next/link";
import { useState } from "react";
import FormField from "@/components/FormField";
import { authErrorMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/client";

// Asks Supabase to email a password reset link.
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    // Same message whether or not the account exists, so this page can't be
    // used to find out who has an account.
    return (
      <div>
        <h1 className="font-serif text-title">Check your email</h1>
        <p className="mt-4 text-stone">
          If there&apos;s an account for {sentTo}, we sent it a link to choose a new
          password. Open it in this browser.
        </p>
        <Link href="/login" className="mt-8 inline-block text-label uppercase underline underline-offset-4">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-title">Reset your password</h1>
      <p className="mt-4 text-stone">
        Enter your email and we&apos;ll send you a link to choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
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
            {busy ? "Sending…" : "Send link"}
          </button>
        </div>
      </form>

      <Link href="/login" className="mt-6 inline-block text-label uppercase underline underline-offset-4">
        Back to log in
      </Link>
    </div>
  );
}
