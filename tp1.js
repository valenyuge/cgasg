let columnas = 6;
let filas = 6;

function setup() {
    createCanvas(width, height);
    background(255);
    stroke(0);
    strokeWeight(1);
for (let i = 0; i <= columnas; i++) {
    let x = (width / columnas) * i;
    line (x, 0, x, height);
}
for (let i = 0; i <= filas; i++) {
    // Calculamos la posición Y directamente aquí
    let y = (height / filas) * i;
    line(0, y, width, y);
  }
}