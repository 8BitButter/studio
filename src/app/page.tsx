
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { usePromptData } from '@/hooks/usePromptData';
import { AlertCircle, Terminal, FileText, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


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
        <Tabs defaultValue="document" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="document">
              <FileText className="mr-2 h-5 w-5" /> Document Prompts
            </TabsTrigger>
            <TabsTrigger value="gmail">
              <Mail className="mr-2 h-5 w-5" /> Gmail Prompts
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="document">
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
                    Use "Create New Document Type" to save custom workflows for document processing. The engineered prompt will be tailored based on your selections.
                  </AlertDescription>
                </Alert>
                 <Button 
                  onClick={triggerPromptEngineeringProcess} 
                  disabled={isLoadingRefinement || isLoadingEngineering}
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
                    onCopy={() => copyToClipboard(aiEngineeredPrompt)}
                    isLoading={isLoadingRefinement || isLoadingEngineering}
                  />
                </section>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="gmail">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl md:text-2xl">Gmail Prompt Constructor</CardTitle>
                <CardDescription>
                  This section is under development. Soon you'll be able to construct specialized prompts for extracting information from Gmail using Gemini.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-muted rounded-lg p-8">
                  <Mail className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Functionality to create Gmail-specific prompts, define scenarios, and save client-specific templates is coming soon!
                  </p>
                </div>
                 <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle className="font-headline text-primary">Future Feature Spotlight</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                        Imagine prompts like: "Extract all invoice attachments from sender X for client Y received last month" or "Summarize email threads about 'Project Phoenix' for client Z."
                        You'll also be able to save and manage prompts tailored to specific clients.
                    </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
