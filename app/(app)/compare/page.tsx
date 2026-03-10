export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import EmptyState from "@/components/shared/EmptyState";
import { getFiles } from "@/lib/data";
import CompareView from "@/components/compare/CompareView";

export default async function ComparePage() {
  const files = await getFiles();

  if (files.length < 2) {
    return (
      <>
        <Header title="Jämförelsevy" />
        <div className="p-6">
          <EmptyState
            title="Behöver minst 2 månader"
            description="Ladda upp data för fler månader för att använda jämförelsevyn."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Jämförelsevy" />
      <div className="p-6 space-y-6">
        <CompareView months={files.map((f) => f.month)} />
      </div>
    </>
  );
}
