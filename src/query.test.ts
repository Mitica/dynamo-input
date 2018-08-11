
import test from 'ava';
import {
    queryInput,
    QueryParams,
} from './query';

test('simple queryInput', t => {
    const params: QueryParams = {
        tableName: 'Videos',
        hashKey: {
            name: 'year',
            value: 2017,
        },
        limit: 12,
        select: 'ALL_ATTRIBUTES',
    };

    const input = queryInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.IndexName, undefined);
    t.is(input.ProjectionExpression, undefined);
    t.is(input.Select, params.select);
    t.is(input.Limit, params.limit);
    t.is(input.KeyConditionExpression, `#${params.hashKey.name} = :${params.hashKey.name}`);
    t.truthy(input.ExpressionAttributeNames);
    t.truthy(input.ExpressionAttributeValues);
    if (input.ExpressionAttributeNames) {
        t.is(input.ExpressionAttributeNames[`#${params.hashKey.name}`], params.hashKey.name);
    }
    if (input.ExpressionAttributeValues) {
        t.is(input.ExpressionAttributeValues[`:${params.hashKey.name}`], params.hashKey.value as any);
    }
});

test('rangeKey queryInput', t => {
    const params: QueryParams = {
        tableName: 'Videos',
        index: 'IndexName',
        hashKey: {
            name: 'year',
            value: 2017,
        },
        rangeKey: {
            name: 'title',
            value: 'Super',
            operation: 'begins_with'
        },
        limit: 12,
        attributes: ['id', 'title'],
        consistentRead: true,
        startKey: {
            year: 2017,
            title: 'Superman',
        },
    };

    const input = queryInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.IndexName, params.index);
    t.is(input.ProjectionExpression, 'id,title');
    t.is(input.Select, params.select);
    t.is(input.Limit, params.limit);
    t.is(input.ConsistentRead, params.consistentRead);
    params.rangeKey &&
        t.is(input.KeyConditionExpression, `#${params.hashKey.name} = :${params.hashKey.name} AND #${params.rangeKey.name} begins_with(:${params.rangeKey.name})`);

    t.truthy(input.ExpressionAttributeNames);
    if (input.ExpressionAttributeNames) {
        t.is(input.ExpressionAttributeNames[`#${params.hashKey.name}`], params.hashKey.name);
        params.rangeKey && t.is(input.ExpressionAttributeNames[`#${params.rangeKey.name}`], params.rangeKey.name);
    }

    t.truthy(input.ExpressionAttributeValues);
    if (input.ExpressionAttributeValues) {
        t.is(input.ExpressionAttributeValues[`:${params.hashKey.name}`], params.hashKey.value as any);
        params.rangeKey && t.is(input.ExpressionAttributeValues[`:${params.rangeKey.name}`], params.rangeKey.value as any);
    }
    
    t.truthy(input.ExclusiveStartKey);
    if (input.ExclusiveStartKey && params.startKey) {
        t.is(input.ExclusiveStartKey['year'], params.startKey.year as any);
        t.is(input.ExclusiveStartKey['title'], params.startKey.title);
    }
});
