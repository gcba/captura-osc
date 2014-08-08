/*
 10/4/14
 
 receiverSerialP5_4c:
 La siguiente aplicación funciona como puente entre Arduino y node.js.
 Desde Arduino recibe un byte por cada sensor, lo procesa y envía mediante el protocolo OSC a node.js 
 utilizando el puerto 3000 hacia la ip 127.0.0.1, q es lo mismo que decir "localhost".
 En la fase de procesamiento, se ocupa de iniciar un contador que se incremente según el tiempo que 
 el sensor esta siendo activado para luego generar la correspondiente visualización en node.js.
 
 Compatible con senderSensoresAr.ino (el programa cargado en Arduino) y oscReceiver_1b.pde (un programa
 que sirve como consola para verificar el correcto envío y funcionamiento de los mensajes OSC).
 
 Librería OSC: http://www.sojamo.de/libraries/oscP5/
 Librería Arduino: ya viene con la versión de Processing 2.0.3 
 (https://processing.org/download/?processing)                  
 */



/* Importamos librerías necesarias y creamos instancias para comunicarnos vía OSC con node.js y vía puerto Serie
 con nuestra placa Arduino. */

import oscP5.*;
import netP5.*;
import processing.serial.*;

OscP5 oscP5;
NetAddress myRemoteLocation1, myRemoteLocation2;


//Variables para comunicación con Puerto Serie
int end=10;
String serial;
Serial port;


int fps=5;

//Variables para mensajes OSC
int ARRAY_SIZE=4;
boolean[] flags=new boolean[ARRAY_SIZE];
int[] m= new int[ARRAY_SIZE];

/* Variables para mapeo de datos que se envían por OSC y el valor de incremento
 Con estos valores ajusto el rango de los datos y la "velocidad" en que se llega del 
 mínimo al máximo. */

int minCounter=1;
int maxCounter=50;
float incrementVal=0.5;

/* Variables para generar los círculos que emulan los botones pulsados.
 Declaro variables de color, de diametro y posiciones en la ventana para que coincida con el 
 png de fondo. */

color on= color(255);
color off= color(180);
int offsetX=68;
int cDiameter=85;
int cDiameter2=25;
int[] yPos= {
  147, 128, 116, 116, 128, 147
};
int[] xPos= {
  0, 112, 226, 337, 451, 563
};


/* Variables para crear el time stamp en el archivo .txt que recopila el historial de botones
 pulsados. */

PrintWriter output;
int mes=month();
int d=day();
int h=hour();
int min=minute();
int s=second();


/* Variables para el cronómetro que mide cada cuántos segundos paso al archivo .txt el 
 historial de los botones. */

int start=0;
int elapsedTime=15000;


/* En void setup() definimos e inicializamos variables que se ejecutarán por única vez cuando
 se ejecuta la aplicación: tamaño de ventana, imagen de fondo, puerto Serie */

void setup() {
  size(150, 150);
  println(Serial.list());
  port=new Serial(this, Serial.list()[1], 115200 );
  port.clear();
  serial=port.readStringUntil(end);
  serial=null;

  //Inicializo el array del estado de sensores
  for (int i=0; i<flags.length; i++) {
    flags[i]=false;
  }

  /* Creo en un for todas las instancias de la clase realizada ad hoc que envía 
   los mensajes OSC a node.js   
   Sintaxis:
   MessageOSC(int index, int minVal, int maxVal, int increment); */



  //Inicializo los parámetros de IP y puerto a dónde envío los mensajes OSC
  oscP5 = new OscP5(this, 3000);
  myRemoteLocation1 = new NetAddress("127.0.0.1", 3000);
  myRemoteLocation2 = new NetAddress("10.200.183.114", 3000);
}

/* En void draw() ejecuto en un loop infinito todas las operaciones de forma 
 continua e ininterrumpida. */

void draw() {
  background(100, 80, 200);
  // frame.setLocation(5, 10);
  ellipseMode(CENTER);
  smooth();
  noStroke();
  frameRate(fps);

  //Mientras lleguen datos desde puerto Serie los ordeno para poder leerlos correctamente
  while (port.available ()>0) {
    serial=port.readStringUntil(end);
  }

  // Si el puerto Serie no es nulo parseo los bytes que llegan.
  if (serial != null) {
    String[]arduino=split(serial, ',');

    for (int i=0; i<m.length; i++) {
      m [i] = Integer.parseInt(arduino[i]);
      //Declaro los tags de los mensajes OSC
      println("sensor "+i+":"+m[i]);

      OscMessage myMessage0 = new OscMessage("/sensor_0");
      myMessage0.add(m[0]);
      oscP5.send(myMessage0, myRemoteLocation1);
      oscP5.send(myMessage0, myRemoteLocation2);


      OscMessage myMessage1 = new OscMessage("/sensor_1");
      myMessage1.add(m[1]);
      oscP5.send(myMessage1, myRemoteLocation1);
      oscP5.send(myMessage1, myRemoteLocation2);


      OscMessage myMessage2 = new OscMessage("/sensor_2");
      myMessage2.add(m[2]);
      oscP5.send(myMessage2, myRemoteLocation1);
      oscP5.send(myMessage2, myRemoteLocation2);


      OscMessage myMessage3 = new OscMessage("/sensor_3");
      myMessage3.add(m[3]);
      oscP5.send(myMessage3, myRemoteLocation1);
      oscP5.send(myMessage3, myRemoteLocation2);

 
    }
  }
}

