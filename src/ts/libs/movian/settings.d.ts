declare module "movian/settings" {
    interface Setting {
        model: PropValue;
        value: any;
        enabled: boolean;
    }

    export var id: string;
    export var nodes: PropValue;
    export var properties: PropValue;

    export function destroy();
    export function dump();

    export function createBool(id: string, title: string, def: boolean, callback: (value: boolean) => void, persistent: boolean): Setting;
    export function createString(id: string, title: string, def: string, callback: (value: string) => void, persistent: boolean): Setting;
    export function createInt(id: string, title: string, def: number, min: number, max: number, step: number, unit: string,
        callback: (value: number) => void, persistent: boolean): Setting;
    export function createDivider(title: string);
    export function createInfo(id: string, icon: string, description: string);
    export function createAction(id: string, title: string, callback: () => void): Setting;
    export function createMultiOpt(id: string, title: string, options: {
        [0]: string;
        [1]: string;
        [2]?: boolean;
    }[], callback: (value: string) => void, persistent: boolean);

    export function globalSettings(id: string, title: string, icon: string, description: string);
    export function kvstoreSettings(nodes: PropValue, url: string, domain: string);
}

interface MultiOptOption {
    [0]: string;
    [1]: string;
    [2]?: boolean;
}