
import { isStringOrNumber } from "./helpers";

export type Key = { [key: string]: string | number }

export type KeyParam = string | number | Key;

export function getHashKey(key: KeyParam, keyName: string): string | number {
    if (key === undefined || key === null) {
        throw new Error(`Model key cannot by undefined or null`);
    }
    if (isStringOrNumber(key)) {
        return key as any;
    }
    if (typeof key !== 'object') {
        throw new Error(`Invalid key: ${key}`);
    }

    const hashKey = key[keyName];
    if (!isStringOrNumber(hashKey)) {
        throw new Error(`Key doesn't contain a valid hash key`);
    }

    return hashKey;
}

export function getRangeKey(key: KeyParam, keyName: string): string | number {
    if (typeof key !== 'object') {
        throw new Error(`Invalid id: the id must contain a range key`);
    }

    const rangeKey = key[keyName];

    if (!isStringOrNumber(rangeKey)) {
        throw new Error(`Key doesn't contain a valid range key`);
    }

    return rangeKey;
}

export function getKeyFromItem<KEY extends object>(item: any, hashKeyName: string, rangeKeyName?: string): KEY {
    const hashKey = item[hashKeyName];
    if (!isStringOrNumber(hashKey)) {
        throw new Error(`Invalid item: no hash key`);
    }
    const key: any = {};
    key[hashKeyName] = hashKey;

    if (!rangeKeyName) {
        return key;
    }

    const rangeKey = item[rangeKeyName];

    if (!isStringOrNumber(rangeKey)) {
        throw new Error(`Invalid item: no range key`);
    }

    key[rangeKeyName] = rangeKey;

    return key;
}
