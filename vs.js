var w = 925,
	h = 550,
	margin = 30,
	startYear = 1999, 
	endYear = 2013,
	startVal = 0,
	endVal = 8000000,
	y = d3.scale.linear().domain([endVal, startVal]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([1999, 2013]).range([0 + margin -5, w]),
	years = d3.range(startYear, endYear);

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    // .attr("transform", "translate(0, 600)");

			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					
var startEnd = {},
    stockCodes = {};
d3.text('report-data.csv', 'text/csv', function(text) {
    var stocks = d3.csv.parseRows(text);
    
    for (i=1; i < stocks.length; i++) {
        var values = stocks[i].slice(2, stocks[i.length-1]);
        var currData = [];
        stockCodes[stocks[i][1]] = stocks[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
            
                if (!started) {
                    startEnd[stocks[i][1]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[stocks[i][1]]['endYear'] = years[j];
                    startEnd[stocks[i][1]]['endVal'] = values[j];
                }
                
            }
        }
        vis.append("svg:path")
            .data([currData])
            .attr("stock", stocks[i][1])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
});  
    
vis.append("svg:line")
    .attr("x1", x(1999))
    .attr("y1", y(startVal))
    .attr("x2", x(2013))
    .attr("y2", y(startVal))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startVal))
    .attr("x2", x(startYear))
    .attr("y2", y(endVal))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

vis.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startVal))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startVal)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(1998.5))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(1999))

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
        .attr("class", currClass + " current");
    
    var stockCode = $(this).attr("stock");
    var stockVals = startEnd[stockCode];
    var percentChange = 100 * (stockVals['endVal'] - stockVals['startVal']) / stockVals['startVal'];
    
    var blurb = '<h2>' + stockCodes[stockCode] + '</h2>';
    blurb += "<p>On average: a life expectancy of " + Math.round(stockVals['startVal']) + " years in " + stockVals['startYear'] + " and " + Math.round(stockVals['endVal']) + " years in " + stockVals['endYear'] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + Math.round(percentChange) + " percent."
    } else {
        blurb += "a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    // $("#blurb").text("hi again");
    $("#default-blurb").show();
    $("#blurb-content").html('');
}

function showRegion(regionCode) {
    var stocks = d3.selectAll("path."+regionCode);
    if (stocks.classed('highlight')) {
        stocks.attr("class", regionCode);
    } else {
        stocks.classed('highlight', true);
    }
}
