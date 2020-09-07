import {Component, h, Prop, State, Event, EventEmitter} from '@stencil/core';
import {SGRNAForOneEntry, CurrentSelection } from '../result-page/interfaces';

@Component({
    tag: 'coord-box',
    styleUrl: 'coord-box.css',
    shadow: false
})

export class CoordBox{
    @Prop() selected: CurrentSelection
    @Prop() coordinates
    @Prop() current_sgrnas
    @Prop() current_genes

    @Event({ eventName: 'coord-box.coordinate-over'}) onOverCoordinate: EventEmitter; //Over coordinate on list
    @Event({ eventName: 'coord-box.coordinate-out'}) onOutCoordinate:EventEmitter; //Out coordinate on list

    render(){
        return(
        <div class="coord-box-root">
            <div class="coord-box-header">
                <span>{this.selected.sgrna} is present at {this.coordinates.length} position(s) in {this.selected.ref} sequence of {this.selected.org} :</span>
            </div>
            <div class="coord-box-content">
                <ul>
                {this.current_sgrnas
                    .find(e => e.seq === this.selected.sgrna).coords
                        .map(coord_obj => <li 
                            onMouseOver={() => this.onOverCoordinate.emit(coord_obj.coord)}
                            onMouseOut={() => this.onOutCoordinate.emit(coord_obj.coord)}>
                            <span>{coord_obj.coord}</span>
                            <span class="coord-on-gene">{this.current_genes ? coord_obj.is_on_gene.length > 0 ? " " + coord_obj.is_on_gene : " not on gene" : ""}</span>
                        </li>)}
                </ul>  
            </div>
        </div>
    )}
}