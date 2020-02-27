import { Component, Prop, h, State, Event, EventEmitter, Listen, Element } from '@stencil/core';
import "@mmsb/mmsb-select";
import * as dspl from './displayPlot';
import * as d3 from "d3";

@Component({
    tag: 'genomic-card',
    styleUrl: 'genomic-card.css',
    shadow: true
})

export class GenomicCard {
    @Element() private element: HTMLElement;

    @Prop() org_names: string;
    @Prop() all_data: string;
    @Prop() size: string;
    @Prop() diagonal_svg: number;
    @Prop() gene: string;
    @Prop() sizeSelected: number;

    all_data_json: {};
    size_json: {};
    orgSelected: string;
    refSelected: string;
    genomeRef: string[];
    @Prop() subSgrna: string[];
    allSgrna: string[] = [];
    @Prop() sgrnaSelected: string;
    show_data: {};
    @Prop() selectedSection = -1;

    @State() state: string = "initialize";
    error_msg: string = '';

    constructor() {
        this.emitOrgChange = this.emitOrgChange.bind(this);
        this.emitRefChange = this.emitRefChange.bind(this);
    }

    @Event() changeOrgCard: EventEmitter;
    emitOrgChange(event: Event) {
        let val = (event.currentTarget as HTMLElement).innerText;
        this.changeOrgCard.emit(val);
    }

    @Event() changeRefCard: EventEmitter;
    emitRefChange(event: Event) {
        let val = (event.currentTarget as HTMLOptionElement).value;
        this.changeRefCard.emit(val);
    }

    @Event() sgDataSection: EventEmitter;
    emitsgData(event: Object, min: number, max: number) {
        let geneParsed = JSON.parse(this.gene);
        let geneOnSection = [];
        geneParsed[this.orgSelected][this.refSelected].forEach(gene => {
            if ((parseInt(gene.start) >= min && parseInt(gene.start) <= max) ||
                (parseInt(gene.end) >= min && parseInt(gene.end) <= max)) {
                geneOnSection.push(gene);
            }
        })
        let msg = {
            allSgrna: JSON.stringify(event),
            gene: JSON.stringify(geneOnSection)
        }
        this.sgDataSection.emit(msg);
    }

    @Listen('changeOrgCard')
    handleChangeOrg(event: CustomEvent) {
        this.orgSelected = event.detail;
        this.updateDataOrg();
    }

    @Listen('changeRefCard')
    handleChangeRef(event: CustomEvent) {
        this.updateDataOrg(event.detail);
    }

    @Listen('mmsb-select.select')
    handleChangeSgrna(event: CustomEvent) {
        this.sgrnaSelected = event.detail;
    }

    @Listen('sectionSelected', { target: 'window' })
    handleSectionSelected(event: CustomEvent) {
        this.subSgrna = event.detail["sgRNA"];
        this.selectedSection = event.detail["section"];
        this.sgrnaSelected = this.subSgrna[0];
    }

    @Listen('sectionSelectedSG', { target: 'window' })
    handleSectionSelectedSG(event: CustomEvent) {
        this.emitsgData(event.detail["sgRNA"], event.detail["min"], event.detail["max"]);
    }


    componentWillLoad() {
        let stop = 0
        this.error_msg = 'ERROR : '
        if (this.org_names == undefined) {
            stop = 1
            this.error_msg += "org_names undefined ";
        }
        if (this.all_data == undefined) {
            stop = 1
            this.error_msg += "all_data undefined "
        }
        if (this.size == undefined) {
            stop = 1
            this.error_msg += "size undefined "
        }
        if (this.diagonal_svg == undefined) {
            this.diagonal_svg = 700;
        }

        if (stop) {
            this.state = "stop";
        }
        else {
            this.orgSelected = this.org_names.split("&")[0]
            this.all_data_json = JSON.parse(this.all_data)
            this.size_json = JSON.parse(this.size)
            this.updateDataOrg()
        }

    }

    componentDidRender() {
        dspl.generateGenomicCard(DisplayGenome, this.diagonal_svg, this.sizeSelected, this.element.shadowRoot, this.show_data[this.sgrnaSelected], this.sgrnaSelected);
        dspl.generateSunburst(this.sizeSelected, this.show_data, this.diagonal_svg, this.element.shadowRoot.querySelector('#displayGenomicCard'), this.selectedSection, this.gene != undefined ? true : false);
        this.element.shadowRoot.querySelector('.genomeCircle').addEventListener("click", () => {
            this.subSgrna = undefined;
            this.selectedSection = -1;
            this.sgrnaSelected = this.allSgrna[0];
            if (this.gene) {
                this.emitsgData(this.all_data_json[this.orgSelected][this.refSelected], 0, this.sizeSelected)
            }

        })
        this.styleHelp(".genomeCircle>path", ".help-gen");
        this.styleHelp(".sunburst>path", ".help-section");
        this.styleHelp("#notif>.material-icons", "#notif-text");
    }

