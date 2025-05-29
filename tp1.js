let columnas = 6;
let filas = 6;
let anchoCelda;
let altoCelda;

let ultimosPuntos = [];
let estadoSecuencia = [];
let coloresCeldas = [];
let lineasDesprolijas = []; 

let minDesvio = 5;
let maxDesvio = 50;
let margenBorde = 0.3;
let probabilidadDeDibujar = 0.25;
let chanceDeNegro = 0.1;
let margenExtra = 20;

let margenX;
let margenY;

const K_KEY = 75;
const B_KEY = 66;
const J_KEY = 74;

let mic;
let amp;

function setup() {
  createCanvas(800, 800);
  margenX = 50;
  margenY = 50;
  anchoCelda = (width - margenX * 2) / columnas;
  altoCelda = (height - margenY * 2) / filas;
  colorMode(HSB, 360, 100, 100, 100);

  for (let i = 0; i < filas; i++) {
    coloresCeldas.push([]);
    for (let j = 0; j < columnas; j++) {
      let H, S, B;
      if (random(1) < chanceDeNegro) {
        H = 0; S = 0; B = 0;
      } else {
        H = random(360); S = random(60, 100); B = random(30, 98);
      }
      coloresCeldas[i].push(color(H, S, B, 90));
    }
  }
  reiniciarEstado(); 
}

function reiniciarEstado() {
  ultimosPuntos = [];
  estadoSecuencia = [];
  lineasDesprolijas = []; 

  for (let i = 0; i < filas; i++) {
    ultimosPuntos.push([]);
    estadoSecuencia.push([]);
    for (let j = 0; j < columnas; j++) {
      let xMin = margenX + j * anchoCelda;
      let yMin = margenY + i * altoCelda;
      let xMax = xMin + anchoCelda;
      let yMax = yMin + altoCelda;
      let r = floor(random(4));
      if (r === 0) { ultimosPuntos[i].push({ x: xMin, y: yMin }); }
      else if (r === 1) { ultimosPuntos[i].push({ x: xMax, y: yMin }); }
      else if (r === 2) { ultimosPuntos[i].push({ x: xMin, y: yMax }); }
      else { ultimosPuntos[i].push({ x: xMax, y: yMax }); }
      estadoSecuencia[i].push(floor(random(4)));
    }
  }
}

function calcularLinea(i, j) {
    let xMin = margenX + j * anchoCelda;
    let yMin = margenY + i * altoCelda;
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

    lineasDesprolijas.push({
        x1: puntoActual.x, y1: puntoActual.y,
        x2: nuevoX, y2: nuevoY,
        color: coloresCeldas[i][j]
    });

    ultimosPuntos[i][j] = { x: nuevoX, y: nuevoY };
    estadoSecuencia[i][j] = (paso + 1) % 4;
}

function draw() {
  background(255); 
  amp = mic.getLevel();

  // Dibuja grilla 
  stroke(230);
  strokeWeight(1);
  for (let i = 0; i <= filas; i++) {
    line(margenX, margenY + i * altoCelda, width - margenX, margenY + i * altoCelda);
  }
  for (let j = 0; j <= columnas; j++) {
    line(margenX + j * anchoCelda, margenY, margenX + j * anchoCelda, height - margenY);
  }

  // Dibuja cuadrados ordenados 
  strokeWeight(1.5);
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
        let colorCelda = coloresCeldas[i][j];
        stroke(colorCelda);
        let xMin = margenX + j * anchoCelda;
        let yMin = margenY + i * altoCelda;
        let xMax = xMin + anchoCelda;
        let yMax = yMin + altoCelda;
        line(xMin, yMin, xMax, yMin); line(xMax, yMin, xMax, yMax);
        line(xMax, yMax, xMin, yMax); line(xMin, yMax, xMin, yMin);
    }
  }

  // Dibuja las líneas desprolijas 
  strokeWeight(1);
  for(let linea of lineasDesprolijas) {
      stroke(linea.color);
      line(linea.x1, linea.y1, linea.x2, linea.y2);
  }

// Botones

  if (keyIsDown(K_KEY)) { // Agregar líneas
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        if (random(1) < probabilidadDeDibujar) {
            calcularLinea(i, j);
        }
      }
    }
  }

  if (keyIsDown(J_KEY)) { // Borrar lineas
      let lineasABorrar = 50; 
      for(let n = 0; n < lineasABorrar && lineasDesprolijas.length > 0; n++) {
        lineasDesprolijas.pop(); 
      }
  }

  if (keyIsDown(B_KEY)) { // Vuelve al inicio
    reiniciarEstado();
  }
}