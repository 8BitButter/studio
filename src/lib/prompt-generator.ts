
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
    prompt += `Provide the result in CSV (Comma Separated Values) format.
- **Headers:** The first line MUST be a header row. The column names in the header should exactly match the "Details to Extract" listed above, in the same order. If no specific details were listed, use appropriate headers based on the extracted information.
- **Data Rows:** Each subsequent line should represent a distinct record or item found in the document.
- **Field Order:** Maintain the order of fields in each row as listed in the "Details to Extract".
- **Missing Data:** If a value for a specific detail is not found or is not applicable for a record, leave the field blank but RETAIN THE COMMA to ensure correct column alignment.
- **Example CSV Output Structure (illustrative, actual headers will depend on your "Details to Extract"):**
  \`\`\`csv
  ${allDetails.length > 0 ? allDetails.join(',') : (firstPrimaryGoal?.suggestedDetails?.map(d=>d.label).join(',') || 'Header1,Header2,Header3')}
  ${allDetails.length > 0 ? allDetails.map((_, i) => `record1_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=>`record1_val_for_${d.label.substring(0,5)}`).join(',') || 'record1_val1,record1_val2,record1_val3')}
  ${allDetails.length > 0 ? allDetails.map((_, i) => i === 1 ? '' : `record2_value_for_detail${i + 1}`).join(',') : (firstPrimaryGoal?.suggestedDetails?.map((d,i)=> i === 1 ? '' : `record2_val_for_${d.label.substring(0,5)}`).join(',') || 'record2_val1,,record2_val3')}
  \`\`\`
`;
  } else if (outputFormat === 'json') {
    const keysForExample = allDetails.length > 0 ? allDetails : (firstPrimaryGoal?.suggestedDetails?.map(d => d.label) || ['field_1', 'field_2', 'field_3']);
    const exampleRecord: { [key: string]: any } = {};
    keysForExample.forEach((detail, index) => {
        const key = toSnakeCase(detail);
        if (detail.toLowerCase().includes('amount') || detail.toLowerCase().includes('price') || detail.toLowerCase().includes('quantity') || detail.toLowerCase().includes('number')) {
            exampleRecord[key] = index === 1 && keysForExample.length > 1 ? null : 123.45;
        } else if (detail.toLowerCase().includes('date')) {
            exampleRecord[key] = index === 1 && keysForExample.length > 1 ? null : "YYYY-MM-DD";
        }
        else {
            exampleRecord[key] = index === 1 && keysForExample.length > 1 ? "" : `value_for_${key}`;
        }
    });
     const exampleJson = {
      [`extracted_${toSnakeCase(docTypeLabel || "items").replace(/s$/, "")}s`]: [
        exampleRecord,
        ...(keysForExample.length > 1 ? [{ ...exampleRecord, [toSnakeCase(keysForExample[0])]: `another_value_for_${toSnakeCase(keysForExample[0])}`, [toSnakeCase(keysForExample[1])]: keysForExample[1].toLowerCase().includes('amount') ? 678.90 : (keysForExample[1].toLowerCase().includes('date') ? "YYYY-MM-DD" : "") }] : [])
      ]
    };

    prompt += `Return the extracted results as a single JSON object.
- **Structure:** The JSON object should have a primary key (e.g., "extracted_records", or a key relevant to the document type like "${toSnakeCase(docTypeLabel || "items").replace(/s$/, "")}s"). The value of this key MUST be an array of JSON objects.
- **Array Elements:** Each JSON object within the array represents a distinct record or item found.
- **Object Keys:** Keys within each item object should be the snake_case version of the "Details to Extract" labels (e.g., "Invoice Number" becomes "invoice_number"). If no specific details were listed, use logical snake_case keys for the data you extract based on the document.
- **Missing/Empty Data:**
    - For missing textual data, use an empty string (\`""\`).
    - For missing numerical or date data where applicable, use \`null\`. If unsure, default to \`""\`.
- **Data Types:** Use appropriate JSON data types (string, number, boolean, array, object). Numbers should be actual numbers, not strings.
- **Always an Array:** The primary value (e.g., under "${toSnakeCase(docTypeLabel || "items").replace(/s$/, "")}s") must always be an array, even if only one item is found (array with one object) or no items are found (empty array \`[]\`).
- **Example JSON Output Structure (illustrative, actual keys and root key will depend on your "Details to Extract" and Document Type):**
  \`\`\`json
  ${JSON.stringify(exampleJson, null, 2)}
  \`\`\`
`;
  } else if (outputFormat === 'bullets') {
    prompt += `- Present information as a series of bullet points.
- Each key piece of information or extracted detail should ideally be a separate bullet or a clearly delineated part of a bullet point.
`;
  } else if (outputFormat === 'list') {
    prompt += `- Present information as a structured list.
- Clearly label each extracted piece of information.
`;
  } else if (outputFormat === 'paragraph') {
    prompt += `- Summarize the extracted information in a concise paragraph or series of paragraphs.
- Ensure the summary flows well and incorporates the key details requested.
`;
  } else if (outputFormat === 'markdown') {
    prompt += `- Present the extracted data as well-formatted Markdown.
- Use appropriate Markdown elements such as headings (#, ##), lists (-, *), tables (if multiple records with consistent fields are extracted), and bold text (**label**) for clarity.
- For single record extraction, a list of bolded labels followed by their values is suitable.
- **Example Markdown for a single record (illustrative):**
  \`\`\`markdown
  **Invoice Number:** INV-2023-001
  **Vendor Name:** ACME Corp
  **Total Amount:** 150.75
  \`\`\`
- **Example Markdown Table for multiple records (illustrative):**
  \`\`\`markdown
  | Item Description | Quantity | Unit Price |
  |------------------|----------|------------|
  | Widget A         | 2        | 10.00      |
  | Gadget B         | 1        | 25.50      |
  \`\`\`
`;
  } else if (outputFormat === 'html_table') {
    prompt += `- Generate a complete HTML table containing the extracted data.
- The table should include \`<table>\`, \`<thead>\`, \`<tbody>\`, \`<tr>\`, \`<th>\` (for headers), and \`<td>\` (for data cells) tags.
- Headers in the \`<thead>\` section should correspond to the "Details to Extract" or logical headers if none were specified.
- Each record or item found in the document should be a separate \`<tr>\` in the \`<tbody>\`.
- Ensure proper HTML escaping for any special characters within the data to prevent broken HTML.
- **Example HTML Table Output Structure (illustrative):**
  \`\`\`html
  <table>
    <thead>
      <tr>
        <th>Detail 1</th>
        <th>Detail 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Record1 Value1</td>
        <td>Record1 Value2</td>
      </tr>
      <tr>
        <td>Record2 Value1</td>
        <td>Record2 Value2</td>
      </tr>
    </tbody>
  </table>
  \`\`\`
`;
  }


  prompt += `\n### 4. Formatting Rules & Handling Data
- **Dates:** If extracting dates, format them as YYYY-MM-DD unless explicitly stated otherwise in the "Custom Instructions".
- **Amounts/Numbers:** If extracting monetary values or numerical data, provide them as raw numbers (e.g., 1234.50 or 1234). Do not include currency symbols (like $, €) or thousands separators (like commas in 1,234) unless required by "Custom Instructions".
- **Text Cleanup:** Strip any leading/trailing unnecessary whitespace from extracted text values. Ensure newlines within a field value are handled appropriately for the chosen output format (e.g., typically escaped or removed for CSV/JSON single line records, but might be preserved in paragraph or bulleted list outputs).
- **Multiple Records:** If the document appears to contain multiple distinct records or items relevant to the Primary Goal (e.g., multiple line items in an invoice, multiple transactions in a statement), ensure each is processed and represented separately according to the Output Format chosen (e.g., a new row in CSV, a new object in the JSON array, a new row in an HTML/Markdown table).

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
