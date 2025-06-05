"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { LivePromptPreview } from '@/components/prompt-pilot/LivePromptPreview';
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { usePromptData } from '@/hooks/usePromptData';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PromptPilotPage() {
  const {
    appConfig,
    formData,
    updateFormData,
    generatedPrompt,
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
  } = usePromptData();

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header appName="PromptPilot" />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          <section id="prompt-constructor" className="space-y-6">
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
            />
             <Alert variant="default" className="bg-accent/10 border-accent/30">
              <AlertCircle className="h-4 w-4 text-accent" />
              <AlertTitle className="font-headline text-accent">Pro Tip!</AlertTitle>
              <AlertDescription>
                Use the "Create New Document Type" button to add your own custom document workflows to PromptPilot.
                Your creations are saved locally in your browser.
              </AlertDescription>
            </Alert>
          </section>

          <section id="prompt-preview" className="lg:sticky lg:top-24"> {/* Sticky for desktop */}
            <LivePromptPreview
              generatedPrompt={generatedPrompt}
              onCopy={copyToClipboard}
            />
          </section>
        </div>
      </main>

      <FeatureCreatorForm
        isOpen={isFeatureCreatorOpen}
        onClose={() => setFeatureCreatorOpen(false)}
        onSave={addNewDocumentType}
      />
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
        © {new Date().getFullYear()} PromptPilot. Empowering your LLM interactions.
      </footer>
    </div>
  );
}
