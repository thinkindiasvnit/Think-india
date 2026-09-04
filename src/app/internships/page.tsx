import type { Metadata } from "next";
import HeroSequence from "../../components/internship/HeroSequence";
import InstitutionShowcase2D from "../../components/internship/InstitutionShowcase2D";
import FinalCTA, {
  InternshipDiaries,
  ApplicationProcess,
} from "../../components/internship/FinalCTA";

export const metadata: Metadata = {
  title: "Think India Internship Experience | Turn Curiosity Into Impact",
  description:
    "Apply to the Think India Internship Experience — ANUBHOOTI, VIDHI, NITI, SANSADIYA, SAMVAD, SHURUAT, and DEEKSHA. 340+ interns. 45+ partner institutes. 7 programs.",
  openGraph: {
    title: "Think India Internship Experience",
    description:
      "7 programs. 45+ institutes. 340+ interns. Your next experience starts here.",
    type: "website",
  },
};

export default function InternshipPage() {
  return (
    <div className="bg-[#FFF8E7] min-h-screen">
      {/* 1. Normal Welcome + 2. Typewriter Experience + 3. Curiosity */}
      <HeroSequence />

      {/* 4 & 5. Mentorship at Premier Institutes (2D Mathematical Orbit) */}
      <InstitutionShowcase2D />

      {/* Voices From The Field (existing) */}
      <InternshipDiaries />

      {/* How It Works (existing) */}
      <ApplicationProcess />

      {/* Final Apply Now (existing) */}
      <FinalCTA />
    </div>
  );
}
