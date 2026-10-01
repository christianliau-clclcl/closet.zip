import Link from "next/link";

// A logged-in closet with nothing in it yet (DESIGN.md "Empty state").
export default function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-serif text-title">Your archive is empty</h1>
      <p className="mt-4 text-stone">
        Add a photo of something you own. Every other detail is optional.
      </p>
      <Link href="/add" className="mt-8 bg-ink px-5 py-3 font-medium text-cell">
        Add your first piece
      </Link>
    </div>
  );
}
