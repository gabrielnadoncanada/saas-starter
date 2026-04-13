import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/constants/routes";

type DashboardAiAssistantCardProps = {
  assistantConversationCount: number;
};

export function DashboardAiAssistantCard({
  assistantConversationCount,
}: DashboardAiAssistantCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>AI Assistant</CardDescription>
        <CardTitle className="text-2xl">
          {assistantConversationCount > 0 ? "In use" : "Ready"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {assistantConversationCount > 0
            ? `${assistantConversationCount} conversation${assistantConversationCount === 1 ? "" : "s"} in this workspace.`
            : "Open the assistant to start a conversation."}
        </p>
        <Badge variant="outline">
          {assistantConversationCount > 0
            ? "Active workspace usage"
            : "Included in your plan"}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="secondary">
          <Link href={routes.app.assistant}>
            Open assistant
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
