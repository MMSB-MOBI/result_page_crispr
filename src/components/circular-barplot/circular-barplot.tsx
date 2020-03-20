import {Component, h, Prop} from '@stencil/core';
import { CoordinatesBinData } from '../result-page/interfaces';
import { tickStep } from 'd3';
declare const d3: any;

@Component({
    tag: 'circular-barplot',
    styleUrl: 'circular-barplot.css',
    shadow: true
})

export class CircularBarplot{
    @Prop() list_coordinates: number[];
    @Prop() genome_size : number; 
    @Prop() selected_sgrna_coordinates : string[]; 

    bin_number:number = 50; 
    bin_data: CoordinatesBinData[]; 

    //svg attributes
    svg; //svg display on page
    margin:number;
    width:number; 
    height:number;

    circle_radius:number; 
    circle_thickness:number;

    createBinData(): CoordinatesBinData[]{
        const bin_size = Math.round(this.genome_size / this.bin_number)
        const bin_data = []; 

        let bin_id = 0; 
        for (let i = 0; i < this.genome_size; i = i + bin_size){
            bin_data.push({ bin_start: i, bin_end: i + bin_size, number_coords_inside: 0, bin_id : bin_id.toString()})
            bin_id += 1; 
        }
        
        bin_data[bin_data.length - 1].bin_end = this.genome_size //Correct the last value because of round approximation
        
        this.list_coordinates.map(coord => {
            const bin = bin_data.find(e => coord >= e.bin_start && coord < e.bin_end); 
            bin.number_coords_inside++; 
        })

        bin_data.map(e => e.number_coords_proportion = e.number_coords_inside / this.list_coordinates.length)

        return bin_data

    }

    initializeSvg(){
        this.margin = 10; 
        this.width = 200; 
        this.height = this.width;
        this.circle_radius = this.width/6; 
        this.circle_thickness = 2; 

        this.svg = d3.select(".circular-barplot-main")
            .append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .append("g")
    }

