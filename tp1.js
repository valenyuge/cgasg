let columnas = 6;
let filas = 6;
let anchoCelda;
let altoCelda;

function setup() {
  createCanvas(600, 600);
  anchoCelda = width / columnas;
  altoCelda = height / filas;
  background(220);

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      let x = j * anchoCelda;
      let y = i * altoCelda;

      let centroX = x + anchoCelda / 2;
      let centroY = y + altoCelda / 2;

      stroke(0);
      strokeWeight(2);
      noFill();

      ellipse(centroX, centroY, 15, 15);
    }
  }
}

function draw() {

}