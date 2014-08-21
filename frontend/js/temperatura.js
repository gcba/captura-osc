var socket, valores, MIN, MAX, width, height, pi, arc, svg, fondo, arco, rango, interpolate, colorScale;

socket = io.connect('//localhost:3000');

valores = [0,0,0,0];

margin = {top: 20, right: 0, bottom: 20, left: 0};

MIN = 0;    // valor MINIMO del sensor
MAX = 40;   // valor MAXIMO del sensor

width = $('.arco').width()+120;
height = $('.arco').height()+120;

console.log(width,height);
pi = 2 * Math.PI; 

arc = d3.svg.arc()
    .innerRadius(170)
    .outerRadius(200)
    .startAngle(0);

colorScale = d3.scale.linear().domain([MIN, MAX]).range(["#2F004B", "#554B80", "#BFA1B4", "#E6CA94","#FFF288"]);

svg = d3.select("#arco").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr('viewBox','0 0 '+(width) +' '+(height) )
    // .attr('preserveAspectRatio','xMidYMid') //none para streched
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

d3.select("svg")
    .append("text")
    .text("0°")
    .attr("class", "degree")
    .attr("transform", "translate(" + (width+20) / 2 + "," + (height+50) / 2 + ")")
    .style("text-anchor","middle" );


// Añado el arco del fondo
fondo = svg.append("path")
    .datum({endAngle: pi})
    .style("fill", "#ffffff")
    .attr("d", arc);

// Añado el arco de color
arco = svg.append("path")
    .datum({endAngle: 0 * pi})
    .attr("d", arc);

// oigo el mensaje del Arduino y cambio el valor del ángulo
socket.on('message', function (message) {
    valores[message[message.split(",")[0].length - 1]] = parseInt(message.split(",")[1]);
    // solo proceso los mensajes del /sensor_0
    
}); // end listener   

setInterval(
    function(){
        console.log(valores[0]);

    // /sensor_0: temperatura
            d3.select("text")
                .text(function () {
                    return (valores[0] + "°");
                });

            rango = d3.scale.linear().domain([ MIN , MAX ]).range([  0 , pi ]);

            arco.transition()
                .duration(500)
                .ease("linear")
                .style('fill',function(d) { return colorScale(d); })
                .call(arcTween, rango ( valores[0] ) );
                

          // 
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
