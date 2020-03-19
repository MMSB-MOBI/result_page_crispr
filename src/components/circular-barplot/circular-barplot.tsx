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

    bin_number:number = 50; 
    bin_data: CoordinatesBinData[]; 

    //svg attributes
    svg; //svg display on page
    margin:number;
    width:number; 
    height:number;

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

        this.svg = d3.select(".barplot")
            .append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .append("g")
    }

    createCircularBarplot(){

        const innerRadius = this.width/4; 
        const outerRadius = this.width - this.margin; 
        const bin_data = this.createBinData()
        const data_blurred = this.blur(bin_data)

        this.bin_data = data_blurred;

        //@ts-ignore
        const x = d3.scaleBand()
            .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
            .align(0)                  // This does nothing ?
            .domain(bin_data.map(function (d) { return d.bin_id; }));

        //@ts-ignore
        const y = d3.scaleRadial()
            .range([innerRadius, outerRadius])   // Domain will be define later.
            .domain([0, 1]); // Domain of Y is from 0 to the max seen in the data

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


    createLinePlot(){
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
    }

    createGenomeCircle(){
        const genome_circle = d3.arc()
            .startAngle(0)
            .endAngle(2 * Math.PI)
            .innerRadius(this.width/6)
            .outerRadius(this.width/6 + 2)
        
        this.svg
            .append("g")
            .attr('class', 'genomeCircle')
            .append('path')
            .attr('d', genome_circle)
            .style('fill', 'rgba(79, 93, 117)');

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

    componentDidLoad(){
        this.initializeSvg();
        this.createGenomeCircle();
        this.createCircularBarplot(); 
    }

    render(){
    return (
    <div class="circular-barplot-main">
        <div class="barplot"></div>
    </div>
    )
    }

}