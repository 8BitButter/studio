
import type { LucideIcon } from 'lucide-react';

export interface DocumentField {
  id: string;
  label: string;
}

export interface PrimaryGoal {
  id: string;
  label: string;
  suggestedDetails: DocumentField[];
}

export interface DocumentType {
  id: string;
  label: string;
  iconName?: string; // Store icon name, resolve to component later
  primaryGoals: PrimaryGoal[];
  isUserDefined?: boolean;
}

export interface OutputFormat {
  id:string;
  label: string;
  iconName?: string; // Store icon name
}

// --- Gmail Scenario Types ---
export interface GmailScenarioInputField {
  id: string; // e.g., 'senderEmail', 'subjectKeywords'
  label: string; // e.g., 'Sender Email Address', 'Keywords in Subject'
  type: 'text' | 'select' | 'textarea'; // Can expand later (e.g., 'date', 'checkbox')
  placeholder?: string;
  options?: Array<{ value: string; label: string }>; // For 'select' type
  required?: boolean;
  defaultValue?: string;
}

export interface GmailScenario {
  id: string; // e.g., 'extractAttachmentsBySender'
  label: string; // e.g., 'Extract Attachments by Sender'
  description: string; // Brief explanation
  iconName?: string; // Lucide icon name
  inputFields: GmailScenarioInputField[];
  basePromptTemplate: string; // Template for the Gemini prompt
  userGuide?: string; // Optional guide for the user on how to best use this scenario or interpret results
}

export interface AppConfiguration {
  documentTypes: DocumentType[];
  outputFormats: OutputFormat[];
  gmailScenarios: GmailScenario[]; // Added for Gmail
}

export interface PromptFormData {
  documentType: string;
  selectedDetails: string[];
  customDetails: string[]; // For user-added text input details
  outputFormat: string;
  customInstructions: string;
}

// For the new execute prompt flow
export interface ExecutePromptInput {
  engineeredPrompt: string;
}

export interface ExecutePromptOutput {
  llmResponseText: string;
}

// For Gmail form data
export interface GmailPromptFormData {
  [key: string]: string | number | boolean | string[] | undefined; // Flexible for dynamic fields
}
