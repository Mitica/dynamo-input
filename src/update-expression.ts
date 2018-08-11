import { ExpressionNamesValues, formatExpressionVariableName, setExpressionNameValue } from "./expression";

export function buildUpdateExpression(params: UpdateExpressionParams): UpdateExpressionInfo {
    let SET: string[] = [];
    let DELETE: string[] = [];
    let REMOVE: string[] = [];

    const nameValues: ExpressionNamesValues = {
        names: {},
        values: {},
    };

    if (params.delete) {
        for (const name of Object.keys(params.delete)) {
            const varName = setExpressionNameValue(nameValues, name, params.delete[name]);
            DELETE.push(`#${varName} :${varName}`);
        }
    }

    if (params.remove) {
        for (const name of params.remove) {
            const varName = formatExpressionVariableName(name);
            REMOVE.push(varName);
        }
    }

    if (params.set) {
        for (const name of Object.keys(params.set)) {
            const nameVar = formatExpressionVariableName(name);
            const nameValue = buildOperandExpressionValue(nameVar, nameValues, params.set[name]);
            SET.push(`#${nameVar} = ${nameValue}`);
        }
    }

    const expressions: string[] = [];
    if (SET.length) {
        expressions.push(`SET ${SET.join(',')}`);
    }
    if (REMOVE.length) {
        expressions.push(`REMOVE ${REMOVE.join(',')}`);
    }
    if (DELETE.length) {
        expressions.push(`DELETE ${REMOVE.join(',')}`);
    }

    const expression = expressions.join(' ');

    return {
        expression,
        names: nameValues.names,
        values: nameValues.values,
    };
}

// export function buildOperandExpressionValue(nameVar: string, nameValues: ExpressionNamesValues, set: UpdateExpressionSet) {
//     let expression = '';

//     // Name = 1
//     if (set.value !== undefined) {
//         nameValues.values[':' + nameVar] = set.value;
//         expression = `:${nameVar}`;
//     }
//     // Name = FirstName
//     else if (set.path) {
//         const pathVar = formatExpressionVariableName(set.path);
//         nameValues.names['#' + pathVar] = set.path;
//         expression = `#${pathVar}`;
//     }
//     // Name = if_not_exists(Name, :value)
//     else if (set.if_not_exists) {
//         const pathVar = setExpressionNameValue(nameValues, set.if_not_exists.path, set.if_not_exists.value);
//         expression = `if_not_exists(#${pathVar}, :${pathVar})`;
//     }
//     // Names = list_append(Names, :values)
//     else if (set.list_append) {
//         const list1ExpressionValue = buildOperandExpressionValue(nameVar + '_list1', nameValues, set.list_append.left);
//         const list2ExpressionValue = buildOperandExpressionValue(nameVar + '_list2', nameValues, set.list_append.right);

//         expression = `list_append(${list1ExpressionValue}, ${list2ExpressionValue})`;
//     }
//     // Rating = Rating - 1
//     else if (set.math) {
//         const leftExpressionValue = buildOperandExpressionValue(nameVar + '_v1', nameValues, set.math.left);
//         const rightExpressionValue = buildOperandExpressionValue(nameVar + '_v1', nameValues, set.math.right);

//         expression = `${leftExpressionValue} ${set.math.operation} ${rightExpressionValue}`;
//     } else {
//         throw new Error(`Invalid UpdateExpressionSetOperand: ${set}`);
//     }

//     return expression;
// }

export function buildOperandExpressionValue(nameVar: string, nameValues: ExpressionNamesValues, operand: UpdateExpressionSetOperand) {
    let expression = '';

    // Name = 1
    if (operand.type === 'value') {
        nameValues.values[':' + nameVar] = operand.value;
        expression = `:${nameVar}`;
    }
    // Name = FirstName
    else if (operand.type === 'path') {
        const pathVar = formatExpressionVariableName(operand.path);
        nameValues.names['#' + pathVar] = operand.path;
        expression = `#${pathVar}`;
    }
    // Name = if_not_exists(Name, :value)
    else if (operand.type === 'if_not_exists') {
        const pathVar = setExpressionNameValue(nameValues, operand.path, operand.value);
        expression = `if_not_exists(#${pathVar}, :${pathVar})`;
    }
    // Names = list_append(Names, :values)
    else if (operand.type === 'list_append') {
        const list1ExpressionValue = buildOperandExpressionValue(nameVar + '_list1', nameValues, operand.list1);
        const list2ExpressionValue = buildOperandExpressionValue(nameVar + '_list2', nameValues, operand.list2);

        expression = `list_append(${list1ExpressionValue}, ${list2ExpressionValue})`;
    }
    // Rating = Rating - 1
    else if (operand.type === 'math') {
        const leftExpressionValue = buildOperandExpressionValue(nameVar + '_v1', nameValues, operand.left);
        const rightExpressionValue = buildOperandExpressionValue(nameVar + '_v1', nameValues, operand.right);

        expression = `${leftExpressionValue} ${operand.operation} ${rightExpressionValue}`;
    } else {
        throw new Error(`Invalid UpdateExpressionSetOperand: ${operand}`);
    }

    return expression;
}

export type UpdateExpressionInfo = {
    expression: string
    names: { [key: string]: string }
    values: { [key: string]: any }
}

export interface UpdateExpressionParams {
    set?: { [key: string]: UpdateExpressionSetOperand }
    remove?: string[]
    delete?: { [key: string]: any }
}

// export type UpdateExpressionSet = {
//     value?: any
//     path?: string
//     if_not_exists?: {
//         path: string
//         value: any
//     }
//     list_append?: {
//         left: UpdateExpressionSet
//         right: UpdateExpressionSet
//     }
//     math?: {
//         operation: '-' | '+'
//         left: UpdateExpressionSet
//         right: UpdateExpressionSet
//     }
// }

export type UpdateExpressionSetOperand =
    UpdateExpressionSetValueOperand |
    UpdateExpressionSetPathOperand |
    UpdateExpressionSetIfNotExistsOperand |
    UpdateExpressionSetListAppendOperand |
    UpdateExpressionSetMathOperand;

export type UpdateExpressionSetValueOperand = {
    type: 'value'
    value: any
}

export type UpdateExpressionSetPathOperand = {
    type: 'path'
    path: string
}

export type UpdateExpressionSetIfNotExistsOperand = {
    type: 'if_not_exists'
    path: string
    value: any
}

export type UpdateExpressionSetListAppendOperand = {
    type: 'list_append'
    list1: UpdateExpressionSetPathOperand | UpdateExpressionSetValueOperand | UpdateExpressionSetIfNotExistsOperand
    list2: UpdateExpressionSetPathOperand | UpdateExpressionSetValueOperand | UpdateExpressionSetIfNotExistsOperand
}

export type UpdateExpressionSetMathOperand = {
    type: 'math',
    operation: '-' | '+'
    left: UpdateExpressionSetOperand
    right: UpdateExpressionSetOperand
}