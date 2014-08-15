SENSORES OSC
============

Envío datos:
/sensor_0: temperatura
/sensor_1: humedad
/sensor_2: sonido
/sensor_3: luz

#### v0.0.1 Requisitos

### Hardware:
* Placa Arduino Mega
* Sensores
* Placa experimental o shields para montaje de sensores

### Frameworks:
* NodeJS v0.10.26 - http://nodejs.org/
* Processing 2.0.3 (32bits) - http://www.processing.org/
* Arduino 1.0.5 - http://www.arduino.cc/
* Grunt - http://gruntjs.com/

### Dependencias Node back-end:
* node-osc: "~0.2.1",
* socket.io: "~0.9.16"

### Dependencias Node front-end:
* grunt-contrib-sass: "~0.7.3",
* grunt-contrib-watch: "~0.6.1",
* grunt: "^0.4.4"

### Librerías Javascript
* D3js v3 - http://d3js.org/
* jquery v2.1.0 - http://jquery.com/

### Librerías Processing
* Librería OSC: http://www.sojamo.de/libraries/oscP5/
* Librería Arduino: ya viene con la versión de Processing 2.0.3


### Estructura de carpetas

arduino/
Codigo del arduino

backend/
Establece una concexión entre la placa Arduino por [OSC](http://opensoundcontrol.org/introduction-osc) y [Node.js](http://nodejs.org/) usando [socket.io](http://socket.io/).

frontend/
Muestra los valores de los sensores.

### Uso

- Instalar, por primera vez, desde la carpeta `backend` las dependecias de node para node-osc y socket.io 

		$ grunt install

- Ejecutar \backend\app.js

		$ node app

- Ejecutar y correr `\Arduino\receiverSensoresP5\receiverSensoresP5.pde` 

- Abrir en en browser `\frontend\index.html`