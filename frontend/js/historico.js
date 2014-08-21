var socket, valores, margin, width, height, n, margin, bkg, colorScale;
var xSound, ySound, yAxisSound, lineSound, svgSound, pathSound, rangeSound, dataSound, textSound;
var xLight, yLight, yAxisLight, lineLight, svgLight, pathLight, rangeLight, dataLight, textLight;

socket = io.connect('//localhost:3000');

    bkg = d3.select("body");

    valores = [0,0,0,0];

    margin = {top: 0, right: 0, bottom: 25, left: 15};

    n = 100, // cantidad de ticks en X
    dataSound = d3.range(n),
    dataLight = d3.range(n);

    width = $('.fiebre').width() - margin.left - margin.right;
    height = $('.fiebre').height() - margin.top - margin.bottom;

    console.log(height);

var MINSound, MAXSound, maxSound;



    MINSound = 0;   // valor Minimo del sensor de sonido
    MAXSound = 140;  // valor Maximo del sensor de sonido
    maxSound = MAXSound;  // var: Maximo de escala normal de sonido
                          

var MINLight, MAXLight, maxLight;


    MINLight = 1;   // valor Minimo del sensor de sonido
    MAXLight = 500;  // valor Maximo del sensor de sonido
    maxLight = MAXLight;  // var: Maximo de escala normal de sonido



xLight = d3.scale.linear()
    .domain([ 1 , n - 2 ])
    .range([ 0 , width ]);

yLight = d3.scale.linear()
    .domain([ MINLight, maxLight ])
    .range([ 0,height ]);

yAxisLight = d3.svg.axis()
    .scale(yLight)
    .tickSize(-width)
    .orient("left")
    .ticks(5, " db");

lineLight = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return xLight(i); })
    .y(function(d, i) { return yLight(d); });

svgLight = d3.select("#fiebre").append("svg")
    .attr("width", width-margin.left )
    .attr("height", height + margin.top + margin.bottom)
    .attr('viewBox','-45 10 '+(width) +' '+(height) )
    // .attr('preserveAspectRatio','xMidYMid') //none para streched
    .append("g")
    .attr("transform", "translate(" + Math.min(width,height) /1000 + "," + Math.min(height,width) /1000 + ")");

svgLight.append("g")
    .attr("class", "y axis")
    .call(yAxisLight);

svgLight.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

pathLight = svgLight.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(dataLight)
    .attr("class", "line light")
    .attr("d", lineLight);
    // Cambiar opacidad de 0 a 1 cuando hayan datos.

textLight = svgLight.append("text")
    .text("")
    .attr("text-anchor", "right")
    .attr("class", "numberLight")
    .attr("dy", 50)
    .attr("dx", 50);




xSound = d3.scale.linear()
    .domain([ 1 , n - 2 ])
    .range([ 0 , width ]);

ySound = d3.scale.linear()
    .domain([ maxSound,MINSound ])
    .range([ 0,height ]);

yAxisSound = d3.svg.axis()
    .scale(ySound)
    .tickSize(-width)
    .orient("left")
    .ticks(5, " db");

lineSound = d3.svg.line()
    .interpolate("basis")
    .x(function(d, i) { return xSound(i); })
    .y(function(d, i) { return ySound(d); });

svgSound = d3.select("#fiebre-sonido").append("svg")
    .attr("width", width-margin.left )
    .attr("height", height + margin.top + margin.bottom)
    .attr('viewBox','-45 10 '+(width) +' '+(height) )
    // .attr('preserveAspectRatio','xMidYMid') //none para streched
    .append("g")
    .attr("transform", "translate(" + Math.min(width,height) /1000 + "," + Math.min(height,width) /1000 + ")");

svgSound.append("g")
    .attr("class", "y axis")
    .call(yAxisSound);

svgSound.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

pathSound = svgSound.append("g")
    .attr("clip-path", "url(#clip)")
    .append("path")
    .datum(dataSound)
    .attr("class", "line sound")
    .attr("d", lineSound);
    // Cambiar opacidad de 0 a 1 cuando hayan datos.

textSound = svgSound.append("text")
    .text("")
    .attr("text-anchor", "right")
    .attr("class", "numberSound")
    .attr("dy", 50)
    .attr("dx", 50);





// listener de mensajes de socket.io
socket.on('message', function (message) {
    valores[message[message.split(",")[0].length - 1]] = parseInt(message.split(",")[1]);
}); // end listener   

setInterval(
    function(){

        if (maxLight < valores[3] ){
            maxLight = valores[3] ;
        } else {
            if (maxLight >= MAXLight) {
                maxLight--;
            }
            // actualizo eje Y con el nuevo máximo
            yLight = d3.scale.linear()
                .domain([ maxLight,MINLight ])
                .range([ 0, height ]);

            //call sin transicion porque va tan rapido que se pierde
            svgLight.select(".y")
                .call(yAxisLight);
        }

        colorScale = d3.scale.linear().domain([MINLight, maxLight]).range(["#2F004B", "#554B80", "#BFA1B4", "#E6CA94","#FFF288"]);

        // console.log(dataLight);

        bkg.datum(valores[3])
        .transition(5000)
        .style('background-color',function(d) { return colorScale(d); });

        rangeLight = d3.scale.linear().domain([ MINLight, maxLight ]).range([ 0.2 , maxLight  ]);
        dataLight.push(rangeLight ( valores[3] ) );

        // redibuja y corre la linea
        pathLight
            .attr("d", lineLight)
            .attr("transform", null)
            .transition()
            .ease("linear")
            .attr("transform", "translate(" + xLight(0) + ",0)");

        // elimino el dato mas viejo del array
        dataLight.shift();

        // actualizo el texto con el valor actual
        svgLight.select(".numberLight")
            .text(
                function () {
                    return ( valores[3] + " lm");
            });

        if (maxSound < valores[2] ){
            maxSound = valores[2] ;
        } else {
            if (maxSound >= MAXSound) {
                maxSound--;
            }
            // actualizo eje Y con el nuevo máximo
            ySound = d3.scale.linear()
                .domain([ maxSound,MINSound ])
                .range([ 0, height ]);

            //call sin transicion porque va tan rapido que se pierde
            svgSound.select(".y")
                .call(yAxisSound);
        }

        rangeSound = d3.scale.linear().domain([ MINSound, maxSound ]).range([ 0.2 , maxSound  ]);
        dataSound.push(rangeSound ( valores[2] ) );

        // redibuja y corre la linea
        pathSound
            .attr("d", lineSound)
            .attr("transform", null)
            .transition()
            .ease("linear")
            .attr("transform", "translate(" + xSound(0) + ",0)");

        // elimino el dato mas viejo del array
        dataSound.shift();

        // actualizo el texto con el valor actual
        svgSound.select(".numberSound")
            .text(
                function () {
                    return ( valores[2] + " dB");
            });
        }
,280);

function arcTween(transition, newAngle) {
  transition.attrTween("d", function(d) {
    interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return arc(d);
    };
  });
}
