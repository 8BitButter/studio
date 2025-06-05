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
  selectedDetails: z.array(z.string()).optional().describe('The details already selected by the user.'),
});
export type SuggestNextOptionsInput = z.infer<typeof SuggestNextOptionsInputSchema>;

const SuggestNextOptionsOutputSchema = z.object({
  suggestedOptions: z.array(z.string()).describe('The AI suggested options for the next step.'),
});
export type SuggestNextOptionsOutput = z.infer<typeof SuggestNextOptionsOutputSchema>;

export async function suggestNextOptions(input: SuggestNextOptionsInput): Promise<SuggestNextOptionsOutput> {
  return suggestNextOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextOptionsPrompt',
  input: {schema: SuggestNextOptionsInputSchema},
  output: {schema: SuggestNextOptionsOutputSchema},
  prompt: `Based on the user's current selections for building a prompt, suggest the next most appropriate options.

  Document Type: {{{documentType}}}
  {{#if primaryGoal}}
  Primary Goal: {{{primaryGoal}}}
  {{/if}}
  {{#if selectedDetails}}
  Selected Details: {{#each selectedDetails}}{{{this}}}, {{/each}}
  {{/if}}

  Suggest options that would logically follow from these selections. Be concise and only provide the names of the options.
  The response must be a JSON array of strings.
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
