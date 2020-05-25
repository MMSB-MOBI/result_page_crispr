import { Component, Prop, h, State, Event, EventEmitter, Listen, Element, Watch } from '@stencil/core';
import "@mmsb/mmsb-select";
import { CurrentSelection, SGRNAForOneEntry } from '../result-page/interfaces';

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
    @Prop() hidden_references:string[]; //Fasta sequences of the organism with no sgrna on it
    @Prop() current_genes:{start:number, end:number}[];
    @Prop() fasta_metadata;

    @Prop() changeOrganism: (org: string) => void;
    @Prop() changeSgrna: (sgrna: string) => void;
    @Prop() changeRef: (ref: string) => void; 
    @Prop() changeSgrnaSubset: (sgrna_subset: string[]) => void; 
    @Prop() onClickHighlight:() => void; 
    @Prop() onClickBarplot:(start:number, end:number) => void; 

    @State() highlight_selection:boolean = false; 
    @State() display_circular_barplot:boolean = true; 
    @State() fasta_info_active:boolean = false; 
    

    //Hack to animate background color when change, because @keyframes don't work.
    @Watch('highlight_selection')
    watchHighlight(){
        setTimeout(() => this.highlight_selection = false, 500);
    }

    @Event({ eventName: 'genomic-card.button-click' }) onClickHighlightButton: EventEmitter;
    @Event({ eventName: 'genomic-card.coordinate-over'}) onOverCoordinate: EventEmitter; 
    @Event({ eventName: 'genomic-card.coordinate-out'}) onOutCoordinate:EventEmitter; 

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

    getFastaMetadata(ref:string){
        console.log("getFastaMetadata")
        console.log(this.fasta_metadata)
        console.log(this.fasta_metadata.find(e => e.fasta_ref === ref))
        return this.fasta_metadata.find(e => e.fasta_ref === ref)
    }

    componentDidRender() {
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

    switchFastaInfo(){
        const parent_node = this.element.shadowRoot.querySelector(".selection-div.organism");
        if (this.fasta_info_active){
            this.fasta_info_active = false; 
            const node_to_delete = this.element.shadowRoot.querySelector(".ref-tooltip-info");
            parent_node.removeChild(node_to_delete);
        }
        else{
            this.fasta_info_active = true; 
            const html_fasta_info = document.createElement("div");
            html_fasta_info.className = "ref-tooltip-info";
            html_fasta_info.innerHTML = `<ul> 
                <li> NCBI link : <a href = "https://www.ncbi.nlm.nih.gov/nuccore/${this.selected.ref}" target = "_blank"> ${this.selected.ref} </a>
                <li> Description : ${this.selected.fasta_header}
            </ul>`
            parent_node.appendChild(html_fasta_info);
        }
    }

    render() {
        console.log(this.selected.ref)
        return ([
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                //@ts-ignore
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
            </head>,
            <div class="genomic-card-root">

                <div class="selection2">
                    <div class="selection-div">
                        <div class="selection-header">
                            <span> Choose a sgRNA </span>
                        </div>
                        <div class="selection-content sgrna">
                            <button class="highlight-sgrna-button" onClick={() => { this.onClickHighlight(); /*this.removeSvg()*/; this.onClickHighlightButton.emit(); }}> 
                                <div class = "inside-sgrna-button"> 
                                    <i class="material-icons" style={{ float: 'left'}}>arrow_left</i>
                                    <span> Display in the left pannel </span>
                                </div>
                            </button>
                            <mmsb-select
                                label="Select sgRNA"
                                data={this.current_sgrnas
                                    .map(sgRna => [sgRna.seq, sgRna.seq + " (" + String(this.getNumberOccurences(sgRna.seq)) + ")"])}
                                selected={[this.selected.sgrna]}
                                onSelect={(e) => {
                                    this.changeSgrna(e); }}
                                color={this.highlight_selection ? "#539ddc54" : undefined}
                                boldOnSelected/>
                    </div>
                                 
                    </div>
                    
                    <div class="selection-div organism">
                        <div class="select-org">
                            <div class="selection-header">
                                <span> Choose an organism </span>
                            </div>
                            <div class="selection-content">
                                <mmsb-select
                                    data={this.organisms.map(name => [name, name])}
                                    selected={[this.selected.org]}
                                    onSelect={e => {/*this.removeSvg();*/ this.changeOrganism(e); 
                                        if (this.fasta_info_active) this.switchFastaInfo()}}
                                    color={this.highlight_selection ? "#539ddc54" : undefined}/>
                            </div>
                        </div>
                        <i class="material-icons left-arrow-icon">arrow_right</i>
                        <div class="select-fasta">
                            <div class="selection-header">
                                <span>Choose fasta sequence</span>
                            </div>
                           
                                
                            <div class="selection-content fasta">
                                {this.current_references.map(ref => 
                                    <div class="select-div"> 
                                        <span class={"select-text active" + (this.selected.ref === ref ? " current":"")} onClick = {() => this.changeRef(ref)}>{ref}</span> 
                                        <span class="tooltip-text2">{this.getFastaMetadata(ref).header}</span>
                                    </div>
                                    )}
                                {this.hidden_references.map(ref =>
                                    <div class="select-div"> 
                                        <span class="select-text inactive">{ref}</span> 
                                        <span class="tooltip-text2">{this.getFastaMetadata(ref).header}</span>
                                </div>)}
                            </div>
                                

                        </div>
                        
                        
                    </div>

                </div>
                <div class="legend">
                    <circular-barplot-legend gene={this.current_genes ? true:false}></circular-barplot-legend>
                </div>
                <div class="genome-representation"> 
                    <circular-barplot 
                        list_coordinates={this.all_start_coordinates}
                        genome_size={this.selected.size} 
                        selected_sgrna_coordinates={this.getCoordinates(this.selected.sgrna)} 
                        gene_coordinates={this.current_genes}
                        active_rotation
                        onClickBarplot={(start, end) => this.onClickBarplot(start,end)}
                    ></circular-barplot>
                    <div class="select-occurences">
                        <div class="selection-header">
                            <span> {this.selected.sgrna} is present at {this.getCoordinates(this.selected.sgrna).length} position(s) in {this.selected.ref} sequence of {this.selected.org} :</span>
                        </div>
                        <div class="selection-content">
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
                
                
            </div>

            
                
        ])
    }
}