
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { getKeyFromItem, Key } from './key';
import { UpdateExpressionParams, buildUpdateExpression } from './update-expression';
import { buildConditionExpression } from './condition-expression';


export interface GetItemParams {
    tableName: string
    key: Key
    attributes?: string[]
}

export function getItemInput(params: GetItemParams): DynamoDB.GetItemInput {
    const Key = DynamoDB.Converter.marshall(params.key);
    const TableName = params.tableName;

    const input: DynamoDB.GetItemInput = {
        Key,
        TableName,
    };

    if (!params.attributes) {
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

export function batchGetItemInput(params: BatchGetItemParams): DynamoDB.BatchGetItemInput {
    const KeysAndAttributes: DynamoDB.KeysAndAttributes = {
        Keys: params.keys.map(key => DynamoDB.Converter.marshall(key)),
    }

    const RequestItems: DynamoDB.BatchGetRequestMap = {};
    RequestItems[params.tableName] = KeysAndAttributes;

    const input: DynamoDB.BatchGetItemInput = {
        RequestItems,
    };

    if (params.attributes) {
        const ProjectionExpression = params.attributes.join(',');

        KeysAndAttributes.ProjectionExpression = ProjectionExpression;
    }

    return input;
}

export interface DeleteItemParams {
    tableName: string
    key: { [key: string]: string | number }
}

export function deleteItemInput(params: DeleteItemParams): DynamoDB.DeleteItemInput {
    const Key = DynamoDB.Converter.marshall(params.key);
    const TableName = params.tableName;

    const input: DynamoDB.DeleteItemInput = {
        Key,
        TableName,
    };

    return input;
}

export interface PutItemParams {
    tableName: string
    item: { [key: string]: any }
}

export function putItemInput(params: PutItemParams): DynamoDB.PutItemInput {
    const TableName = params.tableName;
    const Item = DynamoDB.Converter.marshall(params.item);

    const input: DynamoDB.PutItemInput = {
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

export function createItemInput(params: CreateItemParams): DynamoDB.PutItemInput {
    const TableName = params.tableName;
    const key = getKeyFromItem<Key>(params.item, params.hashKeyName, params.rangeKeyName);
    const Item = DynamoDB.Converter.marshall(params.item);

    const input: DynamoDB.PutItemInput = {
        Item,
        TableName,
    };

    const conditionExpression = buildConditionExpression({
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

    input.ConditionExpression = conditionExpression.expression;
    input.ExpressionAttributeNames = conditionExpression.names;
    input.ExpressionAttributeValues = DynamoDB.Converter.marshall(conditionExpression.values);

    return input;
}

export interface UpdateItemParams extends UpdateExpressionParams {
    tableName: string
    key: Key
}

export function updateItemInput(params: UpdateItemParams): DynamoDB.UpdateItemInput {
    const TableName = params.tableName;

    const input: DynamoDB.UpdateItemInput = {
        Key: DynamoDB.Converter.marshall(params.key),
        TableName,
    };

    const updateExpression = buildUpdateExpression(params);

    input.UpdateExpression = updateExpression.expression;
    input.ExpressionAttributeNames = updateExpression.names;
    input.ExpressionAttributeValues = DynamoDB.Converter.marshall(updateExpression.values);

    return input;
}
