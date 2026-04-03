import { getCards, getStatements } from "@/lib/loadData";
import CardsClient from "@/components/cards/CardsClient";

export default async function CardsPage() {
  const [cards, statements] = await Promise.all([getCards(), getStatements()]);
  return <CardsClient cards={cards} statements={statements} />;
}
