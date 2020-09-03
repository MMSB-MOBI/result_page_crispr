import { Component, Prop, h, State} from '@stencil/core';
import { SequenceSGRNAHit, OrganismHit, SGRNAForOneEntry, CurrentSelection, FastaMetadata, Coordinate} from './interfaces';
import "@mmsb/mmsb-select";

@Component({
  tag: 'result-page',
  styleUrl: 'result-page.css',
  shadow: true
})

export class ResultPage {
  // *************************** PROPERTY & CONSTRUCTOR ***************************
  //@Element() private element: HTMLElement;
  @Prop() complete_data: string;
  @Prop() all_data: string;
  @Prop() org_names: string;
  @Prop() gene?: string;
  @Prop() fasta_metadata:string;

  @State() display_linear_card: boolean = true;
  @State() tableCrisprOrganisms: string[] = [];
  @State() selected: CurrentSelection; //org, sgrna, ref, size
  @State() shouldHighlight = false;
  @State() current_references: string[];
  @State() current_sgrnas: SGRNAForOneEntry[];

  organism_data: OrganismHit[];
  sequence_data_json: SequenceSGRNAHit[];
  gene_json?:{[org : string]:{[ref: string]:Coordinate[]}}; 
  initial_sgrnas: SGRNAForOneEntry[];
  hidden_references: string[];
  fasta_metadata_json: FastaMetadata[]; //Need to be typed
  current_genes?:Coordinate[]; 


  componentWillLoad() {
    //Initialize data
    this.tableCrisprOrganisms = this.org_names.split("&");
    this.sequence_data_json = this.loadSequenceData();
    this.organism_data = this.formatOrganismData(); 
    this.fasta_metadata_json = JSON.parse(this.fasta_metadata)
    
    const org = this.tableCrisprOrganisms[0];
    this.current_references = this.getReferences(org)
    this.hidden_references = this.getHiddenReferences(org)
    const ref = this.current_references[0];

    this.current_sgrnas = this.getSgrnas(org, ref)
    this.selected = {
      org,
      sgrna: this.current_sgrnas[0].seq,
      ref,
      size: this.getSize(org,ref),
      fasta_header: this.getFastaHeader(org, ref)
    };

    this.initial_sgrnas = this.current_sgrnas; 
    if(this.gene !== "undefined"){
      this.gene_json = JSON.parse(this.gene); 
      this.current_genes = this.getGenesCoordinates(org, ref);
    }
  }

  loadSequenceData(): SequenceSGRNAHit[]{
    let sequence_data = JSON.parse(this.complete_data)
    sequence_data
      .forEach(e => e.occurences
        .forEach(occ => occ.all_ref
          .forEach(ref => ref.coords = Object.values(ref.coords))));
      
    return sequence_data 
  }

  /**
   * Format raw json organisms data to OrganismHit[] for easier manipulation
   */
  formatOrganismData():OrganismHit[]{
    const data_parsed = JSON.parse(this.all_data)
    return Object.entries(data_parsed)
      .map(org_entry => {
        const org = org_entry[0];
        return { 
          organism: org, 
          fasta_entry: Object.entries(org_entry[1])
            .map(fasta_entry => ({ 
              ref: fasta_entry[0], 
              // @ts-ignore
              sgrna: Object.entries(fasta_entry[1]).map(sgrna => ({ seq: sgrna[0], coords: Object.values(sgrna[1].coords), on_gene: sgrna[1].on_gene ? Object.values(sgrna[1].on_gene) : undefined, not_on_gene: sgrna[1].not_on_gene ? Object.values(sgrna[1].not_on_gene) : undefined}))
            })) 
        }
      }); 
  }

  /**
   * Get list of references (fasta subsequences) for one organism
   * @param org : organism
   */
  getReferences(org: string): string[] {
    return this.organism_data
      .find(organism_entry => organism_entry.organism === org)
      .fasta_entry.map(e => e.ref)
  }

  getReferencesWithSeq(org:string, sgrna:string){
      return this.sequence_data_json.find(sequence_entry => sequence_entry.sequence === sgrna)
      .occurences.find(occurence_entry => occurence_entry.org === org)
      .all_ref.map(ref_entry => ref_entry.ref)
  }

  /**
   * Return sgrna hits for one organism and one reference. Just keep filtered_sgrna if filtered_sgrna is provided. 
   * @param org : organism
   * @param ref : reference (fasta subsequence)
   * @param filtered_sgrna : sgrna to keep if selection has been done
   */
  getSgrnas(org: string, ref: string, filtered_sgrna?: string[]): SGRNAForOneEntry[]{
    let sgrnas = this.organism_data
      .find(e => e.organism === org)
      .fasta_entry.find(e => e.ref === ref).sgrna

    if (filtered_sgrna) {
      const matches = new Set(filtered_sgrna);
      sgrnas = sgrnas.filter(v => matches.has(v.seq));
    }
    return sgrnas;
  }

  /**
   * Get sequence size from one organism/reference couple
   * @param org : organism
   * @param ref : reference
   */
  getSize(org:string, ref:string): number{
    return this.fasta_metadata_json.find( e => e.org === org && e.fasta_ref === ref).size
  }

