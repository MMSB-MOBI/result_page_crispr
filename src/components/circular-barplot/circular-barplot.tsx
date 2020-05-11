import {Component, h, Prop, Listen, Watch, Element} from '@stencil/core';
import { CoordinatesBinData, Coordinate} from '../result-page/interfaces';
declare const d3: any;

@Component({
    tag: 'circular-barplot',
    styleUrl: 'circular-barplot.css',
    shadow: true
})

export class CircularBarplot{
    @Element() private element: HTMLElement;

    @Prop() list_coordinates: number[];
    @Prop() genome_size : number; 
    @Prop() selected_sgrna_coordinates : string[]; 
    @Prop() gene_coordinates?: Coordinate[]; 

    bin_number:number = 50; 
    bin_data: CoordinatesBinData[]; 

    //svg attributes
    svg; //svg display on page
    margin:number;
    width:number; 
    height:number;

    circle_radius:number; 
    circle_thickness:number;
    barplot_begin:number; 
    barplot_end: number; 
    detailed_barplot_begin:number; 
    detailed_barplot_end:number; 
    coordinates_begin:number;
    coordinates_end:number;
    gene_begin?:number; 
    gene_tickness?:number; 

    @Watch('selected_sgrna_coordinates')
    selectedSgrnaChange(){
        this.svg.selectAll(".single-sgrna-ticks").remove(); 
        this.addSingleCoordinatesTicks(); 
    }

    @Listen('genomic-card.coordinate-over', { target: 'window' })
    handleCoordinateOver(coord){
        const tick = this.svg.select(`.start${parseInt(/\(([0-9]*),/.exec(coord.detail)[1])}`) //Select corresponding coord tick
        tick.remove(); 
        this.highlightCoordinatesTicks([coord.detail], "#ff0000")
    }

    @Listen('genomic-card.coordinate-out', { target: 'window' })
    handleCoordinateOut(coord){
        const tick = this.svg.select(`.start${parseInt(/\(([0-9]*),/.exec(coord.detail)[1])}`) //Select corresponding coord tick
        tick.remove(); 
        this.highlightCoordinatesTicks([coord.detail], "#ff9999")
    }

    /**
     * Format data for bin construction
     * @param list_coordinates list of start coordinates
     * @param bin_number number of bins to construct
     * @param start histogram start coordinate
     * @param end histogram end coordinate
     */
    createBinData(list_coordinates:number[], bin_number:number, start:number, end:number): CoordinatesBinData[]{
        const bin_size = Math.ceil((end - start) / bin_number)
        const bin_data = []; 

        let bin_id = 0; 
        for (let i = start; i < end; i = i + bin_size){
            bin_data.push({ bin_start: i, bin_end: i + bin_size, number_coords_inside: 0, bin_id : bin_id.toString()})
            bin_id += 1; 
        }
        
        bin_data[bin_data.length - 1].bin_end = end //Correct the last value because of round approximation
        
        list_coordinates.map(coord => {
            const bin = bin_data.find(e => coord >= e.bin_start && coord < e.bin_end); 
            bin.number_coords_inside++; 
        })

        bin_data.map(e => e.number_coords_proportion = e.number_coords_inside / list_coordinates.length)

        return bin_data
    }

    /**
     * Fix svg margin, circles radius, and create svg tag. 
     */
    initializeSvg(){
        this.margin = 10; 
        this.width = 200; 
        this.height = this.width;
        this.circle_radius = this.width/6; 
        this.circle_thickness = 2; 
        this.barplot_begin = this.gene_coordinates ? this.width/4 : this.width/4.5; 
        this.barplot_end = this.gene_coordinates ? this.width/2.7 : this.width/3; 
        this.detailed_barplot_begin = this.gene_coordinates ? this.width/2.5 : this.width/2.7;
        this.detailed_barplot_end = this.width/2 - 1; 
        this.coordinates_begin = this.circle_radius + this.circle_thickness + 3
        this.coordinates_end = this.circle_radius + this.circle_thickness + 6 
        this.gene_begin = this.gene_coordinates ? this.barplot_begin - 6 : undefined
        this.gene_tickness = 3; 

        const main_div = this.element.shadowRoot.querySelector('.circular-barplot-main')
        this.svg = d3.select(main_div)
            .append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .append("g")
        
    }

