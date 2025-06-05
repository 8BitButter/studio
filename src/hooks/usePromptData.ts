"use client";
import { useState, useEffect, useCallback } from 'react';
import type { AppConfiguration, DocumentType, PrimaryGoal, PromptFormData, DocumentField } from '@/lib/types';
import { initialAppConfig } from '@/lib/config';
import { generatePrompt } from '@/lib/prompt-generator';
import { suggestNextOptions as fetchAiSuggestions } from '@/ai/flows/context-aware-prompting';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'promptPilotUserConfig';

const defaultFormData: PromptFormData = {
  documentType: '',
  primaryGoal: '',
  selectedDetails: [],
  customDetails: [],
  outputFormat: '',
  customInstructions: '',
};

export function usePromptData() {
  const [appConfig, setAppConfig] = useState<AppConfiguration>(initialAppConfig);
  const [formData, setFormData] = useState<PromptFormData>(defaultFormData);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [availablePrimaryGoals, setAvailablePrimaryGoals] = useState<PrimaryGoal[]>([]);
  const [availableDetails, setAvailableDetails] = useState<DocumentField[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load user-defined document types from localStorage
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
            ],
          }));
        }
      }
    } catch (error) {
      console.error("Failed to load user config from localStorage:", error);
      toast({ title: "Error", description: "Could not load custom document types.", variant: "destructive" });
    }
  }, [toast]);

  const updateFormData = useCallback((field: keyof PromptFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  useEffect(() => {
    if (formData.documentType) {
      const selectedDoc = appConfig.documentTypes.find(dt => dt.id === formData.documentType);
      setAvailablePrimaryGoals(selectedDoc?.primaryGoals || []);
      if (selectedDoc && (!formData.primaryGoal || !selectedDoc.primaryGoals.find(pg => pg.id === formData.primaryGoal))) {
         updateFormData('primaryGoal', ''); // Reset if current goal not in new type
      }
      // Reset details when document type changes
      updateFormData('selectedDetails', []);
      updateFormData('customDetails', []);
    } else {
      setAvailablePrimaryGoals([]);
      updateFormData('primaryGoal', '');
    }
  }, [formData.documentType, appConfig.documentTypes, updateFormData]);

  useEffect(() => {
    if (formData.primaryGoal && formData.documentType) {
      const selectedDoc = appConfig.documentTypes.find(dt => dt.id === formData.documentType);
      const selectedGoal = selectedDoc?.primaryGoals.find(pg => pg.id === formData.primaryGoal);
      setAvailableDetails(selectedGoal?.suggestedDetails || []);
      // Reset selected details if they are not part of the new goal's suggestions (optional, could also merge)
      // updateFormData('selectedDetails', []); 
    } else {
      setAvailableDetails([]);
    }
  }, [formData.primaryGoal, formData.documentType, appConfig.documentTypes, updateFormData]);


  // Generate prompt whenever formData changes
  useEffect(() => {
    setGeneratedPrompt(generatePrompt(formData, appConfig));
  }, [formData, appConfig]);

  // Fetch AI suggestions
  useEffect(() => {
    if (formData.documentType) {
      setIsLoadingAiSuggestions(true);
      const docTypeLabel = appConfig.documentTypes.find(dt => dt.id === formData.documentType)?.label || formData.documentType;
      const goalLabel = availablePrimaryGoals.find(g => g.id === formData.primaryGoal)?.label;
      
      fetchAiSuggestions({
        documentType: docTypeLabel,
        primaryGoal: goalLabel,
        selectedDetails: [...formData.selectedDetails, ...formData.customDetails],
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
  }, [formData.documentType, formData.primaryGoal, formData.selectedDetails, formData.customDetails, appConfig.documentTypes, availablePrimaryGoals, toast]);


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
        // Check if it's a known suggested detail for the current goal
        const isKnownSuggestedDetail = availableDetails.some(d => d.label === suggestion);
        if (isKnownSuggestedDetail) {
            handleDetailToggle(suggestion); // Add to selectedDetails
        } else {
            addCustomDetail(suggestion); // Add to customDetails
        }
        toast({ title: "Suggestion Added", description: `"${suggestion}" added to details.` });
    } else {
        toast({ title: "Already Added", description: `"${suggestion}" is already in your selected details.`, variant: "default" });
    }
  };


  const resetForm = () => {
    setFormData(defaultFormData);
    setAiSuggestions([]);
    toast({ title: "Form Reset", description: "All selections have been cleared." });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
      .then(() => toast({ title: "Prompt Copied!", description: "The generated prompt has been copied to your clipboard." }))
      .catch(err => {
        console.error("Failed to copy: ", err);
        toast({ title: "Copy Failed", description: "Could not copy prompt to clipboard.", variant: "destructive" });
      });
  };

  const addNewDocumentType = (newDocType: DocumentType) => {
    const updatedDocTypes = [...appConfig.documentTypes, { ...newDocType, isUserDefined: true }];
    setAppConfig(prevConfig => ({
      ...prevConfig,
      documentTypes: updatedDocTypes,
    }));
    // Save only user-defined types to localStorage
    const userDefinedTypes = updatedDocTypes.filter(dt => dt.isUserDefined);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDefinedTypes));
      toast({ title: "Feature Saved", description: `New document type "${newDocType.label}" has been added.` });
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      toast({ title: "Save Error", description: "Could not save the new document type.", variant: "destructive" });
    }
  };

  return {
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
  };
}
