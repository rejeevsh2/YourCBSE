import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  categoryTones,
  notificationIconFor,
  priorityLabels,
  priorityTones,
  relativeTime,
  type AppNotification,
} from "@/data/notification-center";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  item: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

/** One notification row: icon, title, description, time, status, priority, actions. */
export const NotificationCard = memo(function NotificationCard({
  item,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  const Icon = notificationIconFor(item.category);
  const unread = item.status === "unread";

  return (
    <article
      className={cn(
        "tile flex gap-3 p-4 transition-colors sm:gap-4 sm:p-5",
        unread && "border-primary/25 bg-accent/40",
      )}
      aria-label={`${item.category} notification`}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-2xl",
          categoryTones[item.category],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-sm font-bold">
            {item.title}
            {unread ? (
              <span className="ml-2 inline-block size-1.5 rounded-full bg-primary align-middle" aria-hidden="true" />
            ) : null}
          </h3>
          <Badge variant="secondary" className="rounded-full text-[10px]">
            {item.category}
          </Badge>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              priorityTones[item.priority],
            )}
          >
            {priorityLabels[item.priority]}
          </span>
          <span className="sr-only">{unread ? "Unread" : "Read"}</span>
        </div>

        <p className="text-sm text-muted-foreground">{item.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <time dateTime={item.createdAt} className="text-[11px] text-muted-foreground">
            {relativeTime(item.createdAt)}
          </time>
          <span aria-hidden="true" className="text-muted-foreground/50">
            ·
          </span>
          <Button asChild size="sm" variant="outline" className="h-8 rounded-2xl text-xs">
            <Link to={item.to} onClick={() => onMarkRead(item.id)}>
              <ExternalLink className="size-3.5" /> Open
            </Link>
          </Button>
          {unread ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-2xl text-xs"
              onClick={() => onMarkRead(item.id)}
            >
              <Check className="size-3.5" /> Mark as read
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Delete notification: ${item.title}`}
            className="h-8 rounded-2xl text-xs text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>
    </article>
  );
});
