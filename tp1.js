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

      stroke(0);
      strokeWeight(1);
      fill(255);

      rect(x, y, anchoCelda, altoCelda);
    }
  }
}

function draw() {

}