import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, disabled, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("relative rounded-md", className)}>
      <input
        ref={ref}
        type={showPassword ? "text" : "password"}
        disabled={disabled}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className="absolute end-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-md text-muted-foreground"
        onClick={() => setShowPassword((prev) => !prev)}
        tabIndex={-1}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </Button>
    </div>
  );
});
