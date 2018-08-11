
import test from 'ava';
import {
    buildExpressionValue,
    buildUpdateExpression,
} from './update-expression';

test('buildUpdateExpression DELETE', t => {
    const result = buildUpdateExpression({
        delete: {
            Color: ['red'],
            Tags: ['news'],
        },
    });

    t.is(result.expression, 'DELETE #Color :Color, #Tags :Tags');
    t.deepEqual(result.names, { '#Color': 'Color', '#Tags': 'Tags' });
    t.deepEqual(result.values, { ':Color': ['red'], ':Tags': ['news'] });
})

test('buildUpdateExpression REMOVE', t => {
    const result = buildUpdateExpression({
        remove: ['Color', 'Tags'],
    });

    t.is(result.expression, 'REMOVE #Color, #Tags');
    t.deepEqual(result.names, { '#Color': 'Color', '#Tags': 'Tags' });
    t.deepEqual(result.values, {});
})

test('buildUpdateExpression SET value', t => {
    const result = buildUpdateExpression({
        set: {
            Title: {
                value: 'New title'
            },
        }
    });

    t.is(result.expression, 'SET #Title = :Title');
    t.deepEqual(result.names, { '#Title': 'Title' });
    t.deepEqual(result.values, { ':Title': 'New title' });
})

test('buildUpdateExpression SET value + 1', t => {
    const result = buildUpdateExpression({
        set: {
            Title: {
                value: 'New title'
            },
            countViews: {
                math: {
                    operator: '+',
                    left: {
                        path: 'countViews'
                    },
                    right: {
                        value: 1
                    }
                }
            }
        },
    });

    t.is(result.expression, 'SET #Title = :Title, #countViews = #countViews + :countViews_mth2');
    t.deepEqual(result.names, { '#Title': 'Title', '#countViews': 'countViews' });
    t.deepEqual(result.values, { ':Title': 'New title', ':countViews_mth2': 1 });
})

test('buildUpdateExpression SET path', t => {
    const result = buildUpdateExpression({
        set: {
            Title: {
                path: 'OldTitle'
            },
        },
    });

    t.is(result.expression, 'SET #Title = #OldTitle');
    t.deepEqual(result.names, { '#Title': 'Title', '#OldTitle': 'OldTitle' });
    t.deepEqual(result.values, {});
})

test('buildUpdateExpression SET if_not_exists', t => {
    const result = buildUpdateExpression({
        set: {
            Title: {
                if_not_exists: {
                    path: 'OldTitle',
                    value: 'Default title'
                }
            },
        },
    });

    t.is(result.expression, 'SET #Title = if_not_exists(#OldTitle, :OldTitle)');
    t.deepEqual(result.names, { '#Title': 'Title', '#OldTitle': 'OldTitle' });
    t.deepEqual(result.values, { ':OldTitle': 'Default title' });
})

test('buildExpressionValue#value', t => {
    const namesValues = { names: {}, values: {} };
    const result = buildExpressionValue('id', namesValues, { value: 1 });
    t.is(result, ':id');
    t.deepEqual(namesValues.names, {});
    t.deepEqual(namesValues.values, { ':id': 1 });
})

test('buildExpressionValue#path', t => {
    const namesValues = { names: {}, values: {} };
    const result = buildExpressionValue('id', namesValues, { path: 'OldId' });
    t.is(result, '#OldId');
    t.deepEqual(namesValues.names, { '#OldId': 'OldId' });
    t.deepEqual(namesValues.values, {});
})

test('buildExpressionValue#if_not_exists', t => {
    const namesValues = { names: {}, values: {} };
    const result = buildExpressionValue('id', namesValues, {
        if_not_exists: {
            path: 'OldId',
            value: 2
        }
    });
    t.is(result, 'if_not_exists(#OldId, :OldId)');
    t.deepEqual(namesValues.names, { '#OldId': 'OldId' });
    t.deepEqual(namesValues.values, { ':OldId': 2 });
})

test('buildExpressionValue#list_append', t => {
    const namesValues = { names: {}, values: {} };
    const result = buildExpressionValue('Tags', namesValues, {
        list_append: {
            left: {
                path: 'Tags'
            },
            right: {
                value: ['new']
            }
        }
    });
    t.is(result, 'list_append(#Tags, :Tags_lst_ppnd2)');
    t.deepEqual(namesValues.names, { '#Tags': 'Tags' });
    t.deepEqual(namesValues.values, { ':Tags_lst_ppnd2': ['new'] });
})

test('buildExpressionValue#math', t => {
    const namesValues = { names: {}, values: {} };
    const result = buildExpressionValue('counter', namesValues, {
        math: {
            operator: '+',
            left: {
                if_not_exists: {
                    path: 'counter',
                    value: 0
                }
            },
            right: {
                value: 1
            }
        }
    });
    t.is(result, 'if_not_exists(#counter, :counter) + :counter_mth2');
    t.deepEqual(namesValues.names, { '#counter': 'counter' });
    t.deepEqual(namesValues.values, { ':counter': 0, ':counter_mth2': 1 });
})
