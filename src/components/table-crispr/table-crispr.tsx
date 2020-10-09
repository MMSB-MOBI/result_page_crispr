'use strict';

import { Component, Prop, State, Element, h, Listen, Event, EventEmitter } from '@stencil/core';
import { CurrentSelection, SequenceSGRNAHit, SortingOrder, MinMaxOccurencesData, SortingType } from '../result-page/interfaces';
import * as d3 from "d3";
import * as d3_slider from 'd3-simple-slider';

@Component({
  tag: 'table-crispr',
  styleUrl: 'table-crispr.css',
  shadow: true
})

export class TableCrispr {
  // *************************** PROPERTY & CONSTRUCTOR ***************************
  @Element() private element: HTMLElement;
  // Data given by the results file
  @Prop() complete_data: SequenceSGRNAHit[];
  @Prop() gene:boolean; 
  @Prop() card_selection:string[]; 

  initial_min_max_data: MinMaxOccurencesData[]
  // sgRNA displayed on interface
  displaySgrna: MinMaxOccurencesData[] = [];
  // Dictionary of min and max occurences for each sgRNA
  // Display occurences with this.displaySgrna as key
  //allOcc = new Map();
  @State() page: number = 1;
  // Current data displayed, filtered by regex and minOccurences
  @State() currentSgrnas: MinMaxOccurencesData[];

  @State() state: string = "initialize";
  error_msg: string = '';

  @State() sort_type: SortingType = "Alphabetical"
  @State() sort_order: SortingOrder = "descending"

  @Prop() selected: CurrentSelection;
  @Prop() shouldHighlight: boolean;
  @Prop() onOrganismClick?: (organism: string, sgrna: string) => void;
  @Prop() reinitSelection : () => void; 
  @Prop() cardAction : (click_target, sgrna:string[]) => void; 
  @Prop() cardAllAction : () => void; 

  total_pages: number;
  @State() entries_by_pages: number = 10;
  current_pagination_display: number[]
  max_pagination: number = 7;

  highlighted_selection: CurrentSelection;
  @State() minocc_filter: number[];
  @State() maxocc_filter: number[];

  initial_minocc: number[]; //Minimum occurences initial min (always 0) and max 
  initial_maxocc: number[]; //Maximum occurences initial min (always 0) and max

  initial_occ_limits:number[];
  @State() occ_filter: number[];

  number_selected:number = 0; 

  // *************************** LISTEN & EMIT ***************************

  constructor() {
    this.sgRNAFilter = this.sgRNAFilter.bind(this);
  }

  //@Event({ eventName: 'table-crispr.org-click' }) onClickTableOrganism: EventEmitter;

  @Listen('dropdown-menu.display-button-click', { target: 'window' })
  handleButtonSelectSgrna() {
    this.reinitializeSliders();
    this.highlighted_selection = {...this.selected};
    this.sgRNAFilter(this.highlighted_selection.sgrna);
    const selected_sgrna_index = this.currentSgrnas.map(e => e.seq).indexOf(this.selected.sgrna)
    const current_page = Math.trunc(selected_sgrna_index / 10) + 1;
    this.page = current_page;
  }

  /**
   * Filter sgrna based on current regex given in regex field and current min and max occurences selected. If a sgrna is given, will filter only this sgrna.
   * @param sgrna : optional, sgrna to filter
   */
  sgRNAFilter(sgrna: string = undefined): void {
    //Filter on min occurences
    const search = sgrna ? sgrna : (this.element.shadowRoot.querySelector("#regexString") as HTMLInputElement).value;
    this.currentSgrnas = this.initial_min_max_data
      .filter(a => RegExp(search).test(a.seq))
      .filter(a => a.total_occurences >= this.occ_filter[0] && a.total_occurences <= this.occ_filter[1])
    this.page = 1;
  }


  // *************************** DISPLAY ***************************

  /**
   * Get pagination that needs to be currently displayed
   * @param start : first page to display in pagination field
   * @param end : last page to display in pagination field
   */
  getCurrentPagination(start: number, end: number): number[] {
    let pagination_display = [];
    for (let i = start; i <= end; i++) {
      pagination_display.push(i);
    }
    return pagination_display;
  }