    styleHelp(ref: string, target: string) {
        if (this.element.shadowRoot.querySelector(ref) != null) {
            var coordGen = this.element.shadowRoot.querySelector(ref).getBoundingClientRect();
            (this.element.shadowRoot.querySelector(target) as HTMLElement).style.top = coordGen.top.toString() + "px";
            (this.element.shadowRoot.querySelector(target) as HTMLElement).style.left = coordGen.left.toString() + "px";
        }
    }

    updateDataOrg(ref = undefined) {
        this.genomeRef = Object.keys(this.all_data_json[this.orgSelected]);
        this.refSelected = (ref === undefined) ? this.genomeRef[0] : ref;
        this.sizeSelected = this.size_json[this.orgSelected][this.refSelected]
        this.show_data = this.all_data_json[this.orgSelected][this.refSelected]
        this.allSgrna = Object.keys(this.show_data).sort((a, b) => (this.show_data[a].length < this.show_data[b].length) ? 1 : -1)
        this.sgrnaSelected = this.allSgrna[0];
        this.selectedSection = -1;

    }

    showCoordHeader(): string {
        if (this.sgrnaSelected == undefined) {
            return ""
        }
        else {
            let dataOneSgrna = this.show_data[this.sgrnaSelected];
            return this.sgrnaSelected + " : " + dataOneSgrna.length
        }
    }

    showCoordText(): string {
        if (this.sgrnaSelected == undefined) {
            return ""
        }
        else {
            let dataOneSgrna = this.show_data[this.sgrnaSelected];
            let text = '';
            dataOneSgrna.forEach(coord => {
                text += coord + "\n";
            })
            return text;
        }
    }

    render() {
        if (this.state == "stop") {
            return this.error_msg
        }
        let tabOrgName = this.org_names.split("&");
        return ([
            <head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                //@ts-ignore
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
            </head>,

            <div class="main-genome-card">
                <div
                    class="nav nav-tabs flex-nav"
                    id="myTab"
                    role="tablist"
                    onWheel={function (this: HTMLDivElement, ev) {
                        const delta = ev.deltaY > 0 ? Math.max(100, ev.deltaY * 2) : Math.min(-100, ev.deltaY * 2);
                        const new_x = Math.min(this.scrollLeft + delta, this.scrollWidth);
                        this.scrollTo(new_x, 0);
                    }}
                >
                    {tabOrgName.map(name => {
                        let classTag: string = "nav-link", bool: string = "false";
                        if (name == this.orgSelected) {
                            classTag = "nav-link active";
                            bool = "true";
                        }
                        return <div class="nav-item flex-nav-item">
                            <a
                                class={classTag}
                                data-toggle="tab"
                                role="tab"
                                aria-selected={bool}
                                href="#"
                                onClick={this.emitOrgChange}
                            >
                                {name}
                            </a>
                        </div>
                    })}
                </div>

                <div class="tab-content genomeGraph" id="myTabContent" >
                    <div class="coordinates-container">
                        <div class="selection">
                            <div class="select-menu">
                                <span>References</span>
                                <select class="custom-select" onChange={e => this.emitRefChange(e)}>
                                    {this.genomeRef.map(ref => <option>{ref}</option>)}
                                </select>
                            </div>

                            <div class="select-menu">
                                <span>sgRNA</span>
                                {(this.subSgrna === undefined) ?
                                    "" : <div id="notif"><i class="material-icons">  notifications_active </i><div id="notif-text">Only sgRNA on the selected <br />sector are shown</div></div>}
                                <mmsb-select label="Select sgRNA" data={this.subSgrna === undefined ? this.allSgrna.map(sgRna => [sgRna, sgRna]) : this.subSgrna.map(sgRna => [sgRna, sgRna])} selected={[this.sgrnaSelected]}> </mmsb-select>
                            </div>
                        </div>

                        <div class="coordBoxContainer">
                            <p style={{ padding: "12px 0px 5px 0px", marginBottom: "0px" }}> <strong> Coordinates Box </strong></p>
                            <div class="coordBox">
                                <div id='coordBoxHeader'>
                                    {this.showCoordHeader()}
                                </div>
                                <div id='coordBoxText'>
                                    {this.showCoordText()}
                                </div>
                            </div>
                        </div>
                    </div>



                    <div class="help">
                        <i class="material-icons" style={{ cursor: "help" }}>help</i>
                        <div class="help-text help-gen"> Click on me to reinitialize sgRNA </div>
                        <div class="help-text help-section"> Click on me to display only sgRNA which are on me </div>
                    </div>

                    <svg id='displayGenomicCard' viewBox={"0 0 " + this.diagonal_svg + " " + this.diagonal_svg}>
                        <text transform={`translate(${this.diagonal_svg / 2 - 30} , ${this.diagonal_svg / 2})`}> {this.sizeSelected} pb </text>
                    </svg>
                </div>

            </div>
        ])
    }
}

/**
* Display the genome by a blue circle
* @param {ShadowRoot} nivMax Maximal level of the sunburst
* @param {Number} nivCurr Maximal level of the sunburst
* @param {Number} nbSec Number of section by circle
*/
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