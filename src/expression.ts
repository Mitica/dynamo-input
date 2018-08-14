
export function formatExpressionAttributeValueKey(name: string) {
    return ':' + name.trim().replace(/[\s\.\[\]]/g, '__');
}

export function formatExpressionAttributeNameKeys(name: string, expressionNames: ExpressionNames) {
    const keys = name.split(/\./g).map(item => {
        const key = '#' + item.trim().replace(/[\s\[\]]/g, '__');
        expressionNames[key] = item;

        return key;
    });

    return keys.join('.');
}

// export function setExpressionNameValues(nameValues: ExpressionNamesValues, data: { [key: string]: any }) {
//     for (const name of Object.keys(data)) {
//         setExpressionNameValue(nameValues, name, data[name]);
//     }
// }

export function setExpressionNameValue(values: ExpressionValues, name: string, value: any) {
    const varName = formatExpressionAttributeValueKey(name);

    values[varName] = value;

    return varName;
}

export function buildProjectionExpression(attributes: string[], names?: ExpressionNames) {
    names = names || {};
    const attributeNames: string[] = [];
    for (const attribute of attributes) {
        attributeNames.push(formatExpressionAttributeNameKeys(attribute, names));
    }
    const projection: ProjectionExpression = {
        expression: attributeNames.join(','),
        names,
    };

    return projection;
}

export type ExpressionNamesValues = {
    names: ExpressionNames
    values: ExpressionValues
}
export type ExpressionNames = { [key: string]: string }
export type ExpressionValues = { [key: string]: any }

export type ProjectionExpression = {
    expression: string
    names: ExpressionNames
}
