import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '~/proto/item';
import { ItemHandlers } from '~/proto/nextmu/item/v1/Item';
import { deleteItems, saveItems } from '~/services/mongodb/item';
import { ZItemDeleteRequest, ZItemSaveRequest } from '../types/item';
import { defaultProtoLoaderConfig } from '../utils/config';
import { handlegRpcError } from '../utils/error';

const definition = protoLoader.loadSync(
    'proto/models/item.proto',
    defaultProtoLoaderConfig,
);
export const proto = grpc.loadPackageDefinition(
    definition,
) as unknown as ProtoGrpcType;

export const service: ItemHandlers = {
    Delete: async (call, callback) => {
        const parsed = ZItemDeleteRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            await deleteItems(parsed.data);
            callback(null, {});
        } catch (error) {
            handlegRpcError('ItemService.Delete', call, callback, error);
        }
    },
    Save: async (call, callback) => {
        const parsed = ZItemSaveRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            await saveItems(parsed.data);
            callback(null, {});
        } catch (error) {
            handlegRpcError('ItemService.Save', call, callback, error);
        }
    },
};
