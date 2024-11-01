window.requestAnimationFrame =
window.__requestAnimationFrame ||
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
(function () {
  return function (callback, elemento) {
    let ultimoTiempo = elemento.__ultimoTiempo;
    if (ultimoTiempo === undefined) {
      ultimoTiempo = 0;
    }
    let tiempoActual = Date.now();
    let tiempoParaLlamar = Math.max(1, 33 - (tiempoActual - ultimoTiempo));
    window.setTimeout(callback, tiempoParaLlamar);
    elemento.__ultimoTiempo = tiempoActual + tiempoParaLlamar;
  };
})();

// Verifica si el dispositivo es móvil
window.esDispositivo = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(((navigator.userAgent || navigator.vendor || window.opera)).toLowerCase()));

let cargado = false;
let iniciar = function () {
  if (cargado) return;
  cargado = true;
  let movil = window.esDispositivo;
  let koef = movil ? 0.5 : 1;
  let lienzo = document.getElementById('heart');
  let ctx = lienzo.getContext('2d');
  let ancho = lienzo.width = koef * innerWidth;
  let alto = lienzo.height = koef * innerHeight;
  let aleatorio = Math.random;

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, ancho, alto);

  // Posición del corazón
  let posicionCorazon = function (rad) {
    return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
  };

  // Escala y traducción
  let escalarYTraducir = function (pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  };

  // Ajustar tamaño en caso de redimensionar la ventana
  window.addEventListener('resize', function () {
    ancho = lienzo.width = koef * innerWidth;
    alto = lienzo.height = koef * innerHeight;
    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, ancho, alto);
  });

  let cantidadRastro = movil ? 20 : 50;
  let puntosOrigen = [];
  let i;
  let dr = movil ? 0.3 : 0.1;
  for (i = 0; i < Math.PI * 2; i += dr) puntosOrigen.push(escalarYTraducir(posicionCorazon(i), 210, 13, 0, 0));
  for (i = 0; i < Math.PI * 2; i += dr) puntosOrigen.push(escalarYTraducir(posicionCorazon(i), 150, 9, 0, 0));
  for (i = 0; i < Math.PI * 2; i += dr) puntosOrigen.push(escalarYTraducir(posicionCorazon(i), 90, 5, 0, 0));
  let cantidadPuntosCorazon = puntosOrigen.length;

  let puntosObjetivo = [];
  let pulso = function (kx, ky) {
    for (i = 0; i < puntosOrigen.length; i++) {
      puntosObjetivo[i] = [];
      puntosObjetivo[i][0] = kx * puntosOrigen[i][0] + ancho / 2;
      puntosObjetivo[i][1] = ky * puntosOrigen[i][1] + alto / 2;
    }
  };

  let e = [];
  for (i = 0; i < cantidadPuntosCorazon; i++) {
    let x = aleatorio() * ancho;
    let y = aleatorio() * alto;
    e[i] = {
      vx: 0,
      vy: 0,
      R: 2,
      velocidad: aleatorio() + 5,
      q: ~~(aleatorio() * cantidadPuntosCorazon),
      D: 2 * (i % 2) - 1,
      fuerza: 0.2 * aleatorio() + 0.7,
      f: "hsla(0," + ~~(40 * aleatorio() + 60) + "%," + ~~(60 * aleatorio() + 20) + "%,.3)",
      rastro: []
    };
    for (let k = 0; k < cantidadRastro; k++) e[i].rastro[k] = { x: x, y: y };
  }

  let configuracion = {
    trazoK: 0.4,
    deltaTiempo: 0.01
  };

  let tiempo = 0;
  let bucle = function () {
    let n = -Math.cos(tiempo);
    pulso((1 + n) * .5, (1 + n) * .5);
    tiempo += ((Math.sin(tiempo)) < 0 ? 9 : (n > 0.8) ? .2 : 1) * configuracion.deltaTiempo;
    ctx.fillStyle = "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, ancho, alto);
    for (i = e.length; i--;) {
      var u = e[i];
      var q = puntosObjetivo[u.q];
      var dx = u.rastro[0].x - q[0];
      var dy = u.rastro[0].y - q[1];
      var longitud = Math.sqrt(dx * dx + dy * dy);
      if (10 > longitud) {
        if (0.95 < aleatorio()) {
          u.q = ~~(aleatorio() * cantidadPuntosCorazon);
        } else {
          if (0.99 < aleatorio()) {
            u.D *= -1;
          }
          u.q += u.D;
          u.q %= cantidadPuntosCorazon;
          if (0 > u.q) {
            u.q += cantidadPuntosCorazon;
          }
        }
      }
      u.vx += -dx / longitud * u.velocidad;
      u.vy += -dy / longitud * u.velocidad;
      u.rastro[0].x += u.vx;
      u.rastro[0].y += u.vy;
      u.vx *= u.fuerza;
      u.vy *= u.fuerza;
      for (k = 0; k < u.rastro.length - 1;) {
        let T = u.rastro[k];
        let N = u.rastro[++k];
        N.x -= configuracion.trazoK * (N.x - T.x);
        N.y -= configuracion.trazoK * (N.y - T.y);
      }
      ctx.fillStyle = u.f;
      for (k = 0; k < u.rastro.length; k++) {
        ctx.fillRect(u.rastro[k].x, u.rastro[k].y, 1, 1);
      }
    }
    ctx.fillStyle = "rgba(255,255,255,1)";
    for (i = u.rastro.length + 13; i--;) ctx.fillRect(puntosObjetivo[i][0], puntosObjetivo[i][1], 2, 2);

    window.requestAnimationFrame(bucle, lienzo);
  };
  bucle();
};

let estado = document.readyState;
if (estado === 'complete' || estado === 'loaded' || estado === 'interactive') iniciar();
else document.addEventListener('DOMContentLoaded', iniciar, false);
