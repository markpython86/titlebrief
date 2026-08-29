import { FlowShell } from "@/components/FlowShell";
import { PageSkeleton } from "@/components/PageSkeleton";

export default function Loading() {
  return (
    <FlowShell>
      <PageSkeleton />
    </FlowShell>
  );
}
