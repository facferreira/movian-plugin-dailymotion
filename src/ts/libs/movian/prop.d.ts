declare module "movian/prop" {
    export var global: PropValue;

    export function createRoot(name: string): PropValue;
    export function print(data: any);
    export function subscribeValue(prop: PropValue, callback: (data: any[]) => void, ctrl: any);
}

declare interface PropValue {
    [key: string]: PropValue;
}