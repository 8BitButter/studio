
// src/ai/flows/context-aware-prompting.ts
'use server';

/**
 * @fileOverview An AI agent that provides context-aware prompt suggestions.
 *
 * - suggestNextOptions - A function that suggests the next most appropriate options for prompt construction.
 * - SuggestNextOptionsInput - The input type for the suggestNextOptions function.
 * - SuggestNextOptionsOutput - The return type for the suggestNextOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextOptionsInputSchema = z.object({
  documentType: z.string().describe('The type of document (e.g., Invoice, Bank Statement).'),
  primaryGoal: z.string().optional().describe('The primary goal (e.g., Extract Line Items).'),
  selectedDetails: z.array(z.string()).optional().describe('The standard details already selected by the user.'),
  selectedCustomDetails: z.array(z.string()).optional().describe('The custom details already added by the user.'),
});
export type SuggestNextOptionsInput = z.infer<typeof SuggestNextOptionsInputSchema>;

const SuggestNextOptionsOutputSchema = z.object({
  suggestedOptions: z.array(z.string()).describe('The AI suggested options for the next step. These should be concise labels for potential details to extract.'),
});
export type SuggestNextOptionsOutput = z.infer<typeof SuggestNextOptionsOutputSchema>;

export async function suggestNextOptions(input: SuggestNextOptionsInput): Promise<SuggestNextOptionsOutput> {
  return suggestNextOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextOptionsPrompt',
  input: {schema: SuggestNextOptionsInputSchema},
  output: {schema: SuggestNextOptionsOutputSchema},
  prompt: `Based on the user's current selections for building a prompt to extract information from a "{{documentType}}", suggest 3-5 concise options for additional details they might want to extract.
  The user's primary goal is "{{#if primaryGoal}}{{{primaryGoal}}}{{else}}not yet specified{{/if}}".
  
  They have already selected the following standard details (if any):
  {{#if selectedDetails}}
  {{#each selectedDetails}}- {{{this}}}\n{{/each}}
  {{else}}
  - None
  {{/if}}

  They have also added the following custom details (if any):
  {{#if selectedCustomDetails}}
  {{#each selectedCustomDetails}}- {{{this}}}\n{{/each}}
  {{else}}
  - None
  {{/if}}

  Consider the document type and primary goal. Suggest options that are distinct from what's already selected and are commonly relevant.
  Provide only the names of the suggested details as a JSON array of strings in the 'suggestedOptions' field. Do not suggest details already listed.
  Be concise. For example, if "Invoice Number" is already selected, do not suggest it again.
  If the user has selected "Vendor Name", "Invoice Date", and "Total Amount" for an "Invoice", you might suggest: ["Due Date", "Item Description", "Tax Amount"].
  `, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestNextOptionsFlow = ai.defineFlow(
  {
    name: 'suggestNextOptionsFlow',
    inputSchema: SuggestNextOptionsInputSchema,
    outputSchema: SuggestNextOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

