'use server';
/**
 * @fileOverview AI flow to interpret dice rolls based on the section theme.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterpretRollInputSchema = z.object({
  roll: z.number().describe('The result of the dice roll (1-6)'),
  section: z.string().describe('The category of the dice section (Game, Lucky, Decision, Yoga)'),
});
export type InterpretRollInput = z.infer<typeof InterpretRollInputSchema>;

const InterpretRollOutputSchema = z.object({
  wisdom: z.string().describe('A short, witty interpretation of the roll.'),
});
export type InterpretRollOutput = z.infer<typeof InterpretRollOutputSchema>;

export async function interpretRoll(input: InterpretRollInput): Promise<InterpretRollOutput> {
  return interpretRollFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretRollPrompt',
  input: { schema: InterpretRollInputSchema },
  output: { schema: InterpretRollOutputSchema },
  prompt: `You are the Spirit of the Smart Dice. A player just rolled a {{roll}} in the "{{section}}" category. 
  
  Your task is to provide a very short, creative, and witty interpretation (max 12 words).
  - If it's "Yoga", be a zen master explaining the energy of the pose.
  - If it's "Lucky", be a mystical fortune teller.
  - If it's "Decision", be a sassy and confident decider.
  - If it's "Game", be a Dungeon Master describing a quick action.
  
  Roll: {{roll}}
  Category: {{section}}`,
});

const interpretRollFlow = ai.defineFlow(
  {
    name: 'interpretRollFlow',
    inputSchema: InterpretRollInputSchema,
    outputSchema: InterpretRollOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
