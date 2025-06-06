let columnas; // Se declaran aquí pero se asignan en setup()
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
let chanceDeNegro = 0.1;
let margenExtra = 20;

let marginX;
let marginY;

let mic;
let fft;

let frecMinGrave = 40;
let frecMaxGrave = 800;
let umbralEnergiaGrave = 140;

let frecMinAgudo = 1500;
let frecMaxAgudo = 5000;
let umbralEnergiaAguda = 60;

let umbralAplauso = 0.4;
let ultimoTiempoAplauso = 0;
let cooldownAplauso = 500;

function setup() {
  createCanvas(800, 800);

  // --- LÓGICA PARA ELEGIR LA GRILLA ALEATORIA ---
  let dimensionesPosibles = [
    [6, 6],
    [8, 8],
    [8, 8],
    [6, 8]
  ];
  let dimensionElegida = random(dimensionesPosibles); // p5.js elige un elemento al azar del array
  filas = dimensionElegida[0];
  columnas = dimensionElegida[1];
  console.log("Grilla generada: " + filas + "x" + columnas); // Para saber cuál se eligió
  // --- FIN DE LA NUEVA LÓGICA ---

  marginX = 100;
  marginY = 100;
  anchoCelda = (width - marginX * 2) / columnas;
  altoCelda = (height - marginY * 2) / filas;
  colorMode(HSB, 360, 100, 100, 100);

  mic = new p5.AudioIn();

  fft = new p5.FFT();
  fft.setInput(mic);

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
        line(xMin, yMin, xMax, yMin); line(xMax, yMin, xMax, yMax);
        line(xMax, yMax, xMin, yMax); line(xMin, yMax, xMin, yMin);
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

    // console.log("Nivel Mic:", nivelMicGeneral.toFixed(4), "Grave:", energiaGrave, "Agudo(custom):", energiaAguda);

    if (nivelMicGeneral > umbralAplauso && millis() - ultimoTiempoAplauso > cooldownAplauso) {
      console.log("¡APLAUSO detectado! Reiniciando...");
      reiniciarEstado();
      ultimoTiempoAplauso = millis();
    } else {
      if (energiaGrave > umbralEnergiaGrave) {
        for (let i = 0; i < filas; i++) {
          for (let j = 0; j < columnas; j++) {
            if (random(1) < probabilidadDeDibujar) {
                calcularLinea(i, j);
            }
          }
        }
      }
      if (energiaAguda > umbralEnergiaAguda) {
          let lineasABorrar = 30;
          for(let n = 0; n < lineasABorrar && lineasDesprolijas.length > 0; n++) {
              lineasDesprolijas.pop();
          }
      }
    }
  }
}

function mousePressed() {
  console.log("mousePressed fue llamado.");
  userStartAudio().then(function() {
    console.log("Contexto de Audio iniciado/reanudado exitosamente por userStartAudio().");
    if (mic) {
      if (!mic.enabled) {
        mic.start(function() {
          console.log("mic.start() - ÉXITO. mic.enabled AHORA ES:", mic.enabled);
          if (mic.enabled) {
            let initialMicLevel = mic.getLevel();
            console.log("Nivel Mic INMEDIATO después de start:", initialMicLevel);
          }
        }, function(err) {
          console.error("mic.start() - ERROR:", err);
        });
      } else {
        console.log("Micrófono ya estaba habilitado (mic.enabled era true).");
        let currentMicLevel = mic.getLevel();
        console.log("Nivel Mic (ya habilitado):", currentMicLevel);
      }
    } else {
      console.error("El objeto 'mic' no está definido en mousePressed.");
    }
  }).catch(function(err) {
    console.error("Error al iniciar/reanudar el Contexto de Audio:", err);
  });
}