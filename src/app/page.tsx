
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
import { LlmResponseDisplay } from '@/components/prompt-pilot/LlmResponseDisplay'; // New component
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { usePromptData } from '@/hooks/usePromptData';
import { AlertCircle, Terminal, FileText, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // For document input
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // For document input section
import { Label } from '@/components/ui/label';

export default function PromptPilotPage() {
  const {
    appConfig,
    formData,
    updateFormData,
    aiEngineeredPrompt,
    availableDetails,
    handleDetailToggle,
    addCustomDetail,
    removeCustomDetail,
    aiSuggestions,
    isLoadingAiSuggestions,
    addAiSuggestionToDetails,
    resetForm,
    copyToClipboard,
    addNewDocumentType,
    deleteUserDefinedDocumentType, 
    triggerPromptEngineeringProcess,
    isLoadingRefinement,
    isLoadingEngineering,
    documentContent, // New state from hook
    setDocumentContent, // New setter from hook
    llmResponseText, // New state from hook
    isLoadingLlmResponse, // New state from hook
    triggerLlmExecution, // New function from hook
  } = usePromptData();

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header appName="PromptPilot" />
      <main className="flex-grow container mx-auto p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:gap-12 items-stretch">
          {/* Section 1: Prompt Constructor Form */}
          <section id="prompt-constructor" className="space-y-8">
            <PromptConstructorForm
              config={appConfig}
              formData={formData}
              updateFormData={updateFormData}
              availableDetails={availableDetails}
              handleDetailToggle={handleDetailToggle}
              addCustomDetail={addCustomDetail}
              removeCustomDetail={removeCustomDetail}
              aiSuggestions={aiSuggestions}
              isLoadingAiSuggestions={isLoadingAiSuggestions}
              addAiSuggestionToDetails={addAiSuggestionToDetails}
              onReset={resetForm}
              onFeatureCreatorOpen={() => setFeatureCreatorOpen(true)}
              deleteUserDefinedDocumentType={deleteUserDefinedDocumentType} 
            />
            <Alert variant="default" className="bg-accent/10 border-accent/30 text-accent-foreground">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="font-headline text-accent">Pro Tip!</AlertTitle>
              <AlertDescription className="text-foreground/80">
                Use the "Create New Document Type" button to add your own custom document workflows to PromptPilot.
                Your creations are saved locally in your browser.
              </AlertDescription>
            </Alert>
             <Button 
              onClick={triggerPromptEngineeringProcess} 
              disabled={isLoadingRefinement || isLoadingEngineering || isLoadingLlmResponse}
              className="w-full py-3 text-base"
            >
              <Terminal className="mr-2 h-5 w-5" />
              {isLoadingRefinement || isLoadingEngineering ? 'Engineering Prompt...' : 'Generate Engineered Prompt'}
            </Button>
          </section>

          {/* Section 2: Engineered Prompt Display */}
          {(aiEngineeredPrompt || isLoadingRefinement || isLoadingEngineering) && (
            <section id="engineered-prompt-display">
              <EngineeredPromptDisplay
                engineeredPrompt={aiEngineeredPrompt}
                onCopy={() => copyToClipboard(aiEngineeredPrompt, 'Prompt')}
                isLoading={isLoadingRefinement || isLoadingEngineering}
              />
            </section>
          )}

          {/* Section 3: Document Input & Execute Button (New) */}
          {aiEngineeredPrompt && !isLoadingEngineering && !isLoadingRefinement && (
            <section id="document-input-section" className="space-y-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-xl md:text-2xl">Process Document</CardTitle>
                  </div>
                  <CardDescription>Paste the content of the document you want to process with the engineered prompt above.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="documentContentTextarea" className="font-medium">Document Content:</Label>
                    <Textarea
                      id="documentContentTextarea"
                      placeholder="Paste your document text here..."
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      rows={10}
                      className="resize-y min-h-[150px]"
                      disabled={isLoadingLlmResponse}
                    />
                  </div>
                  <Button
                    onClick={triggerLlmExecution}
                    disabled={isLoadingLlmResponse || !documentContent.trim()}
                    className="w-full mt-4 py-3 text-base"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {isLoadingLlmResponse ? 'Processing Document...' : 'Execute with Document'}
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}
          
          {/* Section 4: LLM Response Display (New) */}
          {(llmResponseText || isLoadingLlmResponse) && (
            <section id="llm-response-display">
              <LlmResponseDisplay
                llmResponse={llmResponseText}
                onCopy={() => copyToClipboard(llmResponseText, 'Response')}
                isLoading={isLoadingLlmResponse}
                outputFormat={formData.outputFormat}
              />
            </section>
          )}

        </div>
      </main>

      <FeatureCreatorForm
        isOpen={isFeatureCreatorOpen}
        onClose={() => setFeatureCreatorOpen(false)}
        onSave={addNewDocumentType}
      />
      
      <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-auto">
        © {new Date().getFullYear()} PromptPilot. Empowering your LLM interactions.
      </footer>
    </div>
  );
}
