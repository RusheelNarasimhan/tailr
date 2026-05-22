import { AuthError } from "@supabase/supabase-js";

export function formatAuthError(
  err: unknown,
  context: "signin" | "signup" | "oauth",
): string {
  if (err instanceof AuthError) {
    if (err.code === "email_not_confirmed") {
      return "Confirm your email first — check your inbox and spam folder, then sign in again.";
    }
    if (err.code === "user_already_exists") {
      return "This email is already registered. Sign in or use Forgot password below.";
    }
    if (
      context === "signin" &&
      (err.message === "Invalid login credentials" ||
        err.code === "invalid_credentials")
    ) {
      return "Wrong email or password. If you just signed up, confirm your email first. If you used magic link before, use Forgot password to set a password.";
    }
    if (context === "oauth") {
      return err.message || "Google sign-in failed. Try again or use email.";
    }
  }

  if (err instanceof Error) return err.message;
  return "Authentication failed.";
}
