import { Server, ServerCredentials } from '@grpc/grpc-js';
import { logger } from '~/logger';
import * as characterService from './services/character';
import * as itemService from './services/item';
import * as nodeService from './services/node';
import * as sessionService from './services/session';

export const Initialize = async () => {
    const server = new Server({
        'grpc.max_receive_message_length': -1,
        'grpc.max_send_message_length': -1,
    });

    server.addService(
        nodeService.proto.nextmu.node.v1.Node.service,
        nodeService.service,
    );
    server.addService(
        sessionService.proto.nextmu.session.v1.Session.service,
        sessionService.service,
    );
    server.addService(
        characterService.proto.nextmu.character.v1.Character.service,
        characterService.service,
    );
    server.addService(
        itemService.proto.nextmu.item.v1.Item.service,
        itemService.service,
    );
    server.bindAsync(
        `0.0.0.0:${process.env.GRPC_PORT || 8720}`,
        ServerCredentials.createInsecure(),
        (err: Error | null, bindPort: number) => {
            if (err) {
                throw err;
            }

            logger.info(`gRPC:Server:${bindPort}`, new Date().toLocaleString());
        },
    );
};
