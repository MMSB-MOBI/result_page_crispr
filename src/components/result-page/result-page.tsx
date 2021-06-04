import { Component, Prop, h, State, Listen } from '@stencil/core';
import { SequenceSGRNAHit, OrganismHit, SGRNAForOneEntry, CurrentSelection, FastaMetadata, Coordinate } from './interfaces';
import "@mmsb/mmsb-select";
import download from "downloadjs";

@Component({
  tag: 'result-page',
  styleUrl: 'result-page.css',
  scoped: true
})

export class ResultPage {
  // *************************** PROPERTY & CONSTRUCTOR ***************************
  //@Element() private element: HTMLElement;
  @Prop() complete_data: string;
  @Prop() all_data: string;
  @Prop() org_names: string;
  @Prop() gene?: string;
  @Prop() fasta_metadata: string;
  @Prop() job_tag: string;
  @Prop() total_hits: number;
  @Prop() excluded_names: string;

  @State() shouldHighlight: boolean = false;
  //@State() display_linear_card: boolean = true;
  //@State() tableCrisprOrganisms: string[] = [];
  @State() selected: CurrentSelection = { 'org': undefined, 'sgrna': undefined, 'ref': undefined, 'size': undefined, 'fasta_header': undefined }; //org, sgrna, ref, size
  @State() current_references: string[] = [];
  @State() current_sgrnas: SGRNAForOneEntry[] = [];

  organism_data: OrganismHit[];
  sequence_data_json: SequenceSGRNAHit[];
  gene_json?: { [org: string]: { [ref: string]: Coordinate[] } };
  initial_sgrnas: SGRNAForOneEntry[];
  hidden_references: string[];
  fasta_metadata_json: FastaMetadata[]; //Need to be typed
  current_genes?: Coordinate[];
  organisms: string[];
  excluded_genomes: string[];
  @State() select_card: string[] = [];

  @State() display_log: boolean = false;


  @Listen('dropdown-menu.display-button-click', { target: 'window' })
  action() {
    this.shouldHighlight = true;
  }

  componentWillLoad() {
    //Initialize data
    //this.tableCrisprOrganisms = this.org_names.split("&");
    this.sequence_data_json = this.loadSequenceData();
    this.organism_data = this.formatOrganismData();
    this.fasta_metadata_json = JSON.parse(this.fasta_metadata)
    this.organisms = this.org_names.split("&");
    this.excluded_genomes = this.excluded_names.split("&");

    if (this.gene !== undefined) {
      this.gene_json = this.loadGenes();
    }


    /*const org = this.tableCrisprOrganisms[0];
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

     
    if(this.gene !== "undefined"){
      this.gene_json = JSON.parse(this.gene); 
      this.current_genes = this.getGenesCoordinates(org, ref);
    }*/
  }

  loadSequenceData(): SequenceSGRNAHit[] {
    let sequence_data = JSON.parse(this.complete_data)

    sequence_data
      .forEach(e => e.occurences
        .forEach(occ => occ.all_ref
          .forEach(ref => ref.coords = Object.values(ref.coords))));

    return sequence_data
  }

  loadGenes() {
    const gene_json = this.gene ? typeof this.gene === 'object' : JSON.parse(this.gene);

    Object.values(gene_json).forEach((ref) => {
      let gene_number = 0;
      Object.values(ref).forEach(
        coord => {
          coord.map(c => { gene_number = gene_number + 1; c.gene_number = gene_number })
        });
    })
    return gene_json
  }

