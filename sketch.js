let columnas;
let filas;
let anchoCelda;
let altoCelda;

let ultimosPuntos = [];
let estadoSecuencia = [];
let coloresCeldas = [];
let lineasDesprolijas = [];

let minDesvio = 5;
let maxDesvio = 50;
let margenBorde = 0.3;
let margenExtra = 20;

let marginX;
let marginY;

let mic;
let pitch;
let audioContext;

let frecuencia = 0;

let frecMinVoz = 80;
let frecMaxVoz = 480;
let ampMin = 0.01;
let frecMinSilbido = 1200;

let umbralAplauso = 0.3;
let ultimoTiempoAplauso = 0;
let cooldownAplauso = 500;

const recetasDeColor = [
  () => { return color('#342A2A'); },
  () => { return color('#412A25'); },
  () => { return color('#1F5A9A'); },
  () => { return color('#CE6D3C'); },
  () => { return color('#B13348'); },
  () => { return color('#C77BAA'); },
  () => { return color('#31A091'); },
  () => { return color('#7155A2'); }
];

function setup() {
  createCanvas(800, 800);
  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  reconfigurarYReiniciarGrilla();
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  if (mic && !mic.enabled) {
    mic.start(iniciarModeloML5, (err) => {
      console.error(err);
    });
  }
}

function iniciarModeloML5() {
  const modelURL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  pitch = ml5.pitchDetection(modelURL, audioContext, mic.stream, modeloCargado);
}

function modeloCargado() {
  obtenerTono();
}

function obtenerTono() {
  pitch.getPitch(function(err, freq) {
    frecuencia = freq || 0;
    obtenerTono();
  });
}

function reconfigurarYReiniciarGrilla() {
  let dimensionesPosibles = [[6, 6], [8, 8], [6, 8], [6, 10]];
  let dimensionElegida = random(dimensionesPosibles);
  filas = dimensionElegida[0];
  columnas = dimensionElegida[1];

  let marginX_inicial = 100;
  let marginY_inicial = 100;
  let areaDibujoAncho = width - marginX_inicial * 2;
  let areaDibujoAlto = height - marginY_inicial * 2;
  let tamanoCelda = min(areaDibujoAncho / columnas, areaDibujoAlto / filas);
  anchoCelda = tamanoCelda;
  altoCelda = tamanoCelda;
  let anchoTotalGrilla = columnas * anchoCelda;
  let altoTotalGrilla = filas * altoCelda;
  marginX = marginX_inicial + (areaDibujoAncho - anchoTotalGrilla) / 2;
  marginY = marginY_inicial + (areaDibujoAlto - altoTotalGrilla) / 2;

  coloresCeldas = [];
  for (let i = 0; i < filas; i++) {
    coloresCeldas.push([]);
    for (let j = 0; j < columnas; j++) {
      let recetaAleatoria = random(recetasDeColor);
      let colorGenerado = recetaAleatoria();
      coloresCeldas[i].push(colorGenerado);
    }
  }
  
  ultimosPuntos = [];
  estadoSecuencia = [];
  lineasDesprolijas = [];
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

function calcularLinea(i, j) {
    if (i < 0 || i >= filas || j < 0 || j >= columnas) { return; }
    let xMin = marginX + j * anchoCelda;
    let yMin = marginY + i * altoCelda;
    let xMax = xMin + anchoCelda;
    let yMax = yMin + altoCelda;
    let puntoActual = ultimosPuntos[i][j];
    let paso = estadoSecuencia[i][j];
    let nuevoX, nuevoY;
    let desvioActual = random(minDesvio, maxDesvio);
    switch (paso) {
        case 0: nuevoX = random(xMax - anchoCelda * margenBorde, xMax + margenExtra); nuevoY = puntoActual.y + random(-desvioActual, desvioActual); break;
        case 1: nuevoY = random(yMax - altoCelda * margenBorde, yMax + margenExtra); nuevoX = puntoActual.x + random(-desvioActual, desvioActual); break;
        case 2: nuevoX = random(xMin - margenExtra, xMin + anchoCelda * margenBorde); nuevoY = puntoActual.y + random(-desvioActual, desvioActual); break;
        case 3: nuevoY = random(yMin - margenExtra, yMin + altoCelda * margenBorde); nuevoX = puntoActual.x + random(-desvioActual, desvioActual); break;
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
  stroke(230);
  strokeWeight(1);
  for (let i = 0; i <= filas; i++) {
    line(marginX, marginY + i * altoCelda, marginX + columnas * anchoCelda, marginY + i * altoCelda);
  }
  for (let j = 0; j <= columnas; j++) {
    line(marginX + j * anchoCelda, marginY, marginX + j * anchoCelda, marginY + filas * altoCelda);
  }
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
  strokeWeight(1);
  for(let linea of lineasDesprolijas) {
      stroke(linea.color);
      line(linea.x1, linea.y1, linea.x2, linea.y2);
  }

  if (mic && mic.enabled && pitch) {
    let nivelMicGeneral = mic.getLevel();
    
    if (nivelMicGeneral > umbralAplauso && millis() - ultimoTiempoAplauso > cooldownAplauso) {
      reconfigurarYReiniciarGrilla();
      ultimoTiempoAplauso = millis();
    } else if (frecuencia > frecMinSilbido) {
        let lineasABorrar = 30;
        for(let n = 0; n < lineasABorrar && lineasDesprolijas.length > 0; n++) {
            lineasDesprolijas.pop();
        }
    } else if (nivelMicGeneral > ampMin && frecuencia > frecMinVoz && frecuencia < frecMaxVoz) {
      
      let numColumnasCentrales;
      if (columnas === 6) {
        numColumnasCentrales = 2;
      } else { 
        numColumnasCentrales = 4;
      }

      let frecMedia = frecMinVoz + (frecMaxVoz - frecMinVoz) / 2;
      let centroX = (columnas - 1) / 2;
      let colDestino;

      if (frecuencia < frecMedia) {
        let indiceInicioCentral = (columnas - numColumnasCentrales) / 2;
        colDestino = floor(random(indiceInicioCentral, indiceInicioCentral + numColumnasCentrales));
      } else {
        let numColumnasLaterales = (columnas - numColumnasCentrales) / 2;
        if (random(1) < 0.5) { 
          colDestino = floor(random(0, numColumnasLaterales));
        } else {
          colDestino = floor(random(columnas - numColumnasLaterales, columnas));
        }
      }
      
      for (let i = 0; i < filas; i++) {
          calcularLinea(i, colDestino);
      }
    }
  }
}