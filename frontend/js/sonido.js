var socket = io.connect('//localhost:3000');
var MIN = 40; // valor MINIMO del sensor
var MAX = 120; // valor MAXIMO del sensor
var max = MAX; // var: maximo de escala normal

//vars del gráfico
var width = $(window).width();
var height = $(window).height();
var n = 50, // cantidad de ticks en X
    data = d3.range(n);
var margin = {top: 0, right: 0, bottom: 0, left: 0};

var x = d3.scale.linear()
    .domain([ 1 , n - 2 ])
    .range([ 0 , width ]);

var y = d3.scale.linear()
    .domain([ MIN , max ])
    .range([ 0 , height ]);

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return x(i); })
    .y(function(d, i) { return y(d); });

var svg = d3.select("#fiebre").append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr('viewBox','-50 0 '+Math.max(width,height) +' '+Math.min(width,height) )
    .attr('preserveAspectRatio','xMidYMid') //none para streched
    .append("g")
    .attr("transform", "translate(" + Math.min(width,height) /1000 + "," + Math.min(height,width) /1000 + ")");

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

var path = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

texto = svg.append("text")
    .text("")
    .attr("text-anchor", "right")
    .style("font-size","60px")
    .attr("dy", width / 3)
    .attr("dx", height / 1.5);

svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"));

// listener de mensajes de socket.io
socket.on('message', function (message) {
    // solo proceso los mensajes del /sensor_2
    if (message.split(",")[0] === "/sensor_2"){ // /sensor_2: sonido

        if (max < parseInt(message.split(",")[1]) ){
            max = parseInt( message.split(",")[1] ) ;
        } else {
            if ( max >= MAX) {
                max--;
            }
            //actualizo eje Y con el nuevo máximo
            y = d3.scale.linear()
                .domain([ MIN , max ])
                .range([ 0 , height ]);

            //call sin transicion porque va tan rapido que se pierde
            svg.select(".y")
                .call(d3.svg.axis().scale(y).orient("left"));
        }

        var rango = d3.scale.linear().domain([ MIN , max ]).range([  MIN , max ]);
        data.push(rango (message.split(",")[1]) );

        // redibuja y corre la linea
        path
            .attr("d", line)
            .attr("transform", null)
            .transition()
            .ease("linear")
            .attr("transform", "translate(" + x(0) + ",0)");

        // elimino el dato mas viejo del array
        data.shift();

        // actualizo el texto con el valor actual
        svg.select("text")
            .text(function () {
                return (message.split(",")[1] + " db");

        } );

    } // end if
}); // end listener   

