
import DynamoDB = require('aws-sdk/clients/dynamodb');

export function queryInput(params: QueryParams): DynamoDB.QueryInput {

    const input: DynamoDB.QueryInput = {
        TableName: params.tableName,
        IndexName: params.index,
        Limit: params.limit,
        Select: params.select,
        ConsistentRead: params.consistentRead,
    };

    if (params.attributes) {
        input.ProjectionExpression = params.attributes.join(',');
    }

    if (params.startKey) {
        input.ExclusiveStartKey = DynamoDB.Converter.marshall(params.startKey);
    }

    const ExpressionAttributeNames: DynamoDB.ExpressionAttributeNameMap = {};
    ExpressionAttributeNames[`#${params.hashKey.name}`] = params.hashKey.name;

    const ExpressionAttributeValues: { [key: string]: any } = {};
    ExpressionAttributeValues[':' + params.hashKey.name] = params.hashKey.value;


    let KeyConditionExpression = `#${params.hashKey.name} = :${params.hashKey.name}`;

    if (params.rangeKey) {
        const name = params.rangeKey.name;
        ExpressionAttributeNames[`#${name}`] = name;

        let expression = '';
        const value = params.rangeKey.value;

        const arrayValue = Array.isArray(value) ? value : [value];
        const arrayValueName = arrayValue.map((_, i) => `:${name}_${i}`);

        let multiValues = true;

        if (params.rangeKey.operation === 'IN') {
            expression = `#${name} IN (${arrayValueName.join(', ')})`;
        } else if (params.rangeKey.operation === 'BETWEEN') {
            expression = `#${name} BETWEEN ${arrayValueName[0]} AND ${arrayValueName[1]}`;
        } else {
            multiValues = false;
            if (params.rangeKey.operation === 'begins_with') {
                expression = `#${name} ${params.rangeKey.operation}(:${name})`;
            } else {
                expression = `#${name} ${params.rangeKey.operation} :${name}`;
            }
        }

        if (multiValues) {
            arrayValue.forEach((val, i) => {
                ExpressionAttributeValues[`:${name}_${i}`] = val;
            });
        } else {
            ExpressionAttributeValues[`:${name}`] = value;
        }

        KeyConditionExpression += ` AND ${expression}`;
    }

    input.ExpressionAttributeNames = ExpressionAttributeNames;
    input.ExpressionAttributeValues = DynamoDB.Converter.marshall(ExpressionAttributeValues);
    input.KeyConditionExpression = KeyConditionExpression;

    return input;
}


export interface QueryParams {
    tableName: string
    hashKey: QueryHashKey
    rangeKey?: QueryRangeKey
    index?: string
    select?: 'COUNT' | 'ALL_PROJECTED_ATTRIBUTES' | 'ALL_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES'
    attributes?: string[]
    limit?: number
    consistentRead?: boolean
    // KeyConditions?: DynamoDB.KeyConditions;
    // QueryFilter?: DynamoDB.FilterConditionMap;
    // ConditionalOperator?: DynamoDB.ConditionalOperator;
    // ScanIndexForward?: DynamoDB.BooleanObject;
    startKey?: { [key: string]: any }
    // ReturnConsumedCapacity?: DynamoDB.ReturnConsumedCapacity;
    // ProjectionExpression?: DynamoDB.ProjectionExpression;
    // FilterExpression?: DynamoDB.ConditionExpression;
    // KeyConditionExpression?: DynamoDB.KeyExpression;
    // ExpressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap;
    // ExpressionAttributeValues?: DynamoDB.ExpressionAttributeValueMap;
}

export type QueryRangeKey = {
    name: string
    operation: '=' | '<>' | '<' | '<=' | '>' | '>=' | 'IN' | 'BETWEEN' | 'begins_with'
    value: number | string | string[] | number[]
}

export type QueryHashKey = {
    name: string
    value: string | number
}
