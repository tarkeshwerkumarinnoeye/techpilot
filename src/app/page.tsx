import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={props.searchParams} />
    </Suspense>
  );
}
