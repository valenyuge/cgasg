let columnas = 6;
let filas = 6;
let anchoCelda;
let altoCelda;

let ultimosPuntos = [];
let estadoSecuencia = [];
let coloresCeldas = [];
let lineasDesprolijas = []; // <-- ¡NUEVO! Array para guardar líneas

let minDesvio = 5;
let maxDesvio = 50;
let margenBorde = 0.3;
let probabilidadDeDibujar = 0.25;
let chanceDeNegro = 0.1;
let margenExtra = 20;

let marginX;
let marginY;

const K_KEY = 75;
const B_KEY = 66;
const J_KEY = 74; // <-- Tecla J

function setup() {
  createCanvas(800, 800);
  marginX = 50;
  marginY = 50;
  anchoCelda = (width - marginX * 2) / columnas;
  altoCelda = (height - marginY * 2) / filas;
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
  reiniciarEstado(); // Llama para establecer el estado inicial
}

function reiniciarEstado() {
  ultimosPuntos = [];
  estadoSecuencia = [];
  lineasDesprolijas = []; // <-- Limpia las líneas desprolijas

  for (let i = 0; i < filas; i++) {
    ultimosPuntos.push([]);
    estadoSecuencia.push([]);
    for (let j = 0; j < columnas; j++) {
      let xMin = marginX + j * anchoCelda;
      let yMin = marginY + i * altoCelda;
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

function agregarSegmento(i, j) {
    let xMin = marginX + j * anchoCelda;
    let yMin = marginY + i * altoCelda;
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
  background(255); // <-- ¡BORRAMOS TODO EN CADA FOTOGRAMA!

  // Dibujar grilla base
  stroke(230);
  strokeWeight(1);
  for (let i = 0; i <= filas; i++) {
    line(marginX, marginY + i * altoCelda, width - marginX, marginY + i * altoCelda);
  }
  for (let j = 0; j <= columnas; j++) {
    line(marginX + j * anchoCelda, marginY, marginX + j * anchoCelda, height - marginY);
  }

  // Dibujar cuadrados ordenados (siempre)
  strokeWeight(1.5);
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
        let colorCelda = coloresCeldas[i][j];
        stroke(colorCelda);
        let xMin = marginX + j * anchoCelda;
        let yMin = marginY + i * altoCelda;
        let xMax = xMin + anchoCelda;
        let yMax = yMin + altoCelda;
        line(xMin, yMin, xMax, yMin); line(xMax, yMin, xMax, yMax);
        line(xMax, yMax, xMin, yMax); line(xMin, yMax, xMin, yMin);
    }
  }

  // Dibujar TODAS las líneas desprolijas guardadas
  strokeWeight(1);
  for(let linea of lineasDesprolijas) {
      stroke(linea.color);
      line(linea.x1, linea.y1, linea.x2, linea.y2);
  }

  // --- LÓGICA DE TECLAS ---

  if (keyIsDown(K_KEY)) { // Añadir líneas
    for (let i = 0; i < filas; i++) {
      for (let j = 0; j < columnas; j++) {
        if (random(1) < probabilidadDeDibujar) {
            agregarSegmento(i, j);
        }
      }
    }
  }

  if (keyIsDown(J_KEY)) { // Quitar líneas
      let lineasABorrar = 10; // Borra hasta 5 líneas por fotograma
      for(let n = 0; n < lineasABorrar && lineasDesprolijas.length > 0; n++) {
        lineasDesprolijas.pop(); // Quita la última línea añadida
      }
  }

  if (keyIsDown(B_KEY)) { // Borrado total
    reiniciarEstado();
  }
}