import {
    ExpressionNamesValues,
    formatExpressionAttributeNameKeys,
    setExpressionNameValue,
} from "./expression";

export function buildConditionExpression(params: ConditionExpressionParams): ConditionExpressionInfo {

    const nameValues: ExpressionNamesValues = {
        names: {},
        values: {},
    };

    const hashKeyNameVar = formatExpressionAttributeNameKeys(params.hashKey.name, nameValues.names);
    const hashKeyValueVar = setExpressionNameValue(nameValues.values, params.hashKey.name, params.hashKey.value);

    let expression = `${hashKeyNameVar} ${params.operation} ${hashKeyValueVar}`;

    if (params.rangeKey) {
        const rangeKeyNameVar = formatExpressionAttributeNameKeys(params.rangeKey.name, nameValues.names);
        const rangeKeyValueVar = setExpressionNameValue(nameValues.values, params.rangeKey.name, params.rangeKey.value);

        expression += ` AND ${rangeKeyNameVar} ${params.operation} ${rangeKeyValueVar}`;
    }

    return {
        expression,
        names: nameValues.names,
        values: nameValues.values,
    };
}

export type ConditionExpressionInfo = {
    expression: string
    names: { [key: string]: string }
    values: { [key: string]: any }
}

export interface ConditionExpressionParams {
    operation: '=' | '<>'
    hashKey: ConditionExpressionKey
    rangeKey?: ConditionExpressionKey
}

export type ConditionExpressionKey = {
    name: string
    value: string | number
}
