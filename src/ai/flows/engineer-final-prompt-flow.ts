'use server';
/**
 * @fileOverview An AI agent that engineers a raw prompt into an optimized final prompt.
 *
 * - engineerFinalPromptFlow - A function that takes a raw prompt and optimizes it.
 * - EngineerFinalPromptInput - The input type for the flow.
 * - EngineerFinalPromptOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EngineerFinalPromptInputSchema = z.object({
  rawPrompt: z.string().describe('The raw, structured prompt to be optimized.'),
});
export type EngineerFinalPromptInput = z.infer<typeof EngineerFinalPromptInputSchema>;

const EngineerFinalPromptOutputSchema = z.object({
  engineeredPrompt: z.string().describe('The AI-engineered, optimized version of the prompt.'),
});
export type EngineerFinalPromptOutput = z.infer<typeof EngineerFinalPromptOutputSchema>;

export async function engineerFinalPromptFlow(input: EngineerFinalPromptInput): Promise<EngineerFinalPromptOutput> {
  const prompt = ai.definePrompt({
    name: 'engineerFinalPromptPrompt',
    input: {schema: EngineerFinalPromptInputSchema},
    output: {schema: EngineerFinalPromptOutputSchema},
    prompt: `You are an AI assistant that optimizes prompts for other LLMs.
Given the 'raw prompt' below, which is already structured for an LLM, analyze it and re-engineer it for maximum clarity, effectiveness, and to elicit the best possible response.
You can restructure, rephrase, add or remove elements as long as the core request defined by 'Document Type', 'Primary Goal', and 'Details to Extract' (if present in the raw prompt) is preserved.
Ensure the final output is a ready-to-use prompt and strictly adheres to the JSON schema for engineeredPrompt.

Raw Prompt:
{{{rawPrompt}}}
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
    throw new Error('Failed to get engineered prompt from AI.');
  }
  return output;
}
