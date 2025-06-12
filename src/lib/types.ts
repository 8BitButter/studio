
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

export interface AppConfiguration {
  documentTypes: DocumentType[];
  outputFormats: OutputFormat[];
}

export interface PromptFormData {
  documentType: string;
  selectedDetails: string[];
  customDetails: string[]; // For user-added text input details
  outputFormat: string;
  customInstructions: string;
  requestDownloadableFileContent: boolean; // New field
}

// For the new execute prompt flow
export interface ExecutePromptInput {
  engineeredPrompt: string;
  // documentText: string; // Removed
}

export interface ExecutePromptOutput {
  llmResponseText: string;
}

