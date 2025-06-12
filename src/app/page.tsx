
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
import { LlmResponseDisplay } from '@/components/prompt-pilot/LlmResponseDisplay';
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { usePromptData } from '@/hooks/usePromptData';
import { AlertCircle, Terminal } from 'lucide-react'; // Removed FileText, Send
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea'; // No longer needed
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // No longer needed for document input
// import { Label } from '@/components/ui/label'; // No longer needed for document input

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
    // documentContent, // Removed
    // setDocumentContent, // Removed
    llmResponseText, 
    isLoadingLlmResponse, 
    // triggerLlmExecution, // No longer called directly from UI
  } = usePromptData();

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  const isGeneratingContent = formData.requestDownloadableFileContent && (isLoadingEngineering || isLoadingLlmResponse);
  const generateButtonText = () => {
    if (isLoadingRefinement || isLoadingEngineering) return 'Engineering Prompt...';
    if (isLoadingLlmResponse && formData.requestDownloadableFileContent) return 'Generating File Content...';
    if (formData.requestDownloadableFileContent) return 'Generate Engineered Prompt & File Content';
    return 'Generate Engineered Prompt';
  }

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
                Use "Create New Document Type" to save custom workflows. If "Generate downloadable file content" is checked, provide all necessary context for file generation in the custom instructions.
              </AlertDescription>
            </Alert>
             <Button 
              onClick={triggerPromptEngineeringProcess} 
              disabled={isLoadingRefinement || isLoadingEngineering || isLoadingLlmResponse}
              className="w-full py-3 text-base"
            >
              <Terminal className="mr-2 h-5 w-5" />
              {generateButtonText()}
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

          {/* Section 3: LLM Response Display (for file content) */}
          {/* This section now appears if LLM response (file content) exists or is loading */}
          {(llmResponseText || (formData.requestDownloadableFileContent && isLoadingLlmResponse)) && (
            <section id="llm-response-display">
              <LlmResponseDisplay
                llmResponse={llmResponseText}
                onCopy={() => copyToClipboard(llmResponseText, 'Response')}
                isLoading={isLoadingLlmResponse} //isLoadingLlmResponse
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
