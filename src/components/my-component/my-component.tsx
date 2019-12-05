import { Component, Prop, h, Listen, Element } from '@stencil/core';
import "@mmsb/table-crispr";
import "@mmsb/genomic-card"
import "@mmsb/linear-card"

@Component({
  tag: 'result-page',
  styleUrl: 'my-component.css',
  shadow: true
})

export class MyComponent {
// *************************** PROPERTY & CONSTRUCTOR ***************************
  @Element() private element: HTMLElement;
  @Prop() complete_data: string; 
  @Prop() all_data: string; 
  @Prop() org_names: string; 
  @Prop() gene: string; 
  @Prop() size: string; 

  @Prop() all_data_json: {}; 
  @Prop() gene_json: {}; 

  @Prop() orgSelected: string; 
  @Prop() refSelected: string; 
  @Prop() currentSgrna: string;
  @Prop() currentGenes: string; 
// *************************** LISTEN & EMIT ***************************

@Listen('changeOrgCard')
handleChangeOrg(event: CustomEvent) {
  this.orgSelected = event.detail
  this.refSelected = Object.keys(this.all_data_json[this.orgSelected])[0]
  this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
  this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
}

@Listen('changeRefCard')
  handleChangeRef(event: CustomEvent) {
    this.refSelected = event.detail;
    this.currentSgrna = JSON.stringify(this.all_data_json[this.orgSelected][this.refSelected])
    this.currentGenes = JSON.stringify(this.gene_json[this.orgSelected][this.refSelected])
  }

@Listen('sgDataSection')
handlesgDataSection(event: CustomEvent) {
  console.log("SECTION")
  this.currentSgrna = event.detail["allSgrna"]
  this.currentGenes = event.detail["gene"]
  console.log(this.currentGenes)
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

componentDidRender(){
  console.log("didRender")
  console.log(this.gene)
  if (this.gene !== undefined){
    let node = this.element.shadowRoot.querySelector("linear-card");
    if(node){
      node.remove();
    }
    if (this.currentGenes != "[]"){
      console.log("GENES")
      console.log(this.currentGenes)
      node = document.createElement("linear-card");
      let resDiv = this.element.shadowRoot.querySelector("#Result");
      resDiv.appendChild(node);
      node.setAttribute("width_bar", '90%');
      node.setAttribute("all_sgrna", this.currentSgrna);
      node.setAttribute("gene", this.currentGenes);
    }  
  }
}
  

  render() {
    //console.log("PARENT RENDER")
    // console.log(this.all_data);

    return ([
      <div class="table">
      <table-crispr complete_data={this.complete_data}></table-crispr>
    </div>,
    <div class="card">
    <genomic-card all_data={this.all_data} org_names={this.org_names} diagonal_svg={700} gene={this.gene} size={this.size}></genomic-card>
    </div>,
    <div id = "Result">
    </div>
    ]);

  }
}