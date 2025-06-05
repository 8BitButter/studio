import type { PromptFormData, DocumentType, PrimaryGoal, OutputFormat, AppConfiguration } from './types';

export function generatePrompt(formData: PromptFormData, config: AppConfiguration): string {
  const { documentType, primaryGoal, selectedDetails, customDetails, outputFormat, customInstructions } = formData;

  const docTypeLabel = config.documentTypes.find(dt => dt.id === documentType)?.label || documentType;
  const goalLabel = config.documentTypes.find(dt => dt.id === documentType)?.primaryGoals.find(pg => pg.id === primaryGoal)?.label || primaryGoal;
  const outputFormatLabel = config.outputFormats.find(of => of.id === outputFormat)?.label || outputFormat;

  let prompt = `You are an expert AI assistant tasked with processing a document. Your goal is to meticulously extract information and present it in a specific format.

Document Type: ${docTypeLabel}
Primary Goal: ${goalLabel}
`;

  const allDetails = [...selectedDetails, ...customDetails];
  if (allDetails.length > 0) {
    prompt += `\nDetails to Extract or Focus On:\n`;
    allDetails.forEach(detail => {
      prompt += `- ${detail}\n`;
    });
  } else {
    prompt += `\nNo specific details were pre-selected for extraction; use your best judgment based on the primary goal and document type.\n`;
  }

  prompt += `\nOutput Format Preference: ${outputFormatLabel}\n`;

  if (customInstructions) {
    prompt += `\nSpecial Instructions or Clarifications:\n${customInstructions}\n`;
  }

  prompt += `\nPlease analyze the document content provided below and fulfill the request.
Ensure accuracy and completeness based on the information available in the document.

[PASTE DOCUMENT TEXT HERE]
--- End of Document ---
`;

  return prompt;
}
