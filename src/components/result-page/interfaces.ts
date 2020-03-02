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
