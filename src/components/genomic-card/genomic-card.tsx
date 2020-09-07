import { Component, Prop, h, State, Event, EventEmitter, Listen, Element, Watch } from '@stencil/core';
import "@mmsb/mmsb-select";
import { CurrentSelection, SGRNAForOneEntry, FastaMetadata } from '../result-page/interfaces';

@Component({
    tag: 'genomic-card',
    styleUrl: 'genomic-card.css',
    shadow: true
})

export class GenomicCard {
    @Element() private element: HTMLElement;

    @Prop() organisms: string[];
    @Prop() current_references: string[] = [];
    @Prop() current_sgrnas : SGRNAForOneEntry[] = [];
    @Prop() selected: CurrentSelection 
    

    render() {
        return (
            <div class="genomic-card-root">
                <dropdown-menu
                    organisms={this.organisms}
                    fasta_refs={this.current_references}
                    sgrnas={this.current_sgrnas}
                    selected={this.selected}
                />          
            </div>
        )
    }
}