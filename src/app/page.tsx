
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
// LlmResponseDisplay removed
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { usePromptData } from '@/hooks/usePromptData';
import { AlertCircle, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

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
    // llmResponseText, // Removed
    // isLoadingLlmResponse, // Removed
    // triggerLlmExecution, // Removed
  } = usePromptData();

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  const generateButtonText = () => {
    if (isLoadingRefinement || isLoadingEngineering) return 'Engineering Prompt...';
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
                Use "Create New Document Type" to save custom workflows. If "Generate downloadable file content" is checked, the engineered prompt will be tailored to request file content from an LLM.
              </AlertDescription>
            </Alert>
             <Button 
              onClick={triggerPromptEngineeringProcess} 
              disabled={isLoadingRefinement || isLoadingEngineering} // isLoadingLlmResponse removed
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
                onCopy={() => copyToClipboard(aiEngineeredPrompt)} // Only one type of copy now
                isLoading={isLoadingRefinement || isLoadingEngineering}
                requestDownloadableFileContent={formData.requestDownloadableFileContent}
              />
            </section>
          )}

          {/* LLM Response Display Section Removed */}

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
