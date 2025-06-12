
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AppConfiguration, DocumentType, PromptFormData, DocumentField, ExecutePromptInput } from '@/lib/types';
import { initialAppConfig } from '@/lib/config';
import { generatePrompt } from '@/lib/prompt-generator';
import { suggestNextOptions as fetchAiSuggestions } from '@/ai/flows/context-aware-prompting';
import { refineCustomInstructionsFlow } from '@/ai/flows/refine-custom-instructions-flow';
import { engineerFinalPromptFlow } from '@/ai/flows/engineer-final-prompt-flow';
import { executePromptWithDocument as executePromptFlow } from '@/ai/flows/execute-prompt-flow';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'promptPilotUserConfig';

const defaultFormData: Omit<PromptFormData, 'primaryGoal'> & { primaryGoal?: string } = {
  documentType: '',
  selectedDetails: [],
  customDetails: [],
  outputFormat: '',
  customInstructions: '',
  requestDownloadableFileContent: false, // Initialized
};

export function usePromptData() {
  const [appConfig, setAppConfig] = useState<AppConfiguration>(initialAppConfig);
  const [formData, setFormData] = useState<Omit<PromptFormData, 'primaryGoal'>>(defaultFormData as Omit<PromptFormData, 'primaryGoal'>);
  
  const [aiEngineeredPrompt, setAiEngineeredPrompt] = useState<string>('');
  const [isLoadingRefinement, setIsLoadingRefinement] = useState<boolean>(false);
  const [isLoadingEngineering, setIsLoadingEngineering] = useState<boolean>(false);

  // const [documentContent, setDocumentContent] = useState<string>(''); // No longer used from UI
  const [llmResponseText, setLlmResponseText] = useState<string>(''); 
  const [isLoadingLlmResponse, setIsLoadingLlmResponse] = useState<boolean>(false); 

  const [availableDetails, setAvailableDetails] = useState<DocumentField[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUserConfigRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUserConfigRaw) {
        const userDefinedDocumentTypes: DocumentType[] = JSON.parse(storedUserConfigRaw);
        if (Array.isArray(userDefinedDocumentTypes) && userDefinedDocumentTypes.length > 0) {
          setAppConfig(prevConfig => ({
            ...prevConfig,
            documentTypes: [
              ...initialAppConfig.documentTypes,
              ...userDefinedDocumentTypes.map(dt => ({ ...dt, isUserDefined: true }))
            ].filter((dt, index, self) => index === self.findIndex(t => t.id === dt.id || t.label === dt.label)), 
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load user config from localStorage:", error);
      toast({ title: "Error", description: "Could not load custom document types.", variant: "destructive" });
    }
  }, [toast]);

  const updateFormData = useCallback((field: keyof Omit<PromptFormData, 'primaryGoal'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (formData.documentType) {
      const selectedDoc = appConfig.documentTypes.find(dt => dt.id === formData.documentType);
      const firstPrimaryGoal = selectedDoc?.primaryGoals?.[0];
      setAvailableDetails(firstPrimaryGoal?.suggestedDetails || []);
    } else {
      setAvailableDetails([]);
    }
  }, [formData.documentType, appConfig.documentTypes, updateFormData]);

  const serializedSelectedDetails = useMemo(() => JSON.stringify(formData.selectedDetails), [formData.selectedDetails]);
  const serializedCustomDetails = useMemo(() => JSON.stringify(formData.customDetails), [formData.customDetails]);

  useEffect(() => {
    if (formData.documentType) {
      setIsLoadingAiSuggestions(true);
      const selectedDoc = appConfig.documentTypes.find(dt => dt.id === formData.documentType);
      const docTypeLabel = selectedDoc?.label || formData.documentType;
      const firstPrimaryGoalLabel = selectedDoc?.primaryGoals?.[0]?.label;
      
      const currentSelectedDetails = formData.selectedDetails || [];
      const currentCustomDetails = formData.customDetails || [];

      fetchAiSuggestions({
        documentType: docTypeLabel,
        primaryGoal: firstPrimaryGoalLabel,
        selectedDetails: currentSelectedDetails, 
        selectedCustomDetails: currentCustomDetails,
      })
        .then(response => setAiSuggestions(response.suggestedOptions || []))
        .catch(error => {
          console.error("Error fetching AI suggestions:", error);
          toast({ title: "AI Suggestion Error", description: "Could not fetch AI suggestions.", variant: "destructive" });
          setAiSuggestions([]);
        })
        .finally(() => setIsLoadingAiSuggestions(false));
    } else {
      setAiSuggestions([]);
    }
  }, [
      formData.documentType,
      serializedSelectedDetails, 
      serializedCustomDetails,  
      appConfig.documentTypes, 
      toast,
      formData.selectedDetails, 
      formData.customDetails   
    ]);

  const executeEngineeredPromptForFileContent = useCallback(async (promptToExecute: string) => {
    setIsLoadingLlmResponse(true);
    setLlmResponseText('');

    try {
      const executionInput: ExecutePromptInput = {
        engineeredPrompt: promptToExecute,
      };
      const result = await executePromptFlow(executionInput);
      setLlmResponseText(result.llmResponseText);
      toast({ title: "File Content Generated", description: "The LLM has provided the file content. You can download it below." });
    } catch (error) {
      console.error("Error executing prompt for file content:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "LLM Execution Error", description: `Could not get file content from LLM: ${errorMessage}`, variant: "destructive" });
      setLlmResponseText(`Error getting file content: ${errorMessage}`);
    } finally {
      setIsLoadingLlmResponse(false);
    }
  }, [toast]);


  const triggerPromptEngineeringProcess = useCallback(async () => {
    if (!formData.documentType || !formData.outputFormat) {
      toast({
        title: "Missing Information",
        description: "Please select a Document Type and Output Format before generating.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingRefinement(true);
    setIsLoadingEngineering(true);
    setAiEngineeredPrompt(''); 
    setLlmResponseText(''); 

    let instructionsForBasePrompt = formData.customInstructions;

    try {
      if (formData.customInstructions && formData.customInstructions.trim() !== '') {
        const refinedResult = await refineCustomInstructionsFlow({ originalInstructions: formData.customInstructions });
        instructionsForBasePrompt = refinedResult.refinedInstructions;
        toast({ title: "Custom Instructions Refined", description: "AI has enhanced your custom instructions." });
      }
    } catch (error) {
      console.error("Error refining custom instructions:", error);
      toast({ title: "Refinement Error", description: "Could not refine custom instructions. Using original.", variant: "destructive" });
    } finally {
      setIsLoadingRefinement(false);
    }
    
    // Pass the full formData including requestDownloadableFileContent
    const basePrompt = generatePrompt(formData, appConfig, instructionsForBasePrompt);

    try {
      const finalEngineeredResult = await engineerFinalPromptFlow({ rawPrompt: basePrompt });
      setAiEngineeredPrompt(finalEngineeredResult.engineeredPrompt);

      if (formData.requestDownloadableFileContent) {
        toast({ title: "Prompt Engineered!", description: "Now attempting to generate file content..." });
        await executeEngineeredPromptForFileContent(finalEngineeredResult.engineeredPrompt);
      } else {
        toast({ title: "Prompt Engineered!", description: "AI has generated an optimized prompt." });
      }

    } catch (error) {
      console.error("Error engineering final prompt:", error);
      toast({ title: "Engineering Error", description: "Could not engineer the final prompt.", variant: "destructive" });
      setAiEngineeredPrompt("Error generating engineered prompt. Please try again.");
       if (formData.requestDownloadableFileContent) { // Ensure loading state is reset if engineering fails before execution
            setIsLoadingLlmResponse(false);
       }
    } finally {
      setIsLoadingEngineering(false);
      // setIsLoadingLlmResponse is handled by executeEngineeredPromptForFileContent
    }
  }, [formData, appConfig, toast, executeEngineeredPromptForFileContent]);
  
  // This function is no longer called directly from UI, but by triggerPromptEngineeringProcess
  const triggerLlmExecution = executeEngineeredPromptForFileContent;


  const handleDetailToggle = (detailLabel: string) => {
    const currentIndex = formData.selectedDetails.indexOf(detailLabel);
    const newSelectedDetails = [...formData.selectedDetails];
    if (currentIndex === -1) {
      newSelectedDetails.push(detailLabel);
    } else {
      newSelectedDetails.splice(currentIndex, 1);
    }
    updateFormData('selectedDetails', newSelectedDetails);
  };

  const addCustomDetail = (detail: string) => {
    if (detail.trim() && !formData.customDetails.includes(detail.trim()) && !formData.selectedDetails.includes(detail.trim())) {
      updateFormData('customDetails', [...formData.customDetails, detail.trim()]);
    }
  };

  const removeCustomDetail = (detailToRemove: string) => {
    updateFormData('customDetails', formData.customDetails.filter(detail => detail !== detailToRemove));
  };
  
  const addAiSuggestionToDetails = (suggestion: string) => {
    if (!formData.selectedDetails.includes(suggestion) && !formData.customDetails.includes(suggestion)) {
        const isKnownSuggestedDetail = availableDetails.some(d => d.label === suggestion);
        if (isKnownSuggestedDetail) {
            handleDetailToggle(suggestion); 
        } else {
            addCustomDetail(suggestion); 
        }
        toast({ title: "Suggestion Added", description: `"${suggestion}" added to details.` });
    } else {
        toast({ title: "Already Added", description: `"${suggestion}" is already in your selected details.`, variant: "default" });
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData as Omit<PromptFormData, 'primaryGoal'>);
    setAiSuggestions([]);
    setAiEngineeredPrompt('');
    // setDocumentContent(''); // No longer used from UI
    setLlmResponseText('');
    setIsLoadingRefinement(false);
    setIsLoadingEngineering(false);
    setIsLoadingLlmResponse(false);
    toast({ title: "Form Reset", description: "All selections have been cleared." });
  };

  const copyToClipboard = (textToCopy: string, type: 'Prompt' | 'Response') => {
    if (!textToCopy) {
      toast({ title: "Nothing to Copy", description: `Please generate a ${type.toLowerCase()} first.`, variant: "default" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: `${type} Copied!`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` }))
      .catch(err => {
        console.error(`Failed to copy ${type}: `, err);
        toast({ title: "Copy Failed", description: `Could not copy ${type.toLowerCase()} to clipboard.`, variant: "destructive" });
      });
  };

  const addNewDocumentType = (newDocType: DocumentType) => {
    const updatedDocTypes = [...appConfig.documentTypes.filter(dt => !dt.isUserDefined || dt.id !== newDocType.id), { ...newDocType, isUserDefined: true }];
    const uniqueDocTypes = updatedDocTypes.filter((dt, index, self) => index === self.findIndex(t => t.id === dt.id || t.label === dt.label));

    setAppConfig(prevConfig => ({
      ...prevConfig,
      documentTypes: uniqueDocTypes,
    }));
    const userDefinedTypes = uniqueDocTypes.filter(dt => dt.isUserDefined);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDefinedTypes));
      toast({ title: "Feature Saved", description: `New document type "${newDocType.label}" has been added/updated.` });
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      toast({ title: "Save Error", description: "Could not save the new document type.", variant: "destructive" });
    }
  };

  const deleteUserDefinedDocumentType = useCallback((docTypeIdToDelete: string) => {
    const docTypeToDelete = appConfig.documentTypes.find(dt => dt.id === docTypeIdToDelete);
    if (!docTypeToDelete || !docTypeToDelete.isUserDefined) {
      toast({ title: "Deletion Error", description: "Cannot delete pre-defined document types or type not found.", variant: "destructive" });
      return;
    }

    const newDocumentTypes = appConfig.documentTypes.filter(dt => dt.id !== docTypeIdToDelete);
    setAppConfig(prev => ({ ...prev, documentTypes: newDocumentTypes }));

    const userDefinedTypes = newDocumentTypes.filter(dt => dt.isUserDefined);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDefinedTypes));
      toast({ title: "Document Type Deleted", description: `"${docTypeToDelete.label}" has been removed.` });
    } catch (error) {
      console.error("Failed to update localStorage after deletion:", error);
      toast({ title: "Storage Error", description: "Could not update stored document types after deletion.", variant: "destructive" });
    }

    if (formData.documentType === docTypeIdToDelete) {
      updateFormData('documentType', '');
      updateFormData('selectedDetails', []);
      updateFormData('customDetails', []);
    }
  }, [appConfig.documentTypes, formData.documentType, toast, updateFormData]);

  return {
    appConfig,
    formData,
    updateFormData,
    aiEngineeredPrompt,
    isLoadingRefinement,
    isLoadingEngineering,
    triggerPromptEngineeringProcess,
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
    // documentContent, // No longer exposed as it's not managed via UI state
    // setDocumentContent, // No longer exposed
    llmResponseText,
    isLoadingLlmResponse,
    triggerLlmExecution, // This now refers to executeEngineeredPromptForFileContent
  };
}
