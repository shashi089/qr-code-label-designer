// Ambient declaration for jsbarcode — used until the package ships its own .d.ts
declare module 'jsbarcode' {
    interface JsBarcodeOptions {
        format?: string;
        displayValue?: boolean;
        width?: number;
        height?: number;
        margin?: number;
        marginTop?: number;
        marginBottom?: number;
        marginLeft?: number;
        marginRight?: number;
        background?: string;
        lineColor?: string;
        fontSize?: number;
        fontOptions?: string;
        font?: string;
        textAlign?: string;
        textPosition?: string;
        textMargin?: number;
        valid?: (valid: boolean) => void;
    }

    function JsBarcode(
        element: HTMLCanvasElement | HTMLElement | string,
        text: string,
        options?: JsBarcodeOptions
    ): void;

    export = JsBarcode;
}
