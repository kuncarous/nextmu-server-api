import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { SessionHandlers } from '~/proto/nextmu/session/v1/Session';
import { ProtoGrpcType } from '~/proto/session';
import { updateServer } from '~/services/mongodb/node';
import { validateSession } from '~/services/mongodb/session';
import {
    ZSessionReleaseRequest,
    ZSessionRenewRequest,
    ZSessionValidateRequest,
} from '../types/session';
import { defaultProtoLoaderConfig } from '../utils/config';
import { handlegRpcError } from '../utils/error';

const definition = protoLoader.loadSync(
    'proto/models/session.proto',
    defaultProtoLoaderConfig,
);
export const proto = grpc.loadPackageDefinition(
    definition,
) as unknown as ProtoGrpcType;

export const service: SessionHandlers = {
    Validate: async (call, callback) => {
        const parsed = ZSessionValidateRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            const result = await validateSession(parsed.data);
            callback(null, result);
        } catch (error) {
            handlegRpcError('SessionService.Validate', call, callback, error);
        }
    },
    Release: async (call, callback) => {
        const parsed = ZSessionReleaseRequest.safeParse(call.request);
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
            handlegRpcError('SessionService.Release', call, callback, error);
        }
    },
    Renew: async (call, callback) => {
        const parsed = ZSessionRenewRequest.safeParse(call.request);
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
            handlegRpcError('SessionService.Renew', call, callback, error);
        }
    },
};
