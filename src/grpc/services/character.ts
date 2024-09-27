import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '~/proto/character';
import { CharacterHandlers } from '~/proto/nextmu/character/v1/Character';
import {
    createCharacter,
    deleteCharacter,
    fetchCharacter,
    listCharacters,
    saveCharacter,
} from '~/services/mongodb/character';
import {
    ZCharacterCreateRequest,
    ZCharacterDeleteRequest,
    ZCharacterGetRequest,
    ZCharacterListRequest,
    ZCharacterSaveRequest,
} from '../types/character';
import { defaultProtoLoaderConfig } from '../utils/config';
import { handlegRpcError } from '../utils/error';

const definition = protoLoader.loadSync(
    'proto/models/character.proto',
    defaultProtoLoaderConfig,
);
export const proto = grpc.loadPackageDefinition(
    definition,
) as unknown as ProtoGrpcType;

export const service: CharacterHandlers = {
    List: async (call, callback) => {
        const parsed = ZCharacterListRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            const { accountId } = parsed.data;
            const result = await listCharacters(accountId);
            callback(null, result);
        } catch (error) {
            handlegRpcError('CharacterService.List', call, callback, error);
        }
    },
    Create: async (call, callback) => {
        const parsed = ZCharacterCreateRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            const result = await createCharacter(parsed.data);
            callback(null, result);
        } catch (error) {
            handlegRpcError('CharacterService.Create', call, callback, error);
        }
    },
    Delete: async (call, callback) => {
        const parsed = ZCharacterDeleteRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            await deleteCharacter(parsed.data);
            callback(null, {});
        } catch (error) {
            handlegRpcError('CharacterService.Delete', call, callback, error);
        }
    },
    Get: async (call, callback) => {
        const parsed = ZCharacterGetRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            const result = await fetchCharacter(parsed.data);
            callback(null, result);
        } catch (error) {
            handlegRpcError('CharacterService.Get', call, callback, error);
        }
    },
    Save: async (call, callback) => {
        const parsed = ZCharacterSaveRequest.safeParse(call.request);
        if (parsed.success == false) {
            return call.emit<grpc.ServiceError>('error', {
                code: grpc.status.INVALID_ARGUMENT,
                details: parsed.error.format()._errors.join('\n'),
            });
        }

        try {
            await saveCharacter(parsed.data);
            callback(null, {});
        } catch (error) {
            handlegRpcError('CharacterService.Save', call, callback, error);
        }
    },
};
