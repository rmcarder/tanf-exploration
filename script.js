

d3.queue()
  .defer(d3.json, 'data/fam-w-children-tanf-ratio.json')
  .defer(d3.json, 'data/state_tanf_to_poverty_ratio.json')
  .defer(d3.json, 'data/us-states.json')
  .awaitAll(function (error, results) {
    if (error) { throw error; }
    
    directedScatterPlot(results[0]);
    rollingChoropleth(results[1], results[2]);

  });


var margin = {
	left: 75,
	right: 50,
	top: 50,
	bottom: 75
};

var stg_dur = 400; // 800
var stg_delay = 700; // 1400


function directedScatterPlot(data) {
    
    var chart = this;

    chart.width = 625 - margin.left - margin.right;
    chart.height = 625 - margin.top - margin.bottom;

    chart.svg = d3.select("#chart1")
    	.append("svg")
    	.attr("width", chart.width + margin.left + margin.right)
    	.attr("height", chart.height + margin.top + margin.bottom)
    	.append("g")
    	.attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    chart.xScale = d3.scaleLinear()
      	.domain([4500000,7500000])
    	.range([0, width])
    	.nice();

    chart.yScale = d3.scaleLinear()
      	.domain([1500000, 4500000])
    	.range([height, 0]);

    var xAxis = d3.axisBottom(chart.xScale).ticks(5, "s");
	var yAxis = d3.axisLeft(chart.yScale).ticks(5, "s");

    chart.svg.append("g")
    	.attr("transform", function(){ return "translate(0," + chart.height + ")" })
    	.attr("class", "axis")
    	.call(xAxis);

    chart.svg.append("g")
    	.attr("class", "axis")
    	.call(yAxis);

	chart.svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -(chart.height / 2))
		.attr("y", -(margin.left * 0.75))
	    .style("text-anchor", "middle")
		.html("Families with Children on TANF");

	chart.svg
		.append("text")
		.attr("x", chart.width / 2)
		.attr("y", chart.height + margin.bottom * 0.75)
		.style("text-anchor", "middle")
		.html("Impoverished Families with Children");

    var full = data.slice()

    chart.svg
    	.selectAll(".circ")
    	.data(full, function(d){ return d.year }).enter()
    	.append("circle")
    	.attr("class", "circ")
    	.attr("r", 0)
    	.attr("cx", function(d){ return chart.xScale(d.fam_child_pov) })
    	.attr("cy", function(d){ return chart.yScale(d.tanf_fam) })
    .transition()
    	.delay(function (d,i){ return (i * 50) })
    	.duration(500)
    	.attr("r", 8);

    chart.svg
        .selectAll(".year_note")
        .data(full).enter()
        .append("text")
        .attr("class", "year_note")
        .attr("opacity", 0)
        .attr("x", function(d){ return chart.xScale(d.fam_child_pov) })
        .attr("y", function(d){ return chart.yScale(d.tanf_fam) })
        .attr("dx", function(d){ 
            if (d.year <= 2000){ return 10 }
            else if (d.year < 2004) { return 2 }
            else if (d.year < 2006) { return 10 }
            else if (d.year < 2008) { return -40 }
            else if (d.year < 2011) { return 2 }
            else if (d.year < 2013) { return 10 }
            else if (d.year == 2013) { return -40 }
            else if (d.year == 2014) { return 10 }
        })
        .attr("dy", function(d){ 
            if (d.year <= 2000){ return 3 }
            else if (d.year < 2004) { return -10 }
            else if (d.year < 2006) { return 5 }
            else if (d.year < 2008) { return 5 }
            else if (d.year < 2011) { return -10 }
            else if (d.year < 2013) { return 3 }
            else if (d.year == 2013) { return 5 }
            else if (d.year == 2014) { return -3 }
        })
        .text(function(d){ return d.year })
    .transition()
        .delay(function (d,i){ return (i * 50) })
        .duration(500)
        .attr("opacity", 1);

    // Directed Line
    chart.interpolate = d3.scaleQuantile()
        .domain([0,1])
        .range(d3.range(1, data.length + 1));   

    var line = d3.line()
        .x(function(d) { return xScale(d.fam_child_pov); })
        .y(function(d) { return yScale(d.tanf_fam); })
        .curve(d3.curveCatmullRom.alpha(0.7));

    // Reveal Path - Stage 1
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg1)
        .transition()
        .delay(stg_delay * 2)
        .style("stroke","black");;

    // Reveal Annotations - Stage 1
    var annot1 = chart.svg
        .append("g").attr("transform", "translate(40,80)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot1.append("tspan").html("Families enrolled in")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("TANF drops by over")
    annot1.append("tspan").attr("x","0").attr("dy","1.2em").html("50% after 1996 reform.")
    annot1.transition().delay(stg_delay).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 2
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 3 + stg_dur*1.5)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg2)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 2
    var annot2 = chart.svg
        .append("g").attr("transform", "translate(230,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot2.append("tspan").html("The 2001 recession")
    annot2.append("tspan").attr("x","0").attr("dy","1.2em").html("pushed more families")
    annot2.append("tspan").attr("x","0").attr("dy","1.2em").html("into poverty.")
    annot2.transition().delay(stg_delay * 4).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 3
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 6 + stg_dur * 2)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg3)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 3
    var annot3 = chart.svg
        .append("g").attr("transform", "translate(270,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot3.append("tspan").html("TANF enrollment drops")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("during the recovery,")
    annot3.append("tspan").attr("x","0").attr("dy","1.2em").html("but poverty doesn't.")
    annot3.transition().delay(stg_delay * 6 + stg_dur * 2 ).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();

    // Reveal Path - Stage 4
    chart.svg.append("path")
        .attr("class", "line")
        .style("stroke","#ec008b")
        .transition()
        .delay(stg_delay * 8 + stg_dur * 4)
        .duration(stg_dur)
        .attrTween('d', pathReveal_stg4)
        .transition()
        .delay(stg_delay * 2 + stg_dur)
        .style("stroke","black");

    // Reveal Annotations - Stage 4
    var annot4 = chart.svg
        .append("g").attr("transform", "translate(310,300)")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0)
        .attr("class", "annotation");

    annot4.append("tspan").html("The 2008 recession")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("increased the number of")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("impoverished families with ")
    annot4.append("tspan").attr("x","0").attr("dy","1.2em").html("no support from TANF.")
    annot4.transition().delay(stg_delay * 8 + stg_dur * 4).duration(stg_dur).attr("opacity", 1)
    .transition().delay(stg_delay * 2 + stg_dur).duration(stg_dur).attr("opacity", 0).remove();


    function pathReveal_stg1() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year < 2001;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg2() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2000 && d.year < 2005;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg3() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2004 && d.year < 2008;})
                .slice(0, chart.interpolate(t)));
        };
    };

    function pathReveal_stg4() {
        return function(t) {
            return line(data
                .filter(function(d) { return d.year >= 2007 ;})
                .slice(0, chart.interpolate(t)));
        };
    };    

};	