  componentWillLoad() {
    let stop = 0
    this.error_msg = 'ERROR : '
    if (this.complete_data === undefined) {
      stop = 1
      this.error_msg += "complete_data undefined"
    }
    if (stop) {
      this.state = "stop"
    }
    else {
      this.initial_min_max_data = this.minMaxOccurences()
      this.currentSgrnas = this.initial_min_max_data
      this.sortData()
      this.displaySgrna = this.currentSgrnas.slice((10 * (this.page - 1)), 10 * this.page);
    }

    const minocc_max = this.currentSgrnas.reduce((val, e) => val > e.min_occurences ? val : e.min_occurences, 0)
    const maxocc_max = this.currentSgrnas.reduce((val, e) => val > e.max_occurences ? val : e.max_occurences, 0)
    this.initial_minocc = [0, minocc_max];
    this.initial_maxocc = [0, maxocc_max]; 
    this.minocc_filter = this.initial_minocc; 
    this.maxocc_filter = this.initial_maxocc;

    const occ_max = this.currentSgrnas.reduce((val, e) => val > e.total_occurences ? val : e.total_occurences, 0)
    const occ_min = this.currentSgrnas.reduce((val, e) => val < e.total_occurences ? val : e.total_occurences, occ_max)
    this.initial_occ_limits = [occ_min, occ_max]
    this.occ_filter = this.initial_occ_limits; 


  }

  componentDidLoad() {
    this.displaySlider(this.element.shadowRoot.querySelector(".slider"), this.occ_filter[0], this.occ_filter[1]);
    this.addSliderSvgText();
  }

  componentWillUpdate() {
    //Reinitialize sgrna list when selection change
    if (this.highlighted_selection && (this.highlighted_selection.sgrna != this.selected.sgrna || this.highlighted_selection.org != this.selected.org || this.highlighted_selection.ref != this.selected.ref)){
      this.highlighted_selection = undefined; 
      (this.element.shadowRoot.querySelector("#regexString") as HTMLInputElement).value = "" //reinitialize sequence search bar
      this.sgRNAFilter(); //reinitialize sgrnas 
    }
    this.sortData(); 
    this.displaySgrna = this.currentSgrnas.slice((10 * (this.page - 1)), 10 * this.page);
  }

  componentDidUpdate(){
    console.log("didUpdate", this.card_selection);
    this.conserveCheckbox();
  }

  /**
   * Get occurences of the given sequence with organism and number of occurence informations.
   * @param seq : sequence 
   */
  sequencesOccurences(seq: string): {name:string, coords_count:number, on_gene_count:number, not_on_gene_count:number}[]{
    const hit = this.complete_data.find(s => s.sequence === seq);
    return hit.occurences.map(o => {
      const coords_count = o.all_ref.reduce((acc, val) => acc + val.coords.length, 0);
      let on_gene_count = 0; 
      let not_on_gene_count = 0;

      if(this.gene){
        o.all_ref.forEach(all_ref_obj => all_ref_obj.coords
          .forEach(coord_obj => {
            if (coord_obj.is_on_gene.length > 0) on_gene_count++; 
            else not_on_gene_count++; 
        }))
      }
      
      return { name: o.org, coords_count, on_gene_count, not_on_gene_count};
    })
      .sort((a,b) => b.coords_count - a.coords_count)
  }

  /**
   * Get all occurences formated to have access to min occurences and max occurences informations
   */
  minMaxOccurences():MinMaxOccurencesData[] {
    return this.complete_data.map(sgrna => {
      let nb_occurences = []
      sgrna.occurences.map(occ => {
        nb_occurences.push(occ.all_ref.reduce((acc, val) => acc + val.coords.length, 0))
      })
      nb_occurences.sort((a, b) => a - b)
      return { seq: sgrna.sequence, min_occurences: nb_occurences[0], max_occurences: nb_occurences[nb_occurences.length - 1], total_occurences:nb_occurences.reduce((acc,val) => acc + val, 0) };
    })
  }
  
