var dataDisplayed = data;
var datasetDisplayed = data;
var radial_labels = [];

getRadialLabels(dataDisplayed);
drawSlider(dataDisplayed);

var segment_labels = ["Midnight", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am",
                      "11am", "Midday", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
var numSegments = segment_labels.length;// label length is 24 as 24 hours 
var range_blue = ["#fee0d2", "#fc9272", "#de2d26"]; //color for data
var index_one = 0;

//draw first chart
var chart = d3.circularHeat()
        .domain([0, 2, 4, 6])
        .range(range_blue)
        .radialLabels(radial_labels)
        .segmentLabels(segment_labels)
        ._index(index_one);

chart.accessor(function (d) {
    return d.Energy;
});

d3.select("#chart")
    .datum(dataDisplayed)
    .call(chart);

//hover effect params
var innerRadius = chart.innerRadius();
chart.numSegments();
var segmentHeight = chart.segmentHeight();
var svg = d3.select("#chart");

// call mouseover event
chart.on("customHover", mouseover(svg, index_one, innerRadius, numSegments, segmentHeight, dataDisplayed));


// legend
var linearV = d3.scale.linear()
        .domain([0, 2, 4, 6])
        .range(range_blue); // color for range

var svg = d3.select("svg");

svg.append("g")
    .attr("class", "legendV")
    .attr("transform", "translate(10,30)");

var legendV = d3.legend.color()
        .shapeWidth(30)
        .cells(13)
     // .labelFormat(d3.format('.3f'))
        .scale(linearV)
        .title("in KWh");
    
svg.select(".legendV")
    .call(legendV);


var tooltip = d3.select("body")
        .append("div")
        .classed("radial-tooltip", true)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

// Formats the HTML for tooltip based on the data.
var getTooltipHTML = function (d) {
    var html = '<p>';
    var Day = d.Day;
    var Time = d.Time;
    var Energy  = d.Energy;

    if (Day    !== null) {
        html += "Day: " + Day     + '<br/>';
    }
    if (Time   !== null) {
        html += "Time: " +  Time     + '<br/>';
    }
    if (Energy !== null) {
        html += "Energy: " +  Energy    + '<br/>';
    }
    
    html += '</p>';
    return html;
};

//functions

function swapDataset(passedData, radiallabels) {
    chart.radialLabels(radiallabels)
         .domain([0, 2, 4, 6])
         .range(range_blue);
	d3.select("#chart")
        .datum(passedData)
        .call(chart);
    drawSlider(passedData);
}


//update radial labels based on data
function getRadialLabels(passedData) {	
	var groupedData = _.groupBy(passedData, 'Day');
	for (var k in groupedData) radial_labels.push(k);
}

//update viz
function updateChart(passedData,radiallabels){
	chart.radialLabels(radiallabels)
         .domain([0,2,4,6])
         .range(range_blue);
	d3.select("#chart")
      .datum(passedData)
      .call(chart);
}

function mouseover(svg,index,innerRadius,numSegments,segmentHeight,passedData){
 svg.selectAll("path.segment"+index)
    .on("mouseover", function(d, i) {
        var targetIndex = Math.floor(i / numSegments); //the layer you are hovering
        var zoomSize = 20; //inner 5px and outer 5px
		var layerCnt = passedData.length / numSegments; //layer count, number of layers
        if(data.length < 400){
            d3.selectAll("path.segment"+index) //.arc indicates segment
                .transition()
                .duration(200)
                .attr("d",d3.svg.arc()
                      .innerRadius(ir)
                      .outerRadius(or)
                      .startAngle(sa)
                      .endAngle(ea));
        }
        else{
            d3.selectAll("path.segment"+index)
                .transition()
                .duration(0) //transtion effect
                .attr("d", d3.svg.arc() //set d again
                      .innerRadius(ir)
                      .outerRadius(or)
                      .startAngle(sa)
                      .endAngle(ea));              
        }
        function getRadius(floor) {
            if (floor === 0) { //inner radius doesn't change
                return innerRadius;
            }
            if (floor === layerCnt) { //outer radius doesn't change
                return innerRadius + layerCnt * segmentHeight;
            }
            if (floor <= targetIndex) { //it's math
                return innerRadius + floor * segmentHeight - zoomSize * (floor / targetIndex);
			} 
            else { //math again
				return innerRadius + floor * segmentHeight + zoomSize * ((layerCnt - floor) / (layerCnt - targetIndex));
			}
		}
		function ir(d, i) {
			return getRadius(Math.floor(i / numSegments));
		}
		function or(d, i) {
			return getRadius(Math.floor(i / numSegments) + 1);
		}
        var tooltipHTML = getTooltipHTML(d);
        tooltip.html(tooltipHTML);
        return tooltip.style("visibility", "visible");
        })
        
        .on("mousemove", function(d, i) {
            return tooltip
                .style("top", (d3.event.pageY-10)+"px")
                .style("left",(d3.event.pageX+10)+"px");
        })

        .on("mouseout", function(){
            return tooltip.style("visibility", "hidden");
                        
            var targetIndex = Math.floor(i / numSegments);
			var zoomSize = 5;
			var layerCnt = passedData.length / numSegments;
			d3.selectAll("path.segment"+index)
                .transition()
                .duration(0)
                .attr("d", d3.svg.arc()
                      .innerRadius(ir)
                      .outerRadius(or)
                      .startAngle(sa)
                      .endAngle(ea))
			function getRadius(floor) {
                return innerRadius + floor * segmentHeight;
			}
			function ir(d, i) {
				return getRadius(Math.floor(i / numSegments));
			}
			function or(d, i) {
				return getRadius(Math.floor(i / numSegments) + 1);
			}

        });
}

//get start and end date dynamically for slider
function getDateRange(dataPassed){
	//called by slider start & end dates
	//get first object in dataPassed array, and get the date
	firstObj=dataPassed.filter(function(d,i){
		return i==0
	});
	//get last object in dataPassed array, and get the date
	lastObj =  dataPassed.filter(function(d,i){
		return i==dataPassed.length-1
	});
	datefrom = firstObj[0].Day;
	dateto=lastObj[0].Day;
	datejson = {'start':datefrom,'end':dateto};
	return datejson;
}


function drawSlider(passedData){
	//called by swapDataset
	//calls getDateRange
	$("#slider-range").empty();
	
	var dt_from =  getDateRange(passedData)['start'];
	var dt_to = getDateRange(passedData)['end'];
	
	$('#slider-time').html(dt_from);
	$('#slider-time2').html(dt_to);
	var min_val = Date.parse(dt_from)/1000;
	var max_val = Date.parse(dt_to)/1000;
	
	function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join("0") + num;
	}
	
	function formatDT(__dt) {
        var year = __dt.getFullYear();
        var month = zeroPad(__dt.getMonth()+1, 2);
        var date = zeroPad(__dt.getDate(), 2);
        return year + '-' + month + '-' + date ;
    };
    
    $("#slider-range").slider({
        range: true,
        min: min_val,
        max: max_val,
        step: 10,
        values: [min_val, max_val],
        slide: function (e, ui) {
            var dt_cur_from = new Date(ui.values[0]*1000);
            $('#slider-time').html(formatDT(dt_cur_from));
            var dt_cur_to = new Date(ui.values[1]*1000);           
            $('#slider-time2').html(formatDT(dt_cur_to));
        },
        stop: function(e, ui) { 
            var html = $('#slider-time').html();
            var html2 = $('#slider-time2').html();
            filterData(html,html2) 
        }
    });
}

var filtered = [];

function filterData(start,end){
	//called by slider drag stop event
	//calls updateChart
	//console.log(data);
	filtered = datasetDisplayed.filter(function(d){ return d.Day >=  start && d.Day <= end; }) //why data and not dataDisplayed?
	//console.log(filtered);
	radial_labels = [];
	getRadialLabels(filtered);
	updateChart(filtered,radial_labels);
	dataDisplayed = filtered;
	segmentHeight = (500 - 2 * innerRadius) / (2 * radial_labels.length);// should make this dynamic
    index=0;
    chart.on("customHover", mouseover(svg,index,innerRadius,numSegments,segmentHeight,dataDisplayed));
}
