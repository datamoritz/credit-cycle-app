import { getCards, getStatements } from "@/lib/loadData";
import CardsClient from "@/components/cards/CardsClient";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  try {
    const [cards, statements] = await Promise.all([getCards(), getStatements()]);
    return <CardsClient cards={cards} statements={statements} />;
  } catch (e) {
    console.error("[CardsPage] Failed to load data:", e);
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load cards. Check that BACKEND_URL and API_SECRET are set correctly in Vercel, and that the backend is reachable.
      </div>
    );
  }
}
