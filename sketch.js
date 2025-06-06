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
let probabilidadDeDibujar = 0.2;
let margenExtra = 20;

let marginX;
let marginY;

let mic;
let fft;

// Estos son los valores que vamos a configurar
let frecMinGrave = 40;
let frecMaxGrave = 800;
let umbralEnergiaGrave = 120;

let frecMinAgudo = 1500;
let frecMaxAgudo = 5000;
let umbralEnergiaAguda = 25;

let umbralAplauso = 0.25;
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
  mic = new p5.AudioIn();
  fft = new p5.FFT();
  fft.setInput(mic);
  reconfigurarYReiniciarGrilla();
}

function reconfigurarYReiniciarGrilla() {
  let dimensionesPosibles = [[6, 6], [8, 8], [6, 8]];
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
  background(255);

  stroke(230);
  strokeWeight(1);
  for (let i = 0; i <= filas; i++) {
    line(marginX, marginY + i * altoCelda, width - marginX, marginY + i * altoCelda);
  }
  for (let j = 0; j <= columnas; j++) {
    line(marginX + j * anchoCelda, marginY, marginX + j * anchoCelda, height - marginY);
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
        line(xMin, yMin, xMax, yMin);
        line(xMax, yMin, xMax, yMax);
        line(xMax, yMax, xMin, yMax);
        line(xMin, yMax, xMin, yMin);
    }
  }

  strokeWeight(1);
  for(let linea of lineasDesprolijas) {
      stroke(linea.color);
      line(linea.x1, linea.y1, linea.x2, linea.y2);
  }

  if (mic && mic.enabled) {
    let nivelMicGeneral = mic.getLevel();
    fft.analyze();
    let energiaGrave = fft.getEnergy(frecMinGrave, frecMaxGrave);
    let energiaAguda = fft.getEnergy(frecMinAgudo, frecMaxAgudo);

    // Esta es la línea que necesitas para testear
    console.log("Nivel Mic:", nivelMicGeneral.toFixed(4), "Grave:", energiaGrave, "Agudo:", energiaAguda);

    if (nivelMicGeneral > umbralAplauso && millis() - ultimoTiempoAplauso > cooldownAplauso) {
      reconfigurarYReiniciarGrilla();
      ultimoTiempoAplauso = millis();
    } else if (energiaGrave > umbralEnergiaGrave) {
      for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
          if (random(1) < probabilidadDeDibujar) {
              calcularLinea(i, j);
          }
        }
      }
    } else if (energiaAguda > umbralEnergiaAguda) {
        let lineasABorrar = 30;
        for(let n = 0; n < lineasABorrar && lineasDesprolijas.length > 0; n++) {
            lineasDesprolijas.pop();
        }
    }
  }
}

function mousePressed() {
  userStartAudio().then(function() {
    if (mic) {
      if (!mic.enabled) {
        mic.start(() => {}, (err) => { console.error(err); });
      }
    }
  }).catch(function(err) {
    console.error("Error al iniciar/reanudar el Contexto de Audio:", err);
  });
}