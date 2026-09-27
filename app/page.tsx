import ClosetView from "@/components/ClosetView";
import { sampleItems } from "@/lib/sample-items";

// Homepage: the closet, using sample data until Milestone 5.
export default function Home() {
  return <ClosetView items={sampleItems} />;
}
