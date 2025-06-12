
'use server';
/**
 * @fileOverview An AI agent that executes a given prompt.
 *
 * - executePrompt - A function that takes an engineered prompt and gets a response from an LLM.
 * - ExecutePromptInput - The input type for the flow.
 * - ExecutePromptOutput - The output type for theflow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Types are now fully defined here as ExecutePromptInput has changed.
// import type {ExecutePromptInput, ExecutePromptOutput} from '@/lib/types'; 

const ExecutePromptInputSchema = z.object({
  engineeredPrompt: z.string().describe("The fully engineered prompt to be sent to the LLM. It should contain all necessary context if file content generation is expected."),
  // documentText: z.string().describe("The text content of the document to be processed by the LLM."), // Removed
});
export type ExecutePromptInput = z.infer<typeof ExecutePromptInputSchema>;


const ExecutePromptOutputSchema = z.object({
  llmResponseText: z.string().describe("The text response from the LLM after processing the prompt."),
});
export type ExecutePromptOutput = z.infer<typeof ExecutePromptOutputSchema>;


// const PROMPT_DOCUMENT_PLACEHOLDER = "[PASTE DOCUMENT TEXT HERE]"; // No longer needed

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
    // Placeholder logic removed as engineeredPrompt is now self-contained if generating file content,
    // or it contains its own placeholder if manual document pasting is expected (though UI for that is removed).
    // if (!input.engineeredPrompt.includes(PROMPT_DOCUMENT_PLACEHOLDER)) {
    //   // This check might be too strict now, or needs to be conditional based on a new flag
    //   // For now, assume the prompt is ready or contains its own instructions for document content.
    // }
    // const finalPromptForLlm = input.engineeredPrompt.replace(PROMPT_DOCUMENT_PLACEHOLDER, input.documentText); // This line is removed

    const { text } = await ai.generate({
      prompt: input.engineeredPrompt, // Use the engineered prompt directly
      config: {
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
