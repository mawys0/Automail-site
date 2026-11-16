/* Automail – animowane tło (czysty JavaScript + canvas, bez żadnych bibliotek).
   Wstaw na stronę: ten skrypt przed zamknięciem body.
   Warstwy (wszystkie za treścią strony):
   1) duże, rozmyte kulki-gradienty różowo-niebieskie (lekki parallax od myszki)
   2) drobne mrugające iskierki płynące w górę */
(function () {
  "use strict";
  var BLOB_COLORS = [[255, 158, 203], [255, 180, 216], [255, 143, 185], [158, 197, 255], [184, 211, 255], [143, 180, 255], [217, 192, 255]];
  var SPARK_COLORS = [[255, 255, 255], [255, 209, 230], [201, 222, 253], [230, 214, 255]];

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };

  // Warstwa leży za treścią (z-index:-1), więc tło <body> by ją przykryło – przenosimy kolor tła na <html>.
  (function fixBackground() {
    var clear = function (c) { return c === "transparent" || /rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(c); };
    var bc = getComputedStyle(document.body).backgroundColor, hc = getComputedStyle(document.documentElement).backgroundColor;
    if (!clear(bc)) {
      if (clear(hc)) document.documentElement.style.backgroundColor = bc;
      document.body.style.backgroundColor = "transparent";
    } else if (clear(hc)) document.documentElement.style.backgroundColor = "#ffffff9a";
    document.body.style.backgroundImage = document.body.style.backgroundImage || "none";
  })();

  var back = document.createElement("canvas");   // kulki + iskierki
  back.setAttribute("aria-hidden", "true");
  back.style.cssText = "position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none;";
  document.body.insertBefore(back, document.body.firstChild);
  var bx = back.getContext("2d");

  var W = 0, H = 0, DPR = 1;
  var blobs = [], sparks = [];
  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    back.width = Math.round(W * DPR); back.height = Math.round(H * DPR);
    build();
  }

  function build() {
    var small = W < 700;
    blobs = [];
    for (var i = 0; i < (small ? 10 : 18); i++) {
      var col = BLOB_COLORS[i % BLOB_COLORS.length];
      blobs.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(small ? 100 : 150, small ? 230 : 340), col: col, a: rnd(0.35, 0.7),
        vx: rnd(-14, 14), vy: rnd(-14, 14), ph: rnd(0, 6.28), ps: rnd(0.15, 0.4), depth: rnd(0.15, 1) });
    }
    sparks = [];
    for (var j = 0; j < (small ? 30 : 75); j++) sparks.push(newSpark(true));
  }

  function newSpark(init) {
    return { x: rnd(0, W), y: init ? rnd(0, H) : H + 10, r: rnd(1, 4.2), col: SPARK_COLORS[(Math.random() * 4) | 0],
      v: rnd(10, 38), ph: rnd(0, 6.28), ps: rnd(0.6, 2.2), a: rnd(0.3, 0.95), sway: rnd(4, 16) };
  }

  var last = performance.now(), time = 0;
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; if (!reduce) time += dt;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;

    // im dalej na stronie, tym tło bielsze (0 na górze → prawie białe na samym dole)
    var dEl = document.documentElement, dMax = dEl.scrollHeight - H;
    var sp = dMax <= 8 ? 0 : clamp((window.scrollY || dEl.scrollTop || 0) / dMax, 0, 1);
    var white = 0.5 * (1 - 0.85 * smooth(sp));

    // ---- kulki + iskierki ----
    bx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bx.clearRect(0, 0, W, H);
    blobs.forEach(function (b) {
      if (!reduce) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < -b.r * 0.3 || b.x > W + b.r * 0.3) b.vx *= -1;
        if (b.y < -b.r * 0.3 || b.y > H + b.r * 0.3) b.vy *= -1;
      }
      var pulse = 1 + 0.12 * Math.sin(time * b.ps + b.ph);
      var r = b.r * pulse;
      var x = b.x + mouse.x * 40 * b.depth, y = b.y + mouse.y * 40 * b.depth;
      var a = b.a * white * (0.8 + 0.2 * Math.sin(time * b.ps * 0.8 + b.ph * 2));
      var g = bx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(" + b.col + "," + a.toFixed(3) + ")");
      g.addColorStop(0.5, "rgba(" + b.col + "," + (a * 0.38).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + b.col + ",0)");
      bx.fillStyle = g; bx.beginPath(); bx.arc(x, y, r, 0, 6.2832); bx.fill();
    });
    if (!reduce) sparks.forEach(function (s, i) {
      s.y -= s.v * dt;
      if (s.y < -10) sparks[i] = s = newSpark(false);
      var tw = 0.5 + 0.5 * Math.sin(time * s.ps + s.ph);
      var x = s.x + Math.sin(time * 0.5 + s.ph) * s.sway;
      bx.fillStyle = "rgba(" + s.col + "," + (s.a * (0.25 + 0.75 * tw)).toFixed(3) + ")";
      bx.beginPath(); bx.arc(x, s.y, s.r * (0.7 + 0.5 * tw), 0, 6.2832); bx.fill();
    });
    requestAnimationFrame(frame);
  }

  addEventListener("resize", resize);
  addEventListener("mousemove", function (e) { mouse.tx = e.clientX / W - 0.5; mouse.ty = e.clientY / H - 0.5; }, { passive: true });
  resize();
  requestAnimationFrame(frame);
  window.AutomailTlo = { canvasBack: back };
})();