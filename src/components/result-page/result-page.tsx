import { Component, Prop, h, Listen, State, Watch, Element } from '@stencil/core';
import { SequenceSGRNAHit, OrganismHit, SGRNAForOneEntry, CurrentSelection} from './interfaces';
import "@mmsb/mmsb-select";
import noUiSlider from "nouislider"; 

@Component({
  tag: 'result-page',
  styleUrl: 'result-page.css',
  shadow: true
})

export class ResultPage {
  // *************************** PROPERTY & CONSTRUCTOR ***************************
  @Element() private element: HTMLElement;
  @Prop() complete_data: string;
  @Prop() all_data: string;
  @Prop() org_names: string;
  @Prop() gene: string;
  @Prop() size: string;

  @State()
  display_linear_card: boolean = true;
  @State() tableCrisprOrganisms: string[] = [];

  @State() selected: CurrentSelection; //org, sgrna, ref, size
  @State() shouldHighlight = false;
  @State() current_references: string[];
  @State() current_sgrnas: SGRNAForOneEntry[];

  organism_data: OrganismHit[];
  size_data: {[org:string]: { [ref:string]: number}}
  gene_json: {};
  sequence_data_json: SequenceSGRNAHit[];
  initial_sgrnas: SGRNAForOneEntry[];

  // *************************** LISTEN & EMIT ***************************

  /*@Listen('changeOrgCard')
  handleChangeOrg(event: CustomEvent) {
    this.orgSelected = event.detail
    this.refSelected = Object.keys(this.all_data_json[this.orgSelected])[0]
    this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
    if (this.gene_json){
      this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
    }
  }
    
  
  @Listen('changeRefCard')
    handleChangeRef(event: CustomEvent) {
      this.refSelected = event.detail;
      this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
      if (this.gene_json){
        this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
      }
      
    }
  
  @Listen('sgDataSection')
  handlesgDataSection(event: CustomEvent) {
    this.currentSgrna = event.detail["allSgrna"]
    this.currentGenes = event.detail["gene"]
  }*/

  dataFiltered(orgs: string[]): SequenceSGRNAHit[] {
    return this.sequence_data_json.map(sgrna => {
      return { sequence: sgrna.sequence, occurences: sgrna.occurences.filter((occ) => orgs.includes(occ.org)) }
    })
  }

  // *************************** CLICK ***************************


  // *************************** DISPLAY ***************************
  
  componentWillLoad() {
    //Initialize data
    this.tableCrisprOrganisms = this.org_names.split("&");
    this.sequence_data_json = JSON.parse(this.complete_data)
    this.organism_data = this.formatOrganismData()
    this.size_data = JSON.parse(this.size)
    
    const org = this.tableCrisprOrganisms[0];
    this.current_references = this.getReferences(org)

    const ref = this.current_references[0];

    this.current_sgrnas = this.getSgrnas(org, ref)
    this.selected = {
      org,
      sgrna: this.current_sgrnas[0].seq,
      ref,
      size: this.getSize(org,ref)
    };

    this.initial_sgrnas = this.current_sgrnas; 

    //console.log("willLoad")
    /*this.orgSelected = this.org_names.split("&")[0]
    
    
    
    this.refSelected = Object.keys(this.all_data_json[this.orgSelected])[0]
    this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
    if (this.gene){
      this.gene_json = JSON.parse(this.gene)
      this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
    }*/
    //this.selected = [this.orgSelected]
  }

  componentDidRender(){
    //this.createSlider(); 
  }

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
              sgrna: Object.entries(fasta_entry[1]).map(sgrna => ({ seq: sgrna[0], coords: sgrna[1] as string[] }))
            })) 
        }
      }); 
  }

  getReferences(org: string): string[] {
    return this.organism_data
      .find(organism_entry => organism_entry.organism === org)
      .fasta_entry.map(e => e.ref)
  }

  getSgrnas(org: string, ref: string, filtered_sgrna?: string[]): SGRNAForOneEntry[]{
    console.log("getSgrnas", org, ref, filtered_sgrna)
    let sgrnas = this.organism_data
      .find(e => e.organism === org)
      .fasta_entry.find(e => e.ref === ref).sgrna

    if (filtered_sgrna) {
      const matches = new Set(filtered_sgrna);
      sgrnas = sgrnas.filter(v => matches.has(v.seq));
    }
    return sgrnas;
  }

  getSize(org:string, ref:string): number{
    return this.size_data[org][ref]
  }

  /*createSlider(){
    const slider = this.element.shadowRoot.querySelector('.test') as HTMLElement
    noUiSlider.create(slider, {
      start: [50, 100],
      connect: true,
      range: {
          'min': 0,
          'max': 100
      }
    });
  }*/

  render() {
    //console.log("PARENT RENDER")
    // console.log(this.all_data);
    // @ts-ignore
    window.result_page = this;
    //console.log("RENDER")
    //console.log("Selected", this.selected)

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
              this.current_references = this.getReferences(organism);
              const ref_selected = this.current_references[0]
              this.current_sgrnas = this.getSgrnas(organism, ref_selected);
              this.selected = {
                org: organism,
                sgrna,
                ref: ref_selected,
                size: this.getSize(organism, ref_selected)
              };
              this.shouldHighlight = true;
              this.initial_sgrnas = this.current_sgrnas; 
            }}
            shouldHighlight={this.shouldHighlight}
          />
        </div>
        <div>
          <div class="card">
            <genomic-card2
              organisms={this.org_names.split("&")}
              selected={this.selected}
              current_references={this.current_references}
              current_sgrnas={this.current_sgrnas}
              changeOrganism={(organism) => {
                if (!organism) {
                  this.selected = undefined;
                }
                this.current_references = this.getReferences(organism);
                const ref_selected = this.current_references[0]
                this.current_sgrnas = this.getSgrnas(organism, ref_selected);
                this.selected = {
                  ...this.selected,
                  org: organism,
                  ref: ref_selected,
                  size: this.getSize(organism, ref_selected)
                }

                //this.current_sgrnas = this.getSgrnas(this.selected[0], this.selected[1])

                this.shouldHighlight = false; 
                this.initial_sgrnas = this.current_sgrnas; 
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
                  size: this.getSize(this.selected.org, ref)
                };
                if (this.selected.sgrna !== old_sgrna){
                  this.shouldHighlight = false; 
                }; 
                this.initial_sgrnas = this.current_sgrnas; 
              }}

              changeSgrnaSubset = {(sgrna_subset) => {
                console.log("sgrna_subset", sgrna_subset)
                this.current_sgrnas = this.getSgrnas(this.selected.org, this.selected.ref, sgrna_subset)
                console.log("current_sgrnas", this.current_sgrnas)
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
            ></genomic-card2>
          </div>
        </div>
        {/*<div></div>
        <div class="test"></div>*/}
      </div>
    ]);
  }
}


/*<div class="gene_results">
            <div id="button_display_card"> 
              {this.gene && !this.display_linear_card && <button 
                id="display_gene_card" 
                onClick={() => this.display_linear_card = true}
              > Display gene card </button>} 
            </div>
            {this.gene && this.currentGenes !== "[]" && this.display_linear_card && console.log(this.currentGenes)}
            {this.gene && this.currentGenes !== "[]" && this.display_linear_card && <linear-card 
              width_bar="90%" 
              all_sgrna={this.currentSgrna}
              gene={this.currentGenes}
              onClose={() => this.display_linear_card = false}
            />}
          </div>*/