
"use client";
import React from 'react';
import type { GmailScenario, GmailScenarioInputField, GmailPromptFormData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import IconResolver from './IconResolver';
import * as LucideIcons from 'lucide-react';
import { RotateCcw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GmailPromptConstructorFormProps {
  scenarios: GmailScenario[];
  selectedScenario: GmailScenario | null;
  formData: GmailPromptFormData;
  onScenarioChange: (scenarioId: string) => void;
  updateFormData: (fieldId: string, value: any) => void;
  onReset: () => void;
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

export function GmailPromptConstructorForm({
  scenarios,
  selectedScenario,
  formData,
  onScenarioChange,
  updateFormData,
  onReset,
}: GmailPromptConstructorFormProps) {

  const renderInputField = (field: GmailScenarioInputField) => {
    const commonProps = {
      id: field.id,
      value: (formData[field.id] as string | number | undefined) ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
        // For select, the value comes directly, for others from e.target.value
        const value = typeof e === 'string' ? e : e.target.value;
        updateFormData(field.id, value);
      },
      className: "w-full",
      required: field.required,
    };

    switch (field.type) {
      case 'text':
        return <Input type="text" placeholder={field.placeholder} {...commonProps} />;
      case 'textarea':
        return <Textarea placeholder={field.placeholder} {...commonProps} rows={3} />;
      case 'select':
        return (
          <Select
            value={commonProps.value as string}
            onValueChange={(value) => updateFormData(field.id, value)}
            required={field.required}
          >
            <SelectTrigger id={field.id} aria-label={field.label}>
              <SelectValue placeholder={field.placeholder || "Select an option..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      // Add 'date' case later if needed
      default:
        return <Input type="text" placeholder={field.placeholder} {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Scenario */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="gmailScenario" className="text-base font-medium">Step 1: Select Gmail Scenario</Label>
          <SectionTooltip text="Choose a predefined scenario for common Gmail tasks. This will guide the prompt generation.">
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </SectionTooltip>
        </div>
        <Select value={selectedScenario?.id || ''} onValueChange={onScenarioChange}>
          <SelectTrigger id="gmailScenario" aria-label="Select Gmail Scenario">
            <SelectValue placeholder="Select a scenario..." />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map(scenario => (
              <SelectItem key={scenario.id} value={scenario.id}>
                <div className="flex items-center space-x-2">
                  <IconResolver name={scenario.iconName} fallback={LucideIcons.MailQuestion} className="h-4 w-4 text-muted-foreground" />
                  <span>{scenario.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedScenario && (
          <p className="text-sm text-muted-foreground mt-1 px-1">{selectedScenario.description}</p>
        )}
      </div>

      {/* Step 2: Provide Scenario Details */}
      {selectedScenario && selectedScenario.inputFields.length > 0 && (
        <div className="space-y-4">
           <div className="flex items-center space-x-2">
            <Label className="text-base font-medium">Step 2: Provide Scenario Details</Label>
            <SectionTooltip text="Fill in the required (and optional) details for the chosen scenario.">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </SectionTooltip>
          </div>
          {selectedScenario.inputFields.map(field => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id} className="font-normal">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderInputField(field)}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Custom Instructions (Optional) - Can be added if needed for Gmail */}
      {/* 
      <div className="space-y-2">
        <Label htmlFor="gmailCustomInstructions" className="text-base font-medium">Step 3: Add Custom Instructions (Optional)</Label>
        <Textarea
          id="gmailCustomInstructions"
          placeholder="e.g., Prioritize emails from the last 24 hours. Exclude drafts."
          // value={formData.customInstructions || ''} 
          // onChange={(e) => updateFormData('customInstructions', e.target.value)}
          rows={3}
        />
      </div>
      */}

      {selectedScenario && (
        <Button onClick={onReset} variant="outline" className="w-full sm:w-auto mt-4">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Gmail Form
        </Button>
      )}
    </div>
  );
}
