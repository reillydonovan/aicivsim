import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import ResearchClient from "./client";

export const metadata: Metadata = {
  title: "Research Paper | AI Civilization Simulator",
  description: "Reclaiming the Future: AI Alignment, Societal Resilience, and Civilization Trajectories",
};

const TOC = [
  { id: "abstract", label: "Abstract" },
  { id: "s1", label: "1. Why This Matters" },
  { id: "s2", label: "2. Setting an Intent for AI" },
  { id: "s3", label: "3. Keeping Income Stable" },
  { id: "s3-1", label: "3.1 Civic Dividend Stack", sub: true },
  { id: "s3-2", label: "3.2 Transition OS", sub: true },
  { id: "s3-3", label: "3.3 Cooperative Ownership", sub: true },
  { id: "s3-4", label: "3.4 Care & Climate Jobs", sub: true },
  { id: "s4", label: "4. Climate & Biodiversity" },
  { id: "s5", label: "5. Mission Capital" },
  { id: "s6", label: "6. Software Architecture" },
  { id: "s7", label: "7. Kanban Snapshot" },
  { id: "s8", label: "8. Future State" },
  { id: "s9", label: "9. Transition Phases" },
  { id: "s10", label: "10. Executive Cheat Sheet" },
  { id: "s11", label: "11. Baseline Metrics" },
  { id: "s12", label: "12. Funding Stack" },
  { id: "s13", label: "13. Risk Matrix" },
  { id: "s14", label: "14. Proof Points" },
  { id: "s15", label: "15. Reader Pathways" },
  { id: "s16", label: "16. Appendices" },
  { id: "s17", label: "17. Feasibility" },
  { id: "s18", label: "18. Ten-Year Milestones" },
  { id: "s19", label: "19. Conclusion" },
  { id: "refs", label: "References" },
  { id: "related", label: "Continue reading" },
];

export default function ResearchPage() {
  const mdxPath = path.join(process.cwd(), "content", "research-paper.mdx");
  const source = fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, "utf-8") : "";

  return <ResearchClient toc={TOC} source={source} />;
}
