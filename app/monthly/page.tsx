import { getCards, getStatements } from "@/lib/loadData";
import MonthlyClient from "@/components/monthly/MonthlyClient";

export const dynamic = "force-dynamic";

export default async function MonthlyPage() {
  try {
    const [cards, statements] = await Promise.all([getCards(), getStatements()]);
    return <MonthlyClient cards={cards} statements={statements} />;
  } catch (e) {
    console.error("[MonthlyPage] Failed to load data:", e);
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load data. Check BACKEND_URL and API_SECRET in Vercel.
      </div>
    );
  }
}
