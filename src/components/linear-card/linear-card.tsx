import { Component, Prop, State, Element, h, Watch } from '@stencil/core';
import * as d3 from "d3";

@Component({
  tag: 'linear-card',
  styleUrl: 'linear-card.css',
  shadow: true
})

export class LinearCard {
// *************************** PROPERTY & CONSTRUCTOR ***************************
@Element() element: HTMLElement;
// list of all_sgrna in JSON format
@Prop({mutable:true}) all_sgrna:string;
// gene in JSON format
@Prop({mutable:true}) gene:string;
@Prop({mutable:true}) width_bar="90%";
@Prop({mutable: true}) nb_step="20";
// width to calcul hist width : width_bar(in percentage) * screen_width
@Prop({mutable: true}) width_div:string;

@Prop() onClose?: () => void;

// Object gene : [{'start' : xx, 'end': xx}, ..]
@State() allCoordGene:Array<Object>;
// Coordinate of the current gene : {'start': xx, 'end': xx}
@State() coordGene:{};
// all_sgrna parsed
@State() allSgrna:{};
// data for hist : [{'stepCoord': xx-xx, 'nbSgrna': xx, 'sgrna': [string]}, ..]
@State() dataHist:Array<Object>;
// true if several genes (allCoordGene.length > 1)
@State() pagination:boolean;
// State of the current page
@State() page=1;

// *************************** FUNCTIONS ***************************
  /**
  * create a dictionary with interval, number of sgRna and list of sgRNA

  * @returns {Array<Object>} dicInterval
  */
  initializeInterval():Array<Object> {
    let dicInterval=[];

    let stepInterval = Math.round((this.coordGene["end"] - this.coordGene["start"])/parseInt(this.nb_step));
    let start=Number(this.coordGene["start"]);

    for(var i=0; i<Number(this.nb_step) -1; i++){
      dicInterval.push({stepCoord: `${start}-${start+stepInterval}`, nbSgrna: 0, sgrna:[]});
      start += stepInterval;
    }
    // the last interval can be bigger or smaller
    dicInterval.push({stepCoord: `${start}-${this.coordGene["end"]}`, nbSgrna: 0, sgrna:[]});
    return dicInterval;
}

  /**
  * check if a sgRNA is on the current gene or not
  * @param {number} start start coordinate of the sgRNA
  * @param {number} end end coordinate of the sgRNA
  * @returns {boolean} true or false
  */
  checkOnGene(start:number, end:number):boolean {
    if(start >= this.coordGene["start"] && end <= this.coordGene["end"]) {
      return true;
    }
    return false;
  }

  /**
  * check if a sgRNA is on a given interval
  * @param {string} interval coordinates separate by '-'
  * @param {number} start start coordinate of the sgRNA
  * @param {number} end end coordinate of the sgRNA
  * @returns {boolean} true or false
  */
  checkOnInterval(interval:string, start:number, end:number):boolean{
    let stInt=parseInt(interval.split("-")[0]), endInt=parseInt(interval.split("-")[1]);
    if((start >= stInt && start <= endInt) || (end >= stInt && end <= endInt) || (stInt >= start && stInt <= end)){
      return true;
    }
    return false;
  }

  /**
  * Initialize a dictionary with interval and check for each sgRNA if they are on the current gene
  * and on which interval. Then fill the interval dictionary
  * @returns {Array<Object>}
  */
  setDataHist():Array<Object>{
    let data=this.initializeInterval();
    Object.keys(this.allSgrna).forEach(sgrna => (this.allSgrna[sgrna] as Array<string>).forEach(coord => {
      var start = Number(coord.match('[+-][(]([0-9]*)')[1]);
      var end = Number(coord.match(',([0-9]*)[)]')[1]);
      // if it's on the current gene
      if(this.checkOnGene(start, end)){
        data.forEach(interval => {
          // Find on which interval
          if(this.checkOnInterval(interval["stepCoord"], start, end)){
            interval["nbSgrna"] += 1;
            interval["sgrna"].push(sgrna);
          }
        })
      }
    }))
    return data;
  }

// *************************** DISPLAY ***************************
  /**
  * Display a histogram under the div #divHist
  */
  displayHist():void{
    let widthBarNb = (this.width_bar.match("[0-9]*")[0] as unknown as number);
    let leftBorder = (100 - widthBarNb)/2;
    var color = "rgba(76, 152, 187, 0.9)";
    var height = 200;
    d3.selectAll(this.element.shadowRoot.querySelectorAll("#divHist>svg")).remove();
    d3.selectAll(this.element.shadowRoot.querySelectorAll("#divHist>div")).remove();
    // Color scale for bin
    var colorScale = d3.scaleLinear()
                .domain([d3.min(this.dataHist, function(d) { return d["nbSgrna"]; }), d3.max(this.dataHist, function(d) { return d["nbSgrna"]; })])
                // @ts-ignore
                .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);
    // set the ranges
    var x = d3.scaleBand()
              .range([0, widthBarNb*parseFloat(this.width_div)/100])
              .domain(this.dataHist.map(function(d) { return d["stepCoord"]; }));
    var y = d3.scaleLinear()
              .range([height, 0])
              .domain([0, d3.max(this.dataHist, function(d) { return d["nbSgrna"]; })]);
    // Create the svg
    var svg = d3.select(this.element.shadowRoot.querySelector("#divHist")).append("svg")
        .attr("width", this.width_bar)
        .attr("height", height)
        .style("margin-left", `${leftBorder}%`)
      .append("g");

