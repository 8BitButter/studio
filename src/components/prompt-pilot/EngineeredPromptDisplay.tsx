
"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy, Loader2, Download, Wand2 } from 'lucide-react';

interface EngineeredPromptDisplayProps {
  engineeredPrompt: string;
  onCopy: () => void; // General copy function, text passed from parent
  isLoading: boolean;
}

export function EngineeredPromptDisplay({ engineeredPrompt, onCopy, isLoading }: EngineeredPromptDisplayProps) {
  const handleDownloadPrompt = () => { // Specific to downloading the prompt itself
    if (!engineeredPrompt) return;

    const filename = "engineered_prompt.txt";
    const blob = new Blob([engineeredPrompt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-xl md:text-2xl">AI Engineered Prompt</CardTitle>
        </div>
        <CardDescription>This is the AI-optimized version of your prompt. You can now provide document content below to execute it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <ScrollArea className="h-60 rounded-md border bg-muted/20 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Engineering your prompt...</p>
            </div>
          ) : engineeredPrompt ? (
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-code">
              {engineeredPrompt}
            </pre>
          ) : (
             <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Your AI-engineered prompt will appear here once generated...</p>
            </div>
          )}
        </ScrollArea>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onCopy} 
            className="flex-1 transition-all duration-150 ease-in-out hover:shadow-md active:scale-95" 
            disabled={isLoading || !engineeredPrompt}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Engineered Prompt
          </Button>
          <Button 
            onClick={handleDownloadPrompt} 
            variant="outline"
            className="flex-1 transition-all duration-150 ease-in-out hover:shadow-md active:scale-95" 
            disabled={isLoading || !engineeredPrompt}
          >
            <Download className="mr-2 h-4 w-4" /> Download This Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
