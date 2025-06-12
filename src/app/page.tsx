
"use client";
import React, { useState } from 'react';
import { Header } from '@/components/prompt-pilot/Header';
import { PromptConstructorForm } from '@/components/prompt-pilot/PromptConstructorForm';
import { EngineeredPromptDisplay } from '@/components/prompt-pilot/EngineeredPromptDisplay';
import { FeatureCreatorForm } from '@/components/prompt-pilot/FeatureCreatorForm';
import { GmailPromptConstructorForm } from '@/components/prompt-pilot/GmailPromptConstructorForm'; // New Import
import { usePromptData } from '@/hooks/usePromptData';
import { useGmailPromptData } from '@/hooks/useGmailPromptData'; // New Import
import { AlertCircle, Terminal, FileText, Mail, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialAppConfig } from '@/lib/config'; // Import appConfig for Gmail scenarios


export default function PromptPilotPage() {
  const {
    appConfig, // This appConfig from usePromptData includes documentTypes and outputFormats
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
    resetForm: resetDocumentForm,
    copyToClipboard,
    addNewDocumentType,
    deleteUserDefinedDocumentType,
    triggerPromptEngineeringProcess,
    isLoadingRefinement,
    isLoadingEngineering,
  } = usePromptData();

  const {
    selectedScenario,
    gmailFormData,
    generatedGmailPrompt,
    isLoadingGmailPrompt,
    handleScenarioChange,
    updateGmailFormData,
    triggerGmailPromptGeneration,
    resetGmailForm,
    copyGmailPromptToClipboard,
  } = useGmailPromptData(initialAppConfig.gmailScenarios); // Pass gmailScenarios here

  const [isFeatureCreatorOpen, setFeatureCreatorOpen] = useState(false);

  const generateDocButtonText = () => {
    if (isLoadingRefinement || isLoadingEngineering) return 'Engineering Document Prompt...';
    return 'Generate Engineered Document Prompt';
  }

  const generateGmailButtonText = () => {
    if (isLoadingGmailPrompt) return 'Generating Gmail Prompt...';
    return 'Generate Gmail Prompt';
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
                  onReset={resetDocumentForm}
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
                  {generateDocButtonText()}
                </Button>
              </section>

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
            <div className="flex flex-col gap-8 lg:gap-12 items-stretch">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-xl md:text-2xl flex items-center">
                    <Mail className="mr-3 h-6 w-6 text-primary" /> Gmail Prompt Constructor
                  </CardTitle>
                  <CardDescription>
                    Select a scenario and provide the necessary details to generate a specialized prompt for querying your Gmail inbox with Gemini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <GmailPromptConstructorForm
                    scenarios={initialAppConfig.gmailScenarios}
                    selectedScenario={selectedScenario}
                    formData={gmailFormData}
                    onScenarioChange={handleScenarioChange}
                    updateFormData={updateGmailFormData}
                    onReset={resetGmailForm}
                  />
                  {selectedScenario?.userGuide && (
                     <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground mt-4">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-headline text-primary">Scenario Guide: {selectedScenario.label}</AlertTitle>
                        <AlertDescription className="text-foreground/80">
                            {selectedScenario.userGuide}
                        </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    onClick={triggerGmailPromptGeneration} 
                    disabled={isLoadingGmailPrompt || !selectedScenario}
                    className="w-full py-3 text-base mt-4"
                  >
                    <Terminal className="mr-2 h-5 w-5" />
                    {generateGmailButtonText()}
                  </Button>
                </CardContent>
              </Card>

              {(generatedGmailPrompt || isLoadingGmailPrompt) && (
                <section id="gmail-engineered-prompt-display">
                  <EngineeredPromptDisplay
                    engineeredPrompt={generatedGmailPrompt}
                    onCopy={() => copyGmailPromptToClipboard(generatedGmailPrompt)}
                    isLoading={isLoadingGmailPrompt}
                    requestDownloadableFileContent={false} 
                  />
                </section>
              )}
                 <Alert variant="default" className="bg-accent/10 border-accent/30 text-accent-foreground">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertTitle className="font-headline text-accent">Important Note for Gmail Prompts</AlertTitle>
                    <AlertDescription className="text-foreground/80">
                        These generated prompts are designed to be used with AI models that have extensions or capabilities to access your Gmail data (like Gemini with the Gmail extension). Ensure you understand and consent to the data access implications when using such tools.
                        <br />
                        Future updates might include saving client-specific versions of these prompts.
                    </AlertDescription>
                </Alert>
            </div>
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


    