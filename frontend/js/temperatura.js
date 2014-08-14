var socket = io.connect('//localhost:3000');
var MIN = 0; // valor MINIMO del sensor
var MAX = 40; // valor MAXIMO del sensor

var width = $(window).width();
var height = $(window).height();
var pi = 2 * Math.PI; 

var arc = d3.svg.arc()
    .innerRadius(180)
    .outerRadius(200)
    .startAngle(0);

var svg = d3.select("#arco").append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox','-50 0 '+Math.max(width,height) +' '+Math.min(width,height) )
    .attr('preserveAspectRatio','xMidYMid') //none para streched
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.select("svg")
    .append("text")
    .text("s/d")
    .attr("transform", "translate(" + width / 2.17 + "," + height / 1.9 + ")");


// Añado el arco del fondo
var fondo = svg.append("path")
    .datum({endAngle: pi})
    .style("fill", "#ffffff")
    .attr("d", arc);

// Añado el arco de color
var arcoTemperatura = svg.append("path")
    .datum({endAngle: 0 * pi})
    .style("fill", "#000000")
    .attr("d", arc);

// oigo el mensaje del Arduino y cambio el valor del ángulo
socket.on('message', function (message) {
    // solo proceso los mensajes del /sensor_0
    if (message.split(",")[0] === "/sensor_0"){ // /sensor_0: temperatura
        d3.select("text")
            .text(function () {
                return (message.split(",")[1] + "°");
            });

        var rango = d3.scale.linear().domain([ MIN , MAX ]).range([  0 , pi ]);

        arcoTemperatura.transition()
            .duration(100)
            .call(arcTween, rango (message.split(",")[1]) );

    } // end if
}); // end listener   

// Hace el tween entre el ángulo viejo y el nuevo
function arcTween(transition, newAngle) {
  transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });
}
