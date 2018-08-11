import { ExpressionNamesValues, setExpressionNameValue } from "./expression";

export function buildConditionExpression(params: ConditionExpressionParams): ConditionExpressionInfo {

    const nameValues: ExpressionNamesValues = {
        names: {},
        values: {},
    };

    const hashKeyNameVar = setExpressionNameValue(nameValues, params.hashKey.name, params.hashKey.value);

    let expression = `#${hashKeyNameVar} ${params.operation} :${hashKeyNameVar}`;

    if (params.rangeKey) {
        const rangeKeyNameVar = setExpressionNameValue(nameValues, params.rangeKey.name, params.rangeKey.value);

        expression += ` AND #${rangeKeyNameVar} ${params.operation} :${rangeKeyNameVar}`;
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

// abstract class Expression {
//     protected children: Expression[] = []
//     protected addChild(child: Expression) {
//         this.children.push(child);
//     }
//     abstract toString(): string
// }

// type LogicalOperator = 'AND' | 'OR';
// class OperatorExpression extends Expression {
//     constructor(private operator: LogicalOperator) {
//         super();
//     }

//     toString() {
//         return `${this.operator}`;
//     }
// }

// class AttributeExpression extends Expression {
//     constructor(private name: string) {
//         super();
//     }

//     and() {
//         const child = new OperatorExpression('AND');

//         this.addChild(child);

//         return child;
//     }

//     eq()

//     toString() {
//         return `(${this.name} ${this.children})`;
//     }
// }
