declare module "movian/service" {
    interface Service {
        id: any;
        enabled: boolean;

        destroy(): void;
    }

    export function create(title: string, url: string, type: string, enabled: boolean, icon: string) : Service;
}