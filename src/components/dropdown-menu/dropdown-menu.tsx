import {Component, h, Prop, State, Event, EventEmitter} from '@stencil/core';
import {SGRNAForOneEntry, CurrentSelection } from '../result-page/interfaces';

@Component({
    tag: 'dropdown-menu',
    styleUrl: 'dropdown-menu.css',
    shadow: false
})

export class DropdownMenu{
    @Prop() organisms:string[] = []
    @Prop() fasta_refs:string[] = []
    @Prop() sgrnas:SGRNAForOneEntry[] = []
    @Prop() selected:CurrentSelection = undefined

    @State() ref_visible:string = "hidden"
    @State() sgrna_visible:string = "hidden"

    @Prop() selectOrg: (org:string) => void; 
    @Prop() selectRef: (ref:string) => void; 
    @Prop() selectSgrna: (sgrna:string) => void; 

    @Event({ eventName: 'dropdown-menu.display-button-click' }) onClickHighlightButton: EventEmitter;

    render(){
        console.log(this.fasta_refs)
        return (
            <div class="dropdown-menu-root">
                <button class="highlight-sgrna-button" 
                    style={{visibility : this.selected.sgrna ? "visible" : "hidden"}}
                    onClick={() => {this.onClickHighlightButton.emit()}}> 
                    <div class = "inside-sgrna-button"> 
                        <i class="material-icons" style={{ float: 'left'}}>arrow_left</i>
                            <span> Display in the left pannel </span>
                        </div>
                </button>

                <div class="select-org">
                    <mmsb-select 
                        label="Select organism"
                        data={this.organisms.map(org => [org, org])}
                        selected={this.selected.org ? [this.selected.org] : []}
                        onSelect={(e) => {
                            this.selectOrg(e)}}
                        boldOnSelected
                    />
                </div>
                <div class="select-ref" style={{ visibility: this.fasta_refs.length ? "visible" : "hidden"}}>
                    <mmsb-select
                        label="Select fasta query"
                        data={this.fasta_refs.map(ref => [ref, ref])}
                        selected={this.selected.ref ? [this.selected.ref] : []}
                        onSelect={(e) => {
                            this.selectRef(e)}}
                        boldOnSelected
                    />
                </div>
                <div class="ncbi-link-div" style={{ visibility: this.selected.ref ? "visible" : "hidden"}}>
                    <a class="ncbi-link" href={"https://www.ncbi.nlm.nih.gov/nuccore/" + (this.selected.ref ? this.selected.ref.split(".")[0] : "")} target="_blank">
                        <i class="material-icons info-icon">pageview</i>
                        <span> {this.selected.ref} NCBI page </span></a>
                </div>
                <div class="select-sgrna" style={{ visibility: this.sgrnas.length ? "visible" : "hidden"}}>
                    <mmsb-select 
                        label="Select sgRNA sequence"
                        data={this.sgrnas.map(sgrna_entry => [sgrna_entry.seq, sgrna_entry.seq])}
                        selected={this.selected.sgrna ? [this.selected.sgrna] : []}
                        onSelect={(e) => {
                            this.selectSgrna(e)}}
                        boldOnSelected
                    />
                </div>
                
            </div>
        )
    }
}