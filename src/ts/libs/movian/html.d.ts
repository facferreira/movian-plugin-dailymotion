declare module "movian/html" {
    export function parse(html: string): Html;
}

interface Html {
    document: HtmlNode;
    root: HtmlNode;
}

interface HtmlNode {
    readonly nodeName: string;
    readonly nodeType: string;
    readonly children: HtmlNode[];
    readonly textContent: string;
    readonly attributes: any; // TODO type of attributes?

    getElementById(id: string): HtmlNode;
    getElementByClassName(className: string): HtmlNode[];
    getElementByTagName(tag: string): HtmlNode[];
}