  /**
   * For given organism, get fasta subsequences with no sgrna on it.
   * @param org : organism
   */
  getHiddenReferences(org:string):string[]{
    const current_ref = this.getReferences(org)
    const all_ref = this.fasta_metadata_json.filter(fasta_metadata => fasta_metadata.org === org).map(e => e.fasta_ref)
    const difference = all_ref.filter(x => !current_ref.includes(x)); //Get references in all_ref and not in current_ref
    return difference
  }

  
  /**
   * For given organism and fasta subsequence, get fasta header
   * @param org : organism
   * @param ref : reference of fasta subsequence
   */
  getFastaHeader(org:string, ref:string):string{
    const fasta_header = this.fasta_metadata_json.find( e => e.org === org && e.fasta_ref === ref).header
    return fasta_header
  }

  /**
   * Get genes coordinates for given organism and fasta sequence
   * @param org : organism
   * @param ref : reference of fasta subsequence
   */
  getGenesCoordinates(org:string, ref:string):Coordinate[]{
    return this.gene_json[org][ref]
  }

  render() {
    // @ts-ignore
    window.result_page = this;

    return ([<head>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/14.0.3/nouislider.min.css" rel="stylesheet"/>
    </head>,
      <div class="root">
        <div class="table">
          <table-crispr
            selected={this.selected}
            complete_data={this.sequence_data_json}
            onOrganismClick={(organism, sgrna) => {
              if (!organism) {
                this.selected = undefined;
              }
              this.current_references = this.getReferencesWithSeq(organism, sgrna);
              this.hidden_references = this.getHiddenReferences(organism); 
              const ref_selected = this.current_references[0]
              this.current_sgrnas = this.getSgrnas(organism, ref_selected);
              this.selected = {
                org: organism,
                sgrna,
                ref: ref_selected,
                size: this.getSize(organism, ref_selected),
                fasta_header: this.getFastaHeader(organism, ref_selected)
              };
              this.shouldHighlight = true;
              this.initial_sgrnas = this.current_sgrnas; 
              this.current_genes = this.gene_json ? this.getGenesCoordinates(organism, ref_selected):undefined;
            }}
            shouldHighlight={this.shouldHighlight}
            gene={this.current_genes ? true:false}
          />
        </div>
        <div>
          <div class="card">
            <genomic-card
              fasta_metadata={this.fasta_metadata_json}
              organisms={this.org_names.split("&")}
              selected={this.selected}
              current_references={this.current_references}
              hidden_references={this.hidden_references}
              current_sgrnas={this.current_sgrnas}
              current_genes={this.current_genes}
              changeOrganism={(organism) => {
                if (!organism) {
                  this.selected = undefined;
                }
                this.current_references = this.getReferencesWithSeq(organism, this.selected.sgrna);
                this.hidden_references = this.getHiddenReferences(organism); 
                const ref_selected = this.current_references[0]
                this.current_sgrnas = this.getSgrnas(organism, ref_selected);
                this.selected = {
                  ...this.selected,
                  org: organism,
                  ref: ref_selected,
                  size: this.getSize(organism, ref_selected),
                  fasta_header : this.getFastaHeader(organism, ref_selected)
                }

                //this.current_sgrnas = this.getSgrnas(this.selected[0], this.selected[1])

                this.shouldHighlight = false; 
                this.initial_sgrnas = this.current_sgrnas; 
                this.current_genes = this.gene_json ? this.getGenesCoordinates(organism, ref_selected):undefined;
              }}

              changeSgrna={(sgrna) => {
                if (!sgrna) {
                  this.selected = undefined;
                }

                this.selected = {
                  ...this.selected,
                  sgrna
                };
                this.shouldHighlight = false; 
              }}

              changeRef={(ref) => {
                this.current_sgrnas = this.getSgrnas(this.selected.org, ref)
                const old_sgrna = this.selected.sgrna; 
                this.selected = {
                  ...this.selected,
                  sgrna: this.current_sgrnas.find(e => e.seq === old_sgrna) ? old_sgrna : this.current_sgrnas[0].seq,
                  ref,
                  size: this.getSize(this.selected.org, ref),
                  fasta_header : this.getFastaHeader(this.selected.org, ref)
                };
                if (this.selected.sgrna !== old_sgrna){
                  this.shouldHighlight = false; 
                }; 
                this.initial_sgrnas = this.current_sgrnas; 
              }}

              changeSgrnaSubset = {(sgrna_subset) => {
                this.current_sgrnas = this.getSgrnas(this.selected.org, this.selected.ref, sgrna_subset)
                if (!sgrna_subset.includes(this.selected.sgrna)) {
                  this.selected = {
                    ...this.selected,

                    sgrna: this.current_sgrnas.reduce((prec, actual) => {
                      if (prec.coords.length > actual.coords.length)
                        return prec;
                      return actual;
                    }).seq
                  };
                }
              }}
              onClickHighlight={() => this.shouldHighlight = true}
              diagonal_svg={700}
              initial_sgrnas={this.initial_sgrnas}
            ></genomic-card>
          </div>
        </div>
      </div>
    ]);
  }
}