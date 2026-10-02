import Link from "next/link";

type TopBarProps = {
  title?: string; // the closet's name when logged in; CLOSET.ZIP otherwise
  children?: React.ReactNode;
};

// The thin top row: the closet's name (or the wordmark) on the left, linking
// home; anything else on the right. A long name is cut with ….
export default function TopBar({ title, children }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-rule px-4 py-3 md:px-8">
      <Link href="/" className="min-w-0 truncate text-label uppercase">
        {title ?? "Closet.zip"}
      </Link>
      {children && <div className="flex shrink-0 items-center gap-6">{children}</div>}
    </header>
  );
}
