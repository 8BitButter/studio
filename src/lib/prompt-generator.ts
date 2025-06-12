
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

  let prompt = `You are an expert AI assistant specializing in data extraction and analysis.
Your main task is to meticulously process the information based on the specifications below.
`;

  if (requestDownloadableFileContent) {
    prompt += `Your ENTIRE response MUST be the content of a file, formatted according to the "Output Format" specified. Do not include any explanatory text, preamble, or apologies before or after the file content itself. The context for generation is provided within this prompt.\n\n`;
  }

  prompt += `### 1. Document Context (Implied or from Custom Instructions)
- **Document Type Focus:** ${docTypeLabel}
- **Primary Goal:** ${goalLabel}

### 2. Details to Extract or Focus On
Based on the Primary Goal, focus on extracting the following details:
`;

  const allDetails = [...selectedDetails, ...customDetails];
  if (allDetails.length > 0) {
    allDetails.forEach(detail => {
      prompt += `- ${detail}\n`;
    });
  } else {
    const suggestedDetailsFromGoal = firstPrimaryGoal?.suggestedDetails;
    if (suggestedDetailsFromGoal && suggestedDetailsFromGoal.length > 0) {
      prompt += `Refer to the typical details for a "${goalLabel}" task on a "${docTypeLabel}". These include:\n`;
      suggestedDetailsFromGoal.forEach(detail => {
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
  ${allDetails.length > 0 ? allDetails.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetails.length > 0 ? allDetails.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
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


  prompt += `\n### 4. Formatting Rules & Handling Data
- **Dates:** Format dates as YYYY-MM-DD unless explicitly stated otherwise in Custom Instructions.
- **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators unless required by Custom Instructions or the output format explicitly (CSV should be raw numbers).
- **Text Cleanup:** Strip unnecessary leading/trailing whitespace. Handle newlines within a field value appropriately for the chosen output format.
- **Multiple Records:** If multiple distinct records are relevant, represent each separately (e.g., new CSV row, new section in list/bullets).
`;

  const sectionNumber = (instructionsToUse && instructionsToUse.trim() !== '') ? 5 : (requestDownloadableFileContent ? 4 : 5);
  // Section for custom instructions
  if (instructionsToUse && instructionsToUse.trim() !== '') {
    prompt += `\n### ${sectionNumber}. Special Instructions or Clarifications (User-Provided)
Follow these additional instructions carefully:
${instructionsToUse}

`;
  }

  // Final instruction regarding document content, only if not requesting downloadable file content
  if (!requestDownloadableFileContent) {
    prompt += `\n### ${instructionsToUse && instructionsToUse.trim() !== '' ? sectionNumber + 1 : sectionNumber}. Document for Processing\n`;
    prompt += `Please analyze the document content provided below and fulfill the request. Ensure accuracy and completeness based on the information available in the document.

[PASTE DOCUMENT TEXT HERE]
--- End of Document ---
`;
  } else {
     prompt += `\n### ${instructionsToUse && instructionsToUse.trim() !== '' ? sectionNumber +1 : sectionNumber}. Execution Context
Process this request based on the "Document Type Focus", "Primary Goal", "Details to Extract", "Output Format", and any "Special Instructions" provided above. The necessary context for generating the file content is assumed to be embedded within these instructions or known by you for the specified document type.
`;
  }
  
  return prompt;
}
