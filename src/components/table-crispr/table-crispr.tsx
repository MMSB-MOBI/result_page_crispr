'use strict';

import { Component, Prop, State, Element, h, Listen } from '@stencil/core';
import "@mmsb/radial-crispr";
import { CurrentSelection, SequenceSGRNAHit, SortingOrder, MinMaxOccurencesData, SortingType } from '../result-page/interfaces';

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

  @State() sort_type: SortingType = "Min occurences"
  @State() sort_order: SortingOrder = "descending"

  @Prop() selected: CurrentSelection;
  @Prop() shouldHighlight: boolean;
  @Prop() onOrganismClick?: (organism: string, sgrna: string) => void;

  total_pages:number;
  entries_by_pages:number = 10; 
  current_pagination_display:number[]

  // *************************** LISTEN & EMIT ***************************

  constructor() {
    this.sgRNAFilter = this.sgRNAFilter.bind(this);
  }

  @Listen('genomic-card.button-click', { target: 'window' })
  handleButtonSelectSgrna() {
    //console.log('pouet')
    const selected_sgrna_index = this.currentSgrnas.map(e => e.seq).indexOf(this.selected.sgrna)
    const current_page = Math.trunc(selected_sgrna_index / 10) + 1; 
    this.page = current_page; 
  }

  /* Filter sgRNA on search*/
  sgRNAFilter(): void {
    //Filter on min occurences
    const minOcc: any = (this.element.shadowRoot.querySelector("#minOcc") as HTMLInputElement).value;
    const search = (this.element.shadowRoot.querySelector("#regexString") as HTMLInputElement).value;
    this.currentSgrnas = this.initial_min_max_data.filter(d => d.min_occurences >= minOcc).filter(a => RegExp(search).test(a.seq))
    this.page = 1;
  }


  // *************************** DISPLAY ***************************

  /*
    * Find min and max occurences for each sgRNA summing occurences for each organism
    * @param {Number} maxPages Number of maximum pages
  */
  colorPagination(maxPages: Number): void {
    // Color arrows for pagination
    let colorBg = (this.page === 1) ? "#f1f1f1" : "rgba(239, 71, 111)";
    let colorArrow = (this.page === 1) ? "black" : "white";
    (this.element.shadowRoot.querySelector(".previous") as HTMLElement).style.background = colorBg;
    (this.element.shadowRoot.querySelector(".previous") as HTMLElement).style.color = colorArrow;
    colorBg = (this.page === maxPages) ? "#f1f1f1" : "rgba(239, 71, 111)";
    colorArrow = (this.page === maxPages) ? "black" : "white";
    (this.element.shadowRoot.querySelector(".next") as HTMLElement).style.background = colorBg;
    (this.element.shadowRoot.querySelector(".next") as HTMLElement).style.color = colorArrow;
  }

  getCurrentPagination(start:number, end:number):number[]{
    let pagination_display = [];
    for (let i = start; i <= end; i++){
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

    this.total_pages = (Number.isInteger(this.currentSgrnas.length / this.entries_by_pages)) ? (this.currentSgrnas.length / this.entries_by_pages) : (Math.trunc(this.currentSgrnas.length / this.entries_by_pages) + 1);
    
    this.current_pagination_display = this.total_pages < 10 ? this.getCurrentPagination(1, this.total_pages) : this.getCurrentPagination(1,10); 

  }

  componentDidLoad(){
    //this.createSlider();
  }

  componentDidRender() {
    let maxPages = (Number.isInteger(this.currentSgrnas.length / 10)) ? (this.currentSgrnas.length / 10) : (Math.trunc(this.currentSgrnas.length / 10) + 1);
    this.colorPagination(maxPages);
    
  }

  componentWillUpdate() {
    this.sortData()
    console.log("WillUpdate", this.shouldHighlight)
    this.displaySgrna = this.currentSgrnas.slice((10 * (this.page - 1)), 10 * this.page);

    
    //this.sortTable("Max occurences")
  }

  sequencesOccurences(seq: string) {
    //console.log(this.sequence_data_json)
    const hit = this.complete_data.find(s => s.sequence === seq);
    return hit.occurences.map(o => {
      const coords_count = o.all_ref.reduce((acc, val) => acc + val.coords.length, 0);

      return { name: o.org, coords_count };
    })
  }

  minMaxOccurences() {
    return this.complete_data.map(sgrna => {
      let nb_occurences = []
      sgrna.occurences.map(occ => {
        nb_occurences.push(occ.all_ref.reduce((acc, val) => acc + val.coords.length, 0))
      })
      nb_occurences.sort((a, b) => a - b)
      return { seq: sgrna.sequence, min_occurences: nb_occurences[0], max_occurences: nb_occurences[nb_occurences.length - 1] };
    })
  }


  sortData() {
    if (this.sort_type === "Min occurences" && this.sort_order === "descending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.min_occurences - a.min_occurences)
    }
    else if (this.sort_type === "Min occurences" && this.sort_order === "ascending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => a.min_occurences - b.min_occurences)
    }
    else if (this.sort_type === "Max occurences" && this.sort_order === "descending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.max_occurences - a.max_occurences)
    }
    else if (this.sort_type === "Max occurences" && this.sort_order === "ascending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => a.max_occurences - b.max_occurences)
    }
    else if (this.sort_type === "Alphabetical" && this.sort_order === "descending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.seq < a.seq ? 1 : -1)
    }
    else if (this.sort_type === "Alphabetical" && this.sort_order === "ascending") {
      this.currentSgrnas = this.currentSgrnas.sort((a, b) =>  b.seq < a.seq ? -1 : 1)
    }
  }

  clickOnOrganismList(organism: string, sgrna: string) {
    if (this.onOrganismClick) {
      this.onOrganismClick(organism, sgrna);
    }
  }

  handleChangeSortMethod = (e: MouseEvent) => {
    const clicked_e = e.currentTarget as HTMLTableHeaderCellElement;
    const icon_element = clicked_e.querySelector('i');

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

  /*createSlider(){
    const slider = this.element.shadowRoot.querySelector('.slider') as HTMLElement
    noUiSlider.create(slider, {
      start: [2, 5],
      connect: true,
      range: {
          'min': 0,
          'max': 10
      }
    });
  }*/

  render() {
    if (this.state == "stop") {
      return this.error_msg
    }

    console.log(this.total_pages)
    console.log(this.current_pagination_display); 

    // Parse data and initialize allSgrna and calcul occurences

    return ([<head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      // @ts-ignore
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
      <link href="//cdn.bootcss.com/noUiSlider/8.5.1/nouislider.min.css" rel="stylesheet"/>
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
        <input type="text" id="regexString" onKeyUp={this.sgRNAFilter} placeholder="Search for sgRNA.." />
        {/*<span class="tooltiptextRegex">Use Regex : <br/>    ^ : beginning with <br/> $ : ending with</span>*/}
        <div id="slider" class="slider"/>

      </div>
      {/******************** Table ********************/}

      <table id="resultTab" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th onClick={this.handleChangeSortMethod} data-type="Alphabetical">
              <span>Sequence</span> 
              <i class={"material-icons table-sort-icon " + (this.sort_type === "Alphabetical" ? "highlighted" : "")}>keyboard_arrow_down</i>
            </th>

            <th onClick={this.handleChangeSortMethod} data-type="Min occurences" class="align-right">
              <span>Minimum</span>
              <i class={"material-icons table-sort-icon " + (this.sort_type === "Min occurences" ? "highlighted" : "")}>keyboard_arrow_down</i>
            </th>

            <th onClick={this.handleChangeSortMethod} data-type="Max occurences" class="align-right">
              <span>Maximum</span> 
              <i class={"material-icons table-sort-icon " + (this.sort_type === "Max occurences" ? "highlighted" : "")}>keyboard_arrow_down</i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: '8px' }}>
            <td />
            <td />
            <td />
          </tr>

          {this.displaySgrna.map(sgrna => {
            const currentOccurences = this.sequencesOccurences(sgrna.seq);
            //const min = currentOccurences.reduce((p, v) => (p < v.coords_count ? p : v.coords_count), currentOccurences[0].coords_count);

            return ([
              <tr class="seq-header">
                <td>
                  <strong>{sgrna.seq.slice(0, -3)}<span style={{ color: "rgba(239, 71, 111)" }}>{sgrna.seq.slice(-3)} </span></strong>
                </td>
                <td class="occurence-text">{sgrna.min_occurences}</td>
                <td class="occurence-text">{sgrna.max_occurences}</td>
              </tr>,
              <tr>
                <td colSpan={3}>
                  <ul>
                    {currentOccurences.map(o => {
                      const selected = this.selected && this.selected.org === o.name && this.selected.sgrna === sgrna.seq;
                      return <li
                        class="sgrna-organism"
                        style={{ backgroundColor: selected && this.shouldHighlight ? '#539ddc54' : '' }}
                        onClick={() => this.clickOnOrganismList(o.name, sgrna.seq)}
                      >
                        {o.name} <span class="tinyGrayText"> ({o.coords_count}) </span>
                      </li>
                    })}
                  </ul>
                </td>

              </tr>
            ]);
          })}
        </tbody>
      </table>

      {/******************** Pagination ********************/}
      
    
      {this.current_pagination_display.map(e => {
        
      })}
      <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item"><a class="page-link" href="#">1</a></li>
        <li class="page-item"><a class="page-link" href="#">2</a></li>
        <li class="page-item"><a class="page-link" href="#">3</a></li>
        <li class="page-item"><a class="page-link" href="#">4</a></li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>

      <div class="pagination">
        <a href="#" class="previous round" onClick={() => { if (this.page > 1) this.page -= 1 }}>&#8249;</a>
        <a href="#" class="next round" onClick={() => { if (this.page < this.total_pages) this.page += 1 }}>&#8250;</a>
      </div>
    </div>
    ]);
  }
}
