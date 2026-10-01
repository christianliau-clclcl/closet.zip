// A view with nothing in it (as opposed to EmptyState, for a closet with no
// pieces at all): one quiet line in the middle of the page.
type ViewEmptyProps = {
  message: string;
  action?: { label: string; onClick: () => void }; // e.g. "Clear filters"
};

export default function ViewEmpty({ message, action }: ViewEmptyProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-stone">{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="cursor-pointer text-label uppercase underline underline-offset-4">
          {action.label}
        </button>
      )}
    </div>
  );
}
