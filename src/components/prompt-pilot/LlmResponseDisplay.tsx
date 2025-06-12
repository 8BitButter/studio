
"use client";
import type { PromptFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCopy, Loader2, Download, Terminal } from 'lucide-react';

interface LlmResponseDisplayProps {
  llmResponse: string;
  onCopy: () => void;
  isLoading: boolean;
  outputFormat: PromptFormData['outputFormat'];
}

export function LlmResponseDisplay({ llmResponse, onCopy, isLoading, outputFormat }: LlmResponseDisplayProps) {
  
  const getDownloadFilename = () => {
    switch (outputFormat) {
      case 'csv':
        return "llm_output.csv";
      case 'list':
      case 'bullets':
        return "llm_output.txt";
      default:
        return "llm_output.txt";
    }
  };

  const getMimeType = () => {
     switch (outputFormat) {
      case 'csv':
        return "text/csv;charset=utf-8;";
      default:
        return "text/plain;charset=utf-8;";
    }
  }

  const handleDownload = () => {
    if (!llmResponse) return;

    const filename = getDownloadFilename();
    const mimeType = getMimeType();
    const blob = new Blob([llmResponse], { type: mimeType });
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
            <Terminal className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-xl md:text-2xl">LLM Response</CardTitle>
        </div>
        <CardDescription>This is the direct response from the LLM after processing your document.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <ScrollArea className="h-96 rounded-md border bg-muted/20 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Waiting for LLM response...</p>
            </div>
          ) : llmResponse ? (
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed font-code">
              {llmResponse}
            </pre>
          ) : (
             <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">The LLM's response will appear here once executed...</p>
            </div>
          )}
        </ScrollArea>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={onCopy} 
            className="flex-1 transition-all duration-150 ease-in-out hover:shadow-md active:scale-95" 
            disabled={isLoading || !llmResponse}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" /> Copy Response
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="outline"
            className="flex-1 transition-all duration-150 ease-in-out hover:shadow-md active:scale-95" 
            disabled={isLoading || !llmResponse}
          >
            <Download className="mr-2 h-4 w-4" /> Download Response
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
