import {
    setExpressionNameValue,
    formatExpressionAttributeNameKeys,
    ExpressionNames,
    ExpressionValues,
} from "./expression";

export function buildUpdateExpression(params: UpdateExpressionParams): UpdateExpressionInfo {
    let SET: string[] = [];
    let DELETE: string[] = [];
    let REMOVE: string[] = [];

    const names: ExpressionNames = {};
    const values: ExpressionValues = {};

    if (params.delete) {
        for (const name of Object.keys(params.delete)) {
            const nameVar = formatExpressionAttributeNameKeys(name, names);
            const valueVar = setExpressionNameValue(values, name, params.delete[name]);
            DELETE.push(`${nameVar} ${valueVar}`);
        }
    }

    if (params.remove) {
        for (const name of params.remove) {
            REMOVE.push(formatExpressionAttributeNameKeys(name, names));
        }
    }

    if (params.set) {
        for (const name of Object.keys(params.set)) {
            const nameVar = formatExpressionAttributeNameKeys(name, names);
            const valueVar = buildExpressionValue(name, names, values, params.set[name]);
            SET.push(`${nameVar} = ${valueVar}`);
        }
    }

    const expressions: string[] = [];
    if (SET.length) {
        expressions.push(`SET ${SET.join(', ')}`);
    }
    if (REMOVE.length) {
        expressions.push(`REMOVE ${REMOVE.join(', ')}`);
    }
    if (DELETE.length) {
        expressions.push(`DELETE ${DELETE.join(', ')}`);
    }

    const expression = expressions.join(' ');

    return {
        expression,
        names,
        values,
    };
}

export function buildExpressionValue(name: string, names: ExpressionNames, values: ExpressionValues, set: UpdateExpressionSet, valueNameSuffix: string = '') {
    let expression = '';

    // Name = 1
    if (set.value !== undefined) {
        expression = setExpressionNameValue(values, name + valueNameSuffix, set.value);
    }
    // Name = FirstName
    else if (set.path) {
        expression = formatExpressionAttributeNameKeys(set.path, names);
    }
    // Name = if_not_exists(Name, :value)
    else if (set.if_not_exists) {
        const pathName = formatExpressionAttributeNameKeys(set.if_not_exists.path, names);
        const pathVar = setExpressionNameValue(values, set.if_not_exists.path + valueNameSuffix, set.if_not_exists.value);
        expression = `if_not_exists(${pathName}, ${pathVar})`;
    }
    // Names = list_append(Names, :values)
    else if (set.list_append) {
        const list1ExpressionValue = buildExpressionValue(name, names, values, set.list_append.left, valueNameSuffix + '_lst_ppnd1');
        const list2ExpressionValue = buildExpressionValue(name, names, values, set.list_append.right, valueNameSuffix + '_lst_ppnd2');

        expression = `list_append(${list1ExpressionValue}, ${list2ExpressionValue})`;
    }
    // Rating = Rating - 1
    else if (set.math) {
        const leftExpressionValue = buildExpressionValue(name, names, values, set.math.left, valueNameSuffix + '_mth1');
        const rightExpressionValue = buildExpressionValue(name, names, values, set.math.right, valueNameSuffix + '_mth2');

        expression = `${leftExpressionValue} ${set.math.operator} ${rightExpressionValue}`;
    } else {
        throw new Error(`Invalid UpdateExpressionSetOperand: ${set}`);
    }

    return expression;
}

export type UpdateExpressionInfo = {
    expression: string
    names: { [key: string]: string }
    values: { [key: string]: any }
}

export interface UpdateExpressionParams {
    set?: { [key: string]: UpdateExpressionSet }
    remove?: string[]
    delete?: { [key: string]: any[] }
}

export type UpdateExpressionSet = {
    value?: any
    path?: string
    if_not_exists?: {
        path: string
        value: any
    }
    list_append?: {
        left: UpdateExpressionSet
        right: UpdateExpressionSet
    }
    math?: {
        operator: '-' | '+'
        left: UpdateExpressionSet
        right: UpdateExpressionSet
    }
}
