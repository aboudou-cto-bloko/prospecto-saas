import { type LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline py-16 text-center">
      <div className="rounded-full bg-surface-2 p-4">
        <Icon className="h-6 w-6 text-ink-tertiary" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-ink">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-ink-subtle">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