    let div = d3.select(this.element.shadowRoot.querySelector("#divHist"))
      .append('div')
      .attr('class', 'tooltip-hist')
      .style("position", "absolute")
      .style("display", "none");

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
        .data(this.dataHist)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {return x(d["stepCoord"]); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d["nbSgrna"]); })
        .attr("height", function(d) { return height - y(d["nbSgrna"]); })
        .attr("fill", function(d) { return colorScale(d["nbSgrna"]) })
        .on("mouseover", e => {
          div.style("display", "block");
          div.transition()
            .duration(500)
          div.html(`Number of sgRna : ${e["nbSgrna"]} <br/> Interval : ${e["stepCoord"]}`)
            .style('left', (d3.event.pageX) + 'px')
            .style('top', (d3.event.pageY) + 'px');
        })
        .on('mouseout', () => {
          div.transition()
            .duration(5)
            .style('display', "none");
        })
        .on("click", e => {
          d3.select(this.element.shadowRoot.querySelector("#sgrnaBox")).html("<div id='sgrnaBoxHeader'><strong> Interval : </strong>" +
                                                                             e["stepCoord"] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong> Nb sgRNA : </strong>" +
                                                                             e["nbSgrna"] + "</div><div id='sgrnaBoxText'>" +
                                                                             e["sgrna"].map(sg => "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + sg + "<br/>").join(' ') + "</div>");

        });
  }

  /**
  * Color pagination : need .previous and .next div
  * @param {Number} maxPages
  */
  colorPagination(maxPages:number) {
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

  componentWillLoad(){
    // Parse data cause not given by socket
    this.allCoordGene = JSON.parse(this.gene);
    this.coordGene = this.allCoordGene[0];
    this.pagination = (this.allCoordGene.length > 1) ? true : false;
    this.allSgrna = JSON.parse(this.all_sgrna);
    this.dataHist = this.setDataHist();
    let current_parent = this.element.parentElement
    this.width_div = current_parent.getBoundingClientRect().width.toString()
  }

  componentDidLoad() {
    setTimeout(() => {
      this.onGeneChange();
    }, 250);
  }

  componentDidRender() {
    this.displayHist();
    this.colorPagination(this.allCoordGene.length);
  }

  @Watch('gene')
  @Watch('all_sgrna')
  onGeneChange() {
    this.element.shadowRoot.querySelector('svg').innerHTML = "";
    this.componentWillLoad();
  }


  render() {
    let widthBarNb = Number(this.width_bar.match("[0-9]*")[0]);
    let leftBorderGene = `${(100 - widthBarNb)/2}%`;
    let leftBorder = `${(100 - widthBarNb)/2 - 2}%`;
    let rightBorder = `${widthBarNb - ((100 - widthBarNb)/2)}%`;
    let displayPagnigation = (this.pagination) ? "initial" : "none";

    return ([
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>
      </head>,
      // ************************************
      // *      PAGINATION AND POP-UP       *
      // ************************************
      <div id="pagination" >
      <div style={{display:displayPagnigation}}>
        <div class="arrowPagination">
          <a href="#" class="previous round" onClick={() => {if (this.page > 1) {this.page -= 1; this.coordGene = this.allCoordGene[this.page - 1]; this.dataHist = this.setDataHist();}}}>&#8249;</a>
          <a href="#" class="next round" onClick={() => {if (this.page < this.allCoordGene.length) {this.page += 1; this.coordGene = this.allCoordGene[this.page - 1]; this.dataHist = this.setDataHist();}}}>&#8250;</a>
        </div>
          <div class="alert alert-primary alert-dismissible fade show" id="alert-show" role="alert">
            You have {this.allCoordGene.length} homologous gene in this section.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true" onClick={() => (this.element.shadowRoot.querySelector("#alert-show") as HTMLElement).id="alert-hidden"}>&times;</span>
            </button>
          </div>
      </div>
        <div id="close">
          <i class="material-icons" onClick={this.onClose}>
              cancel
          </i>
        </div>

      </div>,
      // ************************************
      // *             HISTOGRAM            *
      // ************************************
      <div>
        <div id="binSize">
          Bin size : <span style={{color:"rgb(239, 71, 111)", width:"35%"}}>{Math.ceil((this.coordGene["end"] - this.coordGene["start"])/(this.nb_step as unknown as number))}</span>
        </div>
        <div style={{float:"right", width:"55%"}}>
          <strong> Sgrna box </strong>
          <div id="sgrnaBox"></div>
        </div>
      </div>,

      <div id="divHist">
        
      </div>,

      <div>
        <div class="geneBar" style={{width:this.width_bar, marginLeft:leftBorderGene}}>
        </div>
        <span style={{marginLeft: leftBorder}}> {this.coordGene["start"]} </span>
        <span style={{marginLeft: rightBorder}}> {this.coordGene["end"]} </span>
      </div>,
      // @ts-ignore
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"/>,
      ]);
  }
}
