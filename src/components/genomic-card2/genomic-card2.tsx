import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import "@mmsb/mmsb-select";
import { CurrentSelection, SGRNAForOneEntry } from '../result-page/interfaces';
import * as dspl from './displayPlot';
import * as d3 from "d3";


@Component({
    tag: 'genomic-card2',
    styleUrl: 'genomic-card2.css',
    shadow: true
})

export class GenomicCard {
    @Element() private element: HTMLElement;

    @Prop() organisms: string[];
    @Prop() selected: CurrentSelection; //org, sgrna, ref, size
    @Prop() current_references: string[];
    @Prop() current_sgrnas: SGRNAForOneEntry[];
    //@Prop() organism_data: OrganismHit[];
    @Prop() diagonal_svg:number; 
    //@Prop() orgSelected: string;
    //@Prop() sgrnaSelected: string;
    //@Prop() json_all_info: any;
    //@Prop() refSelected: string;
    @Prop() changeOrganism: (org: string) => void;
    @Prop() changeSgrna: (sgrna: string) => void;
    @Prop() changeRef: (ref: string) => void; 
    @Prop() changeSgrnaSubset: (sgrna_subset: string[]) => void; 

    @Prop() onClickHighlight:() => void; 
    //@Prop() changeRefs: (ref_list: string[]) => void
    //@Prop() changeSgrnas: (sgrnas: any) => void

    @Event({ eventName: 'genomic-card.button-click' }) onClickHighlightButton: EventEmitter;

    selected_section_on_card:number = -1; 
    initial_sgrnas:SGRNAForOneEntry[]; 

    @Listen('sectionSelected', { target: 'window' })
    handleSectionSelected(event: CustomEvent) {
        this.changeSgrnaSubset(event.detail.sgRNA);
        this.selected_section_on_card = event.detail.section; 
    }

    componentWillLoad(){
        this.initial_sgrnas = this.current_sgrnas
    }

    get selected_sgrna() {
        return this.current_sgrnas
            .find(e => e.seq === this.selected.sgrna)
    }

    getNumberOccurences(sgrna:string){
        return this.current_sgrnas
            .find(e => e.seq === sgrna)
            .coords.length
    }

    //current_sgrnas: string[];
    //current_data:any;

    //componentWillLoad() {
    //    this.initializeData()
    //}

    /*initializeData(org: string = undefined, sgrna: string = undefined, ref: string = undefined) {
        console.log("update", org, sgrna, ref)
        this.orgSelected = org ? org : this.organisms[0]
        //console.log(this.orgSelected)
        this.current_references = Object.keys(this.json_all_info[this.orgSelected]);
        this.refSelected = ref ? ref : this.current_references[0]
        const current_data = this.json_all_info[this.orgSelected][this.refSelected];
        this.current_sgrnas = Object.keys(current_data).sort((a, b) => (current_data[a].length < current_data[b].length) ? 1 : -1)
        this.sgrnaSelected = sgrna ? sgrna : this.current_sgrnas[0]
    }

    setReferences(org: string) {
        this.current_references = Object.keys(this.json_all_info[org]);
        this.refSelected = this.current_references[0];
    }*/

    /*componentDidRender(){
        console.log("DidRender")
        console.log(this.orgSelected)
        this.initializeData(this.orgSelected, this.sgrnaSelected)
    }*/

    componentDidRender() {
        const coords = this.current_sgrnas.find(e => e.seq === this.selected.sgrna).coords
        const old_current_sgrnas:{[seq:string]:string[]} = {}
        this.initial_sgrnas.map(e => old_current_sgrnas[e.seq] = e.coords)
        dspl.generateGenomicCard(DisplayGenome, this.diagonal_svg, this.selected.size, this.element.shadowRoot, coords, this.selected.sgrna);
        dspl.generateSunburst(this.selected.size, old_current_sgrnas, this.diagonal_svg, this.element.shadowRoot.querySelector('#displayGenomicCard'), this.selected_section_on_card, false);
        /*this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
            this.selectedSection = -1;
            this.onOrganismChange(this.orgSelected, this.allSgrna[0]);
            if (this.gene) {
                this.emitsgData(this.all_data_json[this.orgSelected][this.refSelected], 0, this.sizeSelected)
            }

        })*/
        //this.styleHelp(".genomeCircle>path", ".help-gen");
        //this.styleHelp(".sunburst>path", ".help-section");
        //this.styleHelp("#notif>.material-icons", "#notif-text");*/
    }

