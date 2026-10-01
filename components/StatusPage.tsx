import Link from "next/link";
import TopBar from "@/components/TopBar";

type StatusPageProps = {
  title: string;
  message: string;
  children?: React.ReactNode; // extra actions, e.g. "Try again"
};

// A calm full page for "not found" and errors: the top bar, a Fraunces title,
// one line of mono text, and a way back to the closet.
export default function StatusPage({ title, message, children }: StatusPageProps) {
  return (
    <>
      <TopBar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="font-serif text-title">{title}</h1>
        <p className="mt-4 text-stone">{message}</p>
        <div className="mt-8 flex items-center gap-6">
          {children}
          <Link href="/" className="text-label uppercase underline underline-offset-4">
            Back to the closet
          </Link>
        </div>
      </main>
    </>
  );
}
