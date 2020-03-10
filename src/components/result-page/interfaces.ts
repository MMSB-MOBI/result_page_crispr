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
}

export interface MinMaxOccurencesData {
    seq:string
    min_occurences:number
    max_occurences:number
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
}

export interface CurrentSelection {
    org: string;
    sgrna: string;
    ref: string;
    size: number; 
}

export type SortingOrder = 'ascending' | 'descending';

export type SortingType = "Min occurences" | "Max occurences" | "Alphabetical";

/*export interface OrganismHit {
    [organismName: string]: RefHit;
}

export interface RefHit {
    [ref: string]: SGRNAHit;
}

export interface SGRNAHit {
    [seq: string]: string[];
}*/
