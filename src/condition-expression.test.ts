
import test from 'ava';
import {
    buildConditionExpression,
    ConditionExpressionParams,
} from './condition-expression';


test('hashKey = ', t => {
    const params: ConditionExpressionParams = {
        hashKey: {
            name: 'id',
            value: 1,
        },
        operation: '='
    };
    const input = buildConditionExpression(params);

    t.is(input.expression, `#${params.hashKey.name} = :${params.hashKey.name}`);
    t.is(Object.keys(input.names).length, 1);
    t.is(input.names[`#${params.hashKey.name}`], params.hashKey.name);
    t.is(Object.keys(input.values).length, 1);
    t.is(input.values[`:${params.hashKey.name}`], params.hashKey.value);
})

test('hashKey <> ', t => {
    const params: ConditionExpressionParams = {
        hashKey: {
            name: 'id',
            value: 1,
        },
        operation: '<>'
    };
    const input = buildConditionExpression(params);

    t.is(input.expression, `#${params.hashKey.name} <> :${params.hashKey.name}`);
    t.is(Object.keys(input.names).length, 1);
    t.is(input.names[`#${params.hashKey.name}`], params.hashKey.name);
    t.is(Object.keys(input.values).length, 1);
    t.is(input.values[`:${params.hashKey.name}`], params.hashKey.value);
})

test('hashKey & rangeKey = ', t => {
    const rangeKey = {
        name: 'createdAt',
        value: new Date().toISOString(),
    };
    const params: ConditionExpressionParams = {
        hashKey: {
            name: 'id',
            value: 1,
        },
        rangeKey,
        operation: '='
    };
    const input = buildConditionExpression(params);

    t.is(input.expression, `#${params.hashKey.name} = :${params.hashKey.name} AND #${rangeKey.name} = :${rangeKey.name}`);
    t.is(Object.keys(input.names).length, 2);
    t.is(input.names[`#${params.hashKey.name}`], params.hashKey.name);
    t.is(input.names[`#${rangeKey.name}`], rangeKey.name);
    t.is(Object.keys(input.values).length, 2);
    t.is(input.values[`:${params.hashKey.name}`], params.hashKey.value);
    t.is(input.values[`:${rangeKey.name}`], rangeKey.value);
})