function rollingChoropleth(data, states){

    var chart = this;

    for (var i = 0; i < data.length; i++) {

        var dataState = data[i].State;
        var value_1994 = data[i].y1994;
        var value_2013 = data[i].y2013;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < states.features.length; j++)  {
            var jsonState = states.features[j].properties.name;

            if (dataState == jsonState) {
            states.features[j].properties.value_1994 = value_1994; 
            states.features[j].properties.value_2013 = value_2013; 

            break;
            }
        }
    }

    chart.projection = d3.geoAlbersUsa()
        .translate([width/2, height/2])
        .scale([700]); 

    chart.path = d3.geoPath().projection(chart.projection);

    chart.svg = d3.select("#chart2")
        .append("svg")
        .attr("width", chart.width + margin.left + margin.right)
        .attr("height", chart.height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", function(){ return "translate(" + margin.left + "," + margin.top + ")" });

    console.log(states);
    console.log(states.features);
    console.log(states.features[0].properties);    

    chart.colorScale = d3.scaleLinear()
        .domain([0,100])
        .range(["red", "green"]);

    chart.svg.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("class", "map")
        .attr("d", path)
        .attr("fill", function(d){
            return chart.colorScale(d.properties.value_1994);
        })
    .transition().duration(5000)
        .attr("fill", function(d){
            return chart.colorScale(d.properties.value2013);
        });

};


