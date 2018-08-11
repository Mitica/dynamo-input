
import DynamoDB = require('aws-sdk/clients/dynamodb');
import test from 'ava';
import {
    createTableInput,
    formatIndex,
    TableParams,
    IndexParams,
} from './table';

test('createTableInput', t => {
    let params: TableParams = {
        name: 'Videos',
        hashKey: {
            name: 'id',
            type: 'N',
        },
        rangeKey: {
            name: 'year',
            type: 'N',
        },
        indexes: [
            {
                name: 'IndexName',
                type: 'LOCAL',
                hashKey: {
                    name: 'year',
                    type: 'N',
                },
                rangeKey: {
                    name: 'title',
                    type: 'S',
                }
            }
        ],
        throughput: {
            read: 10,
            write: 5,
        }
    };

    let input = createTableInput(params);

    t.is(input.TableName, params.name);

    if (params.throughput) {
        t.is(input.ProvisionedThroughput.WriteCapacityUnits, params.throughput.write);
        t.is(input.ProvisionedThroughput.ReadCapacityUnits, params.throughput.read);
    }

    t.is(input.KeySchema.length, 2);
    t.is(input.KeySchema[0].AttributeName, params.hashKey.name);
    t.is(input.KeySchema[0].KeyType, 'HASH');
    if (params.rangeKey) {
        t.is(input.KeySchema[1].AttributeName, params.rangeKey.name);
        t.is(input.KeySchema[1].KeyType, 'RANGE');
    }
    t.is(input.GlobalSecondaryIndexes, undefined);
    t.truthy(input.LocalSecondaryIndexes && input.LocalSecondaryIndexes.length === 1);
    t.is(input.AttributeDefinitions.length, 3); // id, year, title
    t.is(input.AttributeDefinitions[0].AttributeName, 'id');
    t.is(input.AttributeDefinitions[0].AttributeType, 'N');
    t.is(input.AttributeDefinitions[1].AttributeName, 'year');
    t.is(input.AttributeDefinitions[1].AttributeType, 'N');
    t.is(input.AttributeDefinitions[2].AttributeName, 'title');
    t.is(input.AttributeDefinitions[2].AttributeType, 'S');
});

test('formatIndex', t => {
    let params: IndexParams = {
        name: 'IndexName',
        hashKey: {
            name: 'id',
            type: 'N',
        },
        type: 'LOCAL',
        projection: {
            type: 'KEYS_ONLY',
        },
    };

    let index = formatIndex(params);

    t.is(index.IndexName, params.name);
    t.is(index.KeySchema.length, 1); // only hash key
    t.is(index.KeySchema[0].AttributeName, params.hashKey.name);
    t.is(index.KeySchema[0].KeyType, 'HASH');
    t.is(index.Projection.ProjectionType, 'KEYS_ONLY');

    params = {
        name: 'IndexName',
        hashKey: {
            name: 'id',
            type: 'N',
        },
        rangeKey: {
            name: 'year',
            type: 'N',
        },
        type: 'GLOBAL',
        projection: {
            type: 'INCLUDE',
            include: ['title']
        },
        throughput: {
            read: 10,
            write: 2,
        }
    };

    index = formatIndex(params);
    let globalIndex = <DynamoDB.GlobalSecondaryIndex>index;

    t.is(index.IndexName, params.name);
    t.is(index.KeySchema.length, 2);
    t.is(index.KeySchema[0].AttributeName, params.hashKey.name);
    t.is(index.KeySchema[0].KeyType, 'HASH');
    if (params.rangeKey) {
        t.is(index.KeySchema[1].AttributeName, params.rangeKey.name);
        t.is(index.KeySchema[1].KeyType, 'RANGE');
    }
    if (params.projection) {
        t.is(index.Projection.ProjectionType, 'INCLUDE');
        t.is(index.Projection.NonKeyAttributes, params.projection.include);
    }
    if (params.throughput) {
        t.is(globalIndex.ProvisionedThroughput.ReadCapacityUnits, params.throughput.read);
        t.is(globalIndex.ProvisionedThroughput.WriteCapacityUnits, params.throughput.write);
    }
});
