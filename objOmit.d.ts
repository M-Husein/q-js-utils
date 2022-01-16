export type Argument = string | Argument[];

export default function objOmit(obj: object, ...omitKeys: Argument[]): object;