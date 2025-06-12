
import type { PromptFormData, AppConfiguration, DocumentField } from './types';

function getDetailsList(
  selectedDetails: string[],
  customDetails: string[],
  fallbackSuggestedDetails?: DocumentField[]
): string[] {
  const allDetails = [...selectedDetails, ...customDetails];
  if (allDetails.length > 0) {
    return allDetails;
  }
  if (fallbackSuggestedDetails && fallbackSuggestedDetails.length > 0) {
    return fallbackSuggestedDetails.map(d => d.label);
  }
  return [];
}

function generateDetailBulletPoints(details: string[], indent: string = '    '): string {
  if (details.length === 0) {
    return `${indent}- No specific details were pre-selected. Use your expert judgment based on the Core Objective and Document Type to identify and include all relevant information.\n`;
  }
  return details.map(detail => `${indent}- ${detail}\n`).join('');
}

function generateCsvHeaders(details: string[]): string {
  if (details.length === 0) {
    return 'DataPoint1,DataPoint2,DataPoint3,Description,Amount,Date';
  }
  return details.join(',');
}

function generateCsvExampleRow(details: string[]): string {
  if (details.length === 0) {
     return 'example_val1,example_val2,example_val3,Sample Description,100.00,2023-01-01';
  }
  return details.map((_, i) => `record1_value_for_detail${i + 1}`).join(',');
}


