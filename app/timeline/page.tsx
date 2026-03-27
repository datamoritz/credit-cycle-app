import { getCards } from "@/lib/loadData";
import { computeTimelineEvents } from "@/lib/computeEvents";
import TimelineClient from "@/components/timeline/TimelineClient";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const cards = await getCards();
  const events = computeTimelineEvents(cards);
  return <TimelineClient cards={cards} events={events} />;
}
