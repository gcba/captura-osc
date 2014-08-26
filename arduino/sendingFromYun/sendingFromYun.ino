/*
   Cliente YUN para postear datos a Processing
   Compilado en:    IDE v1.5.7
   Placa:           Arduino Yun
   Version:         0.0.1
   Fecha:           Agosto 2014
   Funcion:         Postear 4 señales de datos: temperatura y humedad (DHT22), ruido (electret) y luz (LDR)
   Direccion General de Innovacion y Gobierno Abierto
*/

#include <Console.h>
#include "DHT.h"

const int ledPin = 13; // the pin that the LED is attached to
char incomingByte;      // a variable to read incoming Console data into
const int del = 100;
const int dataSize = 4;

//Temp
String headerT = "A";
String tailT = "B";
String mensajeT = "";

//Hum
String headerH = "C";
String tailH = "D";
String mensajeH = "";

//Noise
String headerN = "E";
String tailN = "F";
String mensajeN = "";

//Light
String headerL = "G";
String tailL = "H";
String mensajeL = "";

// Variables sensores
byte Offset = 0;
#define DHTPIN 2 //Seleccionamos el pin en el que se //conectará el sensor
#define DHTTYPE DHT22 //Se selecciona el DHT11 (hay //otros DHT)
DHT dht(DHTPIN, DHTTYPE); //Se inicia una variable que será usada por Arduino para comunicarse con el sensor
unsigned long time;

// Variables Luz
int lightPin = A3;  //Pin de la foto-resistencia
int light = 0;   //Variable light
int light0 = 0;
float Res0 = 0.4;
//int min = 0;       //valor mínimo que da la foto-resistencia
//int max = 1000;       //valor máximo que da la foto-resistencia

// Variables ruido

int electret = A0;
int lect = 0;
int noise = 0;
int threshold = 450;


// Rangos
int minTemp = 0;
int maxTemp = 40;
int minHum = 0;
int maxHum = 100;
int minNoise = 40;
int maxNoise = 120;
int minLight = 0;
int maxLight = 4000;


void setup() {

  Bridge.begin();   // Initialize Bridge
  Console.begin();  // Initialize Console
  dht.begin();

  // Wait for the Console port to connect
  while (!Console);

}

void loop() {


  //Temperatura
  int temp = dht.readTemperature() - 5;
  if (temp < minTemp)
  {
    temp = minTemp;
  }
  else if (temp > maxTemp)
  {
    temp = maxTemp;
  }
  delay(del);

  //Humedad
  int hum = dht.readHumidity() + 11;
  if (hum < minHum)
  {
    hum = minHum;
  }
  else if (hum > maxHum)
  {
    hum = maxHum;
  }
  delay(del);

  //Ruido
  int lect = analogRead(electret);
  noise = lect - threshold;
  if (noise < minNoise)
  {
    noise = minNoise;
  }
  else if (noise > maxNoise)
  {
    noise = maxNoise;
  }
  //Luz
  light0 = analogRead(lightPin);   // Read the analogue pin
  float Vout0 = light0 * 0.0048828125;  // calculate the voltage
  light = 500 / (Res0 * ((5 - Vout0) / Vout0));
  if (light < minLight)
  {
    light = minLight;
  }
  else if (light > maxLight)
  {
    light = maxLight;
  }

  delay(del);

  //Sending data
  mensajeT += headerT;
  mensajeH += headerH;
  mensajeN += headerN;
  mensajeL += headerL;

  int largo = 1;//String(light).length();

  //  for (int i = 0; i < largo; i++) {
  mensajeT += String(temp);
  mensajeH += String(hum);
  mensajeN += String(noise);
  mensajeL += String(light);
  delay(del);
  // }

  mensajeT += tailT;
  mensajeH += tailH;
  mensajeN += tailN;
  mensajeL += tailL;



  delay(del);
  Console.print(mensajeT);
  delay(del);
  Console.print(mensajeH);
  delay(del);
  Console.print(mensajeN);
  delay(del);
  Console.print(mensajeL);
  delay(del);
  mensajeT = "";
  mensajeH = "";
  mensajeN = "";
  mensajeL = "";

}


