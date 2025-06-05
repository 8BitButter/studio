"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy } from 'lucide-react';

interface LivePromptPreviewProps {
  generatedPrompt: string;
  onCopy: () => void;
}

export function LivePromptPreview({ generatedPrompt, onCopy }: LivePromptPreviewProps) {
  return (
    <Card className="shadow-lg sticky top-24"> {/* sticky top to keep it in view on scroll */}
      <CardHeader>
        <CardTitle className="font-headline text-xl md:text-2xl">Live Prompt Preview</CardTitle>
        <CardDescription>Your generated prompt will appear here in real-time.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[35rem] rounded-md border bg-muted/30">
          <Textarea
            value={generatedPrompt}
            readOnly
            className="h-full w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-sm leading-relaxed"
            aria-label="Generated Prompt"
            placeholder="Your prompt will be constructed here..."
          />
        </ScrollArea>
        <Button onClick={onCopy} className="w-full transition-all duration-150 ease-in-out hover:shadow-md active:scale-95">
          <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Prompt
        </Button>
      </CardContent>
    </Card>
  );
}
