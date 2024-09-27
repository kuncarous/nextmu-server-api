import crypto from 'crypto';
import MUUID from 'uuid-mongodb';
import { getMongoClient } from '~/shared/database';
import { logger } from '@shared';
import { Binary, ObjectId } from 'mongodb';
import { IMDBGameServerInfo } from './schemas/accounts/servers';
import moment from 'moment';
import { NodeHeartbeatRequest } from '@proto/node_pb';

export const updateServer = async (
    request: NodeHeartbeatRequest
) => {
    const client = await getMongoClient();
    if (!client) {
        throw new Error(`couldn't find mongodb client`);
    }

    try {
        const serversColl = client.db("accounts").collection<IMDBGameServerInfo>("servers");
        
        const nodeId = MUUID.from(new Binary(request.getNodeId_asU8(), Binary.SUBTYPE_UUID));
        const currentTime = new Date();
        serversColl.updateOne(
            {
                _id: nodeId,
            },
            {
                $set: {
                    group: request.getGroup(),
                    index: request.getIndex(),
                    host: request.getHost(),
                    port: request.getPort(),
                    users: request.getUsers(),
                    maxUsers: request.getMaxUsers(),
                    updatedAt: currentTime,
                },
                $setOnInsert: {
                    _id: nodeId,
                    createdAt: currentTime,
                },
            },
            {
                upsert: true,
            }
        );
    } catch(error) {
        logger.error(`[ERROR] updateServer failed : ${error}`);
        throw (error);
    }
}