import { Component, Prop, h, Listen, State } from '@stencil/core';

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
  @Prop() gene: string;
  @Prop() size: string;

  @State()
  display_linear_card: boolean = true;

  @State() orgSelected: string; 
  @State() refSelected: string; 
  
  all_data_json: {}; 
  gene_json: {}; 
  
  currentSgrna: string;
  currentGenes: string; 
// *************************** LISTEN & EMIT ***************************

@Listen('changeOrgCard')
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
}

// *************************** CLICK ***************************


// *************************** DISPLAY ***************************
componentWillLoad(){
  this.orgSelected = this.org_names.split("&")[0]
  this.all_data_json = JSON.parse(this.all_data)
  this.refSelected = Object.keys(this.all_data_json[this.orgSelected])[0]
  this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
  if (this.gene){
    this.gene_json = JSON.parse(this.gene)
    this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
  }
  
  
}

  render() {
    //console.log("PARENT RENDER")
    // console.log(this.all_data);
    // @ts-ignore
    window.result_page = this;
    console.log("RENDER")
    return (
      <div class="root">
        <div class="table">
          <table-crispr complete_data={this.complete_data} />
        </div>
        <div>
          <div class="card">
            <genomic-card all_data={this.all_data} org_names={this.org_names} diagonal_svg={700} gene={this.gene} size={this.size}></genomic-card>
          </div>
          <div class="gene_results">
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
          </div>
        </div>
      </div>
    );
  }
}


