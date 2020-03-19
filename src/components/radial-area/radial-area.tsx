import {Component, h, Prop} from '@stencil/core';
import { SGRNAForOneEntry } from '../result-page/interfaces';
declare const d3: any;

@Component({
    tag: 'radial-area',
    styleUrl: 'radial-area.css',
    shadow: true
})

export class RadialArea{
    @Prop() sgrnas: SGRNAForOneEntry[];
    @Prop() genome_size : number; 
    @Prop() sgrna_length : number = 23; 

    genome_position_overlap: Map<number, number>; 

    get all_position():number[]{
        let all_position:number[] = []
        for (let i = 0; i < this.genome_size ; i++){
            all_position.push(i)
        }
        return all_position
    }

    constructor(){
        this.genome_position_overlap = this.formatData(); 
    }
    

    formatData(): Map<number, number>{
        const coords_increment: [number, number][] = [];
        const mapping: Map<number, number> = new Map; 

        for (const sgrna of this.sgrnas){
            for (const coord of sgrna.coords){
                const start = parseInt(/\(([0-9]*),/.exec(coord)[1]);
                coords_increment.push([start, 1])
                coords_increment.push([start + this.sgrna_length, -1])
            }
        }

        coords_increment.sort((a,b) => a[0] - b[0]);
        
        let previous_sgrna_count = 0; 
        let previous_coord = 0; 

        for (const [cur_pos, inc] of coords_increment){
            mapping.set(previous_coord, previous_sgrna_count);
            previous_sgrna_count += inc; 
            previous_coord = cur_pos; 
        }

        mapping.set(previous_coord, previous_sgrna_count);
        return mapping;
    }
    
    /*getAtPosition(i: number) {
        let upper = this.genome_position_overlap.length - 1;
        let lower = 0;
      
        while (true) {
          const sentinel = Math.floor((upper + lower) / 2);
      
          const item_at_sentinel = this.genome_position_overlap[sentinel];
          const previous = this.genome_position_overlap[sentinel - 1];
      
          if (lower > upper) {
            // Recherche le dernier item.
            return this.genome_position_overlap[this.genome_position_overlap.length - 1][1];
          }
      
          if (previous !== undefined) {
            if (previous[0] <= i && item_at_sentinel[0] > i) {
              // C'est ce i
              return previous[1];
            }
      
            // On lance la recherche dichotomique.
            // Si notre i > item_at_sentinel, alors on recherche entre sentinel et upper
            // Sinon, on recherche entre lower et sentinel
            if (i > previous[0]) {
              lower = sentinel + 1;
            }
            else {
              upper = sentinel;
            }
          }
          else {
            // sentinel === 0
            return item_at_sentinel[1];
          }
        }
      } */

    createRadialArea(){
        //console.log("list coordinates", this.list_coordinates)
        this.formatData();

        const margin = 10, 
        width = 954,
        height = width,
        innerRadius = width/5,
        outerRadius = width/2 - margin

        //@ts-ignore
        const svg = d3.select(".radial-area-main")
            .append('svg')
            //@ts-ignore
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round");

        const x = d3.scaleLinear()
            .range([0, 2 * Math.PI])  
            .domain([0, this.genome_size])
        
        //@ts-ignore
        const y = d3.scaleLinear()
            .domain([0, 50])
            .range([innerRadius, outerRadius])

        //@ts-ignore
        const line = d3.lineRadial()
            //@ts-ignore
            .curve(d3.curveLinearClosed)
            //@ts-ignore
            .angle(d => x(d))

        let cur_val: number = this.genome_position_overlap.get(0)!;
        /*svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", line
                //@ts-ignore
                .radius((d: number) => {
                    if (this.genome_position_overlap.has(d)) {
                      cur_val = this.genome_position_overlap.get(d);
                    }
                
                    return y(cur_val);
                  })
              //@ts-ignore
              (this.all_position));*/
    }

    componentDidLoad(){
        this.createRadialArea();
    }

    render(){
        console.log(this.genome_position_overlap)
        return(<div class="radial-area-main"></div>)
    }
}