export function generatePrompt(
  formData: Omit<PromptFormData, 'primaryGoal'>, // Removed requestDownloadableFileContent from PromptFormData
  config: AppConfiguration,
  customInstructionsOverride?: string
): string {
  const { documentType, selectedDetails, customDetails, outputFormat } = formData;

  const docTypeConfig = config.documentTypes.find(dt => dt.id === documentType);
  const docTypeLabel = docTypeConfig?.label || documentType;
  
  const firstPrimaryGoal = docTypeConfig?.primaryGoals?.[0];
  const goalLabel = firstPrimaryGoal?.label || "Extract relevant data from the document";
  const fallbackSuggestedDetails = firstPrimaryGoal?.suggestedDetails;

  const outputFormatConfig = config.outputFormats.find(of => of.id === outputFormat);
  const outputFormatLabel = outputFormatConfig?.label || outputFormat;
  const outputFormatId = outputFormatConfig?.id || outputFormat;

  const instructionsToUse = customInstructionsOverride !== undefined ? customInstructionsOverride : formData.customInstructions;
  // const fileExtension = outputFormatId === 'csv' ? 'csv' : 'txt'; // No longer needed directly here

  const finalDetailsList = getDetailsList(selectedDetails, customDetails, fallbackSuggestedDetails);

  // --- Prompt Generation Logic ---
  // Always generate the "standard" prompt now.

  let prompt = ``;
  prompt += `### Role & Objective ###\n`;
  prompt += `You are an expert AI assistant tasked with processing a "${docTypeLabel}" document.\n`;
  prompt += `Your objective is to "${goalLabel}" and present the extracted information as specified below.\n\n`;

  prompt += `### Input Document Context ###\n`;
  prompt += `- **Document Type Focus:** ${docTypeLabel}\n`;
  prompt += `- **Document to be Processed:** The text content of the document will be provided after the "--- End of Prompt Specifications ---" marker.\n\n`;

  prompt += `### Core Task: Information Extraction ###\n`;
  prompt += `Based on your objective, extract the following details from the provided document text:\n`;
  prompt += generateDetailBulletPoints(finalDetailsList, '  ');
  if (finalDetailsList.length === 0 && outputFormatId === 'csv') {
      prompt += `  Since no specific details were provided for CSV, you MUST generate appropriate column headers based on common data points for a "${docTypeLabel}" related to "${goalLabel}".\n`;
  }
  prompt += `\n`;

  prompt += `### Output Specifications ###\n`;
  prompt += `- **Requested Output Format:** ${outputFormatLabel}\n`;
  
  if (outputFormatId === 'csv') {
    const csvHeaders = generateCsvHeaders(finalDetailsList);
    const csvExampleRow = generateCsvExampleRow(finalDetailsList);
    prompt += `- **CSV Formatting Rules:**\n`;
    prompt += `  - **Header Row:** The first line of your output MUST be a header row. The column names and their order must be EXACTLY: \`${csvHeaders}\`\n`;
    prompt += `  - **Data Rows:** Each subsequent line after the header row represents a single record or item. Ensure data aligns with the headers.\n`;
    prompt += `  - **Field Order:** Maintain the exact column order as specified in the header row.\n`;
    prompt += `  - **Missing Data:** If a value is not found or not applicable, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.\n`;
    prompt += `  - **Special Characters:** Enclose commas or newline characters in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field are escaped by doubling them (e.g., \`"field with ""double quotes"""\`).\n`;
    prompt += `  - **Example CSV Output Structure (Headers MUST match your generated headers):\n`;
    prompt += `    \`\`\`csv\n`;
    prompt += `    ${csvHeaders}\n`;
    prompt += `    ${csvExampleRow}\n`;
    prompt += `    ...\n`;
    prompt += `    \`\`\`\n`;
  } else if (outputFormatId === 'list') {
    prompt += `- **Structured List Formatting Rules:**\n`;
    prompt += `  - Present information as a clear list of key-value pairs.\n`;
    prompt += `  - Clearly label each extracted piece of information (each item from "Details to Extract").\n`;
    prompt += `  - Example:\n`;
    prompt += `    \`\`\`\n`;
    prompt += `    Detail1 Label: Extracted value for Detail1\n`;
    prompt += `    Detail2 Label: Extracted value for Detail2\n`;
    prompt += `    ...\n`;
    prompt += `    \`\`\`\n`;
    prompt += `  - If multiple records/items are found, clearly separate them or group related key-value pairs per record.\n`;
  } else if (outputFormatId === 'bullets') {
    prompt += `- **Bulleted Summary Formatting Rules:**\n`;
    prompt += `  - Present information as a series of bullet points.\n`;
    prompt += `  - Each key piece of information or extracted detail (each item from "Details to Extract") should ideally be a separate bullet or sub-bullet.\n`;
    prompt += `  - Use clear and concise language.\n`;
    prompt += `  - Example:\n`;
    prompt += `    \`\`\`\n`;
    prompt += `    - Extracted value for Detail1\n`;
    prompt += `    - Extracted value for Detail2\n`;
    prompt += `      - Sub-point related to Detail2 if applicable\n`;
    prompt += `    ...\n`;
    prompt += `    \`\`\`\n`;
  }
  prompt += `\n`;

  prompt += `- **General Data Handling Rules:**\n`;
  prompt += `  - **Dates:** Format dates as YYYY-MM-DD (unless custom instructions specify otherwise).\n`;
  prompt += `  - **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators (unless custom instructions specify otherwise).\n`;
  prompt += `  - **Text Cleanup:** Strip unnecessary leading/trailing whitespace from all extracted text fields.\n`;
  prompt += `  - **Multiple Records/Items:** If the source implies multiple distinct records or items, ensure each is represented appropriately in the chosen output format.\n\n`;

  prompt += `### Custom Instructions (User-Provided) ###\n`;
  if (instructionsToUse && instructionsToUse.trim() !== '') {
    prompt += `Follow these additional instructions precisely:\n${instructionsToUse.replace(/\n/g, '\n  ')}\n\n`; // Indent user instructions
  } else {
    prompt += `No additional custom instructions provided.\n\n`;
  }
  
  prompt += `### Document for Processing ###\n`;
  prompt += `Analyze the document text provided below (after "--- End of Prompt Specifications ---") and fulfill the request according to all specifications above.\n\n`;
  prompt += `--- End of Prompt Specifications ---\n\n`;
  prompt += `[PASTE DOCUMENT TEXT HERE]\n`;
  prompt += `--- End of Document ---`;

  return prompt;
}
