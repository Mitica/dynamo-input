
import test from 'ava';
import {
    batchGetItemInput,
    BatchGetItemParams,
    deleteItemInput,
    DeleteItemParams,
    getItemInput,
    GetItemParams,
    putItemInput,
    PutItemParams,
    UpdateItemParams,
    updateItemInput,
} from './item';

test('putItemInput', t => {
    let params: PutItemParams = {
        tableName: 'Movies',
        item: {
            id: 1,
            year: 2015,
            title: 'Cool Title'
        },
    };

    let input = putItemInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.Item['id'], params.item.id);
    t.is(input.Item['year'], params.item.year);
    t.is(input.Item['title'], params.item.title);
});

test('getItemInput', t => {
    let params: GetItemParams = {
        tableName: 'Movies',
        key: {
            id: 1
        },
        attributes: ['id', 'title'],
    };

    let input = getItemInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.Key['id'], params.key.id as any);
    t.is(input.ProjectionExpression, ['#id', '#title'].join(','));
    t.deepEqual(input.ExpressionAttributeNames, { '#id': 'id', '#title': 'title' });
    t.is(input.AttributesToGet, undefined);
    t.is(input.ReturnConsumedCapacity, undefined);
});

test('getItemInput complex ProjectionExpression', t => {
    let params: GetItemParams = {
        tableName: 'Movies',
        key: {
            id: 1
        },
        attributes: ['id', 'tags.id'],
    };

    let input = getItemInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.Key['id'], params.key.id as any);
    t.is(input.ProjectionExpression, ['#id', '#tags.#id'].join(','));
    t.deepEqual(input.ExpressionAttributeNames, { '#id': 'id', '#tags': 'tags' });
    t.is(input.AttributesToGet, undefined);
    t.is(input.ReturnConsumedCapacity, undefined);
});

test('batchGetItemInput', t => {
    let params: BatchGetItemParams = {
        tableName: 'Movies',
        keys: [{
            id: 1
        }, {
            id: 2
        }],
        attributes: ['id', 'year', 'title'],
    };

    let input = batchGetItemInput(params);

    const RequestItemsKeys = Object.keys(input.RequestItems);

    t.is(RequestItemsKeys.length, 1);
    t.is(RequestItemsKeys[0], params.tableName);
    t.is(input.RequestItems[params.tableName].Keys.length, 2);
    t.is(input.RequestItems[params.tableName].Keys[0]['id'], params.keys[0].id as any);
    t.is(input.RequestItems[params.tableName].Keys[1]['id'], params.keys[1].id as any);
    t.is(input.RequestItems[params.tableName].ProjectionExpression, ['#id', '#year', '#title'].join(','));
    t.deepEqual(input.RequestItems[params.tableName].ExpressionAttributeNames, { '#id': 'id', '#year': 'year', '#title': 'title' });
    t.is(input.RequestItems[params.tableName].AttributesToGet, undefined);
    t.is(input.ReturnConsumedCapacity, undefined);
});

test('deleteItemInput', t => {
    let params: DeleteItemParams = {
        tableName: 'Movies',
        key: {
            id: 1
        },
    };

    let input = deleteItemInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.Key['id'], params.key.id as any);
    t.is(input.ReturnValues, undefined);
});

test('updateItem', t => {
    let params: UpdateItemParams = {
        tableName: 'Movies',
        hashKeyName: 'id',
        key: {
            id: 1
        },
        set: {
            title: {
                value: 'New title'
            }
        }
    };

    let input = updateItemInput(params);

    t.is(input.TableName, params.tableName);
    t.is(input.Key['id'], params.key.id as any);
    t.is(input.ConditionExpression, '#id = :id');
    t.is(input.UpdateExpression, 'SET #title = :title');
    t.truthy(input.ExpressionAttributeNames);
    if (input.ExpressionAttributeNames) {
        t.is(input.ExpressionAttributeNames['#id'], 'id');
        t.is(input.ExpressionAttributeNames['#title'], 'title');
    }
    t.truthy(input.ExpressionAttributeValues);
    if (input.ExpressionAttributeValues) {
        t.is(input.ExpressionAttributeValues[':id'], 1);
        t.is(input.ExpressionAttributeValues[':title'], 'New title');
    }
    t.is(input.ReturnValues, undefined);
});