  /**
   * Sort data based on current sorting type (occurences, alphabetical) and current sort order (descending, ascending).
   * The sorting change currentSgrnas variable
   */
  sortData() {
    if (this.sort_type === "Alphabetical" && this.sort_order === "descending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.seq < a.seq ? 1 : -1)
    }
    else if (this.sort_type === "Alphabetical" && this.sort_order === "ascending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.seq < a.seq ? -1 : 1)
    }
    else if (this.sort_type === "Occurences" && this.sort_order === "descending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.total_occurences - a.total_occurences)
    }
    else if (this.sort_type === "Occurences" && this.sort_order === "ascending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => a.total_occurences - b.total_occurences)
    }
  }

  /**
   * Call with click for sorting. Get the sorting order and the sorting type from html fields and click event and change sort_order and sort_type variables.
   */
  handleChangeSortMethod = (e: MouseEvent) => {
    const clicked_e = e.currentTarget as HTMLTableHeaderCellElement;
    const icon_element = clicked_e.querySelector('i');
    this.page = 1;
    const selected_mode = clicked_e.dataset.type as SortingType;
    if (selected_mode === this.sort_type) {
      this.sort_order = this.sort_order === "ascending" ? "descending" : "ascending";
      icon_element.classList.toggle("ascending");
    }
    else {
      this.sort_order = icon_element.classList.contains("ascending") ? "ascending" : "descending";
      this.sort_type = selected_mode;
    }
  };

  /**
   * Get start and end of pagination depending on the current page. 
   * We want to display 3 pages before and 3 pages after current page. If we have less than 3 available, only the availables are displayed.
   */
  actualizePaginationDisplay() {
    let start: number;
    let end: number;
    if (this.page - 3 <= 0) {
      start = 1;
      end = this.total_pages < this.max_pagination ? this.total_pages : this.max_pagination;
    }
    else if (this.page + 3 >= this.total_pages) {
      start = this.total_pages - this.max_pagination;
      end = this.total_pages;
    }
    else {
      start = this.page - 3;
      end = this.page + 3;
    }
    this.current_pagination_display = this.getCurrentPagination(start, end);
  }

  /**
   * Display slider for min and max occurences selection.
   * @param elmt html element where to put slider
   * @param min : min occurences
   * @param max : max occurences
   */
  displaySlider(elmt: HTMLElement, min: number, max: number) {
    const sliderRange = d3_slider
      .sliderHorizontal()
      .min(min)
      .max(max)
      .step(1)
      .width(450)
      .ticks(max-min < 10 ? max-min : 10)
      .default([min, max])
      .fill("rgba(239, 71, 111)")
      .tickFormat(d3.format(',.0f'))
      .on('onchange', val => {
        this.occ_filter = [val[0], val[1]]
        this.sgRNAFilter();
        this.addSliderSvgText();
        //d3.select(elmtValue).text(val[0]);
      });

    d3.select(elmt)
      .append('svg')
      .attr('width', 500)
      .attr('height', 50)
      .append('g')
      .attr('transform', 'translate(10,10)')
      .call(sliderRange);
  }

  /**
   * Highlight current selected value in sliders below the cursor.
   */
  addSliderSvgText() {
    let i = 0
    this.element.shadowRoot.querySelectorAll('.slider .parameter-value')
      .forEach(svg_elmt => {
        d3.select(svg_elmt).select('text').remove()
        d3.select(svg_elmt)
          .append('text')
          .text(this.occ_filter[i])
          .attr('font-size', 10)
          .attr('dy', '.71em')
          .attr('y', '27')
        i += 1;
      })
  }

  /**
   * Sliders in their initial state.
   */
  reinitializeSliders(){
    this.element.shadowRoot.querySelector(".slider svg").remove();
    this.minocc_filter = this.initial_minocc; 
    this.maxocc_filter = this.initial_maxocc; 
    this.displaySlider(this.element.shadowRoot.querySelector(".slider"), this.occ_filter[0], this.occ_filter[1]);
    this.addSliderSvgText(); 

  }

