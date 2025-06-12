
"use client";
import React, { useState, useMemo } from 'react';
import type { AppConfiguration, PromptFormData, DocumentField, DocumentType } from '@/lib/types'; // PrimaryGoal no longer needed directly from props
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import IconResolver from './IconResolver';
import { Lightbulb, Loader2, PlusCircle, Trash2, Info, RotateCcw } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PromptConstructorFormProps {
  config: AppConfiguration;
  formData: Omit<PromptFormData, 'primaryGoal'>; // formData no longer has primaryGoal
  updateFormData: (field: keyof Omit<PromptFormData, 'primaryGoal'>, value: any) => void;
  // availablePrimaryGoals: PrimaryGoal[]; // Removed
  availableDetails: DocumentField[];
  handleDetailToggle: (detailLabel: string) => void;
  addCustomDetail: (detail: string) => void;
  removeCustomDetail: (detail: string) => void;
  aiSuggestions: string[];
  isLoadingAiSuggestions: boolean;
  addAiSuggestionToDetails: (suggestion: string) => void;
  onReset: () => void;
  onFeatureCreatorOpen: () => void;
  deleteUserDefinedDocumentType: (docTypeId: string) => void; 
}

const SectionTooltip: React.FC<{text: string, children: React.ReactNode}> = ({ text, children }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center" className="max-w-xs">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


export function PromptConstructorForm({
  config,
  formData,
  updateFormData,
  // availablePrimaryGoals, // Removed
  availableDetails,
  handleDetailToggle,
  addCustomDetail,
  removeCustomDetail,
  aiSuggestions,
  isLoadingAiSuggestions,
  addAiSuggestionToDetails,
  onReset,
  onFeatureCreatorOpen,
  deleteUserDefinedDocumentType,
}: PromptConstructorFormProps) {
  const [customDetailInput, setCustomDetailInput] = useState('');

  const handleAddCustomDetail = () => {
    if (customDetailInput.trim()) {
      addCustomDetail(customDetailInput.trim());
      setCustomDetailInput('');
    }
  };
  
  const currentSelectedDocType = config.documentTypes.find(dt => dt.id === formData.documentType);

  const areAllSuggestedDetailsSelected = useMemo(() => {
    if (!availableDetails || availableDetails.length === 0) return false;
    const currentAvailableDetailLabels = availableDetails.map(d => d.label);
    return currentAvailableDetailLabels.every(label => formData.selectedDetails.includes(label));
  }, [availableDetails, formData.selectedDetails]);

  const handleSelectAllSuggestedToggle = () => {
    const currentAvailableDetailLabels = availableDetails.map(d => d.label);
    if (areAllSuggestedDetailsSelected) {
      const newSelectedDetails = formData.selectedDetails.filter(
        label => !currentAvailableDetailLabels.includes(label)
      );
      updateFormData('selectedDetails', newSelectedDetails);
    } else {
      const newSelectedDetails = Array.from(new Set([...formData.selectedDetails, ...currentAvailableDetailLabels]));
      updateFormData('selectedDetails', newSelectedDetails);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl md:text-2xl">Construct Your Prompt</CardTitle>
        <CardDescription>Follow these steps to build the perfect LLM prompt.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Document Type */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="documentType" className="text-base font-medium">Step 1: Select Document Type</Label>
            <SectionTooltip text="Choose the type of document you are working with. This helps tailor subsequent options.">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </SectionTooltip>
          </div>
          <Select value={formData.documentType} onValueChange={(value) => updateFormData('documentType', value)}>
            <SelectTrigger id="documentType" aria-label="Select Document Type">
              <SelectValue placeholder="Select a document type..." />
            </SelectTrigger>
            <SelectContent>
              {config.documentTypes.map(docType => (
                <SelectItem key={docType.id} value={docType.id}>
                  <div className="flex items-center space-x-2">
                    <IconResolver name={docType.iconName} fallback={LucideIcons.FileText} className="h-4 w-4 text-muted-foreground" />
                    <span>{docType.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentSelectedDocType && currentSelectedDocType.isUserDefined && formData.documentType && (
            <Button
              variant="destructive"
              onClick={() => deleteUserDefinedDocumentType(currentSelectedDocType.id)}
              className="mt-2 w-full sm:w-auto"
              aria-label={`Delete document type ${currentSelectedDocType.label}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete "{currentSelectedDocType.label}"
            </Button>
          )}
        </div>

        {/* Step 2: Detail Specification (was Step 3) */}
        {formData.documentType && availableDetails.length > 0 && ( // Show if a doc type is selected and details are available
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label className="text-base font-medium">Step 2: Specify Details to Extract</Label>
              <SectionTooltip text="Select common details or add your own custom fields for extraction.">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </SectionTooltip>
            </div>

            {availableDetails.length > 0 && (
              <>
                <div className="flex justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllSuggestedToggle}
                    className="mb-2"
                  >
                    {areAllSuggestedDetailsSelected ? 'Deselect All Suggested' : 'Select All Suggested'}
                  </Button>
                </div>
                <ScrollArea className="max-h-60 rounded-md border p-4">
                  <div className="space-y-3">
                    {availableDetails.map(detail => (
                      <div key={detail.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`detail-${detail.id}`}
                          checked={formData.selectedDetails.includes(detail.label)}
                          onCheckedChange={() => handleDetailToggle(detail.label)}
                        />
                        <Label htmlFor={`detail-${detail.id}`} className="font-normal cursor-pointer">{detail.label}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="customDetailInput" className="font-medium">Add Custom Detail:</Label>
              <div className="flex space-x-2">
                <Input
                  id="customDetailInput"
                  type="text"
                  placeholder="e.g., PO Number, VAT ID"
                  value={customDetailInput}
                  onChange={(e) => setCustomDetailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomDetail()}
                />
                <Button type="button" onClick={handleAddCustomDetail} variant="outline" size="icon" aria-label="Add custom detail">
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {formData.customDetails.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Your Custom Details:</Label>
                <ul className="space-y-1">
                {formData.customDetails.map(detail => (
                  <li key={detail} className="flex items-center justify-between text-sm bg-secondary p-2 rounded-md">
                    <span>{detail}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomDetail(detail)} aria-label={`Remove ${detail}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* AI Suggestions */}
        {/* Show if doc type is selected AND (details are selected OR custom details exist OR available details are present for context) */}
        {formData.documentType && (formData.selectedDetails.length > 0 || formData.customDetails.length > 0 || availableDetails.length > 0) && (
          <div className="space-y-3 pt-2">
            <Separator />
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-base">AI Suggestions for Next Details</h4>
               <SectionTooltip text="Based on your current selections, AI suggests these details might be relevant. Click to add.">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </SectionTooltip>
            </div>
            {isLoadingAiSuggestions ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading suggestions...</span>
              </div>
            ) : aiSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => addAiSuggestionToDetails(suggestion)}
                    className="bg-accent/20 hover:bg-accent/40 border-accent"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific suggestions right now, or all common ones selected.</p>
            )}
          </div>
        )}


        {/* Step 3: Output Format (was Step 4) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="outputFormat" className="text-base font-medium">Step 3: Choose Output Format</Label>
             <SectionTooltip text="How should the LLM structure its response?">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </SectionTooltip>
          </div>
          <Select value={formData.outputFormat} onValueChange={(value) => updateFormData('outputFormat', value)}>
            <SelectTrigger id="outputFormat" aria-label="Select Output Format">
              <SelectValue placeholder="Select an output format..." />
            </SelectTrigger>
            <SelectContent>
              {config.outputFormats.map(format => (
                <SelectItem key={format.id} value={format.id}>
                  <div className="flex items-center space-x-2">
                    <IconResolver name={format.iconName} fallback={LucideIcons.FileOutput} className="h-4 w-4 text-muted-foreground" />
                    <span>{format.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Step 4: Custom Instructions (was Step 5) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="customInstructions" className="text-base font-medium">Step 4: Add Custom Instructions (Optional)</Label>
            <SectionTooltip text="Provide any specific guidelines, exclusions, or clarifications for the LLM.">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </SectionTooltip>
          </div>
          <Textarea
            id="customInstructions"
            placeholder="e.g., Exclude tax details, focus on transactions above $100, summarize in French..."
            value={formData.customInstructions}
            onChange={(e) => updateFormData('customInstructions', e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
           <Button onClick={onFeatureCreatorOpen} variant="outline" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Document Type
          </Button>
          <Button onClick={onReset} variant="destructive" className="w-full sm:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Form
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
