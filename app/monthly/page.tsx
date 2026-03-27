import { getCards, getStatements } from "@/lib/loadData";
import MonthlyClient from "@/components/monthly/MonthlyClient";

export const dynamic = "force-dynamic";

export default async function MonthlyPage() {
  const [cards, statements] = await Promise.all([getCards(), getStatements()]);
  return <MonthlyClient cards={cards} statements={statements} />;
}