  reinitializeSgrna(){
    (this.element.shadowRoot.querySelector("#regexString") as HTMLInputElement).value = ''; 
    this.sgRNAFilter();
    this.highlighted_selection = undefined; 
  }

  uncheckCheckbox(){
    const checkboxes = this.element.shadowRoot.querySelectorAll(".checkbox")
    checkboxes.forEach(checkbox => {
      if((checkbox as HTMLInputElement).checked) (checkbox as HTMLInputElement).checked = false; 
    })
  }

  conserveCheckbox(){
    this.uncheckCheckbox(); 
    this.card_selection.forEach(sgrna => {
      const select_checkbox = this.element.shadowRoot.querySelector(`#${sgrna}`) as HTMLInputElement
      if(select_checkbox) select_checkbox.checked = true;   
    })
  }

  highlightSelectedOrg(target){
    const org_lines = this.element.shadowRoot.querySelectorAll(`#org-${target.id}`)
    org_lines.forEach(td => (td as HTMLElement).style.background = target.checked ? "#f2f2f2" : ""); 
  }

  getBackground(selected:boolean, checkbox_selected:boolean):string{
    console.log("get background", selected, checkbox_selected)
    if(selected && this.shouldHighlight) return "red"; 
    else if (checkbox_selected) return "yellow"; 
    else return "" 
  }

  countSelected(target){
    this.number_selected = target.checked ? this.number_selected + 1 : this.number_selected - 1;
  }


