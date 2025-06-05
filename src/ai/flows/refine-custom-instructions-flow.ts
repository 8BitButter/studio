'use server';
/**
 * @fileOverview An AI agent that refines user-provided custom instructions.
 *
 * - refineCustomInstructionsFlow - A function that takes user's custom instructions and enhances them.
 * - RefineCustomInstructionsInput - The input type for the flow.
 * - RefineCustomInstructionsOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineCustomInstructionsInputSchema = z.object({
  originalInstructions: z.string().describe('The user-provided custom instructions for an LLM prompt.'),
});
export type RefineCustomInstructionsInput = z.infer<typeof RefineCustomInstructionsInputSchema>;

const RefineCustomInstructionsOutputSchema = z.object({
  refinedInstructions: z.string().describe('The AI-refined version of the custom instructions.'),
});
export type RefineCustomInstructionsOutput = z.infer<typeof RefineCustomInstructionsOutputSchema>;

export async function refineCustomInstructionsFlow(input: RefineCustomInstructionsInput): Promise<RefineCustomInstructionsOutput> {
  const prompt = ai.definePrompt({
    name: 'refineCustomInstructionsPrompt',
    input: {schema: RefineCustomInstructionsInputSchema},
    output: {schema: RefineCustomInstructionsOutputSchema},
    prompt: `You are an AI assistant that refines user-provided instructions for clarity and effectiveness when they are part of a larger prompt for another LLM.
Given the user's custom instructions below, rephrase or enhance them.
Maintain the original intent but make them more direct, concise, and actionable for an LLM.
Ensure the output strictly adheres to the JSON schema for refinedInstructions.

User Instructions:
{{{originalInstructions}}}
`,
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      ],
    },
  });

  const {output} = await prompt(input);
  if (!output) {
    throw new Error('Failed to get refined instructions from AI.');
  }
  return output;
}
