
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { getKeyFromItem, Key } from './key';
import { UpdateExpressionParams, buildUpdateExpression } from './update-expression';
import { buildConditionExpression } from './condition-expression';
import { buildProjectionExpression } from './expression';


export interface GetItemParams {
    tableName: string
    key: Key
    attributes?: string[]
}

export function getItemInput(params: GetItemParams): DynamoDB.DocumentClient.GetItemInput {
    const Key = params.key;
    const TableName = params.tableName;

    const input: DynamoDB.DocumentClient.GetItemInput = {
        Key,
        TableName,
    };

    if (!params.attributes || params.attributes.length === 0) {
        return input;
    }

    const projection = buildProjectionExpression(params.attributes);

    input.ProjectionExpression = projection.expression;
    input.ExpressionAttributeNames = projection.names;

    return input;
}


export interface BatchGetItemParams {
    tableName: string
    keys: Key[]
    attributes?: string[]
}

export function batchGetItemInput(params: BatchGetItemParams): DynamoDB.DocumentClient.BatchGetItemInput {
    const KeysAndAttributes: DynamoDB.DocumentClient.KeysAndAttributes = {
        Keys: params.keys,
    }

    const RequestItems: DynamoDB.DocumentClient.BatchGetRequestMap = {};
    RequestItems[params.tableName] = KeysAndAttributes;

    const input: DynamoDB.DocumentClient.BatchGetItemInput = {
        RequestItems,
    };

    if (params.attributes && params.attributes.length) {
        const projection = buildProjectionExpression(params.attributes);

        KeysAndAttributes.ProjectionExpression = projection.expression;
        KeysAndAttributes.ExpressionAttributeNames = projection.names;
    }

    return input;
}

export interface DeleteItemParams {
    tableName: string
    key: { [key: string]: string | number }
}

export function deleteItemInput(params: DeleteItemParams): DynamoDB.DocumentClient.DeleteItemInput {
    const Key = params.key;
    const TableName = params.tableName;

    const input: DynamoDB.DocumentClient.DeleteItemInput = {
        Key,
        TableName,
    };

    return input;
}

export interface PutItemParams {
    tableName: string
    item: { [key: string]: any }
}

export function putItemInput(params: PutItemParams): DynamoDB.DocumentClient.PutItemInput {
    const TableName = params.tableName;
    const Item = params.item;

    const input: DynamoDB.DocumentClient.PutItemInput = {
        Item,
        TableName,
    };

    return input;
}

export interface CreateItemParams {
    tableName: string
    item: { [key: string]: any }
    hashKeyName: string
    rangeKeyName?: string
}

export function createItemInput(params: CreateItemParams): DynamoDB.DocumentClient.PutItemInput {
    const TableName = params.tableName;
    const key = getKeyFromItem<Key>(params.item, params.hashKeyName, params.rangeKeyName);
    const Item = params.item;

    const input: DynamoDB.DocumentClient.PutItemInput = {
        Item,
        TableName,
    };

    const { expression, names, values } = buildConditionExpression({
        operation: '<>',
        hashKey: {
            name: params.hashKeyName,
            value: key[params.hashKeyName],
        },
        rangeKey: params.rangeKeyName && {
            name: params.rangeKeyName,
            value: key[params.rangeKeyName],
        } || undefined,
    });

    if (expression) {
        input.ConditionExpression = expression;
    }
    if (Object.keys(names).length) {
        input.ExpressionAttributeNames = names;
    }
    if (Object.keys(values).length) {
        input.ExpressionAttributeValues = values;
    }

    return input;
}

export interface UpdateItemParams extends UpdateExpressionParams {
    tableName: string
    key: Key
    hashKeyName: string
}

export function updateItemInput(params: UpdateItemParams): DynamoDB.DocumentClient.UpdateItemInput {
    const TableName = params.tableName;
    const key = params.key;

    const input: DynamoDB.DocumentClient.UpdateItemInput = {
        Key: key,
        TableName,
    };

    const keyProps = Object.keys(key);

    if (keyProps.length > 2) {
        throw new TypeError(`key must contain maximum 2 props: hash & range`);
    }

    const rangeKeyName = keyProps.length === 2 ? keyProps.find(name => name !== params.hashKeyName) : undefined;

    let { expression, names, values } = buildConditionExpression({
        operation: '=',
        hashKey: {
            name: params.hashKeyName,
            value: key[params.hashKeyName],
        },
        rangeKey: rangeKeyName && {
            name: rangeKeyName,
            value: key[rangeKeyName],
        } || undefined,
    });

    if (expression) {
        input.ConditionExpression = expression;
    }

    const update = buildUpdateExpression(params);

    if (update.expression) {
        input.UpdateExpression = update.expression;
    }
    names = { ...names, ...update.names };
    values = { ...values, ...update.values };

    if (Object.keys(names).length) {
        input.ExpressionAttributeNames = names;
    }
    if (Object.keys(values).length) {
        input.ExpressionAttributeValues = values;
    }

    return input;
}
