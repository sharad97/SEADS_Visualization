function loadCircularHeatMap (dataset, dom_element_to_append_to,radial_labels,segment_labels) {

    var margin = {top: 20, right: 50, bottom: 50, left: 50};
    var width = 1000 - margin.left - margin.right;

    var height = width;
    var innerRadius = 100;// width/14;
    
    var segmentHeight = (width - margin.top - margin.bottom - 2*innerRadius )/(2*radial_labels.length);

    var chart = circularHeatChart()
    .segmentHeight(30)
    .innerRadius(95)
    .numSegments(24)
    .domain([0,2,4,6])
    .range(["#fee0d2","#fc9272","#de2d26"])
    .radialLabels(radial_labels)
    .segmentLabels(segment_labels)
    .margin({top: 0, right: 0, bottom: 0, left: 100});

    chart.accessor(function(d) {return d.Consumption;})

    var svg = d3.select(dom_element_to_append_to)
    .selectAll('svg')
    .data([dataset])
    .enter()
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform",
        "translate(" + ( (width )/2 - (radial_labels.length*segmentHeight + innerRadius)  ) + "," + margin.top + ")")
    .call(chart);


    var tooltip = d3.select(dom_element_to_append_to)
    .append('div')
    .attr('class', 'tooltip');

    //order of tooltip
    tooltip.append('div')
    .attr('class', 'day');
    tooltip.append('div')
    .attr('class', 'time');
    tooltip.append('div')
    .attr('class', 'consumption');
    

    svg.selectAll("path")
    .on('mouseover', function(d) {
    	console.log(d.Day);
    	// increase the segment height of the one being hovered as well as all others of the same date
    	// while decreasing the height of all others accordingly
		
		d3.selectAll("path.segment-"+d.Day).style("opacity", function (p) {return 0.6});
		
        tooltip.select('.time').html("<b> Time: " + d.Time + "</b>");
        tooltip.select('.day').html("<b> Date: " + d.Day + "</b>");
        tooltip.select('.consumption').html("<b> Energy Consume: " + d.Consumption + "</b>");
        tooltip.style('display', 'block');
        tooltip.style('opacity',2);
    })
    .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function(d) {
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
       //  var time = d.Time;
	   //  var timeCleaned = time.split(":").join("-");
	   //  var segment = d3.select("#segment-"+d.Day +"-"+timeCleaned); //designate selector variable for brevity
	   //  var fillcolor = segment.select("desc").text();  //access original color from desc
       //  segment.style("fill", fillcolor);
		
		d3.selectAll("path.segment-"+d.Day).style("opacity", function (p) {return 1});
    })
    .append("desc") //append the current color as a desc element
	.text(function(d){ 
			var color = d3.scale.linear().domain([0,2,4,6]).range(["#fee0d2","#fc9272","#de2d26"]);
			// how to access a function within reusable charts
			console.log(color(d.Consumption));
			return color(d.Consumption);
		});
    
    var linearV = d3.scale.linear()
    .domain([0,2,4,6])
    .range(["#fee0d2","#fc9272","#de2d26"]);
    
    svg.append("g")
        .attr("class", "legendV")
        .attr("transform", "translate(10,10)");
    
    var legendV = d3.legend.color()
    .shapeWidth(30)
    .cells(13)
   // .labelFormat(d3.format('.3f'))
    .scale(linearV);
    
    svg.select(".legendV")
        .call(legendV);
	}

function circularHeatChart() {
    var margin = {top: 20, right: 50, bottom: 50, left: 20},
    innerRadius = 95,
    numSegments = 24,
    segmentHeight = 30,
    domain = null,
    range = ["white", "red"],
    accessor = function(d) {return d;},
    radialLabels = segmentLabels = [];

    function chart(selection) {
        selection.each(function(data) {
            var svg = d3.select(this);

            var offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;
            g = svg.append("g")
                .classed("circular-heat", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            var autoDomain = false;
            if (domain === null) {
                domain = d3.extent(data, accessor);
                autoDomain = true;
            }
            var color = d3.scale.linear().domain(domain).range(range);
            if(autoDomain)
                domain = null;

            g.selectAll("path").data(data)
                .enter().append("path")
                // .attr("class","segment")
                .attr("class",function(d){return "segment-"+d.Day})
                .attr("id",function(d){
                	 var time = d.Time;
                	 var timeCleaned = time.split(":").join("-");
               		 return "segment-"+d.Day +"-"+timeCleaned;})
                .attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
                .attr("stroke", function(d) {return '#252525';})
                .attr("fill", function(d) {return color(accessor(d));});
                
            var id = d3.selectAll(".circular-heat")[0].length;
            

            //Radial labels
            var lsa = 0.01; //Label start angle
            var labels = svg.append("g")
                .classed("labels", true)
                .classed("radial", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.selectAll("def")
                .data(radialLabels).enter()
                .append("def")
                .append("path")
                .attr("id", function(d, i) {return "radial-label-path-"+id+"-"+i;})
                .attr("d", function(d, i) {
                    var r = innerRadius + ((i + 0.2) * segmentHeight);
                    return "m" + r * Math.sin(lsa) + " -" + r * Math.cos(lsa) + 
                            " a" + r + " " + r + " 0 1 1 -1 0";
                });

            labels.selectAll("text")
                .data(radialLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", function(d, i) {return "#radial-label-path-"+id+"-"+i;})
                .style("font-size", 0.4 * segmentHeight + 'px')
                .text(function(d) {return d;});


            //Segment labels
            var segmentLabelOffset = 5;
            var r = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + segmentLabelOffset;
            labels = svg.append("g")
                .classed("labels", true)
                .classed("segment", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");

            labels.append("def")
                .append("path")
                .attr("id", "segment-label-path-"+id)
                .attr("d", "m0 -" + r + " a" + r + " " + r + " 0 1 1 -1 0");

            labels.selectAll("text")
                .data(segmentLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", "#segment-label-path-"+id)
                .style("font-size", "12px")
                .attr("startOffset", function(d, i) {return i * 100 / numSegments + 1.5+ "%";})
                .text(function(d) {return d;});
        });

    }

    /* Arc functions */
    ir = function(d, i) {
        return innerRadius + Math.floor(i/numSegments) * segmentHeight;
    }
    or = function(d, i) {
        return innerRadius + segmentHeight + Math.floor(i/numSegments) * segmentHeight;
    }
    sa = function(d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    ea = function(d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.innerRadius = function(_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function(_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function(_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function(_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function(_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function(_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function(_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };

    chart.accessor = function(_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };

    return chart;
}