    displaySvgContent(){
        this.createGenomeCircle();
        this.createCircularBarplot(); 
        this.addSingleCoordinatesTicks();
        this.displayGenes(); 
    }

    cleanSvg(){
        this.svg.selectAll("g").remove(); 
    }

    /**
     * Draw genome circle with coordinates ticks and labels on it.
     */
    createGenomeCircle(){
        //Draw and add the circle to svg
        this.svg
            .append("g")
            .attr('class', 'genome-circle')
            .append('circle')
            .on("click", () => {
                this.svg.selectAll(".detailed-barplot").remove(); //Remove detailed barplot if exists
                this.svg.selectAll(".bin").style("opacity", "1"); //All bins with initial opacity
            })
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.circle_radius + this.circle_thickness)
            .style("fill", "transparent")
            .style("stroke", "rgba(79, 93, 117)")
            .style("stroke-width", this.circle_thickness)
        
        //Draw the coordinates ticks and labels, inspired by http://bl.ocks.org/tomgp/6475678
        const ticks_number:number = 12; 
        const tickAngle= 360 / ticks_number //This is the angle between two ticks. 
        const tickScale = d3.scaleLinear()
            .range([-180, 180 - tickAngle]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, ticks_number - 1])

        const labelScale = d3.scaleLinear()
            .range([0, 360 - tickAngle]) // I don't why 0,360 for label, probably something related to x and y calculations. 
            .domain([0, ticks_number - 1])   
        this.svg
            .append("g")
            .attr("class", "coord-ticks-container")
            .selectAll(".coord-tick")
            .data(d3.range(0,ticks_number)).enter()
                .append("line")
                .attr("class", "coord-tick")
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', this.circle_radius)
                .attr('y2', this.circle_radius - 2)
                .attr('transform', d => 'rotate(' + tickScale(d) + ')')
                .attr("stroke", "gray")
                .attr("stroke-width", 0.5)

        //Add coordinates label. Placements are made for 12 ticks, you will probably have to adapt if you want to change the number of ticks. 
        const gap_between_ticks = Math.round(this.genome_size / ticks_number)
        const label_radius = this.circle_radius - 8; 
        const label_y_offset = 1; 
        const radians = 0.0174532925; 
        this.svg
            .append("g")
            .attr("class", "coord-label-container")
            .selectAll(".coord-label")
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
        this.svg
            .append("g")
            .attr("class", "genome-size-container")
            .append("text")
            .text(numberWithCommas(this.genome_size) + " bp")
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('font-size', '4.5px')
    }

    /**
     * Draw circular barplot for distribution of all sgRNAs
     */
    createCircularBarplot(){
        // https://www.d3-graph-gallery.com/graph/circular_barplot_basic.html
        const innerRadius = this.barplot_begin;
        const outerRadius = this.barplot_end;
        const bin_data = this.createBinData(this.list_coordinates, this.bin_number, 0, this.genome_size); 

        const x = d3.scaleBand()
            .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
            .align(0)                  // This does nothing ?
            .domain(bin_data.map(function (d) { return d.bin_id; }));

        const max_prop = [...bin_data].sort((a,b) => b.number_coords_proportion - a.number_coords_proportion)[0].number_coords_proportion //maximum height for bin

        const y = d3.scaleRadial()
            .range([innerRadius, outerRadius])
            .domain([0, max_prop]); // Domain of Y is from 0 to the max seen in the data

        //Compute all y placements, we need it for detailed barplot so it has to be precomputed.
        bin_data.forEach(bin => bin.y_placement = y(bin.number_coords_proportion))

        const component = this; //Save component in variable for use in click function
        this.svg.append("g")
            .attr("class", "barplot-container")
            .selectAll("path")
            .data(bin_data)
            .enter()
            .append("path")
              .attr("fill", "#69b3a2")
              .attr("class", "bin")
                .on("click", function(d){ //Call function to access the object in this
                    component.svg.selectAll(".bin").style("opacity", "0.5") //Fade all bins
                    d3.select(this).style("opacity","1.0"); //Highlight current bin
                    component.addBarplotDetailed(d) //Add the detailed barplot for current bin
                })
              .attr("d", d3.arc()
                  .innerRadius(innerRadius)
                  //@ts-ignore
                  .outerRadius(d => d.y_placement)
                  //@ts-ignore
                  .startAngle(d => x(d.bin_id))
                  //@ts-ignore
                  .endAngle(d => x(d.bin_id) + x.bandwidth())
                  .padAngle(0.01)
                  .padRadius(innerRadius))
              
    }

    addBarplotDetailed(bin_data:CoordinatesBinData){
        this.svg.selectAll(".detailed-barplot").remove(); //Remove if an other detailed barplot exist 

        const coordinates_inside = this.list_coordinates.filter(e => e >= bin_data.bin_start && e < bin_data.bin_end) //list of coordinates inside the bin
        
        const detailed_bin_data = this.createBinData(coordinates_inside, 20, bin_data.bin_start, bin_data.bin_end); //Format data for detailed histogram

        const middle = bin_data.bin_start + (bin_data.bin_end - bin_data.bin_start) / 2; //Middle placement of new histogram
        const midlength = this.genome_size / 20; //Length at each side

        const arc_placement = d3.scaleLinear() //Scale to place new histogram on circle
            .range([0, 2 * Math.PI])
            .domain([0, this.genome_size])

        const start_angle = arc_placement(middle - midlength)
        const end_angle = arc_placement(middle + midlength)

        //Draw axis to follow circle, so it's an arc
        const detailed_barplot_axis = d3.arc()
            .startAngle(start_angle)
            .endAngle(end_angle)
            .innerRadius(this.detailed_barplot_begin)
            .outerRadius(this.detailed_barplot_begin + 0.5)

        //Scale for x axis of barplot
        const bin_x = d3.scaleLinear()
            .range([start_angle, end_angle])
            .domain([bin_data.bin_start, bin_data.bin_end])
        
        //Scale for y axis of barplot
        const bin_y = d3.scaleLinear()
            .range([this.detailed_barplot_begin + 1, this.detailed_barplot_end])
            .domain([0,1]) //Maybe max height instead of 1 ? Between 0 and 1 because we work with proportion.

        //Add the axis
        this.svg
            .append("g")
            .attr("class", "detailed-barplot")
            .append('path')
            .attr("class", "detailed-barplot-axis")
            .attr('d', detailed_barplot_axis)
            .style('fill', 'gray')

        //Add the barplot
        this.svg.selectAll(".detailed-barplot")
            .selectAll("detailed-bin")
            .data(detailed_bin_data)
            .enter()
            .append("path")
              .attr("fill", "#69b3a2")
              .attr("class", "detailed-bin")
              .attr("d", d3.arc()   
                  .innerRadius(bin_y(0))
                  .outerRadius(d => bin_y(d.number_coords_proportion))
                  .startAngle(d => bin_x(d.bin_start))
                  .endAngle(d => bin_x(d.bin_end))
                ); 

        //Scale for placing start and end coordinates of barplot
        const coordAngle = d3.scaleLinear()
            .range([0, 360]) //Angle
            .domain([0, 2*Math.PI]) //Circle coordinates  

        this.svg.selectAll(".detailed-barplot")
            .selectAll("detailed-barplot-label")
            .data([[bin_data.bin_start, start_angle], [bin_data.bin_end, end_angle]])
            .enter()
            .append("text")
            .attr("class", "detailed-barplot-label")
            .attr('text-anchor', (d,i) => i === 0 ? 'end' : 'start') //If it's start coordinate, anchor end. If it's end coordinates, anchor start.
            .attr("x", 0)
            .attr("y", - this.detailed_barplot_begin - 0.5)
            .attr('transform', d => `rotate(${coordAngle(d[1])})`)
            .text(d => numberWithCommas(d[0]))
            .attr("font-size", "3px")

        //Lines between bin from global barplot and its detailed version
        const line1 = [this.circleCoordinates(bin_data.bin_start, bin_data.y_placement), this.circleCoordinates(middle - midlength, this.detailed_barplot_begin)] //Coordinates (x,y) for begin and end of the first line
        const line2 = [this.circleCoordinates(bin_data.bin_end, bin_data.y_placement), this.circleCoordinates(middle + midlength, this.detailed_barplot_begin)] //Coordinates (x,y) for begin and end of the second line
        this.svg.selectAll(".detailed-barplot")
            .selectAll(".detailed-barplot-line")
            .data([line1, line2])
            .enter()
            .append("line")
            .attr("stroke", "#A9A9A9")
            .attr("stroke-width", "0.5")
            .attr("x1", d => d[0].x)
            .attr("y1", d => - d[0].y)
            .attr("x2", d => d[1].x)
            .attr("y2", d => - d[1].y)
            .style("stroke-dasharray", ("1, 1"))

        


    }

    //Add coordinates ticks for the current sgrna
    addSingleCoordinatesTicks(){
        const coordinateScale = d3.scaleLinear()
            .range([-180, 180]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, this.genome_size])

        const ticks = this.svg
            .append("g")
            .attr("class", "single-sgrna-ticks-container")
            .selectAll("single-sgrna-ticks")
            .data(this.selected_sgrna_coordinates)
            .enter()
            .append("line")
            .attr("class", d => { 
                const start = parseInt(/\(([0-9]*),/.exec(d)[1]);
                return `single-sgrna-ticks start${start}`})
            .attr("stroke", "white")
            .attr("stroke-width", "0.5")
            .attr('x1', 0)
            .attr("x2", 0)
            .attr("y1", this.coordinates_begin)
            .attr("y2", this.coordinates_end)
            .attr('transform', d => {return 'rotate(' + coordinateScale(parseInt(/\(([0-9]*),/.exec(d)[1])) + ')'})
        
        //Transition when change sgrna
        ticks.transition()
            .delay(600)
            .attr("stroke", "#ff9999")
    }

    /**
     * Highlight the given coord. In fact it's just creation of ticks in given color, because the concerned ticks are previously removed. 
     * @param coords : list of coords to highlight
     * @param color : in which color you want to highlight
     */

    highlightCoordinatesTicks(coords:string[], color:string){
        const coordinateScale = d3.scaleLinear()
            .range([-180, 180]) // -180, 180 so tick 0 will be at genome origin (up middle)
            .domain([0, this.genome_size])

        this.svg.selectAll(".single-sgrna-ticks-container")
            .selectAll(".singe-sgrna-ticks")
            .data(coords)
            .enter()
            .append("line")
            .attr("class", d => {  
                const start = parseInt(/\(([0-9]*),/.exec(d)[1]);
                return `single-sgrna-ticks start${start}`})
            //.attr("class", d => {const start = parseInt(/\(([0-9]*),/.exec(d)[1]); return `start${start}`})
            .attr("stroke", color)
            .attr("stroke-width", "0.5")
            .attr('x1', 0)
            .attr("x2", 0)
            .attr("y1", this.coordinates_begin)
            .attr("y2", this.coordinates_end)
            .attr('transform', d => {return 'rotate(' + coordinateScale(parseInt(/\(([0-9]*),/.exec(d)[1])) + ')'})     
    }

    circleCoordinates(genome_position:number, radius : number){
        //Give the angle for this genome position
        const positionAngle = d3.scaleLinear()
            .range([0,2*Math.PI])
            .domain([0, this.genome_size])
        
        const angle = positionAngle(genome_position)
        const x = Math.sin(angle) * radius //Trigonometrie sin(alpha) = opposé / hypothénuse
        const y = Math.cos(angle) * radius // Trigonometrie cos(alpha) = adjacent / hypothénuse
        return {x, y}
    }

    displayGenes(){
        const angle = d3.scaleLinear()
            .range([0, 360])
            .domain([0, this.genome_size])

        this.svg
            .append("g")
            .attr("class", "genes")
            .selectAll(".gene-arc")
            .data(this.gene_coordinates)
            .enter()
            .append("polygon")
                .attr("points", d => {
                    const coord = this.circleCoordinates(d.end - d.start / 2, this.gene_begin)
                    return `0, ${- this.gene_begin} -2,${ - this.gene_begin - this.gene_tickness} 2,${- this.gene_begin - this.gene_tickness}`
                })
                .attr("transform", d => `rotate(${angle(d.end - d.start / 2)})`)
    }

    /**
     * If svg exists, clean it. If not, initialize it. 
     */
    componentDidRender(){
        this.svg ? this.cleanSvg() : this.initializeSvg(); 
        this.displaySvgContent();
    }

    render(){
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

