import { getCards } from "@/lib/loadData";
import { computeTimelineEvents } from "@/lib/computeEvents";
import TimelineClient from "@/components/timeline/TimelineClient";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  try {
    const cards = await getCards();
    const events = computeTimelineEvents(cards);
    return <TimelineClient cards={cards} events={events} />;
  } catch (e) {
    console.error("[TimelinePage] Failed to load data:", e);
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load data. Check BACKEND_URL and API_SECRET in Vercel.
      </div>
    );
  }
}
