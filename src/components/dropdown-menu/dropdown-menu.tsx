import {Component, h, Prop, State, Event, EventEmitter} from '@stencil/core';
import {SGRNAForOneEntry, CurrentSelection } from '../result-page/interfaces';

@Component({
    tag: 'dropdown-menu',
    styleUrl: 'dropdown-menu.css',
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

    /*Maybe put it elsewhere
    To check if accession is a valid refseq or genbank genomic accession
    genbank : https://www.ncbi.nlm.nih.gov/Sequin/acc.html
    refseq : https://www.ncbi.nlm.nih.gov/books/NBK21091/table/ch18.T.refseq_accession_numbers_and_mole/?report=objectonly
    */
    isValidAccession(accession: string): boolean{
        const genbank1_regex = new RegExp('^[A-Z]{1}[0-9]{5}$');
        const genbank2_regex = new RegExp('^[A-Z]{2}[0-9]{6}$');
        const genbank3_regex = new RegExp('^[A-Z]{2}[0-9]{8}$');
        const refseq_regex = new RegExp('^[NA][CGTWZ]_');

        return refseq_regex.test(accession) || genbank1_regex.test(accession) || genbank2_regex.test(accession) || genbank3_regex.test(accession); 
    }

    displayNcbiLink(){
        if (this.selected.ref){
            const cut_ref = this.selected.ref.split(".")[0]
            if (this.isValidAccession(cut_ref)){
                return <div class="link">
                    <a class="ncbi-link" href={"https://www.ncbi.nlm.nih.gov/nuccore/" + (cut_ref)} target="_blank">
                <i class="material-icons info-icon">pageview</i>
                <span> {this.selected.ref} NCBI page </span></a>
                </div>
            }
            else{
                return <div class="link"> 
                
                <a class="ncbi-link" href={"https://www.ncbi.nlm.nih.gov/nuccore/"} target="_blank">
                <i class="material-icons info-icon">pageview</i>
                <span> General NCBI nucleotide page </span></a> 
                <span> This accession is not a valid RefSeq or GenBank genomic accession</span></div>
                
            }
        }
        else
            return
        
    }

    render(){
        return (
            <div class="dropdown-menu-root">
                <button class="highlight-sgrna-button" 
                    style={{visibility : this.selected.sgrna ? "visible" : "hidden"}}
                    onClick={() => {this.onClickHighlightButton.emit()}}
                    > 
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
                    {this.displayNcbiLink()}
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