    createCircularBarplot(){
        // https://www.d3-graph-gallery.com/graph/circular_barplot_basic.html
        const innerRadius = this.width/4; 
        const outerRadius = this.width/2.5; 
        const bin_data = this.createBinData()

        //@ts-ignore
        const x = d3.scaleBand()
            .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
            .align(0)                  // This does nothing ?
            .domain(bin_data.map(function (d) { return d.bin_id; }));

        //@ts-ignore
        const max_prop = [...bin_data].sort((a,b) => b.number_coords_proportion - a.number_coords_proportion)[0].number_coords_proportion

        const y = d3.scaleRadial()
            .range([innerRadius, outerRadius])
            .domain([0, max_prop]); // Domain of Y is from 0 to the max seen in the data

        this.svg.append("g")
            .selectAll("path")
            .data(bin_data)
            .enter()
            .append("path")
              .attr("fill", "#69b3a2")
              //@ts-ignore
              .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                  .innerRadius(innerRadius)
                  //@ts-ignore
                  .outerRadius(function(d) { return y(d.number_coords_proportion); })
                  //@ts-ignore
                  .startAngle(function(d) { return x(d.bin_id); })
                  //@ts-ignore
                  .endAngle(function(d) { return x(d.bin_id) + x.bandwidth(); })
                  .padAngle(0.01)
                  .padRadius(innerRadius))
    }


    /*createLinePlot(){
        const margin = 10, 
            width = 954,
            height = width,
            innerRadius = width/5,
            outerRadius = width/2 - margin

        //@ts-ignore
        var svg = d3.select(".lineplot")
            .append("svg")
            //@ts-ignore
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .append("g")

        //@ts-ignore
        var x = d3.scaleLinear()
            .domain([0, this.genome_size])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            //@ts-ignore
            .call(d3.axisBottom(x));

        //@ts-ignore
        var y = d3.scaleLinear()
            .domain([0, 1])
            .range([height, 0]);
        svg.append("g")
        //@ts-ignore
            .call(d3.axisLeft(y)); 

        svg.append("path")
            .datum(this.bin_data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            //@ts-ignore
            .attr("d", d3.line()
                //@ts-ignore
                .x(function (d) { return x(d.bin_start) })
                //@ts-ignore
                .y(function (d) { return y(d.blurred) })
            )
    }*/

    createGenomeCircle(){
        //Draw the circle
        const genome_circle = d3.arc()
            .startAngle(0)
            .endAngle(2 * Math.PI)
            .innerRadius(this.circle_radius)
            .outerRadius(this.circle_radius + this.circle_thickness)
        this.svg
            .append("g")
            .attr('class', 'genomeCircle')
            .append('path')
            .attr('d', genome_circle)
            .style('fill', 'rgba(79, 93, 117)');

        //Draw the coordinates ticks, inspired by http://bl.ocks.org/tomgp/6475678
        const ticks_number:number = 12; 
        const tickAngle= 360 / ticks_number //This is the angle between two ticks. 
        const tickScale = d3.scaleLinear()
            .range([-180, 180 - tickAngle]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, ticks_number - 1])

        const labelScale = d3.scaleLinear()
            .range([0, 360 - tickAngle]) // I don't why 0,360 for label, probably something related to x and y calculations. 
            .domain([0, ticks_number - 1])
        
        this.svg.selectAll(".coord-tick")
            .data(d3.range(0,ticks_number)).enter()
                .append("line")
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', this.circle_radius)
                .attr('y2', this.circle_radius - 2)
                .attr('transform', d => 'rotate(' + tickScale(d) + ')')
                .attr("stroke", "gray")
                .attr("stroke-width", 0.5)

        //Add coordinates label. Placements are made for 6 ticks, you will probably have to adapt if you want to change the number of ticks. 
        const gap_between_ticks = Math.round(this.genome_size / ticks_number)
        const label_radius = this.circle_radius - 8; 
        const label_y_offset = 1; 
        const radians = 0.0174532925; 
        this.svg.selectAll(".coord-label")
            .data(d3.range(0, ticks_number))
                .enter()
                .append('text')
                .attr('class', 'coord-label')
                .attr('text-anchor', 'middle')
                .attr('font-size', '3px')
                .style('fill', 'gray')
                .attr('x', d => {
                    return label_radius * Math.sin(labelScale(d) * radians)})
                .attr('y', d => {
                    const current_radius = (d * tickAngle)%90 === 0 ? label_radius + 2 : label_radius  // Better placement of strictly vertical and horizontal labels
                    return -current_radius * Math.cos(labelScale(d) * radians) + label_y_offset})
                .text(d => numberWithCommas(Math.round((d * gap_between_ticks) / 1000 )) + " kb"); 

        //Add genome size in the middle
        this.svg.append("text")
            .text(numberWithCommas(this.genome_size) + " bp")
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('font-size', '4.5px')
    }

    

    /*arcFunction(coord){
        const start = parseInt(/\(([0-9]*),/.exec(coord)[1]);
        const end: number = +this.sgrna_length + +start;
        datum.startAngle = 2*Math.PI * datum.start * (1/sizeGenome);
        let endAngle = 2*Math.PI * end * (1/sizeGenome)  ;
        datum.endAngle = (Math.abs(endAngle - datum.startAngle) < 0.01) ? endAngle + 0.01 : endAngle;
        return d3.select(this)
                .transition()
                  .ease(d3.easeBackInOut)
                  .duration(600)
                  .attr('d', pathSgRNA)
                  .attr('transform', `translate( ${width / 2} , ${height / 2})`);
      }*/

    addSingleCoordinatesPoints(){
        const coordinateScale = d3.scaleLinear()
            .range([-180, 180]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, this.genome_size])

        this.svg.selectAll("single-coord-ticks")
            .data(this.selected_sgrna_coordinates)
            .enter()
            .append("circle")
            .attr("fill", "red")
            .attr('cx', 0)
            .attr("r", 0.5)
            .attr('cy', this.circle_radius + this.circle_thickness + 3)
            .attr('transform', d => 'rotate(' + coordinateScale(parseInt(/\(([0-9]*),/.exec(d)[1])) + ')')
    }

    addSingleCoordinatesTicks(){
        const coordinateScale = d3.scaleLinear()
            .range([-180, 180]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, this.genome_size])

        this.svg.selectAll("single-coord-ticks")
            .data(this.selected_sgrna_coordinates)
            .enter()
            .append("line")
            .attr("stroke", "red")
            .attr("stroke-width", "0.5")
            .attr('x1', 0)
            .attr("x2", 0)
            .attr("y1", this.circle_radius + this.circle_thickness + 3)
            .attr("y2", this.circle_radius + this.circle_thickness + 6)
            .attr('transform', d => {console.log(coordinateScale(parseInt(/\(([0-9]*),/.exec(d)[1]))); return 'rotate(' + coordinateScale(parseInt(/\(([0-9]*),/.exec(d)[1])) + ')'})
    }


    blur(data:CoordinatesBinData[]){
        // From https://bl.ocks.org/curran/853fa00b8f0732fb2bee7fccfd7b4523
        return data.map((d, i) => {
            const previous = (i === 0) ? i : i - 1;
            const next = (i === data.length - 1) ? i : i + 1;
            const sum = data[previous].number_coords_proportion + d.number_coords_proportion + data[next].number_coords_proportion;
            d.blurred = sum / 3;
            return d;
          });
    }

    componentDidRender(){
        this.initializeSvg();
        this.createGenomeCircle();
        this.createCircularBarplot(); 
        this.addSingleCoordinatesTicks();
    }

    render(){
        console.log(this.selected_sgrna_coordinates)
        return (
        <div class="circular-barplot-main">
        </div>
        )
    }

}

//https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}