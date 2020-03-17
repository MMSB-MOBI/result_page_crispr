'use strict';

import { Component, Prop, State, Element, h, Listen, Event, EventEmitter } from '@stencil/core';
import "@mmsb/radial-crispr";
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

  total_pages: number;
  @State() entries_by_pages: number = 10;
  current_pagination_display: number[]
  max_pagination: number = 7;

  @State() highlighted_sgrna: string;
  @State() minocc_filter: number[];
  @State() maxocc_filter: number[];

  // *************************** LISTEN & EMIT ***************************

  constructor() {
    this.sgRNAFilter = this.sgRNAFilter.bind(this);
  }

  @Event({ eventName: 'table-crispr.org-click' }) onClickTableOrganism: EventEmitter;

  @Listen('genomic-card.button-click', { target: 'window' })
  handleButtonSelectSgrna() {
    this.highlighted_sgrna = this.selected.sgrna;
    this.sgRNAFilter(this.highlighted_sgrna);
    const selected_sgrna_index = this.currentSgrnas.map(e => e.seq).indexOf(this.selected.sgrna)
    const current_page = Math.trunc(selected_sgrna_index / 10) + 1;
    this.page = current_page;
  }

  /* Filter sgRNA on search*/
  sgRNAFilter(sgrna: string = undefined): void {
    console.log("filter")
    //Filter on min occurences
    //const minOcc: any = (this.element.shadowRoot.querySelector("#minOcc") as HTMLInputElement).value;
    const search = sgrna ? sgrna : (this.element.shadowRoot.querySelector("#regexString") as HTMLInputElement).value;
    //this.currentSgrnas = this.initial_min_max_data.filter(d => d.min_occurences >= minOcc).filter(a => RegExp(search).test(a.seq))
    this.currentSgrnas = this.initial_min_max_data
      .filter(a => RegExp(search).test(a.seq))
      .filter(a => a.min_occurences >= this.minocc_filter[0] && a.min_occurences <= this.minocc_filter[1])
      .filter(a => a.max_occurences >= this.maxocc_filter[0] && a.max_occurences <= this.maxocc_filter[1])



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
    const minocc_min = this.currentSgrnas.reduce((val, e) => val < e.min_occurences ? val : e.min_occurences, 0)
    const maxocc_max = this.currentSgrnas.reduce((val, e) => val > e.max_occurences ? val : e.max_occurences, 0)
    const maxocc_min = this.currentSgrnas.reduce((val, e) => val < e.max_occurences ? val : e.max_occurences, 0)
    this.minocc_filter = [minocc_min, minocc_max];
    this.maxocc_filter = [maxocc_min, maxocc_max]
  }

  componentWillRender() {
  }

  componentDidLoad() {
    this.displaySlider(this.element.shadowRoot.querySelector(".slider-min"), this.minocc_filter[0], this.minocc_filter[1], "minocc");
    this.displaySlider(this.element.shadowRoot.querySelector(".slider-max"), this.maxocc_filter[0], this.maxocc_filter[1], "maxocc");
    this.addSvgText();
  }

  componentWillUpdate() {
    this.sortData()
    this.displaySgrna = this.currentSgrnas.slice((10 * (this.page - 1)), 10 * this.page);


    //this.sortTable("Max occurences")
  }

  sequencesOccurences(seq: string) {
    const hit = this.complete_data.find(s => s.sequence === seq);
    return hit.occurences.map(o => {
      const coords_count = o.all_ref.reduce((acc, val) => acc + val.coords.length, 0);

      return { name: o.org, coords_count };
    })
      .sort((a,b) => b.coords_count - a.coords_count)
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
      this.currentSgrnas = this.currentSgrnas.sort((a, b) => b.seq < a.seq ? -1 : 1)
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

  displaySlider(elmt: HTMLElement, min: number, max: number, cat: string) {
    const sliderRange = d3_slider
      .sliderHorizontal()
      .min(min)
      .max(max)
      .step(1)
      .width(250)
      //.tickFormat(d3.format('.2%'))
      .ticks(5)
      .default([min, max])
      .fill('#2196f3')
      .on('onchange', val => {
        if (cat === "minocc") {
          this.minocc_filter = [val[0], val[1]]
        }
        else if (cat === "maxocc") {
          this.maxocc_filter = [val[0], val[1]]
        }
        this.sgRNAFilter();
        this.addSvgText();
        //d3.select(elmtValue).text(val[0]);
      });

    d3.select(elmt)
      .append('svg')
      .attr('width', 300)
      .attr('height', 50)
      .append('g')
      .attr('transform', 'translate(10,10)')
      .call(sliderRange);
  }

  addSvgText() {
    let i = 0
    this.element.shadowRoot.querySelectorAll('.slider-min .parameter-value')
      .forEach(svg_elmt => {
        d3.select(svg_elmt).select('text').remove()
        d3.select(svg_elmt)
          .append('text')
          .text(this.minocc_filter[i])
          .attr('font-size', 10)
          .attr('dy', '.71em')
          .attr('y', '27')
        i += 1;
      })

    let j = 0
    this.element.shadowRoot.querySelectorAll('.slider-max .parameter-value')
      .forEach(svg_elmt => {
        d3.select(svg_elmt).select('text').remove()
        d3.select(svg_elmt)
          .append('text')
          .text(this.maxocc_filter[j])
          .attr('font-size', 10)
          .attr('dy', '.71em')
          .attr('y', '27')
        j += 1;
      })

  }

  render() {
    if (this.state == "stop") {
      return this.error_msg
    }

    console.log("RENDER")

    this.displaySgrna = this.currentSgrnas.slice((this.entries_by_pages * (this.page - 1)), this.entries_by_pages * this.page);
    this.total_pages = (Number.isInteger(this.currentSgrnas.length / this.entries_by_pages)) ? (this.currentSgrnas.length / this.entries_by_pages) : (Math.trunc(this.currentSgrnas.length / this.entries_by_pages) + 1);
    this.actualizePaginationDisplay();

    // Parse data and initialize allSgrna and calcul occurences

    return ([<head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      // @ts-ignore
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
      <link href="//cdn.bootcss.com/noUiSlider/8.5.1/nouislider.min.css" rel="stylesheet" />
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
          <input type="text" id="regexString" onKeyUp={() => this.sgRNAFilter()} placeholder={"Search for sgRNA.."} value={this.highlighted_sgrna ? this.highlighted_sgrna : ""} />
          {/*<span class="tooltiptextRegex">Use Regex : <br/>    ^ : beginning with <br/> $ : ending with</span>*/}
        </div>
        <div class="slider-containers">
          <div class="slider-min">
            <span class="selection-header">Minimum occurences</span>
          </div>
          <div class="slider-max">
            <span class="selection-header">Maximum occurences</span>
          </div>
        </div>

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
                <td class="occurence-text"><strong>{sgrna.min_occurences}</strong></td>
                <td class="occurence-text"><strong>{sgrna.max_occurences}</strong></td>
              </tr>,
              <tr>
                <td colSpan={3}>
                  <ul>
                    {currentOccurences.map(o => {
                      const selected = this.selected && this.selected.org === o.name && this.selected.sgrna === sgrna.seq;
                      return <li
                        class="sgrna-organism"
                        style={{ backgroundColor: selected && this.shouldHighlight ? '#539ddc54' : '' }}
                        onClick={() => {
                          this.clickOnOrganismList(o.name, sgrna.seq);
                          this.onClickTableOrganism.emit();
                        }}
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
        {/*<div class="pagination-select-page">
          <span>Go to page : </span>
          <input type="text" style={{width:'30px'}} onKeyUp={(e) => console.log(e)}></input>
          </div>*/}

      </div>
    </div>
    ]);
  }
}