import { formatPrice } from "@/lib/format";
import { conditionLabels, type Listing } from "@/lib/listing";

type ItemListingProps = {
  listing: Listing;
  username: string;
  contact?: string; // the owner's contact line, in their own words
};

// What a visitor sees about a piece for sale, in its details (Milestone
// 16c): the asking price and condition, the owner's note, and how to get in
// touch. Nothing about buyers is saved; the sale happens outside the app.
export default function ItemListing({ listing, username, contact }: ItemListingProps) {
  return (
    <section className="mt-8">
      <h3 className="text-label text-stone uppercase">For sale</h3>
      <p className="mt-2">
        {formatPrice(listing.askingPrice)} · {conditionLabels[listing.condition]}
      </p>
      {listing.note && <p className="mt-1 text-stone">{listing.note}</p>}
      <p className="mt-4 border-t border-rule pt-4">{contact ? `To buy: ${contact}` : `Ask @${username} how to buy it.`}</p>
    </section>
  );
}
