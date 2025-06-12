
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

  const outputFormatConfig = config.outputFormats.find(of => of.id === outputFormat);
  const outputFormatLabel = outputFormatConfig?.label || outputFormat;
  const outputFormatId = outputFormatConfig?.id || outputFormat;

  const instructionsToUse = customInstructionsOverride !== undefined ? customInstructionsOverride : formData.customInstructions;
  const fileExtension = outputFormatId === 'csv' ? 'csv' : (outputFormatId === 'list' || outputFormatId === 'bullets' ? 'txt' : 'txt');

  let prompt = ``;

  if (requestDownloadableFileContent) {
    prompt = `Your SOLE TASK for this request is to PROVIDE THE CONTENT FOR A DOWNLOADABLE ${outputFormatLabel.toUpperCase()} FILE.
ABSOLUTELY EVERYTHING in your response MUST BE the file content itself.
Do NOT include any other text: no explanations, no apologies, no summaries, no conversational remarks, nothing before or after the file content.
The user will take your entire output and save it directly as a .${fileExtension} file.

The file content should be based on extracting data from a "${docTypeLabel}" document with the core objective of "${goalLabel}".
All necessary context for generating this file content is assumed to be embedded within these instructions or known by you for the specified document type and objective.

### Specifications for the Downloadable File Content:

1.  **Source Document Type (for content generation):** ${docTypeLabel}
2.  **Core Objective for File Content:** ${goalLabel}

3.  **Details to Include in the File:**
    The following details must be extracted and included in the downloadable file:
`;
    const allDetailsFile = [...selectedDetails, ...customDetails];
    if (allDetailsFile.length > 0) {
      allDetailsFile.forEach(detail => {
        prompt += `    - ${detail}\n`;
      });
    } else {
      const suggestedDetailsFromFileGoal = firstPrimaryGoal?.suggestedDetails;
      if (suggestedDetailsFromFileGoal && suggestedDetailsFromFileGoal.length > 0) {
        prompt += `    As no specific details were pre-selected, comprehensively cover typical details for a "${goalLabel}" task on a "${docTypeLabel}". These include:\n`;
        suggestedDetailsFromFileGoal.forEach(detail => {
           prompt += `    - ${detail.label}\n`;
        });
      } else {
         prompt += `    - No specific details were pre-selected. Use your expert judgment based on the Core Objective ("${goalLabel}") and Document Type ("${docTypeLabel}") to identify and include all relevant information in the file content.\n`;
      }
    }

    prompt += `\n4.  **Structure of the Downloadable File Content (Format: ${outputFormatLabel}):**\n`;
    if (outputFormatId === 'csv') {
      prompt += `    The downloadable file must be structured as CSV (Comma Separated Values). Adhere strictly to these CSV specifications:
    - **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Include in the File" listed above, in the same order. If no specific details were listed, use appropriate, descriptive headers based on the extracted information.
    - **Data Rows:** Each subsequent line should represent a distinct record or item.
    - **Field Order:** Maintain the order of fields in each row as listed in the "Details to Include in the File".
    - **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.
    - **Special Characters:** Ensure commas or newline characters within a data field are enclosed in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field should be escaped (e.g., \`"field with ""double quotes"""\`).
    - **Example CSV Output Structure (illustrative, headers will match "Details to Include"):**
      \`\`\`csv
      ${allDetailsFile.length > 0 ? allDetailsFile.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
      ${allDetailsFile.length > 0 ? allDetailsFile.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
      \`\`\`
`;
    } else if (outputFormatId === 'bullets') {
      prompt += `    The downloadable file must be structured as a series of bullet points.
    - Each key piece of information or extracted detail should ideally be a separate bullet.
    - Use clear and concise language.
`;
    } else if (outputFormatId === 'list') {
      prompt += `    The downloadable file must be structured as a list of key-value pairs.
    - Clearly label each extracted piece of information. Example:
      \`\`\`
      Invoice Number: INV-123
      Vendor Name: Acme Corp
      Total Amount: 100.00
      \`\`\`
    - If multiple records are found, clearly separate them.
`;
    }

    prompt += `\n5.  **General Formatting & Data Handling for the File Content:**\n`;
    prompt += `    - **Dates:** Format dates as YYYY-MM-DD unless explicitly stated otherwise in Custom Instructions.\n`;
    prompt += `    - **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators unless required by Custom Instructions or the output format explicitly (CSV should be raw numbers).\n`;
    prompt += `    - **Text Cleanup:** Strip unnecessary leading/trailing whitespace. Handle newlines within a field value appropriately for the chosen output format.\n`;
    prompt += `    - **Multiple Records:** If multiple distinct records are relevant, represent each separately (e.g., new CSV row, new section in list/bullets).\n`;

    if (instructionsToUse && instructionsToUse.trim() !== '') {
      prompt += `\n6.  **Special Instructions for Generating this File Content (User-Provided):**\n`;
      prompt += `    Follow these additional instructions carefully when generating the file content:\n    ${instructionsToUse.replace(/\n/g, '\n    ')}\n`; // Indent user instructions
    }

    prompt += `\n### Final Instructions for Downloadable File Content Generation:\n`;
    prompt += `Ensure all above specifications (1-6) are met.
Remember: Your entire output must be the file content itself. Do not add any surrounding text or explanations.`;

  } else {
    // Standard prompt generation (not for direct file content)
    prompt += `You are an expert AI assistant.\n`;
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
    if (outputFormatId === 'csv') {
      prompt += `Provide the result in CSV (Comma Separated Values) format.
- **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Extract" listed above, in the same order. If no specific details were listed, use appropriate, descriptive headers based on the extracted information.
- **Data Rows:** Each subsequent line should represent a distinct record or item.
- **Field Order:** Maintain the order of fields in each row as listed in the "Details to Extract".
- **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.
- **Special Characters:** Ensure commas or newline characters within a data field are enclosed in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field should be escaped (e.g., \`"field with ""double quotes"""\`).
- **Example CSV Output Structure (illustrative, headers will match "Details to Extract"):**
  \`\`\`csv
  ${allDetailsStandard.length > 0 ? allDetailsStandard.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetailsStandard.length > 0 ? allDetailsStandard.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
  \`\`\`
`;
    } else if (outputFormatId === 'bullets') {
      prompt += `- Present information as a series of bullet points.
- Each key piece of information or extracted detail should ideally be a separate bullet.
- Use clear and concise language.
`;
    } else if (outputFormatId === 'list') {
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

