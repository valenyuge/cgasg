let columnas;
let filas;
let anchoCelda;
let altoCelda;

let ultimosPuntos = [];
let estadoSecuencia = [];
let coloresCeldas = [];
let lineasDesprolijas = [];
let conteoLineasPorCelda = [];

let maxLineasPorCelda = 80;
let minDesvio = 5;
let maxDesvio = 50;
let margenBorde = 0.3;
let margenExtra = 20;
let probabilidadDeDibujar = 0.4;
let dibujarCuadradosBase;
let modoMapeoVoz; 

let marginX;
let marginY;

let mic;
let pitch;
let audioContext;
let fft;

let frecuencia = 0;
let frecuenciaSuavizada = 0;
let amortiguacionFrec = 0.8;

// Parámetros de Control
let frecMinVoz = 80;
let frecMaxVoz = 300;
let ampMin = 0.01;
let frecMinSilbido = 1200;

let umbralGraveParaAplauso = 180;
let umbralAgudoParaAplauso = 30;
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
    mic.start(iniciarDeteccion, (err) => {
      console.error(err);
    });
  }
}

function iniciarDeteccion() {
  const modelURL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
  pitch = ml5.pitchDetection(modelURL, audioContext, mic.stream, modeloCargado);
  fft = new p5.FFT();
  fft.setInput(mic);
}

function modeloCargado() {
  obtenerTono();
}

function obtenerTono() {
  pitch.getPitch(function(err, freq) {
    frecuencia = freq || 0;
    frecuenciaSuavizada = frecuenciaSuavizada * amortiguacionFrec + frecuencia * (1 - amortiguacionFrec);
    obtenerTono();
  });
}

function reconfigurarYReiniciarGrilla() {
  let dimensionesPosibles = [[6, 6], [8, 8], [6, 8], [6, 10]];
  let dimensionElegida = random(dimensionesPosibles);
  filas = dimensionElegida[0];
  columnas = dimensionElegida[1];
  
  dibujarCuadradosBase = random(1) < 0.5;

  modoMapeoVoz = floor(random(2)); 
  
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
  ultimosPuntos = [];
  estadoSecuencia = [];
  lineasDesprolijas = [];
  conteoLineasPorCelda = [];

  for (let i = 0; i < filas; i++) {
    coloresCeldas.push([]);
    ultimosPuntos.push([]);
    estadoSecuencia.push([]);
    conteoLineasPorCelda.push([]);

    for (let j = 0; j < columnas; j++) {
      coloresCeldas[i].push(random(recetasDeColor)());
      conteoLineasPorCelda[i].push(0);

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
    
    if (conteoLineasPorCelda[i][j] >= maxLineasPorCelda) {
        const indiceABorrar = lineasDesprolijas.findIndex(linea => linea.i === i && linea.j === j);
        if (indiceABorrar !== -1) {
            lineasDesprolijas.splice(indiceABorrar, 1);
            conteoLineasPorCelda[i][j]--;
        }
    }

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
        color: coloresCeldas[i][j],
        i: i,
        j: j
    });
    conteoLineasPorCelda[i][j]++;

    ultimosPuntos[i][j] = { x: nuevoX, y: nuevoY };
    estadoSecuencia[i][j] = (paso + 1) % 4;
}

function draw() {
  background(255);
  
  if (dibujarCuadradosBase) {
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
  }

  strokeWeight(1);
  for(let linea of lineasDesprolijas) {
      stroke(linea.color);
      line(linea.x1, linea.y1, linea.x2, linea.y2);
  }

  if (mic && mic.enabled && pitch && fft) {
    fft.analyze();
    let energiaGrave = fft.getEnergy(40, 800);
    let energiaAguda = fft.getEnergy(1500, 5000);
    
    if (energiaGrave > umbralGraveParaAplauso && energiaAguda > umbralAgudoParaAplauso && millis() - ultimoTiempoAplauso > cooldownAplauso) {
      reconfigurarYReiniciarGrilla();
      ultimoTiempoAplauso = millis();
    } else if (frecuenciaSuavizada > frecMinSilbido) {
        let lineasABorrar = 30;
        for (let n = 0; n < lineasABorrar; n++) {
            if (lineasDesprolijas.length > 0) {
                let lineaBorrada = lineasDesprolijas.pop();
                if (lineaBorrada) {
                    conteoLineasPorCelda[lineaBorrada.i][lineaBorrada.j]--;
                }
            }
        }
    } else if (mic.getLevel() > ampMin && frecuenciaSuavizada > frecMinVoz && frecuenciaSuavizada < frecMaxVoz) {
      
      let frecMedia = frecMinVoz + (frecMaxVoz - frecMinVoz) / 2;
      
      if (modoMapeoVoz === 0) {
        let numColumnasCentrales;
        if (columnas === 6) { numColumnasCentrales = 2; } else { numColumnasCentrales = 4; }

        if (frecuenciaSuavizada < frecMedia) {
          let indiceInicioCentral = (columnas - numColumnasCentrales) / 2;
          for (let j = indiceInicioCentral; j < indiceInicioCentral + numColumnasCentrales; j++) {
              for (let i = 0; i < filas; i++) {
                  if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
              }
          }
        } else {
          let numColumnasLaterales = (columnas - numColumnasCentrales) / 2;
          for (let j = 0; j < numColumnasLaterales; j++) {
              for (let i = 0; i < filas; i++) {
                  if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
              }
          }
          for (let j = columnas - numColumnasLaterales; j < columnas; j++) {
              for (let i = 0; i < filas; i++) {
                  if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
              }
          }
        }
      } else {

        let numFilasCentrales;
        if (filas === 6) { numFilasCentrales = 2; } else { numFilasCentrales = 4; }
        
        if (frecuenciaSuavizada < frecMedia) {
            let indiceInicioCentral = (filas - numFilasCentrales) / 2;
            for (let i = indiceInicioCentral; i < indiceInicioCentral + numFilasCentrales; i++) {
                for (let j = 0; j < columnas; j++) {
                    if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
                }
            }
        } else {
            let numFilasLaterales = (filas - numFilasCentrales) / 2;
            for (let i = 0; i < numFilasLaterales; i++) {
                for (let j = 0; j < columnas; j++) {
                    if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
                }
            }
            for (let i = filas - numFilasLaterales; i < filas; i++) {
                for (let j = 0; j < columnas; j++) {
                    if (random(1) < probabilidadDeDibujar) { calcularLinea(i, j); }
                }
            }
        }
      }
    }
  }
}