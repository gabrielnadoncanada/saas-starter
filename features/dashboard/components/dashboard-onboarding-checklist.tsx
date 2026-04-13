import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  href: string;
};

export function DashboardOnboardingChecklist({
  items,
}: {
  items: ChecklistItem[];
}) {
  return (
    <ItemGroup className="gap-3">
      {items.map((item) => (
        <Item key={item.id} asChild variant="outline" size="sm">
          <Link href={item.href}>
            <ItemMedia variant="icon">
              {item.done ? (
                <CheckCircle2 className="size-4 text-primary" />
              ) : (
                <Circle className="size-4 text-muted-foreground" />
              )}
            </ItemMedia>
            <ItemContent>
              <ItemHeader>
                <ItemTitle>{item.title}</ItemTitle>
                <Badge variant={item.done ? "secondary" : "outline"}>
                  {item.done ? "Done" : "Open"}
                </Badge>
              </ItemHeader>
            </ItemContent>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  );
}
