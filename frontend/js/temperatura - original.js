var socket, valores, widthArcs, heightArcs, pi, interpolate;
var MINTemp, MAXTemp, svgTemp, getArcTemp, arcTemp, bkgTemp, rangeTemp, colorScaleTemp, textTemp;

socket = io.connect('//localhost:3000');

valores = [0,0,0,0];

widthArcs = $('.arco').width()+150;
heightArcs = $('.arco').height()+150;

MINTemp = 0;    // valor MINIMO del sensor
MAXTemp = 40;   // valor MAXIMO del sensor

pi = 2 * Math.PI; 

getArcTemp = d3.svg.arc().innerRadius(170).outerRadius(200).startAngle(0);
arc = d3.svg.arc().innerRadius(170).outerRadius(200).startAngle(0);

svgTemp = d3.select("#arcTemp").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('viewBox','0 0 '+(widthArcs) +' '+(heightArcs) )
    .append("g")
    .attr("transform", "translate(" + widthArcs / 2 + "," + heightArcs / 2 + ")")

// Añado el arco del fondo
bkgTemp = svgTemp.append("path")
    .datum({endAngle: pi})
    .style("fill", "#ffffff")
    .attr("d", getArcTemp);

// Añado el arco de color
arcTemp = svgTemp.append("path")
    .datum({endAngle: 0 * pi})
    .attr("d", getArcTemp);

textTemp = svgTemp.append("text")
    .text("0°")
    .attr("class", "degree")
    .attr("dy", 45)
    .attr("dx", 25)
    .style("text-anchor","middle");


// oigo el mensaje del Arduino y cambio el valor del ángulo
socket.on('message', function (message) {
    valores[message[message.split(",")[0].length - 1]] = parseInt(message.split(",")[1]);
    
}); // end listener   

setInterval(
    function(){

            svgTemp.select('.degree')
                .text(function () {
                    return (valores[0] + "°");
                });

            rangeTemp = d3.scale.linear().domain([ MINTemp , MAXTemp ]).range([  0 , pi ]);

            arcTemp.transition()
                .ease("linear")
                .call(arcTween, rangeTemp ( valores[0] ) );

    },280)

// Hace el tween entre el ángulo viejo y el nuevo
function arcTween(transition, newAngle) {
  transition.attrTween("d", function(d) {
    interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });
}
