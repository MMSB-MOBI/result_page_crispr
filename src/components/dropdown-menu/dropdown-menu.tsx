import {Component, h, Prop, State, Event, EventEmitter} from '@stencil/core';
import {SGRNAForOneEntry } from '../result-page/interfaces';

@Component({
    tag: 'dropdown-menu',
    styleUrl: 'dropdown-menu.css',
    shadow: true
})

export class DropdownMenu{
    @Prop() organisms:string[] = []
    @Prop() fasta_refs:string[] = []
    @Prop() sgrnas:SGRNAForOneEntry[] = []

    @State() ref_visible:string = "hidden"
    @State() sgrna_visible:string = "hidden"

    @Event({ eventName: 'dropdown-menu.org-select' }) selectOrg: EventEmitter;
    @Event({ eventName: 'dropdown-menu.ref-select' }) selectRef: EventEmitter;


    render(){
        console.log("mmsb-select render")
        return (
            <div class="dropdown-menu-root">
                <div class="select-org">
                    <mmsb-select 
                        label="Select organism"
                        data={this.organisms.map(org => [org, org])}
                        onSelect={(e) => {
                            this.ref_visible = "visible"
                            this.sgrna_visible = "hidden"
                            this.selectOrg.emit(e)}}
                    />
                </div>
                <div class="select-ref" style={{ visibility: this.ref_visible}}>
                    <mmsb-select
                        label="Select fasta query"
                        data={this.fasta_refs.map(ref => [ref, ref])}
                        onSelect={(e) => {
                            this.sgrna_visible = "visible"
                            this.selectRef.emit(e)}}
                    />
                </div>
                <div class="select-sgrna" style={{ visibility: this.sgrna_visible}}>
                    <mmsb-select
                        label="Select sgRNA sequence"
                        data={this.sgrnas.map(sgrna_entry => [sgrna_entry.seq, sgrna_entry.seq])}
                    />
                </div>
                
            </div>
        )
    }
}