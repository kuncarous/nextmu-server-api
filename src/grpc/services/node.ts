import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '~/proto/character';
import { NodeHandlers } from '~/proto/nextmu/node/v1/Node';
import { updateServer } from '~/services/mongodb/node';
import { ZNodeHeartbeatRequest } from '../types/node';
import { defaultProtoLoaderConfig } from '../utils/config';
import { handlegRpcError } from '../utils/error';

const definition = protoLoader.loadSync(
    'proto/models/node.proto',
    defaultProtoLoaderConfig,
);
export const proto = grpc.loadPackageDefinition(
    definition,
) as unknown as ProtoGrpcType;

export const service: NodeHandlers = {
    Heartbeat: async (call, callback) => {
        const parsed = ZNodeHeartbeatRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            await updateServer(parsed.data);
            callback(null, {});
        } catch (error) {
            handlegRpcError('NodeService.Heartbeat', call, callback, error);
        }
    },
};
