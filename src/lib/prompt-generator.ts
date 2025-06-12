
import type { PromptFormData, AppConfiguration, DocumentType } from './types';

export function generatePrompt(
  formData: Omit<PromptFormData, 'primaryGoal'>, 
  config: AppConfiguration,
  customInstructionsOverride?: string
): string {
  const { documentType, selectedDetails, customDetails, outputFormat, requestDownloadableFileContent } = formData;

  const docTypeConfig = config.documentTypes.find(dt => dt.id === documentType);
  const docTypeLabel = docTypeConfig?.label || documentType;
  
  const firstPrimaryGoal = docTypeConfig?.primaryGoals?.[0];
  const goalLabel = firstPrimaryGoal?.label || "Extract relevant data from the document"; 

  const outputFormatLabel = config.outputFormats.find(of => of.id === outputFormat)?.label || outputFormat;
  const instructionsToUse = customInstructionsOverride !== undefined ? customInstructionsOverride : formData.customInstructions;

  let prompt = `You are an expert AI assistant.\n`;

  if (requestDownloadableFileContent) {
    prompt += `Your primary instruction is to generate and provide the content for a downloadable file.
This content should be based on a "${docTypeLabel}" document, with a focus on "${goalLabel}".
Your ENTIRE response MUST BE the file content itself, formatted as "${outputFormatLabel}".
Do NOT include any conversational text, introductions, explanations, or any text other than the raw file content. The output must be immediately ready to be saved as a file by the user.\n\n`;

    prompt += `### Specifications for the Downloadable File Content:\n\n`;
    prompt += `- **Source Document Type (for content generation):** ${docTypeLabel}\n`;
    prompt += `- **Core Objective for File Content:** ${goalLabel}\n\n`;

    prompt += `### Details to Include in the File:\n`;
    const allDetailsFile = [...selectedDetails, ...customDetails];
    if (allDetailsFile.length > 0) {
      allDetailsFile.forEach(detail => {
        prompt += `- ${detail}\n`;
      });
    } else {
      const suggestedDetailsFromFileGoal = firstPrimaryGoal?.suggestedDetails;
      if (suggestedDetailsFromFileGoal && suggestedDetailsFromFileGoal.length > 0) {
        prompt += `The file should comprehensively cover typical details for a "${goalLabel}" task on a "${docTypeLabel}". These include:\n`;
        suggestedDetailsFromFileGoal.forEach(detail => {
           prompt += `- ${detail.label}\n`;
        });
      } else {
         prompt += `- No specific details were pre-selected. Use your expert judgment based on the Core Objective ("${goalLabel}") and Document Type ("${docTypeLabel}") to identify and include all relevant information in the file content.\n`;
      }
    }

    prompt += `\n### Required Output Format for the File: ${outputFormatLabel}\n`;
    // Output format specific instructions (CSV, List, Bullets)
    if (outputFormat === 'csv') {
      prompt += `Provide the result in CSV (Comma Separated Values) format.
- **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Include in the File" listed above, in the same order. If no specific details were listed, use appropriate, descriptive headers based on the extracted information.
- **Data Rows:** Each subsequent line should represent a distinct record or item.
- **Field Order:** Maintain the order of fields in each row as listed in the "Details to Include in the File".
- **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.
- **Special Characters:** Ensure commas or newline characters within a data field are enclosed in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field should be escaped (e.g., \`"field with ""double quotes"""\`).
- **Example CSV Output Structure (illustrative):**
  \`\`\`csv
  ${allDetailsFile.length > 0 ? allDetailsFile.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetailsFile.length > 0 ? allDetailsFile.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
  \`\`\`
`;
    } else if (outputFormat === 'bullets') {
      prompt += `- Present the file content as a series of bullet points.
- Each key piece of information or extracted detail should ideally be a separate bullet.
- Use clear and concise language.
`;
    } else if (outputFormat === 'list') {
      prompt += `- Present the file content as a structured list of key-value pairs.
- Clearly label each extracted piece of information. Example:
  \`\`\`
  Invoice Number: INV-123
  Vendor Name: Acme Corp
  Total Amount: 100.00
  \`\`\`
- If multiple records are found, clearly separate them.
`;
    }

    prompt += `\n### General Formatting & Data Handling for the File:\n`;
    prompt += `- **Dates:** Format dates as YYYY-MM-DD unless explicitly stated otherwise in Custom Instructions.\n`;
    prompt += `- **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators unless required by Custom Instructions or the output format explicitly (CSV should be raw numbers).\n`;
    prompt += `- **Text Cleanup:** Strip unnecessary leading/trailing whitespace. Handle newlines within a field value appropriately for the chosen output format.\n`;
    prompt += `- **Multiple Records:** If multiple distinct records are relevant, represent each separately (e.g., new CSV row, new section in list/bullets).\n`;

    if (instructionsToUse && instructionsToUse.trim() !== '') {
      prompt += `\n### Special Instructions for Generating this File Content (User-Provided):\n`;
      prompt += `Follow these additional instructions carefully when generating the file content:\n${instructionsToUse}\n\n`;
    }

    prompt += `\n### Final Instructions for Downloadable File Content Generation:\n`;
    prompt += `Ensure all above specifications are met. The necessary context for generating the file content is assumed to be embedded within these instructions or known by you for the specified document type.
Remember: Your entire output must be the file content itself. Do not add any surrounding text or explanations.`;

  } else {
    // Standard prompt generation (not for direct file content)
    prompt += `Your main task is to meticulously process information based on the specifications below for a "${docTypeLabel}" document, with the goal of "${goalLabel}".\n\n`;

    prompt += `### 1. Document Context & Goal\n`;
    prompt += `- **Document Type Focus:** ${docTypeLabel}\n`;
    prompt += `- **Primary Goal:** ${goalLabel}\n`;

    prompt += `\n### 2. Details to Extract or Focus On\n`;
    prompt += `Based on the Primary Goal, focus on extracting the following details:\n`;
    const allDetailsStandard = [...selectedDetails, ...customDetails];
    if (allDetailsStandard.length > 0) {
      allDetailsStandard.forEach(detail => {
        prompt += `- ${detail}\n`;
      });
    } else {
      const suggestedDetailsFromGoalStd = firstPrimaryGoal?.suggestedDetails;
      if (suggestedDetailsFromGoalStd && suggestedDetailsFromGoalStd.length > 0) {
        prompt += `Refer to the typical details for a "${goalLabel}" task on a "${docTypeLabel}". These include:\n`;
        suggestedDetailsFromGoalStd.forEach(detail => {
           prompt += `- ${detail.label}\n`;
        });
      } else {
         prompt += `- No specific details were pre-selected. Use your expert judgment based on the Primary Goal ("${goalLabel}") and Document Type Focus ("${docTypeLabel}") to identify and extract relevant information.\n`;
      }
    }

    prompt += `\n### 3. Output Format: ${outputFormatLabel}\n`;
    if (outputFormat === 'csv') {
      prompt += `Provide the result in CSV (Comma Separated Values) format.
- **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Extract" listed above, in the same order. If no specific details were listed, use appropriate, descriptive headers based on the extracted information.
- **Data Rows:** Each subsequent line should represent a distinct record or item.
- **Field Order:** Maintain the order of fields in each row as listed in the "Details to Extract".
- **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.
- **Special Characters:** Ensure commas or newline characters within a data field are enclosed in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field should be escaped (e.g., \`"field with ""double quotes"""\`).
- **Example CSV Output Structure (illustrative):**
  \`\`\`csv
  ${allDetailsStandard.length > 0 ? allDetailsStandard.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetailsStandard.length > 0 ? allDetailsStandard.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
  \`\`\`
`;
    } else if (outputFormat === 'bullets') {
      prompt += `- Present information as a series of bullet points.
- Each key piece of information or extracted detail should ideally be a separate bullet.
- Use clear and concise language.
`;
    } else if (outputFormat === 'list') {
      prompt += `- Present information as a structured list of key-value pairs.
- Clearly label each extracted piece of information. Example:
  \`\`\`
  Invoice Number: INV-123
  Vendor Name: Acme Corp
  Total Amount: 100.00
  \`\`\`
- If multiple records are found, clearly separate them.
`;
    }

    prompt += `\n### 4. Formatting Rules & Handling Data\n`;
    prompt += `- **Dates:** Format dates as YYYY-MM-DD unless explicitly stated otherwise in Custom Instructions.\n`;
    prompt += `- **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators unless required by Custom Instructions or the output format explicitly (CSV should be raw numbers).\n`;
    prompt += `- **Text Cleanup:** Strip unnecessary leading/trailing whitespace. Handle newlines within a field value appropriately for the chosen output format.\n`;
    prompt += `- **Multiple Records:** If multiple distinct records are relevant, represent each separately (e.g., new CSV row, new section in list/bullets).\n`;

    let currentSectionNumber = 4;
    if (instructionsToUse && instructionsToUse.trim() !== '') {
      currentSectionNumber++;
      prompt += `\n### ${currentSectionNumber}. Special Instructions or Clarifications (User-Provided)\n`;
      prompt += `Follow these additional instructions carefully:\n${instructionsToUse}\n\n`;
    }

    currentSectionNumber++;
    prompt += `\n### ${currentSectionNumber}. Document for Processing\n`;
    prompt += `Please analyze the document content provided below and fulfill the request. Ensure accuracy and completeness based on the information available in the document.

[PASTE DOCUMENT TEXT HERE]
--- End of Document ---
`;
  }
  
  return prompt;
}
