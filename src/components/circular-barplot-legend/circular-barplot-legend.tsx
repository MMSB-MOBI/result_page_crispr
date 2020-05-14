import {Component, h, Prop, Listen, Watch, Element} from '@stencil/core';
declare const d3: any;

@Component({
    tag: 'circular-barplot-legend',
    styleUrl: 'circular-barplot-legend.css',
    shadow: true
})

export class CircularBarplotLegend{
    @Element() private element: HTMLElement;

    @Prop() gene?:boolean;

    svg; 
    margin:number; 
    width:number; 
    height:number;

    componentDidLoad(){
        console.log("POUET")
        this.width = 50; 
        this.height = 8;

        const main_div = this.element.shadowRoot.querySelector('.circular-barplot-legend-main')
        this.svg = d3.select(main_div)
            .append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .append("g")

        this.addSingleCoordinatesLegend(); 
        this.addCoordBarplotLegend();
        if (this.gene) this.addGeneBarplotLegend();
    }

    addSingleCoordinatesLegend(){
        this.svg.append("g").attr("class", "single-coordinates-legend")
        this.svg
            //.append("g")
            //.attr("class", "single-coordinates-legend-line")
            .append("line")
            .attr("class", "legend-line")
            .attr("stroke", "#ff9999")
            .attr("stroke-width", 0.1)
            .attr('x1', -this.width/2 + 1.5)
            .attr('x2', -this.width/2 + 2.5)
            .attr('y1', -this.height/2 + 1)
            .attr('y2', -this.height/2 + 1)
        
        this.svg
            //.append("g")
            //.attr("class", "single-coordinates-legend-text")
            .append("text")
            .attr("class", "legend-text")
            .attr('x', -this.width/2 + 4)
            .attr('y', -this.height/2 + 1)
            .text("Positions of current sgrna along the genome")
            //.attr('text-anchor', 'left')
            .attr('font-size', '0.9px')
            .attr("dominant-baseline","middle")
    }

    addCoordBarplotLegend(){

        const y = d3.scaleLinear()
            .domain([0,1])
            .range([0,2])

        const x = d3.scaleLinear()
            .domain([0,3])
            .range([-this.width/2 + 1, -this.width/2 + 2.5])

        const factice_data = [[0,0.3], [1,0.8], [2,0.4], [3, 1]]
        
        //this.svg.append("g").call(d3.axisLeft(y))
        //this.svg.append("g").call(d3.axisBottom(x))
        
        this.svg.append("g").attr("transform",  "rotate(180) translate(46)")
            .selectAll("bin")
            .data(factice_data)
            .enter()
            .append("rect")
            .attr("x", d => x(d[0]))
            .attr("y", this.height/2 - 4)
            .attr("width", 0.4)
            .attr("height", d => y(d[1]))
            .attr("fill", "#66B032")
            //.attr("transform", "rotate(180)")

        this.svg
            .append("text")
            .attr("class", "legend-text")
            .attr('x', -this.width/2 + 4)
            .attr('y', -this.height/2 + 3.5)
            .text("Distribution of the first 1000 sgRNAs positions along the genome")
            //.attr('text-anchor', 'left')
            .attr('font-size', '0.9px')
            .attr("dominant-baseline","middle")
        
    }

    addGeneBarplotLegend(){
        console.log("Gene legend")
        this.svg
            .append("polygon")
            .attr("points", ` ${-this.width/2 + 1.6},${-this.height/2 + 5.5} ${-this.width/2 + 2.4},${-this.height/2 + 5.5} ${-this.width/2 + 2},${-this.height/2 + 6.3}`)
            .attr("fill", "#D5912A")

        this.svg
            .append("text")
            .attr('x', -this.width/2 + 4)
            .attr('y', -this.height/2 + 6)
            .text("Position(s) of homolog genes along genome")
            //.attr('text-anchor', 'left')
            .attr('font-size', '0.9px')
            .attr("dominant-baseline","middle")
    }

    render(){
        return (
        <div class="circular-barplot-legend-main">
        </div>
        )

    }
}