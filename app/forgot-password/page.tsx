import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import TopBar from "@/components/TopBar";

// "Forgot password?": request a reset link by email.
export default function ForgotPasswordPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-sm px-4 py-12 md:py-20">
        <ForgotPasswordForm />
      </main>
    </>
  );
}
