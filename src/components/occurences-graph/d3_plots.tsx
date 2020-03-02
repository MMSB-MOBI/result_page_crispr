import * as d3 from "d3";

export function lollipopPlot(element: HTMLElement, occurences_data: { name: string, coords_count: number }[]) {
    const max_occurences = occurences_data[0].coords_count

    const margin = { top: 10, right: 10, bottom: 40, left: 150 },
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    const svg = d3.select(element)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    const x = d3.scaleLinear()
        .domain([0, max_occurences])
        .range([0, width])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(max_occurences > 5 ? 5 : max_occurences))
        .selectAll("text")

    // Y axis
    const y = d3.scalePoint()
        .range([0, height])
        .domain(occurences_data.map(function (occ) { return occ.name; }))
        .padding(0.5)

    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("transform", "translate(-10,0)")
        .call(wrapText, margin.left - 10)

    svg.selectAll("myline")
        .data(occurences_data)
        .enter()
        .append("line")
        .attr("x1", function (d) { return x(d.coords_count); })
        .attr("x2", x(0))
        .attr("y1", function (d) { return y(d.name); })
        .attr("y2", function (d) { return y(d.name); })
        .attr("stroke", "grey")

    // Circles
    svg.selectAll("mycircle")
        .data(occurences_data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.coords_count); })
        .attr("cy", function (d) { return y(d.name); })
        .attr("r", "4")
        .style("fill", "#69b3a2")
        .attr("stroke", "black")

}

function wrapText(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],

            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
            }
        }
    });
}

export function densityPlot(element: HTMLElement, occurences_data: { name: string, coords_count: number }[]) {
    const max_occurences = occurences_data[0].coords_count
    const organisms = new Set(occurences_data.map((d) => d.name))
    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 40, left: 40},
        width = 240 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(element)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([0, max_occurences + 1])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(max_occurences + 1 < 5 ? max_occurences + 1 : 5))

    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function (d) { return d; })   // I need to give the vector of value
        .domain([0, max_occurences + 1])  // then the domain of the graphic
        .thresholds(x.ticks(10)); // then the numbers of bins

    // And apply this function to data to get the bins
    var bins = histogram(occurences_data.map((occ) => occ.coords_count));

    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
    y.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y).ticks(organisms.size >= 15 ? 15 : organisms.size));

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
        .attr("height", function (d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
        .on('mouseover', (d) => {
            const values_of_bar = new Set(d);
            const names = occurences_data.filter(m => values_of_bar.has(m.coords_count)).map(e => e.name);
            console.log(names)
        })

}