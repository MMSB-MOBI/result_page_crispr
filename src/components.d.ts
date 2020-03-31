/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface GenomicCard {
        "all_data": string;
        "diagonal_svg": number;
        "gene": string;
        "org_names": string;
        "selectedSection": number;
        "sgrnaSelected": string;
        "size": string;
        "sizeSelected": number;
        "subSgrna": string[];
    }
    interface LinearCard {
        "all_sgrna": string;
        "gene": string;
        "nb_step": string;
        "onClose"?: () => void;
        "width_bar": string;
        "width_div": string;
    }
    interface ResultPage {
        "all_data": string;
        "complete_data": string;
        "gene": string;
        "org_names": string;
        "size": string;
    }
    interface TableCrispr {
        "complete_data": string;
    }
}
declare global {
    interface HTMLGenomicCardElement extends Components.GenomicCard, HTMLStencilElement {
    }
    var HTMLGenomicCardElement: {
        prototype: HTMLGenomicCardElement;
        new (): HTMLGenomicCardElement;
    };
    interface HTMLLinearCardElement extends Components.LinearCard, HTMLStencilElement {
    }
    var HTMLLinearCardElement: {
        prototype: HTMLLinearCardElement;
        new (): HTMLLinearCardElement;
    };
    interface HTMLResultPageElement extends Components.ResultPage, HTMLStencilElement {
    }
    var HTMLResultPageElement: {
        prototype: HTMLResultPageElement;
        new (): HTMLResultPageElement;
    };
    interface HTMLTableCrisprElement extends Components.TableCrispr, HTMLStencilElement {
    }
    var HTMLTableCrisprElement: {
        prototype: HTMLTableCrisprElement;
        new (): HTMLTableCrisprElement;
    };
    interface HTMLElementTagNameMap {
        "genomic-card": HTMLGenomicCardElement;
        "linear-card": HTMLLinearCardElement;
        "result-page": HTMLResultPageElement;
        "table-crispr": HTMLTableCrisprElement;
    }
}
declare namespace LocalJSX {
    interface GenomicCard {
        "all_data"?: string;
        "diagonal_svg"?: number;
        "gene"?: string;
        "onChangeOrgCard"?: (event: CustomEvent<any>) => void;
        "onChangeRefCard"?: (event: CustomEvent<any>) => void;
        "onSgDataSection"?: (event: CustomEvent<any>) => void;
        "org_names"?: string;
        "selectedSection"?: number;
        "sgrnaSelected"?: string;
        "size"?: string;
        "sizeSelected"?: number;
        "subSgrna"?: string[];
    }
    interface LinearCard {
        "all_sgrna"?: string;
        "gene"?: string;
        "nb_step"?: string;
        "onClose"?: () => void;
        "width_bar"?: string;
        "width_div"?: string;
    }
    interface ResultPage {
        "all_data"?: string;
        "complete_data"?: string;
        "gene"?: string;
        "org_names"?: string;
        "size"?: string;
    }
    interface TableCrispr {
        "complete_data"?: string;
    }
    interface IntrinsicElements {
        "genomic-card": GenomicCard;
        "linear-card": LinearCard;
        "result-page": ResultPage;
        "table-crispr": TableCrispr;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "genomic-card": LocalJSX.GenomicCard & JSXBase.HTMLAttributes<HTMLGenomicCardElement>;
            "linear-card": LocalJSX.LinearCard & JSXBase.HTMLAttributes<HTMLLinearCardElement>;
            "result-page": LocalJSX.ResultPage & JSXBase.HTMLAttributes<HTMLResultPageElement>;
            "table-crispr": LocalJSX.TableCrispr & JSXBase.HTMLAttributes<HTMLTableCrisprElement>;
        }
    }
}
