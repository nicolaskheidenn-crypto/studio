'use server';
/**
 * @fileOverview This file implements a Genkit flow for drafting website content using AI.
 *
 * - aiContentDraftingTool - A function that generates an initial draft for a website section or article.
 * - AIContentDraftingToolInput - The input type for the aiContentDraftingTool function.
 * - AIContentDraftingToolOutput - The return type for the aiContentDraftingTool function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIContentDraftingToolInputSchema = z.object({
  topic: z.string().describe('The main topic for the content draft.'),
  keywords: z.array(z.string()).optional().describe('Optional keywords to guide the content generation.'),
});
export type AIContentDraftingToolInput = z.infer<typeof AIContentDraftingToolInputSchema>;

const AIContentDraftingToolOutputSchema = z.object({
  draftContent: z.string().describe('The generated draft content for the website section or article.'),
});
export type AIContentDraftingToolOutput = z.infer<typeof AIContentDraftingToolOutputSchema>;

export async function aiContentDraftingTool(input: AIContentDraftingToolInput): Promise<AIContentDraftingToolOutput> {
  return aiContentDraftingToolFlow(input);
}

const contentDraftingPrompt = ai.definePrompt({
  name: 'contentDraftingPrompt',
  input: { schema: AIContentDraftingToolInputSchema },
  output: { schema: AIContentDraftingToolOutputSchema },
  prompt: `You are an AI assistant specialized in writing website content drafts. Your task is to generate a comprehensive and engaging draft for a website section or article based on the provided topic and keywords.

Topic: {{{topic}}}
{{#if keywords}}Keywords: {{#each keywords}}{{{this}}}{{/each}}{{/if}}

Generate the draft content, focusing on clarity, conciseness, and engagement suitable for a website.
`,
});

const aiContentDraftingToolFlow = ai.defineFlow(
  {
    name: 'aiContentDraftingToolFlow',
    inputSchema: AIContentDraftingToolInputSchema,
    outputSchema: AIContentDraftingToolOutputSchema,
  },
  async (input) => {
    const { output } = await contentDraftingPrompt(input);
    return output!;
  }
);
