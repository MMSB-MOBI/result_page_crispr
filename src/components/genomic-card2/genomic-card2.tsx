import { Component, Prop, h, State, Event, EventEmitter, Listen, Element, Watch } from '@stencil/core';
import "@mmsb/mmsb-select";
import { CurrentSelection, SGRNAForOneEntry } from '../result-page/interfaces';
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
    @Prop() diagonal_svg:number; 
    @Prop() initial_sgrnas?:SGRNAForOneEntry[]; 

    @Prop() changeOrganism: (org: string) => void;
    @Prop() changeSgrna: (sgrna: string) => void;
    @Prop() changeRef: (ref: string) => void; 
    @Prop() changeSgrnaSubset: (sgrna_subset: string[]) => void; 
    @Prop() onClickHighlight:() => void; 

    @State() highlight_selection:boolean = false; 
    @State() display_circular_barplot:boolean = true; 

    selected_section_on_card:number = -1; 
    

    //Hack to animate background color when change, because @keyframes don't work.
    @Watch('highlight_selection')
    watchHighlight(){
        setTimeout(() => this.highlight_selection = false, 500);
    }

    @Event({ eventName: 'genomic-card.button-click' }) onClickHighlightButton: EventEmitter;
    @Event({ eventName: 'genomic-card.coordinate-over'}) onOverCoordinate: EventEmitter; 
    @Event({ eventName: 'genomic-card.coordinate-out'}) onOutCoordinate:EventEmitter; 

    @Listen('sectionSelected', { target: 'window' })
    handleSectionSelected(event: CustomEvent) {
        if ( event.detail.sgRNA.length > 0 ){
            this.changeSgrnaSubset(event.detail.sgRNA);
            this.selected_section_on_card = event.detail.section; 
        }
    }

    @Listen('table-crispr.org-click', { target: 'window'})
    handleTableOrganismClick(){
        //this.removeSvg(); 
        this.highlight_selection = true; 
    }

    get selected_sgrna() {
        return this.current_sgrnas
            .find(e => e.seq === this.selected.sgrna)
    }

    get all_start_coordinates(){
        const all_coords:number[] = []; 
        this.current_sgrnas.map(e => 
            e.coords.map(coord => all_coords.push(parseInt(/\(([0-9]*),/.exec(coord)[1]))))
        return all_coords.sort((a, b) => a - b);
    }

    get overlapping_positions(): number[]{
        const word_length: number = this.current_sgrnas[0].seq.length
        const all_pos:number[] = [];
        this.current_sgrnas.map(e => 
            e.coords.map(coord => {
                const start = parseInt(/\(([0-9]*),/.exec(coord)[1]); 
                for (let i = start; i < start + word_length; i++){
                    all_pos.push(i)
                }
            }))
        return all_pos; 
    }

    /**
     * Get number of occurences for one sgrna sequence
     * @param sgrna : sgrna sequence
     */
    getNumberOccurences(sgrna:string){
        return this.current_sgrnas
            .find(e => e.seq === sgrna)
            .coords.length
    }

    getCoordinates(sgrna:string){
        return this.current_sgrnas
            .find(e => e.seq === sgrna).coords
    }

    componentDidRender() {
        const coords = this.current_sgrnas.find(e => e.seq === this.selected.sgrna).coords
        const old_current_sgrnas:{[seq:string]:string[]} = {}
        this.initial_sgrnas.map(e => old_current_sgrnas[e.seq] = e.coords)
        /*dspl.generateGenomicCard(DisplayGenome, this.diagonal_svg, this.selected.size, this.element.shadowRoot, coords, this.selected.sgrna);
        dspl.generateSunburst(this.selected.size, old_current_sgrnas, this.diagonal_svg, this.element.shadowRoot.querySelector('#displayGenomicCard'), this.selected_section_on_card, false);
        this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
            this.selected_section_on_card = -1;
            this.current_sgrnas = this.initial_sgrnas; 
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

    removeSvg(){
        if (this.element.shadowRoot.querySelector("circular-barplot svg")) {
            this.element.shadowRoot.querySelector("circular-barplot svg").remove(); 
        }
    }

    removeSvgCoordTicks(){
        //this.element.shadowRoot.querySelectorAll("circular-barplot svg .single-coord-ticks"); 
    }

    render() {
        console.log("genomic-card RENDER")
        console.log(this.selected)
        return ([
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                //@ts-ignore
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
            </head>,
            <div class="genomic-card-root">
                <div class="selection">
                    <div class="selection-col">
                        <div class="list-selection organism-selection">
                            <span class="selection-header"> Choose an organism :</span>
                            <mmsb-select
                                data={this.organisms.map(name => [name, name])}
                                selected={[this.selected.org]}
                                onSelect={e => {/*this.removeSvg();*/ this.changeOrganism(e)}}
                                color={this.highlight_selection ? "#539ddc54" : undefined}
                            />
                        </div>
                        <div class="list-selection ref-selection">
                            <span class="selection-header">This organism features {this.current_references.length} fasta sequence(s) :</span>
                            <select 
                                class={"custom-select" + (this.highlight_selection ? " highlight-select":"")} 
                                onChange={e => {/*this.removeSvg();*/this.changeRef((e.target as HTMLSelectElement).value)}}>
                                {this.current_references.map(ref => <option>{ref}</option>)}
                            </select>
                        </div>
                        <div class="list-selection">
                            <button class="highlight-sgrna-button" onClick={() => { this.onClickHighlight(); /*this.removeSvg()*/; this.onClickHighlightButton.emit(); }}> 
                                <i class="material-icons" style={{ float: 'left' }}>arrow_left</i>

                                <span>Highlight this sgRNA</span>
                            </button>
                        </div>
                    </div>
                    <div class="selection-col">
                        <div class="list-selection sgrna-selection">
                            <span class="selection-header">Choose a sgRNA sequence :</span>
                            <mmsb-select
                                label="Select sgRNA"
                                data={this.current_sgrnas
                                    .map(sgRna => [sgRna.seq, sgRna.seq + " (" + String(this.getNumberOccurences(sgRna.seq)) + ")"])}
                                selected={[this.selected.sgrna]}
                                onSelect={(e) => {
                                    this.changeSgrna(e); 
                                    //this.removeSvgCoordTicks(); 
                                }}
                                color={this.highlight_selection ? "#539ddc54" : undefined}/>
                        </div>
                        <div class="list-selection coordinates">
                            <span class="selection-header">This sgRNA is present at {this.getCoordinates(this.selected.sgrna).length} position(s) :</span>
                            <div class="coord-box">
                                <ul>
                                    {this.current_sgrnas
                                        .find(e => e.seq === this.selected.sgrna).coords
                                        .map(coord => <li 
                                            onMouseOver={() => this.onOverCoordinate.emit(coord)}
                                            onMouseOut={() => this.onOutCoordinate.emit(coord)}>
                                                {coord}
                                            </li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
                <circular-barplot list_coordinates={this.all_start_coordinates} genome_size={this.selected.size} selected_sgrna_coordinates={this.getCoordinates(this.selected.sgrna)}></circular-barplot>
                
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