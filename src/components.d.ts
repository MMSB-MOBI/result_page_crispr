/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { Coordinate, CurrentSelection, SequenceSGRNAHit, SGRNAForOneEntry, } from "./components/result-page/interfaces";
export namespace Components {
    interface CircularBarplot {
        "active_rotation"?: any;
        "gene_coordinates"?: Coordinate[];
        "genome_size": number;
        "list_coordinates": number[];
        "onClickBarplot": (start: number, end: number) => void;
        "selected_sgrna_coordinates": string[];
    }
    interface CircularBarplotLegend {
        "gene"?: boolean;
    }
    interface CoordBox {
        "current_genes": any;
        "current_sgrnas": any;
        "selected": CurrentSelection;
    }
    interface DropdownMenu {
        "fasta_refs": string[];
        "organisms": string[];
        "selectOrg": (org: string) => void;
        "selectRef": (ref: string) => void;
        "selectSgrna": (sgrna: string) => void;
        "selected": CurrentSelection;
        "sgrnas": SGRNAForOneEntry[];
    }
    interface GenomicCard {
        "current_references": string[];
        "current_sgrnas": SGRNAForOneEntry[];
        "organisms": string[];
        "selected": CurrentSelection;
    }
    interface ResultPage {
        "all_data": string;
        "complete_data": string;
        "fasta_metadata": string;
        "gene"?: string;
        "org_names": string;
    }
    interface TableCrispr {
        "complete_data": SequenceSGRNAHit[];
        "gene": boolean;
        "onOrganismClick"?: (organism: string, sgrna: string) => void;
        "reinitSelection": () => void;
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
    interface HTMLCircularBarplotLegendElement extends Components.CircularBarplotLegend, HTMLStencilElement {
    }
    var HTMLCircularBarplotLegendElement: {
        prototype: HTMLCircularBarplotLegendElement;
        new (): HTMLCircularBarplotLegendElement;
    };
    interface HTMLCoordBoxElement extends Components.CoordBox, HTMLStencilElement {
    }
    var HTMLCoordBoxElement: {
        prototype: HTMLCoordBoxElement;
        new (): HTMLCoordBoxElement;
    };
    interface HTMLDropdownMenuElement extends Components.DropdownMenu, HTMLStencilElement {
    }
    var HTMLDropdownMenuElement: {
        prototype: HTMLDropdownMenuElement;
        new (): HTMLDropdownMenuElement;
    };
    interface HTMLGenomicCardElement extends Components.GenomicCard, HTMLStencilElement {
    }
    var HTMLGenomicCardElement: {
        prototype: HTMLGenomicCardElement;
        new (): HTMLGenomicCardElement;
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
        "circular-barplot-legend": HTMLCircularBarplotLegendElement;
        "coord-box": HTMLCoordBoxElement;
        "dropdown-menu": HTMLDropdownMenuElement;
        "genomic-card": HTMLGenomicCardElement;
        "result-page": HTMLResultPageElement;
        "table-crispr": HTMLTableCrisprElement;
    }
}
declare namespace LocalJSX {
    interface CircularBarplot {
        "active_rotation"?: any;
        "gene_coordinates"?: Coordinate[];
        "genome_size"?: number;
        "list_coordinates"?: number[];
        "onClickBarplot"?: (start: number, end: number) => void;
        "selected_sgrna_coordinates"?: string[];
    }
    interface CircularBarplotLegend {
        "gene"?: boolean;
    }
    interface CoordBox {
        "current_genes"?: any;
        "current_sgrnas"?: any;
        "onCoord-box.coordinate-out"?: (event: CustomEvent<any>) => void;
        "onCoord-box.coordinate-over"?: (event: CustomEvent<any>) => void;
        "selected"?: CurrentSelection;
    }
    interface DropdownMenu {
        "fasta_refs"?: string[];
        "onDropdown-menu.display-button-click"?: (event: CustomEvent<any>) => void;
        "organisms"?: string[];
        "selectOrg"?: (org: string) => void;
        "selectRef"?: (ref: string) => void;
        "selectSgrna"?: (sgrna: string) => void;
        "selected"?: CurrentSelection;
        "sgrnas"?: SGRNAForOneEntry[];
    }
    interface GenomicCard {
        "current_references"?: string[];
        "current_sgrnas"?: SGRNAForOneEntry[];
        "organisms"?: string[];
        "selected"?: CurrentSelection;
    }
    interface ResultPage {
        "all_data"?: string;
        "complete_data"?: string;
        "fasta_metadata"?: string;
        "gene"?: string;
        "org_names"?: string;
    }
    interface TableCrispr {
        "complete_data"?: SequenceSGRNAHit[];
        "gene"?: boolean;
        "onOrganismClick"?: (organism: string, sgrna: string) => void;
        "reinitSelection"?: () => void;
        "selected"?: CurrentSelection;
        "shouldHighlight"?: boolean;
    }
    interface IntrinsicElements {
        "circular-barplot": CircularBarplot;
        "circular-barplot-legend": CircularBarplotLegend;
        "coord-box": CoordBox;
        "dropdown-menu": DropdownMenu;
        "genomic-card": GenomicCard;
        "result-page": ResultPage;
        "table-crispr": TableCrispr;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "circular-barplot": LocalJSX.CircularBarplot & JSXBase.HTMLAttributes<HTMLCircularBarplotElement>;
            "circular-barplot-legend": LocalJSX.CircularBarplotLegend & JSXBase.HTMLAttributes<HTMLCircularBarplotLegendElement>;
            "coord-box": LocalJSX.CoordBox & JSXBase.HTMLAttributes<HTMLCoordBoxElement>;
            "dropdown-menu": LocalJSX.DropdownMenu & JSXBase.HTMLAttributes<HTMLDropdownMenuElement>;
            "genomic-card": LocalJSX.GenomicCard & JSXBase.HTMLAttributes<HTMLGenomicCardElement>;
            "result-page": LocalJSX.ResultPage & JSXBase.HTMLAttributes<HTMLResultPageElement>;
            "table-crispr": LocalJSX.TableCrispr & JSXBase.HTMLAttributes<HTMLTableCrisprElement>;
        }
    }
}
