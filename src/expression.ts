
export function formatExpressionVariableName(name: string) {
    return name.trim().replace(/[\.\[\]]/g, '_');
}

export function setExpressionNameValues(nameValues: ExpressionNamesValues, data: { [key: string]: any }) {
    for (const name of Object.keys(data)) {
        setExpressionNameValue(nameValues, name, data[name]);
    }
}

export function setExpressionNameValue(nameValues: ExpressionNamesValues, name: string, value: any) {
    const varName = formatExpressionVariableName(name);

    nameValues.names['#' + varName] = name;
    nameValues.values[':' + varName] = value;

    return varName;
}

export type ExpressionNamesValues = {
    names: ExpressionNames
    values: ExpressionValues
}
export type ExpressionNames = { [key: string]: string }
export type ExpressionValues = { [key: string]: any }
