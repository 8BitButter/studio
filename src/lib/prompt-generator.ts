
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
    // Fallback headers if no details are specified at all.
    // This should ideally be based on document type if possible, but for a generic fallback:
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
  formData: Omit<PromptFormData, 'primaryGoal'>,
  config: AppConfiguration,
  customInstructionsOverride?: string
): string {
  const { documentType, selectedDetails, customDetails, outputFormat, requestDownloadableFileContent } = formData;

  const docTypeConfig = config.documentTypes.find(dt => dt.id === documentType);
  const docTypeLabel = docTypeConfig?.label || documentType;
  
  const firstPrimaryGoal = docTypeConfig?.primaryGoals?.[0];
  const goalLabel = firstPrimaryGoal?.label || "Extract relevant data from the document";
  const fallbackSuggestedDetails = firstPrimaryGoal?.suggestedDetails;

  const outputFormatConfig = config.outputFormats.find(of => of.id === outputFormat);
  const outputFormatLabel = outputFormatConfig?.label || outputFormat;
  const outputFormatId = outputFormatConfig?.id || outputFormat;

  const instructionsToUse = customInstructionsOverride !== undefined ? customInstructionsOverride : formData.customInstructions;
  const fileExtension = outputFormatId === 'csv' ? 'csv' : 'txt';

  const finalDetailsList = getDetailsList(selectedDetails, customDetails, fallbackSuggestedDetails);

  // --- Prompt Generation Logic ---

  if (requestDownloadableFileContent) {
    // SCENARIO: GENERATE DOWNLOADABLE FILE CONTENT
    let prompt = ``;
    prompt += `### Primary Mission: Generate Downloadable File Content ###\n`;
    prompt += `YOUR ABSOLUTE PRIMARY MISSION: Generate the complete, raw content for a downloadable ${outputFormatLabel.toUpperCase()} file.\n`;
    prompt += `This file content will be derived from a "${docTypeLabel}" document, with the core objective being "${goalLabel}".\n`;
    prompt += `YOUR ENTIRE RESPONSE MUST BE THIS FILE CONTENT. No introductions, no explanations, no apologies, no summaries, no conversational remarks.\n`;
    prompt += `The user will save your entire response directly as a .${fileExtension} file.\n\n`;

    prompt += `### Specifications for the Downloadable File Content ###\n\n`;

    prompt += `1.  **Source Document Type (Implied for Content Generation):** ${docTypeLabel}\n`;
    prompt += `2.  **Core Objective for File Content:** ${goalLabel}\n\n`;

    prompt += `3.  **Details to Include in the File:**\n`;
    prompt += `    The following details must be extracted from the source and included in the downloadable file content:\n`;
    prompt += generateDetailBulletPoints(finalDetailsList, '    ');
    if (finalDetailsList.length === 0 && outputFormatId === 'csv') {
      prompt += `    Since no specific details were provided for CSV, you MUST generate appropriate column headers based on common data points for a "${docTypeLabel}" related to "${goalLabel}".\n`;
    }
    prompt += `\n`;
    
    prompt += `4.  **Structure and Formatting of the Downloadable File Content (Format: ${outputFormatLabel.toUpperCase()}):**\n`;

    if (outputFormatId === 'csv') {
      const csvHeaders = generateCsvHeaders(finalDetailsList);
      const csvExampleRow = generateCsvExampleRow(finalDetailsList);
      prompt += `    The downloadable file MUST be structured as CSV (Comma Separated Values). Adhere strictly to these CSV specifications:\n`;
      prompt += `    - **Header Row:** The first line of your output MUST be a header row. The column names and their order must be EXACTLY: \`${csvHeaders}\`\n`;
      prompt += `    - **Data Rows:** Each subsequent line after the header row represents a single record or item. Ensure data aligns with the headers.\n`;
      prompt += `    - **Field Order:** Maintain the exact column order as specified in the header row.\n`;
      prompt += `    - **Missing Data:** If a value for a specific detail/column is not found or is not applicable, leave the field blank but RETAIN THE COMMA. Example: \`value1,,value3\`.\n`;
      prompt += `    - **Special Characters:** Enclose commas or newline characters within a data field in double quotes (e.g., \`"field, with comma"\`). Double quotes within a field must be escaped by doubling them (e.g., \`"field with ""double quotes"""\`).\n`;
      prompt += `    - **Example CSV Structure (Headers MUST match your generated headers):\n`;
      prompt += `      \`\`\`csv\n`;
      prompt += `      ${csvHeaders}\n`;
      prompt += `      ${csvExampleRow}\n`;
      prompt += `      ...\n`;
      prompt += `      \`\`\`\n`;
    } else if (outputFormatId === 'list') {
      prompt += `    The downloadable file must be structured as a clear list of key-value pairs.\n`;
      prompt += `    - Clearly label each extracted piece of information (each item from "Details to Include in the File").\n`;
      prompt += `    - Example:\n`;
      prompt += `      \`\`\`\n`;
      prompt += `      Detail1 Label: Extracted value for Detail1\n`;
      prompt += `      Detail2 Label: Extracted value for Detail2\n`;
      prompt += `      ...\n`;
      prompt += `      \`\`\`\n`;
      prompt += `    - If multiple records/items are found, clearly separate them or group related key-value pairs per record.\n`;
    } else if (outputFormatId === 'bullets') {
      prompt += `    The downloadable file must be structured as a series of bullet points.\n`;
      prompt += `    - Each key piece of information or extracted detail (each item from "Details to Include in the File") should ideally be a separate bullet or sub-bullet.\n`;
      prompt += `    - Use clear and concise language.\n`;
      prompt += `    - Example:\n`;
      prompt += `      \`\`\`\n`;
      prompt += `      - Extracted value for Detail1\n`;
      prompt += `      - Extracted value for Detail2\n`;
      prompt += `        - Sub-point related to Detail2 if applicable\n`;
      prompt += `      ...\n`;
      prompt += `      \`\`\`\n`;
    }
    prompt += `\n`;

    prompt += `5.  **General Data Handling for the File Content:**\n`;
    prompt += `    - **Dates:** Format dates as YYYY-MM-DD (unless custom instructions specify otherwise).\n`;
    prompt += `    - **Amounts/Numbers:** Provide monetary values/numbers as raw numbers (e.g., 1234.50). Do not include currency symbols or thousands separators (unless custom instructions specify otherwise).\n`;
    prompt += `    - **Text Cleanup:** Strip unnecessary leading/trailing whitespace from all extracted text fields.\n`;
    prompt += `    - **Multiple Records/Items:** If the source implies multiple distinct records or items (e.g., line items in an invoice), ensure each is represented appropriately in the chosen file format (e.g., new CSV row, new section in list/bullets).\n\n`;

    prompt += `6.  **Special Instructions for Generating this File Content (User-Provided):**\n`;
    if (instructionsToUse && instructionsToUse.trim() !== '') {
      prompt += `    Follow these additional instructions meticulously when generating the file content:\n    ${instructionsToUse.replace(/\n/g, '\n    ')}\n\n`; // Indent user instructions
    } else {
      prompt += `    No additional custom instructions apply beyond these specifications.\n\n`;
    }

    prompt += `### Final Command for Downloadable File Content Generation ###\n`;
    prompt += `Generate the ${outputFormatLabel.toUpperCase()} file content now, adhering to all specifications (1-6).\n`;
    prompt += `Remember: Your entire output must be the raw file content. Nothing else.\n`;

    return prompt;

  } else {
    // SCENARIO: STANDARD PROMPT (FOR USER TO USE ELSEWHERE)
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
}
