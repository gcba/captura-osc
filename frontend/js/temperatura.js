var socket, valores, widthArcs, heightArcs, pi, interpolate;
var MINTemp, MAXTemp, svgTemp, getArcTemp, arcTemp, bkgTemp, rangeTemp, colorScaleTemp, textTemp;
var MINHum, MAXHum, svgHum, arc, arcHum, bkgHum, rangeHum, colorScaleHum, textHum;

socket = io.connect('//localhost:3000');

valores = [0,0,0,0];

widthArcs = $('.arco').width()+150;
heightArcs = $('.arco').height()+150;

MINTemp = 0;    // valor MINIMO del sensor
MAXTemp = 40;   // valor MAXIMO del sensor

MINHum = 0;    // valor MINIMO del sensor
MAXHum = 100;   // valor MAXIMO del sensor

pi = 2 * Math.PI; 

arcArcHum = d3.svg.arc().innerRadius(170).outerRadius(200).startAngle(0);

svgHum = d3.select("#arcHum").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('viewBox','0 0 '+(widthArcs) +' '+(heightArcs) )
    .append("g")
    .attr("transform", "translate(" + widthArcs / 2 + "," + heightArcs / 2 + ")");

// Añado el arco del fondo
bkgHum = svgHum.append("path")
    .datum({endAngle: pi})
    .style("fill", "#ffffff")
    .attr("d", arcArcHum);

// Añado el arco de color
arcHum = svgHum.append("path")
    .datum({endAngle: 0 * pi})
    .attr("class","pathHum")
    .attr("d", arcArcHum);

textHum = svgHum.append("text")
    .text("0"+'%')
    .attr("class", "percent")
    .attr("dy", 45)
    .attr("dx", 25)
    .style("text-anchor","middle");

// oigo el mensaje del Arduino y cambio el valor del ángulo
socket.on('message', function (message) {
    valores[message[message.split(",")[0].length - 1]] = parseInt(message.split(",")[1]);
    
}); // end listener   

setInterval(
    function(){
            svgHum.select('.percent')
                .text(function () {
                    return (valores[1] + "%");
                });


            rangeHum = d3.scale.linear().domain([ MINHum , MAXHum ]).range([  0 , pi ]);

            arcHum.transition()
                .ease("linear")
                .call(arcTweenHum, rangeHum( valores[1] ) );

    },280);


// Hace el tween entre el ángulo viejo y el nuevo
function arcTweenHum(transition, newAngle) {
  transition.attrTween("d", function(e) {
    interpolate = d3.interpolate(e.endAngle, newAngle);
    return function(t) {
      e.endAngle = interpolate(t);
      return arcArcHum(e);
    };
  });
}

