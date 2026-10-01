import type { AuthError } from "@supabase/supabase-js";

// Turns Supabase's error codes into plain sentences for the login page.
export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match.";
    case "email_not_confirmed":
      return "Confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists.";
    case "weak_password":
      return "Choose a longer password: at least 8 characters.";
    case "email_address_invalid":
      return "That email address doesn't look right.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    default:
      return "Something went wrong. Try again.";
  }
}

// Messages shown at the top of the login page after an email link.
export const loginNotices = {
  confirmed: "Your email is confirmed. Log in to continue.",
  "link-expired":
    "That link has expired or was already used. Log in, or sign up again with the same email to get a new link.",
} as const;

export type LoginNotice = keyof typeof loginNotices;
