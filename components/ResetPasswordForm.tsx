"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import FormField from "@/components/FormField";
import { authErrorMessage } from "@/lib/auth-messages";
import { createClient } from "@/lib/supabase/client";

// Sets a new password for the person the reset link logged in.
export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(
        error.code === "same_password"
          ? "That's your current password. Choose a different one."
          : authErrorMessage(error),
      );
      setBusy(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-serif text-title">Choose a new password</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <FormField
          label="New password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
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
            {busy ? "Saving…" : "Save password"}
          </button>
        </div>
      </form>
    </div>
  );
}
