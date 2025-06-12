
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
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
    availablePrimaryGoals,
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
    deleteUserDefinedDocumentType, // Added this
    triggerPromptEngineeringProcess,
    isLoadingRefinement,
    isLoadingEngineering,
  } = usePromptData();

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header appName="PromptPilot" />
      <main className="flex-grow container mx-auto p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:gap-12 items-stretch">
          <section id="prompt-constructor" className="space-y-8">
            <PromptConstructorForm
              config={appConfig}
              formData={formData}
              updateFormData={updateFormData}
              availablePrimaryGoals={availablePrimaryGoals}
              availableDetails={availableDetails}
              handleDetailToggle={handleDetailToggle}
              addCustomDetail={addCustomDetail}
              removeCustomDetail={removeCustomDetail}
              aiSuggestions={aiSuggestions}
              isLoadingAiSuggestions={isLoadingAiSuggestions}
              addAiSuggestionToDetails={addAiSuggestionToDetails}
              onReset={resetForm}
              onFeatureCreatorOpen={() => setFeatureCreatorOpen(true)}
              deleteUserDefinedDocumentType={deleteUserDefinedDocumentType} // Passed this down
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
              disabled={isLoadingRefinement || isLoadingEngineering}
              className="w-full py-3 text-base"
            >
              <Terminal className="mr-2 h-5 w-5" />
              {isLoadingRefinement || isLoadingEngineering ? 'Engineering Prompt...' : 'Generate Engineered Prompt'}
            </Button>
          </section>

          {(aiEngineeredPrompt || isLoadingRefinement || isLoadingEngineering) && (
            <section id="engineered-prompt-display">
              <EngineeredPromptDisplay
                engineeredPrompt={aiEngineeredPrompt}
                onCopy={copyToClipboard}
                isLoading={isLoadingRefinement || isLoadingEngineering}
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

