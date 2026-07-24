import { z } from 'zod';

export const createMessageSchema = z.object({
    chatId: z.string().trim().min(1, { message: "Chat ID is required" }),
    content: z.preprocess(
        (val) => (val === "" ? undefined : val), 
        z.string().trim().optional()
    ),
    image: z.preprocess(
        (val) => (val === "" ? undefined : val), 
        z.string().trim().optional()
    ),
    replyTo: z.preprocess(
        (val) => (val === "" ? undefined : val), 
        z.string().trim().optional()
    )
});
