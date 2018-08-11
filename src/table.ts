
import DynamoDB = require('aws-sdk/clients/dynamodb');
import { uniqByProperty } from "./helpers";

export function createTableInput(table: TableParams): DynamoDB.CreateTableInput {
    let AttributeDefinitions: DynamoDB.AttributeDefinitions = [
        {
            AttributeName: table.hashKey.name,
            AttributeType: table.hashKey.type,
        }
    ];
    const KeySchema: DynamoDB.KeySchema = [
        {
            AttributeName: table.hashKey.name,
            KeyType: 'HASH',
        }
    ];

    if (table.rangeKey) {
        AttributeDefinitions.push({
            AttributeName: table.rangeKey.name,
            AttributeType: table.rangeKey.type,
        });
        KeySchema.push({
            AttributeName: table.rangeKey.name,
            KeyType: 'RANGE',
        });
    }

    const LocalSecondaryIndexes: DynamoDB.LocalSecondaryIndexList = [];
    const GlobalSecondaryIndexes: DynamoDB.GlobalSecondaryIndexList = [];

    if (table.indexes) {
        for (const indexInfo of table.indexes) {
            const index = formatIndex(indexInfo);
            if (indexInfo.type === 'GLOBAL') {
                GlobalSecondaryIndexes.push(index as DynamoDB.GlobalSecondaryIndex);
            } else {
                LocalSecondaryIndexes.push(index as DynamoDB.LocalSecondaryIndex);
            }

            AttributeDefinitions.push({
                AttributeName: indexInfo.hashKey.name,
                AttributeType: indexInfo.hashKey.type,
            });
            if (indexInfo.rangeKey) {
                AttributeDefinitions.push({
                    AttributeName: indexInfo.rangeKey.name,
                    AttributeType: indexInfo.rangeKey.type,
                });
            }
        }

        AttributeDefinitions = uniqByProperty(AttributeDefinitions, 'AttributeName');
    }

    const ProvisionedThroughput = createProvisionedThroughput(table.throughput);

    return {
        TableName: table.name,
        AttributeDefinitions,
        KeySchema,
        LocalSecondaryIndexes: LocalSecondaryIndexes.length > 0 ? LocalSecondaryIndexes : undefined,
        GlobalSecondaryIndexes: GlobalSecondaryIndexes.length > 0 ? GlobalSecondaryIndexes : undefined,
        ProvisionedThroughput,
    };
}

export function formatIndex(index: IndexParams): DynamoDB.GlobalSecondaryIndex | DynamoDB.LocalSecondaryIndex {
    const KeySchema: DynamoDB.KeySchema = [
        {
            AttributeName: index.hashKey.name,
            KeyType: 'HASH',
        }
    ];
    if (index.rangeKey) {
        KeySchema.push({
            AttributeName: index.rangeKey.name,
            KeyType: 'RANGE',
        })
    }

    const projection = index.projection || { type: 'KEYS_ONLY' };

    const Projection: DynamoDB.Projection = {
        ProjectionType: projection.type
    };

    if (projection.include) {
        Projection.NonKeyAttributes = projection.include;
    }



    if (index.type === 'GLOBAL') {
        return {
            IndexName: index.name,
            KeySchema,
            Projection,
            ProvisionedThroughput: createProvisionedThroughput(index.throughput),
        } as DynamoDB.GlobalSecondaryIndex;
    }

    return {
        IndexName: index.name,
        KeySchema,
        Projection,
    } as DynamoDB.LocalSecondaryIndex;
}

function createProvisionedThroughput(provisionedThroughput?: ProvisionedThroughput): DynamoDB.ProvisionedThroughput {
    provisionedThroughput = provisionedThroughput || {
        read: 1,
        write: 1,
    };

    return {
        ReadCapacityUnits: provisionedThroughput.read,
        WriteCapacityUnits: provisionedThroughput.write,
    };
}


export interface IndexParams {
    name: string
    type: 'LOCAL' | 'GLOBAL'
    hashKey: Key
    rangeKey?: Key
    projection?: IndexProjection
    throughput?: ProvisionedThroughput
}

export type IndexProjection = {
    include?: string[]
    type: 'KEYS_ONLY' | 'INCLUDE' | 'ALL'
}

export type ProvisionedThroughput = {
    read: number
    write: number
}

export type Key = {
    name: string
    type: 'S' | 'N'
}

export interface TableParams {
    name: string
    hashKey: Key
    rangeKey?: Key
    indexes?: IndexParams[]
    throughput?: ProvisionedThroughput
}

