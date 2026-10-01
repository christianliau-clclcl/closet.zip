import Link from "next/link";

// The thin top row: wordmark on the left (links home), anything else on the right.
export default function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between border-b border-rule px-4 py-3 md:px-8">
      <Link href="/" className="text-label uppercase">
        Closet.zip
      </Link>
      {children && <div className="flex items-center gap-6">{children}</div>}
    </header>
  );
}
