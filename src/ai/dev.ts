import { config } from 'dotenv';
config();

import '@/ai/flows/context-aware-prompting.ts';
import '@/ai/flows/refine-custom-instructions-flow.ts';
import '@/ai/flows/engineer-final-prompt-flow.ts';
