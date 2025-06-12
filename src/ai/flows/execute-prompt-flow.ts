
'use server';
/**
 * @fileOverview An AI agent that executes a given prompt with provided document text.
 *
 * - executePromptWithDocument - A function that takes an engineered prompt and document text,
 *   replaces a placeholder in the prompt with the document text, and gets a response from an LLM.
 * - ExecutePromptInput - The input type for the flow.
 * - ExecutePromptOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {ExecutePromptInput, ExecutePromptOutput} from '@/lib/types';

// Schemas are defined in lib/types.ts and imported, so we don't redefine them here.
// However, Genkit's defineFlow requires Zod schemas directly.
const ExecutePromptInputSchema = z.object({
  engineeredPrompt: z.string().describe("The fully engineered prompt to be sent to the LLM. It should contain a placeholder for document content."),
  documentText: z.string().describe("The text content of the document to be processed by the LLM."),
});

const ExecutePromptOutputSchema = z.object({
  llmResponseText: z.string().describe("The text response from the LLM after processing the document with the prompt."),
});

const PROMPT_DOCUMENT_PLACEHOLDER = "[PASTE DOCUMENT TEXT HERE]";

export async function executePromptWithDocument(input: ExecutePromptInput): Promise<ExecutePromptOutput> {
  return executePromptFlow(input);
}

const executePromptFlow = ai.defineFlow(
  {
    name: 'executePromptFlow',
    inputSchema: ExecutePromptInputSchema,
    outputSchema: ExecutePromptOutputSchema,
  },
  async (input: ExecutePromptInput) => {
    if (!input.engineeredPrompt.includes(PROMPT_DOCUMENT_PLACEHOLDER)) {
      throw new Error(`Engineered prompt does not contain the required placeholder: ${PROMPT_DOCUMENT_PLACEHOLDER}`);
    }

    const finalPromptForLlm = input.engineeredPrompt.replace(PROMPT_DOCUMENT_PLACEHOLDER, input.documentText);

    const { text } = await ai.generate({
      prompt: finalPromptForLlm,
      config: {
        // Using default safety settings from the model configuration in genkit.ts
        // Add specific safety settings here if needed for this flow
         safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      }
    });

    if (text === undefined) {
      throw new Error('LLM did not return a text response.');
    }
    
    return { llmResponseText: text };
  }
);
