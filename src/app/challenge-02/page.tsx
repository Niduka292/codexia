import type { Metadata } from "next";
import { ChallengeDayTwoClient } from "@/components/ChallengeDayTwoClient";

export const metadata: Metadata = {
  title: "Day 02 Challenge | CODEXIA 2026",
  description: "Decode the C algorithmic challenge and crack the transmission key for CODEXIA 2026.",
};

export default function ChallengeDayTwoPage() {
  return <ChallengeDayTwoClient />;
}
