import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const ZNodeHeartbeatRequest = z.object({
    nodeId: z
        .union([z.instanceof(Buffer), z.instanceof(Uint8Array), z.string()])
        .refine((v) => ObjectId.isValid(v))
        .transform((v) => new ObjectId(v)),
    host: z.string().min(3),
    port: z.number().int().min(1).max(65535),
    index: z.number().int().min(0),
    group: z.number().int().min(0),
    maxUsers: z.number().int().min(1),
    users: z.number().int().min(0),
    pvp: z.boolean(),
});
export type INodeHeartbeatRequest = z.infer<typeof ZNodeHeartbeatRequest>;
