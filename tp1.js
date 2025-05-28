let columnas = 6;
let filas = 6;
let anchoCelda;
let altoCelda;

let ultimosPuntos = [];
let estadoSecuencia = [];
let coloresCeldas = [];

let minDesvio = 5;
let maxDesvio = 25;
let margenBorde = 0.3;
let probabilidadDeDibujar = 0.15;
let chanceDeNegro = 0.1;
let margenExtra = 20; 

function setup() {
  createCanvas(600, 600);
  anchoCelda = width / columnas;
  altoCelda = height / filas;
  background(255);
  colorMode(HSB, 360, 100, 100, 100);

  stroke(230); 
  strokeWeight(1);
  for (let i = 0; i <= filas; i++) {
    line(0, i * altoCelda, width, i * altoCelda);
  }
  for (let j = 0; j <= columnas; j++) {
    line(j * anchoCelda, 0, j * anchoCelda, height);
  }

  for (let i = 0; i < filas; i++) {
    ultimosPuntos.push([]);
    estadoSecuencia.push([]);
    coloresCeldas.push([]);
    for (let j = 0; j < columnas; j++) {
      let xMin = j * anchoCelda;
      let yMin = i * altoCelda;
      let xMax = xMin + anchoCelda;
      let yMax = yMin + altoCelda;

      let startX, startY;
      let r = floor(random(4));

      if (r === 0) {
        startX = xMin;
        startY = yMin;
      } else if (r === 1) {
        startX = xMax;
        startY = yMin;
      } else if (r === 2) {
        startX = xMin;
        startY = yMax;
      } else {
        startX = xMax;
        startY = yMax;
      }

      ultimosPuntos[i].push({ x: startX, y: startY });
      estadoSecuencia[i].push(floor(random(4)));

      let H, S, B;
      if (random(1) < chanceDeNegro) {
          H = 0;
          S = 0;
          B = 0;
      } else {
          H = random(360);
          S = random(60, 100);
          B = random(30, 98);
      }
      coloresCeldas[i].push(color(H, S, B, 80));
    }
  }
}

function draw() {
  if (keyIsPressed === true) {
    strokeWeight(1);

    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {

        if (random(1) < probabilidadDeDibujar) {

          let colorCelda = coloresCeldas[i][j];
          stroke(colorCelda);

          let xMin = j * anchoCelda;
          let yMin = i * altoCelda;
          let xMax = xMin + anchoCelda;
          let yMax = yMin + altoCelda;

          let puntoActual = ultimosPuntos[i][j];
          let paso = estadoSecuencia[i][j];
          let nuevoX, nuevoY;
          let desvioActual = random(minDesvio, maxDesvio);

          switch (paso) {
            case 0: 
              nuevoX = random(xMax - anchoCelda * margenBorde, xMax + margenExtra); 
              nuevoY = puntoActual.y + random(-desvioActual, desvioActual); 
              break;
            case 1: 
              nuevoY = random(yMax - altoCelda * margenBorde, yMax + margenExtra); 
              nuevoX = puntoActual.x + random(-desvioActual, desvioActual); 
              break;
            case 2: 
              nuevoX = random(xMin - margenExtra, xMin + anchoCelda * margenBorde); 
              nuevoY = puntoActual.y + random(-desvioActual, desvioActual); 
              break;
            case 3: 
              nuevoY = random(yMin - margenExtra, yMin + altoCelda * margenBorde); 
              nuevoX = puntoActual.x + random(-desvioActual, desvioActual); 
              break;
          }

          line(puntoActual.x, puntoActual.y, nuevoX, nuevoY);

          ultimosPuntos[i][j] = { x: nuevoX, y: nuevoY };
          estadoSecuencia[i][j] = (paso + 1) % 4;
        }
      }
    }
  }
}