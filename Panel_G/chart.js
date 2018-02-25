d3.circularHeat= function module() {
	 var margin = {
			top: 50,
			right: 50,
			bottom: 50,
			left: 100
		};
    var width = 750 - margin.left - margin.right;
    var height = width;
    var format = d3.time.format("%Y-%m-%d");
	
	var accessor = function(d) {return d.Energy;};
    var radialLabels = segmentLabels = [];
    var numSegments = 24;
    var innerRadius = 80; 
	// the length of the radius of the donut chart is: (width-innerRadius*2) / 2
	// the length of each segment is: the radius of the donut chart / the number of layers
	
	var domain;
	var range;
	
	var _index = 0;
	
	var dispatch = d3.dispatch("customHover");


    function chart(selection) {
        selection.each(function (data) {
        	
        	//console.log('radialLabels.length');
        	//console.log(radialLabels.length);
        	
        	segmentHeight = (width - margin.top - margin.bottom - 2 * innerRadius) / (2 * radialLabels.length);
        
            offset = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight;
            
            
            
            var color = d3.scale.linear().domain(domain).range(range);
        	
        	// Initialize the SVG Element
            var svg = d3.select(this)
                .selectAll("svg")
                .data([data]);
            
            // Set the SVG size
            svg.enter().append("svg")
                .classed("chart", true)
                .attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

        
        	if(svg.select('g.circular-heat')[0][0] == null){
        		var g = svg.append("g")
                	.classed("circular-heat", true)
                	.attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");
            }
            
        
            var id = d3.selectAll(".circular-heat")[0].length-1;
            
            svg.select('g.circular-heat').attr('id','chart'+_index);
            
            //console.log(d3.selectAll(".circular-heat")[0]);
            //console.log(d3.select(".circular-heat")[0]);
            
            //console.log('id');
            //console.log(id);
            // console.log(_index);
            
            var segments = svg.select('g.circular-heat').selectAll("path").data(data)
            .attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
            .attr("fill", function (d) {return color(accessor(d));});
             
             //console.log('segmentHeight');
             //console.log(segmentHeight);   
                
                segments
					.enter().append("path")
					.attr("id", function (d) {
						var time = d.Time;
						var timeCleaned = time.split(":").join("-");
						return "segment-" + d.Day + "-" + timeCleaned+"-"+id;
					})
					.attr("class", function (d) {
						return "segment-" + d.Day + " segment"+_index
					})
					.attr("d", d3.svg.arc().innerRadius(ir).outerRadius(or).startAngle(sa).endAngle(ea))
					// this part is not called when data is updated if the update data is shorter than the current one
					
					.attr("stroke", function (d) {
						return '#252525';
					})
					.attr("stroke-width",0.5)
					.attr("fill", function (d) {
						return color(accessor(d));
					})
					.on("mouseover", dispatch.customHover);
					
                
                segments.exit().transition().style({opacity: 0}).remove();

            //Segment labels
            var segmentLabelOffset = 5;
            var r = innerRadius + Math.ceil(data.length / numSegments) * segmentHeight + segmentLabelOffset;
            if(svg.select('g.labels')[0][0] == null){
        		var labels = svg.append("g")
                .classed("labels", true)
                .attr("transform", "translate(" + parseInt(margin.left + offset) + "," + parseInt(margin.top + offset) + ")");
            }
            
            svg.select('g.labels').append("def")
                .append("path")
                .attr("id", "segment-label-path-" + _index)
                .attr("d", "m0 -" + r + " a" + r + " " + r + " 0 1 1 -1 0");

            svg.select('g.labels').selectAll("text")
                .data(segmentLabels).enter()
                .append("text")
                .append("textPath")
                .attr("xlink:href", "#segment-label-path-" + _index)
                .style("font-size", "12px")
                .attr("startOffset", function (d, i) {
                    return i * 100 / numSegments + 1.5 + "%";
                })
                .text(function (d) {
                    return d;
                });
        });

    }

    /* Arc functions */
    getRadius = function (floor) {
    	// console.log('innerRadius + floor * segmentHeight;');
//     	console.log(innerRadius + floor * segmentHeight);
        return innerRadius + floor * segmentHeight;
    }

    ir = function (d, i) {
        return getRadius(Math.floor(i / numSegments));
    }

    or = function (d, i) {
        return getRadius(Math.floor(i / numSegments) + 1);
    }


    sa = function (d, i) {
        return (i * 2 * Math.PI) / numSegments;
    }
    ea = function (d, i) {
        return ((i + 1) * 2 * Math.PI) / numSegments;
    }

    /* Configuration getters/setters */
    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };
    
    chart.width = function (_) {
        if (!arguments.length) return width;
        margin = _;
        return chart;
    };

    chart.innerRadius = function (_) {
        if (!arguments.length) return innerRadius;
        innerRadius = _;
        return chart;
    };

    chart.numSegments = function (_) {
        if (!arguments.length) return numSegments;
        numSegments = _;
        return chart;
    };

    chart.segmentHeight = function (_) {
        if (!arguments.length) return segmentHeight;
        segmentHeight = _;
        return chart;
    };

    chart.domain = function (_) {
        if (!arguments.length) return domain;
        domain = _;
        return chart;
    };

    chart.range = function (_) {
        if (!arguments.length) return range;
        range = _;
        return chart;
    };

    chart.radialLabels = function (_) {
        if (!arguments.length) return radialLabels;
        if (_ == null) _ = [];
        radialLabels = _;
        return chart;
    };

    chart.segmentLabels = function (_) {
        if (!arguments.length) return segmentLabels;
        if (_ == null) _ = [];
        segmentLabels = _;
        return chart;
    };
    
    chart.accessor = function (_) {
        if (!arguments.length) return accessor;
        accessor = _;
        return chart;
    };
    
	chart.offset = function(value) {
			if (!arguments.length) return offset;
			offset = value;
			return chart;
	};
	
	chart._index = function(value) {
			if (!arguments.length) return _index;
			_index = value;
			return chart;
	};

	d3.rebind(chart, dispatch, "on");
    return chart;
    
};