    styleHelp(ref: string, target: string) {
        if (this.element.shadowRoot.querySelector(ref) != null) {
            var coordGen = this.element.shadowRoot.querySelector(ref).getBoundingClientRect();
            (this.element.shadowRoot.querySelector(target) as HTMLElement).style.top = coordGen.top.toString() + "px";
            (this.element.shadowRoot.querySelector(target) as HTMLElement).style.left = coordGen.left.toString() + "px";
        }
    }

    render() {
        /*console.log("RENDER GENOMIC CARD")
        console.log(this.organisms)
        console.log(this.selected)
        console.log(this.current_references)
        console.log(this.current_sgrnas)*/
        return ([
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                //@ts-ignore
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
            </head>,
            <div class="genomic-card-root">
                <div class="selection">
                    <div>
                        <div class="list-selection organism-selection">
                            <span class="selection-header"> Organisms </span>
                            <mmsb-select
                                data={this.organisms.map(name => [name, name])}
                                selected={[this.selected.org]}
                                onSelect={e => this.changeOrganism(e)}
                            />
                        </div>
                        <div class="list-selection ref-selection">
                            <span class="selection-header">References</span>
                            <select class="custom-select" onChange={e => this.changeRef((e.target as HTMLSelectElement).value)}>
                                {this.current_references.map(ref => <option>{ref}</option>)}
                            </select>
                        </div>
                        <div>
                            <button class="highlight-sgrna-button" onClick={() => { this.onClickHighlight(); this.onClickHighlightButton.emit(); }}> 
                                <i class="material-icons" style={{ float: 'left' }}>arrow_left</i>

                                <span>Highlight this sgRNA</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div class="list-selection sgrna-selection">
                            <span class="selection-header">sgRNA</span>
                            <mmsb-select
                                label="Select sgRNA"
                                data={this.current_sgrnas
                                    .map(sgRna => [sgRna.seq, sgRna.seq + " (" + String(this.getNumberOccurences(sgRna.seq)) + ")"])}
                                selected={[this.selected.sgrna]}
                                onSelect={(e) => {
                                    this.changeSgrna(e)
                                }}/>
                        </div>
                        <div class="coordinates">
                            <span class="selection-header">Coordinates</span>
                            <div class="coord-box">
                                <ul>
                                    {this.current_sgrnas
                                        .find(e => e.seq === this.selected.sgrna).coords
                                        .map(e => <li>{e}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="graph">
                    <svg 
                        id='displayGenomicCard' 
                        viewBox={"0 0 " + this.diagonal_svg + " " + this.diagonal_svg}>
                        <text transform={`translate(${this.diagonal_svg / 2 - 30} , ${this.diagonal_svg / 2})`}> {this.selected.size} pb </text>
                    </svg>
                </div>
            </div>

            
                
        ])
    }
}

function DisplayGenome(root: ShadowRoot, width: number, height: number): void {
    // Clean all arc
    d3.select(root.querySelector('#displayGenomicCard')).selectAll('g').remove();
    let arcGenerator = d3.arc();
    // Generator arc for the complete genome
    let pathGenome = arcGenerator({
        startAngle: 0,
        endAngle: 2 * Math.PI,
        innerRadius: width * 15 / 100 - width * 1 / 100,
        outerRadius: width * 15 / 100
    })
    // Draw the complete genome
    d3.select(root.querySelector('svg'))
        .append("g")
        .attr('class', 'genomeCircle')
        .append('path')
        .attr('d', pathGenome)
        .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')')
        .style('fill', 'rgba(79, 93, 117)');
}