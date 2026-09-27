// Placeholder homepage until login arrives in Milestone 2.
export default function Home() {
  return (
    <>
      <header className="border-b border-rule px-4 py-3 md:px-8">
        <p className="text-label uppercase">Closet.zip</p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center md:px-8">
        <h1 className="font-serif text-title">A quiet archive</h1>
        <p className="mt-4 text-stone">
          Of the clothes you own and have owned.
          <br />
          Opening soon.
        </p>
      </main>
    </>
  );
}
