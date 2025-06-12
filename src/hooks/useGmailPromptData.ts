
"use client";
import { useState, useCallback, useMemo } from 'react';
import type { GmailScenario, GmailPromptFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// We'll need a Gmail-specific prompt generator later
// import { generateGmailPrompt as generatePrompt } from '@/lib/gmail-prompt-generator'; 

// Placeholder for Handlebars or similar templating
function compileTemplate(template: string, data: GmailPromptFormData): string {
  let compiled = template;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      // Basic replacement, Handlebars would be more robust
      compiled = compiled.replace(new RegExp(`{{\\s*#if ${key}\\s*}}([^]*?){{\\s*/if ${key}\\s*}}`, 'g'), 
        value ? `$1`.replace(new RegExp(`{{${key}}}`, 'g'), String(value)) : ''
      );
      compiled = compiled.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }
  // Clean up any unfulfilled #if blocks
  compiled = compiled.replace(new RegExp(`{{\\s*#if \\w+\\s*}}[^]*?{{\\s*/if \\w+\\s*}}`, 'g'), '');
  
  // Simple date range description for template
  if (data.dateRange) {
    let dateRangeDescription = '';
    if (data.dateRange === 'last7days') dateRangeDescription = 'the last 7 days';
    else if (data.dateRange === 'last30days') dateRangeDescription = 'the last 30 days';
    else if (data.dateRange === 'last90days') dateRangeDescription = 'the last 90 days';
    else if (data.dateRange === 'allTime') dateRangeDescription = 'all time';
    compiled = compiled.replace(new RegExp(`{{dateRangeDescription}}`, 'g'), dateRangeDescription);
  }


  return compiled;
}


export function useGmailPromptData(scenarios: GmailScenario[]) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [gmailFormData, setGmailFormData] = useState<GmailPromptFormData>({});
  const [generatedGmailPrompt, setGeneratedGmailPrompt] = useState<string>('');
  const [isLoadingGmailPrompt, setIsLoadingGmailPrompt] = useState<boolean>(false);
  const { toast } = useToast();

  const selectedScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId) || null;
  }, [selectedScenarioId, scenarios]);

  const handleScenarioChange = useCallback((scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const scenario = scenarios.find(s => s.id === scenarioId);
    const initialData: GmailPromptFormData = {};
    if (scenario) {
      scenario.inputFields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialData[field.id] = field.defaultValue;
        } else {
          // Keep undefined or set to empty string based on type for controlled components
           initialData[field.id] = field.type === 'select' ? '' : '';
        }
      });
    }
    setGmailFormData(initialData);
    setGeneratedGmailPrompt(''); // Reset prompt when scenario changes
  }, [scenarios]);

  const updateGmailFormData = useCallback((fieldId: string, value: any) => {
    setGmailFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);
  
  const resetGmailForm = useCallback(() => {
    setSelectedScenarioId(null);
    setGmailFormData({});
    setGeneratedGmailPrompt('');
    setIsLoadingGmailPrompt(false);
    toast({ title: "Gmail Form Reset", description: "Selections and inputs cleared." });
  }, [toast]);

  const triggerGmailPromptGeneration = useCallback(async () => {
    if (!selectedScenario) {
      toast({ title: "No Scenario Selected", description: "Please select a Gmail scenario first.", variant: "destructive" });
      return;
    }

    // Basic validation
    for (const field of selectedScenario.inputFields) {
      if (field.required && (gmailFormData[field.id] === undefined || gmailFormData[field.id] === '')) {
        toast({ title: "Missing Required Field", description: `Please fill in "${field.label}".`, variant: "destructive" });
        return;
      }
    }
    // Check if at least one optional field is filled for scenarios that rely on them
    if (selectedScenario.id === 'extractAttachments' || selectedScenario.id === 'summarizeEmails') {
        if (!gmailFormData.senderEmail && !gmailFormData.subjectKeywords) {
             toast({ title: "Missing Information", description: `For "${selectedScenario.label}", please provide either a Sender Email or Subject Keywords.`, variant: "destructive" });
            return;
        }
    }


    setIsLoadingGmailPrompt(true);
    setGeneratedGmailPrompt('');

    // Simulate AI prompt generation (replace with actual Genkit flow later)
    try {
      // For now, use a simple template compilation. Replace with a Genkit flow later.
      const promptText = compileTemplate(selectedScenario.basePromptTemplate, gmailFormData);
      
      // Simulating a Genkit flow for prompt engineering/refinement if needed
      // const engineeredResult = await engineerGmailPromptFlow({ rawPrompt: promptText, scenario: selectedScenario });
      // setGeneratedGmailPrompt(engineeredResult.engineeredPrompt);
      setGeneratedGmailPrompt(promptText); // For now, use the compiled template directly

      toast({ title: "Gmail Prompt Generated!", description: `Prompt for "${selectedScenario.label}" is ready.` });
    } catch (error) {
      console.error("Error generating Gmail prompt:", error);
      toast({ title: "Prompt Generation Error", description: "Could not generate the Gmail prompt.", variant: "destructive" });
      setGeneratedGmailPrompt("Error generating prompt. Please try again.");
    } finally {
      setIsLoadingGmailPrompt(false);
    }
  }, [selectedScenario, gmailFormData, toast]);

  const copyGmailPromptToClipboard = (textToCopy: string) => {
    if (!textToCopy) {
      toast({ title: "Nothing to Copy", description: "Please generate a Gmail prompt first.", variant: "default" });
      return;
    }
    navigator.clipboard.writeText(textToCopy)
      .then(() => toast({ title: "Gmail Prompt Copied!", description: "The prompt has been copied to your clipboard." }))
      .catch(err => {
        console.error("Failed to copy Gmail prompt:", err);
        toast({ title: "Copy Failed", description: "Could not copy prompt.", variant: "destructive" });
      });
  };

  return {
    selectedScenario,
    gmailFormData,
    generatedGmailPrompt,
    isLoadingGmailPrompt,
    handleScenarioChange,
    updateGmailFormData,
    triggerGmailPromptGeneration,
    resetGmailForm,
    copyGmailPromptToClipboard,
  };
}
