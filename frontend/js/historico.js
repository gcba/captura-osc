var socket, valores, margin, width, height, n, margin, x, y, line, svg, path, rango;

socket = io.connect('//localhost:3000');

function lineChart(){

    var line = function () {

        var MIN, MAX, max;
        
            MIN = 20;   // valor MINIMO del sensor
            MAX = 140;  // valor MAXIMO del sensor
            max = MAX;  // var: maximo de escala normal
        
        valores = [0,0,0,0];

        margin = {top: 20, right: 0, bottom: 150, left: 0};

        width = $('#fiebre-sonido').width();
        height = $('#fiebre-sonido').height();

        n = 100, // cantidad de ticks en X
            data = d3.range(n);
        margin = {top: 0, right: 0, bottom: 0, left: 0};

        x = d3.scale.linear()
            .domain([ 1 , n - 2 ])
            .range([ 0 , width ]);

        y = d3.scale.linear()
            .domain([ MIN,max ])
            .range([ 0,height ]);

        line = d3.svg.line()
            .interpolate("basis")
            .x(function(d, i) { return x(i); })
            .y(function(d, i) { return y(d); });

        svg = d3.select("#fiebre-sonido").append("svg")
            .attr("width", '100%')
            .attr("height", height)
            .attr('viewBox','-40 20 '+(width-margin.left) +' '+(height-margin.bottom) )
            // .attr('preserveAspectRatio','xMidYMid') //none para streched
            .append("g")
            .attr("transform", "translate(" + Math.min(width,height) /1000 + "," + Math.min(height,width) /1000 + ")");

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        path = svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        texto = svg.append("text")
            .text("")
            .attr("text-anchor", "right")
            .attr("class", "numero")
            .attr("dy", 50)
            .attr("dx", 50);

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(y).orient("left").ticks(5, " db"));

    }

    return line;
}

var line = lineChart();



// listener de mensajes de socket.io
socket.on('message', function (message) {
    valores[message[message.split(",")[0].length - 1]] = parseInt(message.split(",")[1]);
}); // end listener   

setInterval(
    function(){

        if (max < valores[2] ){
            max = valores[2] ;
        } else {
            if (max >= MAX) {
                max--;
        }
            // actualizo eje Y con el nuevo máximo
            y = d3.scale.linear()
                .domain([ max,MIN ])
                .range([ 0, height ]);



            //call sin transicion porque va tan rapido que se pierde
            svg.select(".y")
                .call(d3.svg.axis().scale(y).orient("left").ticks(5, " db"));
            }

        rango = d3.scale.linear().domain([ MIN, max ]).range([ 0.2 , max  ]);
        data.push(rango ( valores[2] ) );

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
            .text(
                function () {
                    return ( valores[2] + " db");
            });
        }
,280);
