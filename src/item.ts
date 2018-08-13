
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { getKeyFromItem, Key } from './key';
import { UpdateExpressionParams, buildUpdateExpression } from './update-expression';
import { buildConditionExpression } from './condition-expression';


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

    const ProjectionExpression = params.attributes.join(',');

    return { ...input, ProjectionExpression };
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
        const ProjectionExpression = params.attributes.join(',');

        KeysAndAttributes.ProjectionExpression = ProjectionExpression;
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
}

export function updateItemInput(params: UpdateItemParams): DynamoDB.DocumentClient.UpdateItemInput {
    const TableName = params.tableName;

    const input: DynamoDB.DocumentClient.UpdateItemInput = {
        Key: params.key,
        TableName,
    };

    const { expression, names, values } = buildUpdateExpression(params);

    if (expression) {
        input.UpdateExpression = expression;
    }
    if (Object.keys(names).length) {
        input.ExpressionAttributeNames = names;
    }
    if (Object.keys(values).length) {
        input.ExpressionAttributeValues = values;
    }

    return input;
}
