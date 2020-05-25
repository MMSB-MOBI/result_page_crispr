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
    @Prop() active_rotation?

    @Prop() onClickBarplot:(start:number, end:number) => void;

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
    barplot_gene_begin?:number; 
    barplot_gene_end?:number; 
    genome_color:string; 
    gene_color:string; 
    coord_color:string; 


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
     * Fix svg margin, circles radius, color, and create svg
     */
    initializeSvg(){
        //this.margin = 10; 
        this.width = 150; 
        this.height = 200;
        this.circle_radius = this.height/6; 
        this.circle_thickness = 2; 
        this.barplot_begin = this.gene_coordinates ? this.height/4 : this.height/4.5; 
        this.barplot_end = this.gene_coordinates ? this.height/2.7 : this.height/3; 
        this.detailed_barplot_begin = this.gene_coordinates ? this.height/2.5 : this.height/2.7;
        this.detailed_barplot_end = this.height/2 - 1; 
        this.coordinates_begin = this.circle_radius + this.circle_thickness + 3
        this.coordinates_end = this.circle_radius + this.circle_thickness + 6 
        this.gene_begin = this.gene_coordinates ? this.barplot_begin - 6 : undefined
        this.gene_tickness = 3; 
        this.barplot_gene_begin = this.gene_coordinates ? this.height/3 : undefined
        this.barplot_gene_end = this.gene_coordinates ? this.height/2 : undefined
        this.genome_color = "#5E4F63"; 
        this.gene_color = "#D5912A";
        this.coord_color = "#66B032";


        const main_div = this.element.shadowRoot.querySelector('.circular-barplot-main')
        this.svg = d3.select(main_div)
            .append("svg")
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height])
            .append("g")
            .attr("class", "main")
        
    }

    displaySvgContent(){
        this.createGenomeCircle();
        this.createCircularBarplot(); 
        this.addSingleCoordinatesTicks();
        if (this.gene_coordinates) this.displayGenes(); 
        this.addReinitializeEvent();
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
                /*this.svg.selectAll(".detailed-barplot").remove(); //Remove detailed barplot if exists
                this.svg.selectAll(".bin").style("opacity", "1"); //All bins with initial opacity
                if(this.active_rotation){
                    this.applyRotation(0)
                    this.deEmphasizeZero();
                }*/
            })
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", this.circle_radius + this.circle_thickness)
            .style("fill", "transparent")
            .style("stroke", this.genome_color)
            .style("stroke-width", this.circle_thickness)
        
        //Draw the coordinates ticks and labels, inspired by http://bl.ocks.org/tomgp/6475678
        const ticks_number:number = 12; 
        const tickAngle= 360 / ticks_number //This is the angle between two ticks. 
        const tickScale = d3.scaleLinear()
            .range([-180, 180 - tickAngle]) // -180, 180 so tick 0 will be at genome origin (up middle)
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

        const gap_between_ticks = Math.round(this.genome_size / ticks_number)
        const label_radius = this.circle_radius - 8; 

        //Compute coordinates for each coordinates label
        let data_label = []
        for(let i = 0; i < ticks_number; i++){
            const coordinates = this.circleCoordinates(i*gap_between_ticks, label_radius)
            data_label.push({coord:i*gap_between_ticks, x:coordinates.x, y:coordinates.y})
        }
        
        //Add coordinates label
        this.svg.append("g")
            .attr("class", "coord-label-container")
            .selectAll(".coord-label")
            .data(data_label)
                .enter()
                .append("text")
                .attr('class', 'coord-label')
                .attr("font-size", "3px")
                .attr("text-anchor", "middle")
                .style("fill", "gray")
                .attr("x", d => d.x)
                .attr("y", d => d.y)
                .text(d => numberWithCommas(Math.round(d.coord / 1000 )) + " kb")

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

        const angle = d3.scaleLinear()
            .range([0,360])
            .domain([0, this.genome_size])

        const component = this; //Save component in variable for use in click function
        this.svg.append("g")
            .attr("class", "barplot-container")
            .selectAll("path")
            .data(bin_data)
            .enter()
            .append("path")
              .attr("fill", this.coord_color)
              .attr("class", "bin")
                .on("click", function(d){ 
                    component.svg.selectAll(".bin").style("opacity", "0.5") //Fade all bins
                    d3.select(this).style("opacity","1.0"); //Highlight current bin
                    component.addBarplotDetailed(d) //Add the detailed barplot for current bin
                    if (component.active_rotation){
                        const middle  = d.bin_start + ((d.bin_end - d.bin_start)/2)
                        component.applyRotation(-angle(middle))
                        component.emphasizeZero(); 
                    }
                    
                    //component.applyRotation(90);

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

    /**
     * Add detailed barplot corresponding to some bin_data. Called when click on first barplot bin.
     * @param bin_data : data of clicked bin.
     */
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
        
        const max_prop = [...detailed_bin_data].sort((a,b) => b.number_coords_proportion - a.number_coords_proportion)[0].number_coords_proportion
        //Scale for y axis of barplot
        const bin_y = d3.scaleLinear()
            .range([this.detailed_barplot_begin + 1, this.detailed_barplot_end])
            .domain([0,max_prop]) //Maybe max height instead of 1 ? Between 0 and 1 because we work with proportion.

        //Add the axis
        this.svg
            .append("g")
            .attr("class", "detailed-barplot")
            .append('path')
            .attr("class", "detailed-barplot-axis")
            .attr('d', detailed_barplot_axis)
            .style('fill', this.genome_color)

        //Add the barplot
        this.svg.selectAll(".detailed-barplot")
            .selectAll("detailed-bin")
            .data(detailed_bin_data)
            .enter()
            .append("path")
              .attr("fill", this.coord_color)
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
            .attr("fill", this.coord_color)

        //Lines between bin from global barplot and its detailed version
        const line1 = [this.circleCoordinates(bin_data.bin_start, bin_data.y_placement), this.circleCoordinates(middle - midlength, this.detailed_barplot_begin)] //Coordinates (x,y) for begin and end of the first line
        const line2 = [this.circleCoordinates(bin_data.bin_end, bin_data.y_placement), this.circleCoordinates(middle + midlength, this.detailed_barplot_begin)] //Coordinates (x,y) for begin and end of the second line
        this.svg.selectAll(".detailed-barplot")
            .selectAll(".detailed-barplot-line")
            .data([line1, line2])
            .enter()
            .append("line")
            .attr("stroke", this.coord_color)
            .attr("stroke-width", "0.5")
            .attr("x1", d => d[0].x)
            .attr("y1", d => d[0].y)
            .attr("x2", d => d[1].x)
            .attr("y2", d => d[1].y)
            .style("stroke-dasharray", ("1, 1"))

        


    }

    /**
     * Display barplot detailed for some data. Here used for gene barplot, but we can imagine use it elsewhere by adapting the given data.
     * @param coord_start : genome coordinates where barplot start
     * @param coord_end : genome coordinates where barplot end
     * @param line_start : genome coordinates where the barplot axis display starts 
     * @param line_end : genome coordinates where the barplot axis display starts 
     * @param y_line : y coordinate where barplot axis is
     * @param y_barplot_start : y coordinate where barplot start
     * @param y_barplot_end : y coordinate where barplot end
     * @param class_name : g class name
     * @param color : bins color
     * @param nb_bins : number of bins
     * @param genome_proportion : proportion of genome where barplot will be displayed. (example : if 2, will take the half of the circular)
     */
    addGeneBarplotDetailed(coord_start:number, coord_end:number, line_start:number=coord_start, line_end:number=coord_end, y_line:number, y_barplot_start:number, y_barplot_end:number, class_name:string, color:string, nb_bins:number = 20, genome_proportion:number=20){
        this.svg.selectAll(class_name).remove(); //Remove if an other detailed barplot exist 

        const coordinates_inside = this.list_coordinates.filter(e => e >= coord_start && e < coord_end) //list of coordinates inside the bin
        
        const detailed_bin_data = this.createBinData(coordinates_inside, nb_bins, coord_start, coord_end); //Format data for detailed histogram

        const middle = coord_start + (coord_end - coord_start) / 2; //Middle placement of new histogram
        const midlength = this.genome_size / (genome_proportion*2); //Length at each side

        const arc_placement = d3.scaleLinear() //Scale to place new histogram on circle
            .range([0, 2 * Math.PI])
            .domain([0, this.genome_size])

        const start_angle = arc_placement(middle - midlength)
        const end_angle = arc_placement(middle + midlength)

        //Draw axis to follow circle, so it's an arc
        const detailed_barplot_axis = d3.arc()
            .startAngle(start_angle)
            .endAngle(end_angle)
            .innerRadius(y_barplot_start)
            .outerRadius(y_barplot_start + 0.5)

        //Scale for x axis of barplot
        const bin_x = d3.scaleLinear()
            .range([start_angle, end_angle])
            .domain([coord_start, coord_end])
        
        const max_prop = [...detailed_bin_data].sort((a,b) => b.number_coords_proportion - a.number_coords_proportion)[0].number_coords_proportion
        //Scale for y axis of barplot
        const bin_y = d3.scaleLinear()
            .range([y_barplot_start + 1, y_barplot_end])
            .domain([0,max_prop]) //Maybe max height instead of 1 ? Between 0 and 1 because we work with proportion.

        //Add the axis
        this.svg
            .append("g")
            .attr("class", "detailed-barplot")
            .append('path')
            .attr("class", "detailed-barplot-axis")
            .attr('d', detailed_barplot_axis)
            .style('fill', this.genome_color)

        //Add the barplot
        this.svg.selectAll(".detailed-barplot")
            .selectAll("detailed-bin")
            .data(detailed_bin_data)
            .enter()
            .append("path")
              .attr("fill", color)
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
            .data([[coord_start, start_angle], [coord_end, end_angle]])
            .enter()
            .append("text")
            .attr("class", "detailed-barplot-label")
            .attr('text-anchor', (d,i) => i === 0 ? 'end' : 'start') //If it's start coordinate, anchor end. If it's end coordinates, anchor start.
            .attr("x", 0)
            .attr("y", - y_barplot_start - 0.5)
            .attr('transform', d => `rotate(${coordAngle(d[1])})`)
            .text(d => numberWithCommas(d[0]))
            .attr("font-size", "3px")
            .attr("fill", color)

        //Lines between bin from global barplot and its detailed version
        const line1 = [this.circleCoordinates(line_start, y_line), this.circleCoordinates(middle - midlength, y_barplot_start)] //Coordinates (x,y) for begin and end of the first line
        const line2 = [this.circleCoordinates(line_end, y_line), this.circleCoordinates(middle + midlength, y_barplot_start)] //Coordinates (x,y) for begin and end of the second line
        this.svg.selectAll(".detailed-barplot")
            .selectAll(".detailed-barplot-line")
            .data([line1, line2])
            .enter()
            .append("line")
            .attr("stroke", color)
            .attr("stroke-width", "0.5")
            .attr("x1", d => d[0].x)
            .attr("y1", d => d[0].y)
            .attr("x2", d => d[1].x)
            .attr("y2", d => d[1].y)
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

    /**
     * Give coordinates on circle of genome position with trigonometry
     * @param genome_position : position on genome
     * @param radius : circle radius
     */

    circleCoordinates(genome_position:number, radius : number): {"x":number, "y":number}{
        //Give the angle for this genome position
        const positionAngle = d3.scaleLinear()
            .range([0,2*Math.PI])
            .domain([0, this.genome_size])
        
        const angle = positionAngle(genome_position)
        const x = Math.sin(angle) * radius //Trigonometrie sin(alpha) = opposé / hypothénuse
        const y = - Math.cos(angle) * radius // Trigonometrie cos(alpha) = adjacent / hypothénuse
        return {x, y}
    }

    /**
     * Display gene triangles
     */
    displayGenes(){
        const angle = d3.scaleLinear()
            .range([0, 360])
            .domain([0, this.genome_size])

        const component = this;
        this.svg
            .append("g")
            .attr("class", "genes")
            .selectAll(".gene-arc")
            .data(this.gene_coordinates)
            .enter()
            .append("polygon")
                .attr("points", d => {
                    const middle = d.start + ((d.end - d.start) / 2)
                    const triangle_gap = this.genome_size / 204
                    const point1 = this.circleCoordinates(middle, this.gene_begin)
                    const point2 = this.circleCoordinates(middle - triangle_gap, this.gene_begin + this.gene_tickness)
                    const point3 = this.circleCoordinates(middle + triangle_gap, this.gene_begin + this.gene_tickness)
                    return `${point1.x},${point1.y} ${point2.x},${point2.y} ${point3.x},${point3.y}`
                })
                .attr("fill", this.gene_color)
                //.attr("transform", d => `rotate(${angle(d.end - d.start / 2)})`)
                .on("click", d => {
                    component.svg.selectAll(".detailed-barplot").remove(); //Remove detailed barplot if exists
                    component.svg.selectAll(".bin").style("opacity", "0.3"); //All bins with initial opacity
                    const middle = d.start + ((d.end - d.start) / 2)
                    const triangle_gap = this.genome_size / 204
                    component.addGeneBarplotDetailed(d.start, d.end, middle - triangle_gap, middle + triangle_gap, this.gene_begin + this.gene_tickness, this.barplot_gene_begin, this.barplot_gene_end, ".barplot-detailed-gene", this.gene_color, 20, 5)
                    component.applyRotation(-angle(middle))
                })
    }

    /**
     * Apply rotation to genome circle
     * @param angle : rotation angle
     */
    applyRotation(angle:number){
        console.log("apply rotation")
        this.svg
            .transition()
            .duration(500)
            .attr("transform", `rotate(${angle})`)

        this.svg.selectAll(".genome-size-container")
            .transition()
            .duration(500)
            .attr("transform", `rotate(${-angle})`)

        this.svg.selectAll(".coord-label-container text")
            .transition()
            .duration(500)
            .attr("transform", d => `rotate(${-angle}, ${d.x}, ${d.y})`);

    }

    /**
     * Emphasize label for 0 coordinates (red and bold)
     */
    emphasizeZero(){
        this.svg.select(".coord-tick")
            .attr("stroke", "red")
            .attr("stroke-width", 0.7)
        this.svg.select(".coord-label")
            .style("fill", "red")
            .style("font-weight", "bold")
    }

    /**
     * De-emphasize label for 0 coordinate (grey and not bold)
     */
    deEmphasizeZero(){
        this.svg.select(".coord-tick")
            .attr("stroke", "grey")
            .attr("stroke-width", 0.5)
        this.svg.select(".coord-label")
            .style("fill", "grey")
            .style("font-weight", "normal")
    }

    /**
     * Reinitialize genome circle when click everywhere in svg except barplot, detailed barplots and gene triangle
     */
    addReinitializeEvent(){
        const svg = this.element.shadowRoot.querySelector("svg")
        svg.addEventListener('click', (e) => {
            const barplot = this.element.shadowRoot.querySelector(".barplot-container")
            const detailed_barplot = this.element.shadowRoot.querySelector(".detailed-barplot")
            const genes = this.element.shadowRoot.querySelector(".genes")
            const current_parent_node = (e.target as HTMLElement).parentNode
            if ( current_parent_node !== barplot && current_parent_node !== detailed_barplot && current_parent_node !== genes){ 
                this.svg.selectAll(".detailed-barplot").remove(); //Remove detailed barplot if exists
                this.svg.selectAll(".bin").style("opacity", "1"); //All bins with initial opacity
                if(this.active_rotation){
                    this.applyRotation(0)
                    this.deEmphasizeZero();
                }
            }
            
        })
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

/**
 * Transform number to string with comma as thousands separators
 * @param x : number to transform
 */
//https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
function numberWithCommas(x:number):string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