  render() {
    if (this.state == "stop") {
      return this.error_msg
    }
    this.displaySgrna = this.currentSgrnas.slice((this.entries_by_pages * (this.page - 1)), this.entries_by_pages * this.page);
    this.total_pages = (Number.isInteger(this.currentSgrnas.length / this.entries_by_pages)) ? (this.currentSgrnas.length / this.entries_by_pages) : (Math.trunc(this.currentSgrnas.length / this.entries_by_pages) + 1);
    this.actualizePaginationDisplay();

    return ([<head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
    </head>,
    // ***********************************************
    // ******************* SPINNER *******************
    // ***********************************************
    <div style={{ display: "none" }}>
      <strong> Loading ... </strong>
      <div class="spinner-grow text-info" role="status"></div>
    </div>,
    // *********************************************
    // ******************* TABLE *******************
    // *********************************************
    <div class="main-table" style={{ display: "block" }}>
      {/******************** Search Bar ********************/}

      <div class="search-container">
        <div class="sgrna-search-container">
          <span class='selection-header'>Filter by sequence</span>
          <input type="text" id="regexString" onKeyUp={() => this.sgRNAFilter()} placeholder={"Search for sgRNA.."} value={this.highlighted_selection ? this.highlighted_selection.sgrna : ""} />
          <i class="material-icons close-icon" onClick={() => {this.reinitializeSgrna(); this.reinitSelection() }}>close</i>
          {/*<span class="tooltiptextRegex">Use Regex : <br/>    ^ : beginningslider with <br/> $ : ending with</span>*/}
        </div>
        <div class="slider-containers">
          <span class="selection-header">Filter by number of occurences</span>
          <div class="slider">
          </div>
        </div>

      </div>
      {/******************** Table ********************/}

      <table id="resultTab" style={{ width: '100%' }}>
        <thead>
          <tr class="global-header">
            <th 
              rowSpan={this.gene ? 2: 1}
              onClick={(e) => {this.handleChangeSortMethod(e);}}
              data-type="Alphabetical">
                <span>Sequence(s) ({this.currentSgrnas.length} sgRNAs selected)</span>
                <i class={"material-icons table-sort-icon " + (this.sort_type === "Alphabetical" ? "highlighted" : "")}>keyboard_arrow_down</i>
            </th>
            <th 
              colSpan={2}
              onClick={(e) => {this.handleChangeSortMethod(e);}}
              data-type="Occurences">
                <span>Occurences number</span>
                <i class={"material-icons table-sort-icon " + (this.sort_type === "Occurences" ? "highlighted" : "")}>keyboard_arrow_down</i>
            </th>
            <th>Selection ({this.card_selection.length}) 
            <input type="checkbox" class="all-checkbox" onClick={(e) => {
                //this.highlightSelectedOrg(e.target);
                this.cardAction(e.target, this.currentSgrnas.map(sgrna => sgrna.seq));
                }}></input> 
            </th>
          </tr>
          {this.gene ? <tr>
            <td style={{ paddingRight: '10px' }}>Inside homologous gene(s)</td>
            <td>Outside homologous gene(s)</td>
          </tr> : ''}
        </thead>
        <tbody>
          <tr style={{ height: '8px' }}>
            <td />
            <td />
            <td />
            <td />
          </tr>

          {this.displaySgrna.map(sgrna => {
            const currentOccurences = this.sequencesOccurences(sgrna.seq);
            //const min = currentOccurences.reduce((p, v) => (p < v.coords_count ? p : v.coords_count), currentOccurences[0].coords_count);
            
            let to_return = [<tr class="seq-header">
            <td>
              <strong>{sgrna.seq.slice(0, -3)}<span style={{ color: "rgba(239, 71, 111)" }}>{sgrna.seq.slice(-3)} </span></strong>
            </td>
            {this.gene ? <td>
              <strong>{currentOccurences.reduce((acc, val) => acc + val.on_gene_count, 0)}</strong>
            </td> : 
            <td colSpan={2}>
              <strong>{currentOccurences.reduce((acc, val) => acc + val.coords_count, 0)}</strong>
            </td>}
            {this.gene ? <td>
              <strong>{currentOccurences.reduce((acc, val) => acc + val.not_on_gene_count, 0)}</strong>
            </td> : ''} 
            <td>
              <input type="checkbox" class="checkbox" id={sgrna.seq} onClick={(e) => {
                //this.highlightSelectedOrg(e.target);
                this.cardAction(e.target, [sgrna.seq]); 
                }}></input>
            </td>
            
          </tr>]
          {currentOccurences.map(o => {
            const selected = this.selected && this.selected.org === o.name && this.selected.sgrna === sgrna.seq;
            const checkbox_selected = this.card_selection.includes(sgrna.seq);
            to_return.push(
            <tr class={"organism-line" + (checkbox_selected && !selected ? " checkbox-selected" : "") + (selected && this.shouldHighlight ? " click-selected":"")}
              onClick={() => {
                this.onOrganismClick(o.name, sgrna.seq);;
                //this.onClickTableOrganism.emit();
              }}
              >
            
            <td
              class="sgrna-organism"   
            >
            {o.name}
            </td>
              {this.gene ? <td> {o.on_gene_count}</td> : <td colSpan={2}>{o.coords_count}</td>}
              {this.gene ? <td> {o.not_on_gene_count}</td> : ''}
            <td />
            </tr>)             
          })}

            return to_return; 
          })}
        </tbody>
      </table>

      {/******************** Pagination ********************/}

      <div class="pagination">
        <div class="pagination-select-entries">
          <span>Items by page : </span>
          <select onChange={(e) => {
            this.entries_by_pages = (e.target as HTMLSelectElement).value as unknown as number;
            this.page = 1; 
              }}>
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div class="page-numbering">
          <div
            class={"page-field" + (this.page === 1 ? " disabled" : "")}
            onClick={() => this.page = 1}
          >
            First
          </div>
          <div
            class={"page-field" + (this.page === 1 ? " disabled" : "")}
            onClick={() => this.page = this.page === 1 ? this.page : this.page - 1}
          >
            &laquo;
          </div>
          {this.current_pagination_display.map(e =>
            <div
              class={"page-field page-number" + (this.page === e ? " active" : "")}
              onClick={() => this.page = e}>
              <span>{e}</span>
            </div>)}
          <div
            class={"page-field" + (this.page === this.total_pages ? " disabled" : "")}
            onClick={() => this.page = this.page === this.total_pages ? this.page : this.page + 1}>
            &raquo;
            </div>
          <div
            class={"page-field" + (this.page === this.total_pages ? " disabled" : "")}
            onClick={() => this.page = this.total_pages}>
            Last
        </div>
        </div>
      </div>
    </div>
    ]);
  }
}