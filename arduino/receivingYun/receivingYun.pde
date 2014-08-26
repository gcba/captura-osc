import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import java.io.*;
import oscP5.*;
import netP5.*;


String user = "root";
String password = "isabel09";
String host = "arduino.local";
int port=22;

//Variables OSC
OscP5 oscP5;
NetAddress myRemoteLocation;
int portOsc=3000;
String ip="10.92.28.197";

//////Create instances
JSch jsch;
Session session;
Channel channel;
DataOutputStream dataOut;
InputStream in;

boolean prendido= false;
int timerPrendido=0;
int timerApagado=0;

int ARRAY_SIZE= 4;
int end=10;
String ss;
String headerT="A";
String tailT="B";
String mensajeT="";

String headerH="C";
String tailH="D";
String mensajeH="";


String headerN="E";
String tailN="F";
String mensajeN="";


String headerL="G";
String tailL="H";
String mensajeL="";

void setup() {
  size(100, 100);
  oscP5 = new OscP5(this, portOsc);
  myRemoteLocation = new NetAddress("127.0.0.1", portOsc);

  try {
    jsch = new JSch();
    session = jsch.getSession(user, host, port);
    session.setPassword(password);
    session.setConfig("StrictHostKeyChecking", "no");  // less than maximally secure
    System.out.println("Establishing Connection...");
    session.connect();
    System.out.println("Connection established.");


    // this stream will be used to send data to the Yun
    channel = session.openChannel("exec");
    channel.setInputStream(null);

    // this jsch member class provides remote execution of a shell command
    ((ChannelExec) channel).setCommand("telnet localhost 6571");
    // see <a href="http://arduino.cc/en/Guide/ArduinoYun#toc17" target="_blank" rel="nofollow">http://arduino.cc/en/Guide/ArduinoYun#toc17</a> for why this command
    dataOut = new DataOutputStream(channel.getOutputStream());
    ((ChannelExec)channel).setErrStream(System.err);

    /*
    java.util.Properties config = new java.util.Properties(); 
     config.put("StrictHostKeyChecking", "no");
     session.setConfig(config);
     */
    // after configuring all channel parameters, we connect, causing the
    // command to be executed. Results and further input will be handled
    // by the streams
    in=channel.getInputStream();
    channel.connect();
  }
  catch(Exception e) {
    System.err.print(e);
  }

  timerApagado=millis();
}


void draw() {
  background(255, 22, 100);
  byte[] tmp=new byte[1024];


  try {
    while (in.available ()>0) {


      int i=in.read(tmp, 0, 1024);
      if (i<0)break;
      String s=new String(tmp, 0, i);
      //  println(s);


      if (s != null) {
        String ss=trim(s);
        String recibido=ss;
        boolean tieneTailT=false;
        boolean tieneTailH=false;
        boolean tieneTailN=false;
        boolean tieneTailL=false;
        // println("Recibido: "+recibido);
        String parseado="";
        //  println(str(recibido.charAt(0)));

        if (str(recibido.charAt(0)).equals(headerT) ) {

          for (int j=1;j<recibido.length();j++) {
            if ( str(recibido.charAt(j)).equals(tailT) ) {
              j=recibido.length();
              tieneTailT=true;
            }
            else {
              parseado+=str(recibido.charAt(j));
            }
          }
          //OSC
          OscMessage myMessageT = new OscMessage("/sensor_0");

          myMessageT.add(Integer.parseInt(parseado));
          oscP5.send(myMessageT, myRemoteLocation);
          println("      Temp: "+parseado);
        }
        else if (str(recibido.charAt(0)).equals(headerH)) {

          for (int j=1;j<recibido.length();j++) {
            if ( str(recibido.charAt(j)).equals(tailH) ) {
              j=recibido.length();
              tieneTailH=true;
            }
            else {
              parseado+=str(recibido.charAt(j));
            }
          }
          //OSC
          OscMessage myMessageH = new OscMessage("/sensor_1");

          myMessageH.add(Integer.parseInt(parseado));
          oscP5.send(myMessageH, myRemoteLocation);

           println("      Hum: "+parseado);
        }

        else if (str(recibido.charAt(0)).equals(headerN)) {

          for (int j=1;j<recibido.length();j++) {
            if ( str(recibido.charAt(j)).equals(tailN) ) {
              j=recibido.length();
              tieneTailN=true;
            }
            else {
              parseado+=str(recibido.charAt(j));
            }
          }
          //OSC
          OscMessage myMessageN = new OscMessage("/sensor_2");

          myMessageN.add(Integer.parseInt(parseado));
          oscP5.send(myMessageN, myRemoteLocation);
            println("      Noise: "+parseado);
        }

        else if (str(recibido.charAt(0)).equals(headerL)) {

          for (int j=1;j<recibido.length();j++) {
            if ( str(recibido.charAt(j)).equals(tailL) ) {
              j=recibido.length();
              tieneTailL=true;
            }
            else {
              parseado+=str(recibido.charAt(j));
            }
          }
          //OSC
          OscMessage myMessageL = new OscMessage("/sensor_3");

          myMessageL.add(Integer.parseInt(parseado));
          oscP5.send(myMessageL, myRemoteLocation);
          println("      Light: "+parseado);
        }
      }
    }
  }
  catch(Exception IOException) {
    System.err.print(IOException);
  }
  if (channel.isClosed()) {
    System.out.println("exit-status: "+channel.getExitStatus());
    //      break;
    //}
  }






  //try {
  //  // if used with the Console example code, this will blink the LED
  //  // in time with polling events
  //
  //  if (prendido) {
  //    if (( millis()-timerPrendido )>1000) {
  //      dataOut.writeBytes("L\n");
  //      dataOut.flush();
  //      timerApagado=millis();
  //      prendido=false;
  //      println("apaga!");
  //    }
  //  }
  //  else {
  //    if (( millis()-timerApagado)>1000) {
  //      dataOut.writeBytes("H\n");
  //      dataOut.flush();
  //      timerPrendido=millis();
  //      prendido=true;
  //      println("prende!");
  //    }
  //  }
  //}
  //catch(Exception ee) {
  //  System.err.print(ee);
  //}
}

void mousePressed() {
  /* in the following different ways of creating osc messages are shown by example */
  OscMessage myMessage = new OscMessage("/test");

  myMessage.add(123); /* add an int to the osc message */
  myMessage.add(12.34); /* add a float to the osc message */
  myMessage.add("some text"); /* add a string to the osc message */
  myMessage.add(new byte[] {
    0x00, 0x01, 0x10, 0x20
  }
  ); /* add a byte blob to the osc message */
  myMessage.add(new int[] {
    1, 2, 3, 4
  }
  ); /* add an int array to the osc message */

  /* send the message */
  oscP5.send(myMessage, myRemoteLocation);
}


void stop() {
  System.out.println("disconnecting...\n");
  channel.disconnect();
  session.disconnect();
  System.out.println("Finished.\n");
}

