export interface SequenceSGRNAHit {
    sequence: string;
    occurences: OccurenceSGRNAHit[];
}

export interface OccurenceSGRNAHit {
    org: string;
    all_ref: RefSGRNAHit[];
}

export interface RefSGRNAHit {
    ref: string;
    coords: string[];
    on_gene?: string[];
    not_on_gene?: string[];
}

export interface MinMaxOccurencesData {
    seq:string
    min_occurences:number
    max_occurences:number
    total_occurences:number
}

export interface OrganismHit {
     organism: string;
     fasta_entry: FastaEntryHit[];
}

export interface FastaEntryHit {
     ref: string; 
     sgrna : SGRNAForOneEntry[];
}

export interface SGRNAForOneEntry {
     seq: string; 
     coords: string[];
     on_gene?: string[];
     not_on_gene?: string[]; 
}

export interface CurrentSelection {
    org: string;
    sgrna: string;
    ref: string;
    size: number; 
    fasta_header : string
}

export interface CoordinatesBinData {
    bin_start:number; 
    bin_end:number;
    number_coords_inside:number; 
    number_coords_proportion:number; 
    blurred:number; 
    bin_id:string; 
    y_placement?: number; 
}

export interface FastaReferences {
    ref:string; //fasta identifiant
    status:DisplayStatus; 
}

export interface FastaMetadata{
    org:string;
    fasta_ref:string;
    size:number;
    header:string; 

}

export interface Coordinate{
    start:number;
    end:number;
}

export type SortingOrder = 'ascending' | 'descending';

export type SortingType = "Min occurences" | "Max occurences" | "Alphabetical" | "Occurences";

export type DisplayStatus = "hidden" | "display"