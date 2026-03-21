import { Button } from "@/shared/components/ui/button";

type AuthEmailSummaryProps = {
  email: string;
  onChange: () => void;
};

export function AuthEmailSummary({ email, onChange }: AuthEmailSummaryProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Email</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-2 py-1 text-sm"
        onClick={onChange}
      >
        Change
      </Button>
    </div>
  );
}
