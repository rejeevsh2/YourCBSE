import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreference } from "@/lib/notifications";

const groups: NotificationPreference["group"][] = ["Channels", "Learning", "Platform"];

/** Grouped notification preference switches. */
export function NotificationSettingsPanel({
  preferences,
  onToggle,
}: {
  preferences: NotificationPreference[];
  onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {groups.map((group) => {
        const items = preferences.filter((preference) => preference.group === group);
        if (items.length === 0) return null;

        return (
          <section key={group} className="tile space-y-4 p-5">
            <h2 className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              {group}
            </h2>
            <ul className="space-y-4">
              {items.map((preference) => (
                <li key={preference.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Label htmlFor={preference.id} className="text-sm font-medium">
                      {preference.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{preference.hint}</p>
                  </div>
                  <Switch
                    id={preference.id}
                    checked={preference.enabled}
                    onCheckedChange={(value) => onToggle(preference.id, value)}
                    aria-label={preference.label}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
