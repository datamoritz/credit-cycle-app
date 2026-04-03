import { notFound } from "next/navigation";
import CardDetailClient from "@/components/cards/CardDetailClient";
import { getCards, getStatements, getStatementsByCardId } from "@/lib/loadData";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [cards, allStatements] = await Promise.all([getCards(), getStatements()]);
  const card = cards.find((c) => c.id === id);
  if (!card) notFound();

  const statements = getStatementsByCardId(allStatements, card.id);
  return <CardDetailClient card={card} statements={statements} />;
}
