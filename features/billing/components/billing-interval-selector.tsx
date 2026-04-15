"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { BillingInterval } from "@/config/billing.config";
import { isBillingInterval } from "@/features/billing/plans";

export function BillingIntervalSelector({
  interval,
  annualEnabled,
  onValueChange,
}: {
  interval: BillingInterval;
  annualEnabled: boolean;
  onValueChange: (value: BillingInterval) => void;
}) {
  return (
    <FieldSet className="gap-3">
      <FieldLegend variant="label">Billing frequency</FieldLegend>

      <RadioGroup
        value={interval}
        onValueChange={(value) => {
          if (isBillingInterval(value)) {
            onValueChange(value);
          }
        }}
        className="grid gap-3 md:grid-cols-2"
      >
        <FieldLabel htmlFor="billing-interval-month">
          <Field orientation="horizontal">
            <RadioGroupItem value="month" id="billing-interval-month" />
            <FieldContent>
              <FieldTitle>Monthly</FieldTitle>
              <FieldDescription>Pay every month.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>

        <FieldLabel htmlFor="billing-interval-year">
          <Field orientation="horizontal">
            <RadioGroupItem
              value="year"
              id="billing-interval-year"
              disabled={!annualEnabled}
            />
            <FieldContent>
              <FieldTitle>Yearly</FieldTitle>
              <FieldDescription>
                {annualEnabled ? "Pay annually." : "No yearly price available."}
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      </RadioGroup>
    </FieldSet>
  );
}
