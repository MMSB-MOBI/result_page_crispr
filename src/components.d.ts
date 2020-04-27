/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { CurrentSelection, SequenceSGRNAHit, SGRNAForOneEntry, } from "./components/result-page/interfaces";
export namespace Components {
    interface CircularBarplot {
        "genome_size": number;
        "list_coordinates": number[];
        "selected_sgrna_coordinates": string[];
    }
    interface GenomicCard2 {
        "changeOrganism": (org: string) => void;
        "changeRef": (ref: string) => void;
        "changeSgrna": (sgrna: string) => void;
        "changeSgrnaSubset": (sgrna_subset: string[]) => void;
        "current_references": string[];
        "current_sgrnas": SGRNAForOneEntry[];
        "diagonal_svg": number;
        "initial_sgrnas"?: SGRNAForOneEntry[];
        "onClickHighlight": () => void;
        "organisms": string[];
        "selected": CurrentSelection;
    }
    interface LinearCard {
        "all_sgrna": string;
        "gene": string;
        "nb_step": string;
        "onClose"?: () => void;
        "width_bar": string;
        "width_div": string;
    }
    interface OccurencesGraph {
        "occurences_data": {
            name: string;
            coords_count: number;
        }[];
    }
    interface RadialArea {
        "genome_size": number;
        "sgrna_length": number;
        "sgrnas": SGRNAForOneEntry[];
    }
    interface ResultPage {
        "all_data": string;
        "complete_data": string;
        "gene": string;
        "org_names": string;
        "size": string;
    }
    interface TableCrispr {
        "complete_data": SequenceSGRNAHit[];
        "onOrganismClick"?: (organism: string, sgrna: string) => void;
        "selected": CurrentSelection;
        "shouldHighlight": boolean;
    }
}
declare global {
    interface HTMLCircularBarplotElement extends Components.CircularBarplot, HTMLStencilElement {
    }
    var HTMLCircularBarplotElement: {
        prototype: HTMLCircularBarplotElement;
        new (): HTMLCircularBarplotElement;
    };
    interface HTMLGenomicCard2Element extends Components.GenomicCard2, HTMLStencilElement {
    }
    var HTMLGenomicCard2Element: {
        prototype: HTMLGenomicCard2Element;
        new (): HTMLGenomicCard2Element;
    };
    interface HTMLLinearCardElement extends Components.LinearCard, HTMLStencilElement {
    }
    var HTMLLinearCardElement: {
        prototype: HTMLLinearCardElement;
        new (): HTMLLinearCardElement;
    };
    interface HTMLOccurencesGraphElement extends Components.OccurencesGraph, HTMLStencilElement {
    }
    var HTMLOccurencesGraphElement: {
        prototype: HTMLOccurencesGraphElement;
        new (): HTMLOccurencesGraphElement;
    };
    interface HTMLRadialAreaElement extends Components.RadialArea, HTMLStencilElement {
    }
    var HTMLRadialAreaElement: {
        prototype: HTMLRadialAreaElement;
        new (): HTMLRadialAreaElement;
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
        "circular-barplot": HTMLCircularBarplotElement;
        "genomic-card2": HTMLGenomicCard2Element;
        "linear-card": HTMLLinearCardElement;
        "occurences-graph": HTMLOccurencesGraphElement;
        "radial-area": HTMLRadialAreaElement;
        "result-page": HTMLResultPageElement;
        "table-crispr": HTMLTableCrisprElement;
    }
}
declare namespace LocalJSX {
    interface CircularBarplot {
        "genome_size"?: number;
        "list_coordinates"?: number[];
        "selected_sgrna_coordinates"?: string[];
    }
    interface GenomicCard2 {
        "changeOrganism"?: (org: string) => void;
        "changeRef"?: (ref: string) => void;
        "changeSgrna"?: (sgrna: string) => void;
        "changeSgrnaSubset"?: (sgrna_subset: string[]) => void;
        "current_references"?: string[];
        "current_sgrnas"?: SGRNAForOneEntry[];
        "diagonal_svg"?: number;
        "initial_sgrnas"?: SGRNAForOneEntry[];
        "onClickHighlight"?: () => void;
        "onGenomic-card.button-click"?: (event: CustomEvent<any>) => void;
        "onGenomic-card.coordinate-out"?: (event: CustomEvent<any>) => void;
        "onGenomic-card.coordinate-over"?: (event: CustomEvent<any>) => void;
        "organisms"?: string[];
        "selected"?: CurrentSelection;
    }
    interface LinearCard {
        "all_sgrna"?: string;
        "gene"?: string;
        "nb_step"?: string;
        "onClose"?: () => void;
        "width_bar"?: string;
        "width_div"?: string;
    }
    interface OccurencesGraph {
        "occurences_data"?: {
            name: string;
            coords_count: number;
        }[];
    }
    interface RadialArea {
        "genome_size"?: number;
        "sgrna_length"?: number;
        "sgrnas"?: SGRNAForOneEntry[];
    }
    interface ResultPage {
        "all_data"?: string;
        "complete_data"?: string;
        "gene"?: string;
        "org_names"?: string;
        "size"?: string;
    }
    interface TableCrispr {
        "complete_data"?: SequenceSGRNAHit[];
        "onOrganismClick"?: (organism: string, sgrna: string) => void;
        "onTable-crispr.org-click"?: (event: CustomEvent<any>) => void;
        "selected"?: CurrentSelection;
        "shouldHighlight"?: boolean;
    }
    interface IntrinsicElements {
        "circular-barplot": CircularBarplot;
        "genomic-card2": GenomicCard2;
        "linear-card": LinearCard;
        "occurences-graph": OccurencesGraph;
        "radial-area": RadialArea;
        "result-page": ResultPage;
        "table-crispr": TableCrispr;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "circular-barplot": LocalJSX.CircularBarplot & JSXBase.HTMLAttributes<HTMLCircularBarplotElement>;
            "genomic-card2": LocalJSX.GenomicCard2 & JSXBase.HTMLAttributes<HTMLGenomicCard2Element>;
            "linear-card": LocalJSX.LinearCard & JSXBase.HTMLAttributes<HTMLLinearCardElement>;
            "occurences-graph": LocalJSX.OccurencesGraph & JSXBase.HTMLAttributes<HTMLOccurencesGraphElement>;
            "radial-area": LocalJSX.RadialArea & JSXBase.HTMLAttributes<HTMLRadialAreaElement>;
            "result-page": LocalJSX.ResultPage & JSXBase.HTMLAttributes<HTMLResultPageElement>;
            "table-crispr": LocalJSX.TableCrispr & JSXBase.HTMLAttributes<HTMLTableCrisprElement>;
        }
    }
}