  /**
   * Format raw json organisms data to OrganismHit[] for easier manipulation
   */
  formatOrganismData(): OrganismHit[] {
    const data_parsed = this.all_data ? typeof this.all_data === 'object' : JSON.parse(this.all_data);

    return Object.entries(data_parsed)
      .map(org_entry => {
        const org = org_entry[0];
        return {
          organism: org,
          fasta_entry: Object.entries(org_entry[1])
            .map(fasta_entry => ({
              ref: fasta_entry[0],
              // @ts-ignore
              sgrna: Object.entries(fasta_entry[1]).map(sgrna => ({ seq: sgrna[0], coords: Object.values(sgrna[1].coords), on_gene: sgrna[1].on_gene ? Object.values(sgrna[1].on_gene) : undefined, not_on_gene: sgrna[1].not_on_gene ? Object.values(sgrna[1].not_on_gene) : undefined }))
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

  getReferencesWithSeq(org: string, sgrna: string) {
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
  getSgrnas(org: string, ref: string, filtered_sgrna?: string[]): SGRNAForOneEntry[] {
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
  getSize(org: string, ref: string): number {
    return this.fasta_metadata_json.find(e => e.org === org && e.fasta_ref === ref).size
  }

  /**
   * For given organism, get fasta subsequences with no sgrna on it.
   * @param org : organism
   */
  getHiddenReferences(org: string): string[] {
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
  getFastaHeader(org: string, ref: string): string {
    const fasta_header = this.fasta_metadata_json.find(e => e.org === org && e.fasta_ref === ref).header
    return fasta_header
  }

  /**
   * Get genes coordinates for given organism and fasta sequence
   * @param org : organism
   * @param ref : reference of fasta subsequence
   */
  getGenesCoordinates(org: string, ref: string): Coordinate[] {
    return this.gene_json[org][ref];
  }

  getCoordinates(sgrna: string): string[] {
    return this.current_sgrnas
      .find(e => e.seq === sgrna).coords
      .map(coord_obj => coord_obj.coord)
  }

  get all_start_coordinates(): number[] {
    const all_coords: number[] = [];
    this.current_sgrnas.forEach(e =>
      e.coords.forEach(coord_obj => all_coords.push(parseInt(/\(([0-9]*),/.exec(coord_obj.coord)[1]))))
    return all_coords.sort((a, b) => a - b);
  }

  isCompleteSelection(): boolean {
    if (Object.values(this.selected).includes(undefined)) return false
    else return true
  }

  addToCard(sgrnas: string[]) {
    const all_select_card = this.select_card.concat(sgrnas);
    this.select_card = all_select_card.filter((item, pos) => all_select_card.indexOf(item) === pos) //Array with unique elements
    //Reassign to triger state
  }

  removeFromCard(sgrna: string[]) {
    this.select_card = this.select_card.filter(select_sgrna => sgrna.includes(select_sgrna) ? false : true)
  }

  createSelectionFile() {
    if (!this.select_card.length) window.alert("No sgRNA selected")
    else {
      const sgrnas = this.sequence_data_json.filter(sgrna_obj => this.select_card.includes(sgrna_obj.sequence))
      let data_str = this.gene_json ? "#sgRNA\torganism\tfasta record\tcoordinates\tinside homologous gene\n" : "#sgRNA\torganism\tfasta record\tcoordinates\n"

      sgrnas.forEach(sgrna => {
        sgrna.occurences.forEach(occ => {
          occ.all_ref.forEach(ref => {
            ref.coords.forEach(coord => {
              data_str = data_str + `${sgrna.sequence}\t${occ.org}\t${ref.ref}\t${coord.coord}`
              if (this.gene_json) data_str = data_str + `\t${coord.is_on_gene.length ? "true" : "false"}`
              data_str = data_str + "\n"
            })
          })
        })
      })
      download(data_str, `${this.job_tag}_selected_sgrnas.tsv`, "text/plain")
    }
  }

  displayCard() {
    if (this.isCompleteSelection()) {
      const coordinates = this.getCoordinates(this.selected.sgrna)
      return <div class="genomic-card">
        <div class="genome-rep">
          <circular-barplot
            list_coordinates={this.all_start_coordinates}
            genome_size={this.selected.size}
            selected_sgrna_coordinates={coordinates}
            gene_coordinates={this.current_genes}
            active_rotation
          ></circular-barplot>
          <div class="legend"><circular-barplot-legend gene={this.current_genes ? true : false} /></div>
        </div>
      </div>
    }
    else return <div class="genomic-card"></div>
  }

  displayCoords() {
    if (this.isCompleteSelection()) {
      return <div class="coords">
        <coord-box
          selected={this.selected}
          current_sgrnas={this.current_sgrnas}
          current_genes={this.current_genes}
        />
      </div>
    }
    else return <div class="coords"></div>


  }

  overflowGestion() {
    if (document.querySelector(".excluded-list").scrollHeight > document.querySelector(".excluded-list").clientHeight) {
      return <div class="show-all-eg"> <i class="material-icons">arrow_drop_down</i> </div>
    }
  }

  displayExcluded() {
    if (this.excluded_genomes[0] === "") {
      return <span> No excluded genomes</span>
    }
    else {
      return [<span>Excluded genomes </span>, <div class="excluded-list"> {this.excluded_genomes.join(";")} </div>]
    }
  }

  render() {
    // @ts-ignore
    window.result_page = this;

    return (
      <div class="root">
        <div class="header">
          <div class="log-info">
            <div class={"log-info-header" + (this.display_log ? " open" : "")} onClick={() => this.display_log = this.display_log ? false : true}>
              <span> Job info </span> <i class="material-icons">{this.display_log ? "arrow_drop_up" : "arrow_drop_down"}</i>
            </div>
            <div class="log-info-content" style={{ display: this.display_log ? 'grid' : 'none' }}>
              <div class="first-col">
                <span>Job id : {this.job_tag}</span>
                <span>Total hits : {this.total_hits}</span>
                <span>Displayed hits : {this.sequence_data_json.length}</span>
              </div>
              <div class="second-col">
                {this.displayExcluded()}
              </div>
            </div>


          </div>


          <div class="download w3-dropdown-hover">
            <span class="download-dropdown-header"> Download results</span>
            <div class="w3-dropdown-content w3-bar-block w3-border">
              <a href={`download/${this.job_tag}`} class="w3-bar-item w3-button">All raw results</a>
              <a href="#" class="w3-bar-item w3-button" onClick={() => this.createSelectionFile()}>Selected sgRNAs</a>
            </div>

          </div>

        </div>
        <div class="table">
          <table-crispr
            card_selection={this.select_card}
            selected={this.selected}
            complete_data={this.sequence_data_json}
            onOrganismClick={(organism, sgrna) => {
              this.current_references = this.getReferencesWithSeq(organism, sgrna);
              //this.hidden_references = this.getHiddenReferences(organism); 
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
              this.current_genes = this.gene_json ? this.getGenesCoordinates(organism, ref_selected) : undefined;
            }}
            shouldHighlight={this.shouldHighlight}
            gene={this.gene_json ? true : false}
            reinitSelection={() => {
              this.current_references = [];
              this.current_sgrnas = [];
              this.selected = {
                org: undefined,
                sgrna: undefined,
                ref: undefined,
                size: undefined,
                fasta_header: undefined
              }
            }}
            cardAction={(target, sgrnas) => {
              if ((target as HTMLInputElement).checked) this.addToCard(sgrnas);
              else this.removeFromCard(sgrnas);
            }}
          />
        </div>
        <div class="right-panel">
          <div class="first-line">
            <dropdown-menu
              organisms={this.organisms}
              fasta_refs={this.current_references}
              sgrnas={this.current_sgrnas}
              selected={this.selected}
              selectOrg={(org) => {
                this.shouldHighlight = false;
                this.current_references = this.getReferences(org);
                this.current_sgrnas = [];
                this.selected = {
                  org,
                  sgrna: undefined,
                  ref: undefined,
                  size: undefined,
                  fasta_header: undefined,
                }
              }}
              selectRef={(ref) => {
                this.current_sgrnas = this.getSgrnas(this.selected.org, ref);
                this.current_genes = this.gene_json ? this.getGenesCoordinates(this.selected.org, ref) : undefined;
                this.shouldHighlight = false;
                this.selected = {
                  ...this.selected,
                  sgrna: undefined,
                  ref,
                  size: undefined,
                  fasta_header: undefined,
                }
              }}
              selectSgrna={(sgrna) => {
                this.shouldHighlight = false;
                this.selected = {
                  ...this.selected,
                  sgrna,
                  size: this.getSize(this.selected.org, this.selected.ref),
                  fasta_header: this.getFastaHeader(this.selected.org, this.selected.ref),
                }
              }}
            />
            {this.displayCoords()}
          </div>

          {this.displayCard()}
        </div>
      </div>
    );
  }
}
