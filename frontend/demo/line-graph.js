
function LineGraph(argsMap) {
	var self = this;
	this.slideData = function(newData) {
		var tempData = processDataMap(newData);
		
		if(tempData.step != newData.step) {
			throw new Error("The step size on appended data must be the same as the existing data => " + data.step + " != " + tempData.step);
		}

		if(tempData.values[0].length == 0) {
			throw new Error("There is no data to append.");
		}
		
		var numSteps = tempData.values[0].length;
		tempData.values.forEach(function(dataArrays, i) {
			var existingDataArrayForIndex = data.values[i];
			dataArrays.forEach(function(v) {
				existingDataArrayForIndex.push(v);
				existingDataArrayForIndex.shift();
			})
		})
		
		data.startTime = new Date(data.startTime.getTime() + (data.step * numSteps));
		data.endTime = tempData.endTime;
		redrawAxes(false);	
		redrawLines(false);
			
	    graph.selectAll("g .lines path")
	        .attr("transform", "translate(-" + x(numSteps*data.step) + ")");
		 
		handleDataUpdate();
		$(container).trigger('LineGraph:dataModification')
	}
	
	this.updateData = function(newData) {
		data = processDataMap(newData);
	    graph.selectAll("g .lines path").data(data.values)
		redrawAxes(true);
		redrawLines(false);
		handleDataUpdate();
		$(container).trigger('LineGraph:dataModification')
	}

	
	
	this.getScale = function() {
		return yScale;
	}

	var containerId;
	var container;
	var graph, x, yLeft, yRight, xAxis, yAxisLeft, yAxisRight, yAxisLeftDomainStart, linesGroup, linesGroupText, lines, lineFunction, lineFunctionSeriesIndex = -1;
	var yScale = 'linear'; // can be pow, log, linear
	var hoverContainer, hoverLine, hoverLineXOffset, hoverLineYOffset, hoverLineGroup;
	var legendFontSize = 12; // we can resize dynamically to make fit so we remember it here
	var data;
	var margin = [-1, -1, -1, -1]; // margins (top, right, bottom, left)
	var w, h;	 // width & height
	var transitionDuration = 0;
	var formatNumber = d3.format(",.0f") // for formatting integers
	var tickFormatForLogScale = function(d) { return formatNumber(d) };
	var userCurrentlyInteracting = false;
	var currentUserPositionX = -1;
	var _init = function() {
		containerId = getRequiredVar(argsMap, 'containerId');
		container = document.querySelector('#' + containerId);
		margin[0] = getOptionalVar(argsMap, 'marginTop', 20) // marginTop allows fitting the actions, date and top of axis labels
		margin[1] = getOptionalVar(argsMap, 'marginRight', 20)
		margin[2] = getOptionalVar(argsMap, 'marginBottom', 35) // marginBottom allows fitting the legend along the bottom
		margin[3] = getOptionalVar(argsMap, 'marginLeft', 90) // marginLeft allows fitting the axis labels
		data = processDataMap(getRequiredVar(argsMap, 'data'));
		yScale = data.scale;
		initDimensions();
		
		createGraph()
		var TO = false;
		$(window).resize(function(){
		 	if(TO !== false)
		    	clearTimeout(TO);
		 	TO = setTimeout(handleWindowResizeEvent, 200); // time in miliseconds
		});
	}
	
	var processDataMap = function(dataMap) {
		var dataValues = getRequiredVar(dataMap, 'values', "The data object must contain a 'values' value with a data array.")
		var startTime = new Date(getRequiredVar(dataMap, 'start', "The data object must contain a 'start' value with the start time in milliseconds since epoch."))
		var endTime = new Date(getRequiredVar(dataMap, 'end', "The data object must contain an 'end' value with the end time in milliseconds since epoch."))
		var step = getRequiredVar(dataMap, 'step', "The data object must contain a 'step' value with the time in milliseconds between each data value.")		
		var names = getRequiredVar(dataMap, 'names', "The data object must contain a 'names' array with the same length as 'values' with a name for each data value array.")		
		var displayNames = getOptionalVar(dataMap, 'displayNames', names);
		var numAxisLabelsPowerScale = getOptionalVar(dataMap, 'numAxisLabelsPowerScale', 6); 
		var numAxisLabelsLinearScale = getOptionalVar(dataMap, 'numAxisLabelsLinearScale', 6); 
		
		var axis = getOptionalVar(dataMap, 'axis', []);
		if(axis.length == 0) {
			displayNames.forEach(function (v, i) {
				axis[i] = "left";
			})
		} else {
			var hasRightAxis = false;
			axis.forEach(function(v) {
				if(v == 'right') {
					hasRightAxis = true;
				}
			})
			if(hasRightAxis) {
				margin[1] = margin[1] + 50;
			}
		}

		
		var colors = getOptionalVar(dataMap, 'colors', []);
		if(colors.length == 0) {
			displayNames.forEach(function (v, i) {
				colors[i] = "black";
			})
		}
		
		var maxValues = [];
		var rounding = getOptionalVar(dataMap, 'rounding', []);
		if(rounding.length == 0) {
			displayNames.forEach(function (v, i) {
				rounding[i] = 0;
			})
		}
		
		var newDataValues = [];
		dataValues.forEach(function (v, i) {
			newDataValues[i] = v.slice(0);
			maxValues[i] = d3.max(newDataValues[i])
		})
		
		return {
			"values" : newDataValues,
			"startTime" : startTime,
			"endTime" : endTime,
			"step" : step,
			"names" : names,
			"displayNames": displayNames,
			"axis" : axis,
			"colors": colors,
			"scale" : getOptionalVar(dataMap, 'scale', yScale),
			"maxValues" : maxValues,
			"rounding" : rounding,
			"numAxisLabelsLinearScale": numAxisLabelsLinearScale,
			"numAxisLabelsPowerScale": numAxisLabelsPowerScale
		}
	}
	
	var redrawAxes = function(withTransition) {
		initY();
		initX();
		
		if(withTransition) {
			graph.selectAll("g .x.axis").transition()
			.duration(transitionDuration)
			.ease("linear")
			.call(xAxis)				  
		
			graph.selectAll("g .y.axis.left").transition()
			.duration(transitionDuration)
			.ease("linear")
			.call(yAxisLeft)
			
			if(yAxisRight != undefined) {
				graph.selectAll("g .y.axis.right").transition()
				.duration(transitionDuration)
				.ease("linear")
				.call(yAxisRight)
			}
		} else {
			graph.selectAll("g .x.axis")
			.call(xAxis)				  
		
			graph.selectAll("g .y.axis.left")
			.call(yAxisLeft)

			if(yAxisRight != undefined) {			
				graph.selectAll("g .y.axis.right")
				.call(yAxisRight)
			}
		}
	}
	
	var redrawLines = function(withTransition) {
		lineFunctionSeriesIndex  =-1;
		
		// redraw lines
		if(withTransition) {
			graph.selectAll("g .lines path")
			.transition()
				.duration(transitionDuration)
				.ease("linear")
				.attr("d", lineFunction)
				.attr("transform", null);
		} else {
			graph.selectAll("g .lines path")
				.attr("d", lineFunction)
				.attr("transform", null);
		}
	}
	
	var initY = function() {
		initYleft();
		initYright();
	}
	
	var initYleft = function() {
		var maxYscaleLeft = calculateMaxY(data, 'left')
		if(yScale == 'pow') {
			yLeft = d3.scale.pow().exponent(0.3).domain([0, maxYscaleLeft]).range([h, 0]).nice();	
			numAxisLabels = data.numAxisLabelsPowerScale;
		} else if(yScale == 'log') {
			yLeft = d3.scale.log().domain([0.1, maxYscaleLeft]).range([h, 0]).nice();	
		} else if(yScale == 'linear') {
			yLeft = d3.scale.linear().domain([0, maxYscaleLeft]).range([h, 0]).nice();
			numAxisLabels = data.numAxisLabelsLinearScale;
		}

		yAxisLeft = d3.svg.axis().scale(yLeft).ticks(numAxisLabels, tickFormatForLogScale).orient("left");
	}
	
	var initYright = function() {
		var maxYscaleRight = calculateMaxY(data, 'right')
		if(maxYscaleRight != undefined) {
			if(yScale == 'pow') {
				yRight = d3.scale.pow().exponent(0.3).domain([0, maxYscaleRight]).range([h, 0]).nice();		
				numAxisLabels = data.numAxisLabelsPowerScale;
			} else if(yScale == 'log') {
				yRight = d3.scale.log().domain([0.1, maxYscaleRight]).range([h, 0]).nice();	
			} else if(yScale == 'linear') {
				yRight = d3.scale.linear().domain([0, maxYscaleRight]).range([h, 0]).nice();
				numAxisLabels = data.numAxisLabelsLinearScale;
			}
			
			yAxisRight = d3.svg.axis().scale(yRight).ticks(numAxisLabels, tickFormatForLogScale).orient("right");
		}
	}
	
	var calculateMaxY = function(data, whichAxis) {
		var maxValuesForAxis = [];
		data.maxValues.forEach(function(v, i) {
			if(data.axis[i] == whichAxis) {
				maxValuesForAxis.push(v);
			}
		})
		
		return d3.max(maxValuesForAxis);
	}
	
	var initX = function() {
		x = d3.time.scale().domain([data.startTime, data.endTime]).range([0, w]);
		xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(1);
	}

	var createGraph = function() {
		graph = d3.select("#" + containerId).append("svg:svg")
				.attr("class", "line-graph")
				.attr("width", w + margin[1] + margin[3])
				.attr("height", h + margin[0] + margin[2])	
				.append("svg:g")
					.attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

		initX()		
		
		graph.append("svg:g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);
			
		
		initY();
				
		graph.append("svg:g")
			.attr("class", "y axis left")
			.attr("transform", "translate(-10,0)")
			.call(yAxisLeft);
			
		if(yAxisRight != undefined) {
			graph.append("svg:g")
				.attr("class", "y axis right")
				.attr("transform", "translate(" + (w+10) + ",0)")
				.call(yAxisRight);
		}
				
		lineFunction = d3.svg.line()
			.x(function(d,i) { 
				var _x = x(data.startTime.getTime() + (data.step*i)); 
				return _x;
			})
			.y(function(d, i) { 
				if(yScale == 'log' && d < 0.1) {
					d = 0.1;
				}
				if(i == 0) {
					lineFunctionSeriesIndex++;
				}
				var axis = data.axis[lineFunctionSeriesIndex];
				var _y;
				if(axis == 'right') {
					_y = yRight(d); 
				} else {
					_y = yLeft(d); 
				}
				return _y;
			})
			.defined(function(d) {
				return d >= 0;
			});

		lines = graph.append("svg:g")
				.attr("class", "lines")
			.selectAll("path")
				.data(data.values); 

		hoverContainer = container.querySelector('g .lines');
		
		$(container).mouseleave(function(event) {
			handleMouseOutGraph(event);
		})
		
		$(container).mousemove(function(event) {
			handleMouseOverGraph(event);
		})		

		linesGroup = lines.enter().append("g")
				.attr("class", function(d, i) {
					return "line_group series_" + i;
				});
				
		linesGroup.append("path")
				.attr("class", function(d, i) {
				})
				.attr("fill", "none")
				.attr("stroke", function(d, i) {
					return data.colors[i];
				})
				.attr("d", lineFunction) 
				.on('mouseover', function(d, i) {
					handleMouseOverLine(d, i);
				});
				
		linesGroupText = linesGroup.append("svg:text");
		linesGroupText.attr("class", function(d, i) {
			})
			.text(function(d, i) {
				return "";
			});
			
		hoverLineGroup = graph.append("svg:g")
							.attr("class", "hover-line");

		hoverLine = hoverLineGroup
			.append("svg:line")
				.attr("x1", 10).attr("x2", 10) 
				.attr("y1", 0).attr("y2", h);
				
		hoverLine.classed("hide", true);
			
		createLegend();		
		setValueLabelsToLatest();
	}
	


	var createLegend = function() {
		var legendLabelGroup = graph.append("svg:g")
				.attr("class", "legend-group")
			.selectAll("g")
				.data(data.displayNames)
			.enter().append("g")
				.attr("class", "legend-labels");
				
		legendLabelGroup.append("svg:text")
				.attr("class", "legend name")
				.text(function(d, i) {
					return d;
				})
				.attr("font-size", legendFontSize)
				.attr("fill", function(d, i) {
					return data.colors[i];
				})
				.attr("y", function(d, i) {
					return h+28;
				})

		legendLabelGroup.append("svg:text")
				.attr("class", "legend value")
				.attr("font-size", legendFontSize)
				.attr("fill", function(d, i) {
					return data.colors[i];
				})
				.attr("y", function(d, i) {
					return h+28;
				});
	}
	
	var handleMouseOverLine = function(lineData, index) {
		userCurrentlyInteracting = true;
	}

	var handleMouseOverGraph = function(event) {	
		var mouseX = event.pageX-hoverLineXOffset;
		var mouseY = event.pageY-hoverLineYOffset;
		
		if(mouseX >= 0 && mouseX <= w && mouseY >= 0 && mouseY <= h) {
			hoverLine.classed("hide", false);
			hoverLine.attr("x1", mouseX).attr("x2", mouseX)
			displayValueLabelsForPositionX(mouseX)
			userCurrentlyInteracting = true;
			currentUserPositionX = mouseX;
		} else {
			handleMouseOutGraph(event)
		}
	}
	
	
	var handleMouseOutGraph = function(event) {	
		hoverLine.classed("hide", true);
		setValueLabelsToLatest();
		userCurrentlyInteracting = false;
		currentUserPositionX = -1;
	}
	
	var handleDataUpdate = function() {
		if(userCurrentlyInteracting) {
			if(currentUserPositionX > -1) {
				displayValueLabelsForPositionX(currentUserPositionX)
			}
		} else {
			setValueLabelsToLatest();
		}
	}
	
	var displayValueLabelsForPositionX = function(xPosition, withTransition) {
		var animate = false;
		if(withTransition != undefined) {
			if(withTransition) {
				animate = true;
			}
		}
		var dateToShow;
		var labelValueWidths = [];
		graph.selectAll("text.legend.value")
		.text(function(d, i) {
			var valuesForX = getValueForPositionXFromData(xPosition, i);
			dateToShow = valuesForX.date;
			return valuesForX.value;
		})
		.attr("x", function(d, i) {
			labelValueWidths[i] = this.getComputedTextLength();
		})

		var cumulativeWidth = 0;
		var labelNameEnd = [];
		graph.selectAll("text.legend.name")
				.attr("x", function(d, i) {
					var returnX = cumulativeWidth;
					cumulativeWidth += this.getComputedTextLength()+4+labelValueWidths[i]+8;
					labelNameEnd[i] = returnX + this.getComputedTextLength()+5;
					return returnX;
				})

		cumulativeWidth = cumulativeWidth - 8;

		if(cumulativeWidth > w) {
			legendFontSize = legendFontSize-1;
			graph.selectAll("text.legend.name")
				.attr("font-size", legendFontSize);
			graph.selectAll("text.legend.value")
				.attr("font-size", legendFontSize);
			
			displayValueLabelsForPositionX(xPosition);
			return;
		}

		graph.selectAll("text.legend.value")
		.attr("x", function(d, i) {
			return labelNameEnd[i];
		})
		

		graph.select('text.date-label').text(dateToShow.toDateString() + " " + dateToShow.toLocaleTimeString())

		if(animate) {
			graph.selectAll("g.legend-group g")
				.transition()
				.duration(transitionDuration)
				.ease("linear")
				.attr("transform", "translate(" + (w-cumulativeWidth) +",0)")
		} else {
			graph.selectAll("g.legend-group g")
				.attr("transform", "translate(" + (w-cumulativeWidth) +",0)")
		}
	}
	
	var setValueLabelsToLatest = function(withTransition) {
		displayValueLabelsForPositionX(w, withTransition);
	}
	
	var getValueForPositionXFromData = function(xPosition, dataSeriesIndex) {
		var d = data.values[dataSeriesIndex]
		
		var xValue = x.invert(xPosition);

		var index = (xValue.getTime() - data.startTime) / data.step;


		if(index >= d.length) {
			index = d.length-1;
		}
		index = Math.round(index);

		var bucketDate = new Date(data.startTime.getTime() + data.step * (index+1)); // index+1 as it is 0 based but we need 1-based for this math
				
		var v = d[index];

		var roundToNumDecimals = data.rounding[dataSeriesIndex];

		return {value: roundNumber(v, roundToNumDecimals), date: bucketDate};
	}

	var handleWindowResizeEvent = function() {
	 	initDimensions();
		initX();
		
		d3.select("#" + containerId + " svg")
				.attr("width", w + margin[1] + margin[3])
				.attr("height", h + margin[0] + margin[2]);

		graph.selectAll("g .x.axis")
			.attr("transform", "translate(0," + h + ")");
			
		if(yAxisRight != undefined) {
			graph.selectAll("g .y.axis.right")
				.attr("transform", "translate(" + (w+10) + ",0)");
		}

		legendFontSize = 12;
		graph.selectAll("text.legend.name")
			.attr("font-size", legendFontSize);
		graph.selectAll("text.legend.value")
			.attr("font-size", legendFontSize);

		graph.select('text.date-label')
			.transition()
			.duration(transitionDuration)
			.ease("linear")
			.attr("x", w)

		redrawAxes(true);
		redrawLines(true);
		setValueLabelsToLatest(true);
	}

	var initDimensions = function() {
		// automatically size to the container using JQuery to get width/height
		w = $("#" + containerId).width() - margin[1] - margin[3]; // width
		h = $("#" + containerId).height() - margin[0] - margin[2]; // height
		
		// make sure to use offset() and not position() as we want it relative to the document, not its parent
		hoverLineXOffset = margin[3]+$(container).offset().left;
		hoverLineYOffset = margin[0]+$(container).offset().top;
	}
	
	var getRequiredVar = function(argsMap, key, message) {
		if(!argsMap[key]) {
			if(!message) {
				throw new Error(key + " is required")
			} else {
				throw new Error(message)
			}
		} else {
			return argsMap[key]
		}
	}
	
	var getOptionalVar = function(argsMap, key, defaultValue) {
		if(!argsMap[key]) {
			return defaultValue
		} else {
			return argsMap[key]
		}
	}
	
	var error = function(message) {
		console.log("ERROR: " + message)
	}

	/* private */ function roundNumber(num, dec) {
		var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		var resultAsString = result.toString();
		if(dec > 0) {
			if(resultAsString.indexOf('.') == -1) {
				resultAsString = resultAsString + '.';
			}
			var indexOfDecimal = resultAsString.indexOf('.');
			while(resultAsString.length <= (indexOfDecimal+dec)) {
				resultAsString = resultAsString + '0';
			}
		}
		return resultAsString;
	};

	_init();
};