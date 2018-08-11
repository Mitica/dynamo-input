
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
    t.is(input.Item['id'].N, params.item.id.toString());
    t.is(input.Item['year'].N, params.item.year.toString());
    t.is(input.Item['title'].S, params.item.title);
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
    t.is(input.Key['id'].N, params.key.id.toString());
    params.attributes && t.is(input.ProjectionExpression, params.attributes.join(','));
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
    t.is(input.RequestItems[params.tableName].Keys[0]['id'].N, params.keys[0].id.toString());
    t.is(input.RequestItems[params.tableName].Keys[1]['id'].N, params.keys[1].id.toString());
    params.attributes && t.is(input.RequestItems[params.tableName].ProjectionExpression, params.attributes.join(','));
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
    t.is(input.Key['id'].N, params.key.id.toString());
    t.is(input.ReturnValues, undefined);
});
