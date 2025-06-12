
import type { PromptFormData, AppConfiguration, DocumentType } from './types';

// Helper function to convert strings to snake_case
function toSnakeCase(str: string): string {
  return str
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters except underscore
    .toLowerCase();
}

export function generatePrompt(
  formData: Omit<PromptFormData, 'primaryGoal'>, // formData no longer contains primaryGoal directly
  config: AppConfiguration,
  customInstructionsOverride?: string
): string {
  const { documentType, selectedDetails, customDetails, outputFormat } = formData;

  const docTypeConfig = config.documentTypes.find(dt => dt.id === documentType);
  const docTypeLabel = docTypeConfig?.label || documentType;
  
  // Infer the goalLabel from the first primary goal of the selected document type
  const firstPrimaryGoal = docTypeConfig?.primaryGoals?.[0];
  const goalLabel = firstPrimaryGoal?.label || "Extract relevant data from the document"; // Fallback if no goals defined

  const outputFormatLabel = config.outputFormats.find(of => of.id === outputFormat)?.label || outputFormat;

  const instructionsToUse = customInstructionsOverride !== undefined ? customInstructionsOverride : formData.customInstructions;

  let prompt = `You are an expert AI assistant specializing in data extraction and analysis from documents.
Your main task is to meticulously process the provided document based on the specifications below.

### 1. Document Context
- **Document Type:** ${docTypeLabel}
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
    // If no specific details, refer to the inferred primary goal's suggested details (if any)
    const suggestedDetailsFromGoal = firstPrimaryGoal?.suggestedDetails;
    if (suggestedDetailsFromGoal && suggestedDetailsFromGoal.length > 0) {
      prompt += `Refer to the typical details for a "${goalLabel}" task on a "${docTypeLabel}". These include:\n`;
      suggestedDetailsFromGoal.forEach(detail => {
         prompt += `- ${detail.label}\n`;
      });
    } else {
       prompt += `- No specific details were pre-selected or automatically suggested. Use your expert judgment based on the Primary Goal ("${goalLabel}") and Document Type ("${docTypeLabel}") to identify and extract relevant information.\n`;
    }
  }

  prompt += `\n### 3. Output Format: ${outputFormatLabel}\n`;

  if (outputFormat === 'csv') {
    prompt += `Provide the result in CSV (Comma Separated Values) format. This format is suitable for import into spreadsheet software like Excel or accounting software like Tally.
- **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Extract" listed above, in the same order. If no specific details were listed, use appropriate, descriptive headers based on the extracted information.
- **Data Rows:** Each subsequent line should represent a distinct record or item found in the document.
- **Field Order:** Maintain the order of fields in each row as listed in the "Details to Extract".
- **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA to ensure correct column alignment. For example, \`value1,,value3\` if the second value is missing.
- **Special Characters:** Ensure that any commas or newline characters within a data field are properly handled for CSV format (e.g., by enclosing the field in double quotes: \`"field, with comma"\`). Double quotes within a field should be escaped (e.g., \`"field with ""double quotes"""\`).
- **Example CSV Output Structure (illustrative, actual headers will depend on your "Details to Extract"):**
  \`\`\`csv
  ${allDetails.length > 0 ? allDetails.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetails.length > 0 ? allDetails.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
  ${allDetails.length > 0 ? allDetails.map((_, i) => i === 1 ? '' : `record2_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=> i === 1 ? '' : `record2_val_for_${d.label.substring(0,5)}`).join(',') || 'record2_val1,,record2_val3')}
  \`\`\`
`;
  } else if (outputFormat === 'bullets') {
    prompt += `- Present information as a series of bullet points.
- Each key piece of information or extracted detail should ideally be a separate bullet or a clearly delineated part of a bullet point.
- Use clear and concise language.
`;
  } else if (outputFormat === 'list') {
    prompt += `- Present information as a structured list.
- Clearly label each extracted piece of information (Key-Value Pair style). For example:
  \`\`\`
  Invoice Number: INV-123
  Vendor Name: Acme Corp
  Total Amount: 100.00
  \`\`\`
- If multiple records are found, clearly separate them (e.g., with a blank line or a sub-heading for each record).
`;
  }


  prompt += `\n### 4. Formatting Rules & Handling Data
- **Dates:** If extracting dates, format them as YYYY-MM-DD unless explicitly stated otherwise in the "Custom Instructions".
- **Amounts/Numbers:** If extracting monetary values or numerical data, provide them as raw numbers (e.g., 1234.50 or 1234). Do not include currency symbols (like $, €) or thousands separators (like commas in 1,234) unless required by "Custom Instructions" or the output format explicitly (e.g. for human readable lists, currency symbols might be ok if specified in custom instructions, but for CSV, raw numbers are usually better).
- **Text Cleanup:** Strip any leading/trailing unnecessary whitespace from extracted text values. Ensure newlines within a field value are handled appropriately for the chosen output format (e.g., typically escaped or removed for CSV single line records, but might be preserved in bulleted list outputs).
- **Multiple Records:** If the document appears to contain multiple distinct records or items relevant to the Primary Goal (e.g., multiple line items in an invoice, multiple transactions in a statement), ensure each is processed and represented separately according to the Output Format chosen (e.g., a new row in CSV, a new distinct section in a list).

`;

  if (instructionsToUse && instructionsToUse.trim() !== '') {
    prompt += `### 5. Special Instructions or Clarifications (User-Provided)
Follow these additional instructions carefully:
${instructionsToUse}

`;
    prompt += `\n### 6. Document for Processing\n`;
  } else {
    prompt += `\n### 5. Document for Processing\n`;
  }

  prompt += `Please analyze the document content provided below and fulfill the request. Ensure accuracy and completeness based on the information available in the document.

[PASTE DOCUMENT TEXT HERE]
--- End of Document ---
`;

  return prompt;
}
