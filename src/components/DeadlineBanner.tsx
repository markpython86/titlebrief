import { AlertTriangle, CalendarClock, CircleAlert } from "lucide-react";
import { DEADLINE_COPY } from "@/lib/sources";
import { deadlineTone, formatLongDate, titleDeadline, type DeadlineTone } from "@/lib/dates";
import { parseIsoDate } from "@/lib/dates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function toneCopy(tone: DeadlineTone, deadlineLabel: string): {
  variant: "ok" | "warn" | "destructive";
  title: string;
  icon: typeof CalendarClock;
} {
  if (tone === "past") {
    return {
      variant: "destructive",
      title: `Title-transfer deadline ${deadlineLabel} is past.`,
      icon: CircleAlert,
    };
  }
  if (tone === "warn") {
    return {
      variant: "warn",
      title: `Title-transfer deadline ${deadlineLabel} is within 7 days.`,
      icon: AlertTriangle,
    };
  }
  return {
    variant: "ok",
    title: `Title-transfer deadline ${deadlineLabel}.`,
    icon: CalendarClock,
  };
}

export function DeadlineBanner({
  purchaseDate,
  now,
}: {
  purchaseDate: string;
  now?: Date;
}) {
  const parsed = parseIsoDate(purchaseDate);
  if (!parsed) {
    return null;
  }
  const deadline = titleDeadline(parsed);
  const tone = deadlineTone(deadline, now);
  const label = formatLongDate(deadline);
  const copy = toneCopy(tone, label);
  const Icon = copy.icon;
  return (
    <Alert variant={copy.variant}>
      <AlertTitle className="flex items-center gap-2">
        <Icon className="size-4" aria-hidden />
        {copy.title}
      </AlertTitle>
      <AlertDescription>{DEADLINE_COPY}</AlertDescription>
    </Alert>
  );
}
