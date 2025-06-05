"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy, Loader2 } from 'lucide-react';

interface EngineeredPromptDisplayProps {
  engineeredPrompt: string;
  onCopy: () => void;
  isLoading: boolean;
}

export function EngineeredPromptDisplay({ engineeredPrompt, onCopy, isLoading }: EngineeredPromptDisplayProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline text-xl md:text-2xl">AI Engineered Prompt</CardTitle>
        <CardDescription>This is the AI-optimized version of your prompt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <ScrollArea className="h-96 rounded-md border bg-muted/20">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Engineering your prompt...</p>
            </div>
          ) : (
            <Textarea
              value={engineeredPrompt}
              readOnly
              className="h-full w-full resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-sm leading-relaxed"
              aria-label="AI Engineered Prompt"
              placeholder="Your AI-engineered prompt will appear here once generated..."
            />
          )}
        </ScrollArea>
        <Button onClick={onCopy} className="w-full transition-all duration-150 ease-in-out hover:shadow-md active:scale-95" disabled={isLoading || !engineeredPrompt}>
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Engineered Prompt
        </Button>
      </CardContent>
    </Card>
  );
}
