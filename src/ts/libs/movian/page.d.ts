declare module "movian/page" {
    export class Route {
        constructor(regex: string, callback: (page: Page, ...args: string[]) => void);
        destroy(): void;
    }

    export class Searcher {
        constructor(title: string, icon: string, callback: (page: Page, ...args: string[]) => void);
        destroy(): void;
    }
}

interface ItemMetadata {
    title: string;
    description?: string;
    icon?: string;
    duration?: number;
    views?: number;
    likes?: number;
    dislikes?: number;
}

interface PageMetadata {
    title?: string;
    description?: string;
    icon?: string;
}

interface VideoMetadata {
    filename?: string;
    year?: number;
    title?: string;
    season?: number;
    episode?: number;
    imdb?: string;
    duration?: number;
}

interface Item {
    page: Page;
    root: PropValue;

    bindVideoMetadata(metadata: VideoMetadata);
    unbindVideoMetadata(metadata: VideoMetadata);
    toString(): string;
    dump(): void;
    enable(): void;
    disable(): void;
    destroyOption(item: any): void; // TODO: type of item?
    addOptAction(title: string, func: () => void, subtype: string): PropValue;
    addOptURL(title: string, url: string, subtype: string);
    addOptSeparator(title: string);
    destroy(): void;
    moveBefore(before: Item): void;
    onEvent(type: string, callback: (val: any) => void); // TODO type of val?
}

interface Page {
    type: string;
    metadata: PageMetadata;
    loading: boolean;
    source: string;
    entries: number;
    paginator: () => void;
    asyncPaginator: () => void;
    options: SettingsGlobalInstance; // TODO type of options?

    haveMore(more: boolean);
    findItemByProp(prop: PropValue);
    error(msg: string);
    getItems(): Item[];
    appendItem(url: string, type: string, metadata: ItemMetadata): Item;
    appendAction(title: string, func: () => void, subtype: string): Item;
    appendPassiveItem(type: string, data: string, metadata: ItemMetadata): Item;
    dump(): void;
    flush(): void;
    redirect(url: string);
    onEvent(type: string, callback: (val: any) => void); // TODO type of val?
}