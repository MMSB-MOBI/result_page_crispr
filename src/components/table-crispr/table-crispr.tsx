import { Component, Prop, State, Element, h } from '@stencil/core';
import "@mmsb/radial-crispr";

@Component({
  tag: 'table-crispr',
  styleUrl: 'table-crispr.css',
  shadow: true
})

export class TableCrispr {
// *************************** PROPERTY & CONSTRUCTOR ***************************
@Element() private element: HTMLElement;
// Data given by the results file
@Prop() complete_data: string;

// Complete data parsed
complete_json: [];
// List of all sgRNA
allSgrna = [];
// sgRNA displayed on interface
displaySgrna = [];
// Dictionary of min and max occurences for each sgRNA
// Display occurences with this.displaySgrna as key
allOcc = new Map();
@State() page = 1;
// Current data displayed, filtered by regex and minOccurences
@State() currentData = [];

@State() state: string="initialize"; 
error_msg: string=''; 

// *************************** LISTEN & EMIT ***************************

constructor() {
  this.regexSearch = this.regexSearch.bind(this);
  this.calculTotalOcc = this.calculTotalOcc.bind(this);
  this.minOccSearch = this.minOccSearch.bind(this);
  this.regexOccSearch = this.regexOccSearch.bind(this);
}

// *************************** CLICK ***************************
/**
  * Filter data by regex and occurence
*/
regexOccSearch():void {
  this.regexSearch();
  this.minOccSearch();
}


/**
  * Filter data by regex and reinitialize page to 1
*/
regexSearch():void {
  let search = (this.element.shadowRoot.querySelector("#regexString")  as HTMLInputElement).value;
  this.page = 1;
  this.currentData = this.allSgrna.filter(a => RegExp(search).test(a));
}


/**
  * Filter data by occurences.Check if maxOcc is superior to occurence given by user
  and check if sgRNA is in current data which were filtered by regex
*/
minOccSearch():void {
  let minOcc = (this.element.shadowRoot.querySelector("#minOcc")  as HTMLInputElement).value;
  let tmp = [];
  for (var [key, value] of this.allOcc) {
    // Check if maxOcc is > to occurences given by user and check if sgRNA is in current data
    // which were filtered by regex
    if (value[1] >= minOcc && this.currentData.includes(key)) tmp.push(key);
  }
  this.currentData = tmp;
}

// *************************** DISPLAY ***************************
/**
  * Find min and max occurences for each sgRNA summing occurences for each organism
*/
calculTotalOcc():void {
  this.complete_json.forEach(sgrna => {
    let maxOcc = 0, minOcc = 10000;
    (sgrna['occurences'] as Array<string>).forEach(org => {
      let sumOcc = 0;
      // For each references, sum occurences. It will be total occurences for an organism
      org['all_ref'].forEach(ref => {
        sumOcc += ref['coords'].length;
      })
      // Compare if total occ is the min or the max for this sgRNA
      if (sumOcc > maxOcc) maxOcc = sumOcc;
      if (sumOcc < minOcc) minOcc = sumOcc;
    })
    this.allOcc.set(sgrna['sequence'], [minOcc, maxOcc]);
  })
}

/**
  * Find min and max occurences for each sgRNA summing occurences for each organism
  * @param {Number} maxPages Number of maximum pages
*/
colorPagination(maxPages:Number):void {
  // Color arrows for pagination
  let colorBg = (this.page == 1) ? "#f1f1f1" :  "rgba(239, 71, 111)";
  let colorArrow = (this.page == 1) ? "black" :  "white";
  (this.element.shadowRoot.querySelector(".previous") as HTMLElement).style.background =  colorBg;
  (this.element.shadowRoot.querySelector(".previous") as HTMLElement).style.color =  colorArrow;
  colorBg = (this.page == maxPages) ? "#f1f1f1" :  "rgba(239, 71, 111)";
  colorArrow = (this.page == maxPages) ? "black" :  "white";
  (this.element.shadowRoot.querySelector(".next") as HTMLElement).style.background =  colorBg;
  (this.element.shadowRoot.querySelector(".next") as HTMLElement).style.color =  colorArrow;
}

/**
*
* @param {string} seq sequence of the sgRNA
* @returns {string} the dictionary of the sequence in JSON format
*/
getDicSeq(seq: string):string {
  for (var dic in this.complete_json){
    if (this.complete_json[dic]["sequence"] == seq){
      return JSON.stringify(this.complete_json[dic])
    }
  }
}

  componentWillLoad(){
    let stop = 0
    this.error_msg = 'ERROR : '
    if (this.complete_data === undefined){
      stop = 1
      this.error_msg += "complete_data undefined"
    }
    if (stop){
      this.state = "stop"
    }
    else{
      this.complete_json = JSON.parse(this.complete_data)
      if (this.allSgrna.length == 0) {
        this.complete_json.forEach(el => this.allSgrna.push(el['sequence']));
        this.calculTotalOcc();
        this.currentData = this.allSgrna;
      }
    }
  }

  componentDidRender() {
    let maxPages = (Number.isInteger(this.currentData.length/5)) ? (this.currentData.length/5) :  (Math.trunc(this.currentData.length/5) + 1);
    this.colorPagination(maxPages)
  }

  componentWillRender() {
    this.displaySgrna = this.currentData.slice((5 * (this.page - 1)), 5*this.page);

    
  }

  render() {

    if (this.state=="stop"){
      return this.error_msg
    }

    // Parse data and initialize allSgrna and calcul occurences

    let maxPages = (Number.isInteger(this.currentData.length/5)) ? (this.currentData.length/5) :  (Math.trunc(this.currentData.length/5) + 1);


    return ([
      // ***********************************************
      // ******************* SPINNER *******************
      // ***********************************************
      <div style={{display: "none"}}>
        <strong> Loading ... </strong>
        <div class="spinner-grow text-info" role="status"></div>
      </div>,
      // *********************************************
      // ******************* TABLE *******************
      // *********************************************
      <div class="main-table" style={{display: "block"}}>
        {/******************** Search Bar ********************/}
        <div class="search-container">
          <span class="tooltipRegex">
            <input type="text" id="regexString" onKeyUp={this.regexOccSearch} placeholder="Search for sgRNA.."/>
            <span class="tooltiptextRegex">Use Regex : <br/>    ^ : beginning with <br/> $ : ending with</span>
          </span>
          <input type="text" id="minOcc" onKeyUp={this.regexOccSearch} placeholder="Min occ..."/>
        </div>
        {/******************** Table ********************/}
        <table id="resultTab">
          {this.displaySgrna.map(seq => <tr>
            <td> <b>{seq.slice(0, -3)}<span style={{color:"rgba(239, 71, 111)"}}>{seq.slice(-3,)} </span></b>
              <br/> Max : {this.allOcc.get(seq)[1]}
              <br/> Min : {this.allOcc.get(seq)[0]}</td>
            <td> <radial-crispr dic_sgrna={this.getDicSeq(seq)} max_occ={this.allOcc.get(seq)[1]} diagonal={200}> </radial-crispr> </td>
            </tr>)}
        </table>

        {/******************** Pagination ********************/}
        <div class="pagination">
          <a href="#" class="previous round" onClick={() => {if (this.page > 1) this.page -= 1}}>&#8249;</a>
          <a href="#" class="next round" onClick={() => {if (this.page < maxPages) this.page += 1}}>&#8250;</a>
        </div>
      </div>,
      //@ts-ignore
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>

      ]);
  }
}
