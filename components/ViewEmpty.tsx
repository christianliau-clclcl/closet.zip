// A view with nothing in it (as opposed to EmptyState, for a closet with no
// pieces at all): one quiet line in the middle of the page.
export default function ViewEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20 text-center">
      <p className="text-stone">{message}</p>
    </div>
  );
}
