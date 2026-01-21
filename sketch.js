
let bgColor = "#f6f1e7";
let treeColor = "#466c33";
let decoColor = "#e5242d";


let shapeSelect, decoSizeSlider;
let textInput;
let clearButton, saveButton;

let decorations = [];


const BASE_W = 500;
const BASE_H = 650;


let exportSize = { w: 500, h: 650 };


let formatW = 500;
let formatH = 650;


const BG_PALETTE = ["#f6f1e7", "#ffffff", "#000000"];
const TREE_PALETTE = ["#466c33", "#2daa55", "#49a090"];
const DECO_PALETTE = ["#f8b99d", "#582b86", "#f9af2b", "#e5242d", "#68c8f2", "#e71f66"];

function setup() {
  createCanvas(BASE_W, BASE_H).parent("canvas-container");
  textFont("Helvetica");

 
  createP("Fondo").parent("panel-colors");
  createPaletteRow("panel-colors", BG_PALETTE, (c) => (bgColor = c), bgColor);

  createP("Árbol").parent("panel-colors");
  createPaletteRow("panel-colors", TREE_PALETTE, (c) => (treeColor = c), treeColor);

  createP("Decoración").parent("panel-colors");
  createPaletteRow("panel-colors", DECO_PALETTE, (c) => (decoColor = c), decoColor);

  
  createP("Forma de la decoración").parent("panel-deco");
  shapeSelect = createSelect().parent("panel-deco");
  shapeSelect.option("Círculo");
  shapeSelect.option("Cuadrado");
  shapeSelect.option("Triángulo");

  createP("Tamaño de la decoración").parent("panel-deco");
  decoSizeSlider = createSlider(8, 60, 26, 1).parent("panel-deco");

  clearButton = createButton("Limpiar decoraciones").parent("panel-deco");
  clearButton.mousePressed(() => (decorations = []));


  createP("Formato de guardado").parent("panel-size");

  createButton("A4").parent("panel-size").mousePressed(() => setFormat(2480, 3508));
  createButton("A5").parent("panel-size").mousePressed(() => setFormat(1480, 2100));
  createButton("Instagram").parent("panel-size").mousePressed(() => setFormat(1080, 1080));
  createButton("Historia").parent("panel-size").mousePressed(() => setFormat(1080, 1920));

 
  createP("Texto").parent("panel-text");
  textInput = createElement("textarea", "Feliz Navidad ").parent("panel-text");
  textInput.attribute("rows", "4");
  textInput.style("width", "100%");
  textInput.style("resize", "vertical");

  saveButton = createButton("Guardar postal (PNG)").parent("panel-text");
  saveButton.mousePressed(savePostal);

  
  resizePreviewToFit();
}

function draw() {
 
  background(bgColor);


  const tf = getTransform();

  push();
  translate(tf.ox, tf.oy);
  scale(tf.s);

  drawTextBase();
  drawTreeBase();
  drawStarFixedBase();

  for (let d of decorations) drawDecorationBase(d);

  pop();
}

  pop();



function drawTextBase() {
  fill(treeColor);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(28);
  text(textInput.value(), 36, 50);
}

function drawTreeBase() {
  fill(treeColor);
  noStroke();
  triangle(BASE_W / 2, 170, 120, BASE_H - 140, BASE_W - 120, BASE_H - 140);
}

function drawStarFixedBase() {
  fill("#f9af2b");
  noStroke();
  drawStarBurst(BASE_W / 2, 140, 12, 38, 8);
}


function drawDecorationBase(d) {
  fill(d.color);
  noStroke();

  if (d.shape === "Círculo") ellipse(d.x, d.y, d.size);
  else if (d.shape === "Cuadrado") {
    rectMode(CENTER);
    rect(d.x, d.y, d.size, d.size);
  } else if (d.shape === "Triángulo") {
    drawTriangle(d.x, d.y, d.size);
  }
}

function drawTriangle(x, y, size) {
  let h = size * 0.9;
  triangle(x, y - h / 2, x - size / 2, y + h / 2, x + size / 2, y + h / 2);
}


function drawStarBurst(x, y, innerR, outerR, points) {
  const step = TWO_PI / points;
  const half = step / 2;
  beginShape();
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += step) {
    vertex(x + cos(a) * outerR, y + sin(a) * outerR);
    vertex(x + cos(a + half) * innerR, y + sin(a + half) * innerR);
  }
  endShape(CLOSE);
}


function mousePressed() {

  const p = screenToBase(mouseX, mouseY);
  if (!p) return;

  if (!isInsideTreeBase(p.x, p.y)) return;

  decorations.push({
    x: p.x,
    y: p.y,
    shape: shapeSelect.value(),
    size: decoSizeSlider.value(),
    color: decoColor,
  });
}


function getTransform() {
  
  const s = min(width / BASE_W, height / BASE_H);

 
  const drawW = BASE_W * s;
  const drawH = BASE_H * s;
  const ox = (width - drawW) / 2;
  const oy = (height - drawH) / 2;

  return { s, ox, oy };
}

function screenToBase(sx, sy) {
  const tf = getTransform();


  const xIn = sx - tf.ox;
  const yIn = sy - tf.oy;
  if (xIn < 0 || yIn < 0 || xIn > BASE_W * tf.s || yIn > BASE_H * tf.s) return null;

  return { x: xIn / tf.s, y: yIn / tf.s };
}


function isInsideTreeBase(px, py) {
  let a = { x: BASE_W / 2, y: 170 };
  let b = { x: 120, y: BASE_H - 140 };
  let c = { x: BASE_W - 120, y: BASE_H - 140 };

  let area = (p1, p2, p3) =>
    abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);

  let A = area(a, b, c);
  let A1 = area({ x: px, y: py }, b, c);
  let A2 = area(a, { x: px, y: py }, c);
  let A3 = area(a, b, { x: px, y: py });

  return abs(A - (A1 + A2 + A3)) < 0.5;
}


function createPaletteRow(parentId, palette, onPick, selected) {
  let row = createDiv().parent(parentId);
  row.style("display", "flex");
  row.style("gap", "10px");
  row.style("flex-wrap", "wrap");

  palette.forEach((col) => {
    let b = createButton("").parent(row);
    b.style("width", "28px");
    b.style("height", "28px");
    b.style("border-radius", "999px");
    b.style("border", col === selected ? "2px solid #111" : "1px solid #ccc");
    b.style("background", col);

    b.mousePressed(() => {
      onPick(col);
      row.elt.querySelectorAll("button").forEach((bt) => (bt.style.border = "1px solid #ccc"));
      b.elt.style.border = "2px solid #111";
    });
  });
}


function setFormat(w, h) {
  
  exportSize = { w, h };


  formatW = w;
  formatH = h;

  resizePreviewToFit();
}

function resizePreviewToFit() {

  const frame = document.querySelector(".canvas-frame");
  if (!frame) return;

  
  const maxW = Math.max(200, frame.clientWidth - 48); 
  const maxH = Math.max(200, window.innerHeight - 120); 

  const aspect = formatW / formatH;

  let newW = maxW;
  let newH = newW / aspect;

  if (newH > maxH) {
    newH = maxH;
    newW = newH * aspect;
  }

  
  newW = Math.round(newW);
  newH = Math.round(newH);

  resizeCanvas(newW, newH);
}


function windowResized() {
  resizePreviewToFit();
}


function savePostal() {
  const pg = createGraphics(exportSize.w, exportSize.h);
  pg.textFont("Helvetica");


  const s = min(exportSize.w / BASE_W, exportSize.h / BASE_H);
  const drawW = BASE_W * s;
  const drawH = BASE_H * s;
  const ox = (exportSize.w - drawW) / 2;
  const oy = (exportSize.h - drawH) / 2;

 
  pg.background(bgColor);

  pg.push();
  pg.translate(ox, oy);
  pg.scale(s);

  
  pg.fill(treeColor);
  pg.noStroke();
  pg.textAlign(LEFT, TOP);
  pg.textSize(28);
  pg.text(textInput.value(), 36, 50);

 
  pg.fill(treeColor);
  pg.noStroke();
  pg.triangle(BASE_W / 2, 170, 120, BASE_H - 140, BASE_W - 120, BASE_H - 140);

  
  pg.fill("#f9af2b");
  pg.noStroke();
  drawStarBurstExport(pg, BASE_W / 2, 140, 12, 38, 8);

 
  decorations.forEach((d) => drawDecorationExportBase(pg, d));

  pg.pop();

  save(pg, "postal_navidad", "png");
}

function drawDecorationExportBase(pg, d) {
  pg.fill(d.color);
  pg.noStroke();

  if (d.shape === "Círculo") pg.ellipse(d.x, d.y, d.size);
  else if (d.shape === "Cuadrado") {
    pg.rectMode(CENTER);
    pg.rect(d.x, d.y, d.size, d.size);
  } else if (d.shape === "Triángulo") {
    const h = d.size * 0.9;
    pg.triangle(d.x, d.y - h / 2, d.x - d.size / 2, d.y + h / 2, d.x + d.size / 2, d.y + h / 2);
  }
}

function drawStarBurstExport(pg, x, y, innerR, outerR, points) {
  const step = TWO_PI / points;
  const half = step / 2;

  pg.beginShape();
  for (let a = -HALF_PI; a < TWO_PI - HALF_PI; a += step) {
    pg.vertex(x + cos(a) * outerR, y + sin(a) * outerR);
    pg.vertex(x + cos(a + half) * innerR, y + sin(a + half) * innerR);
  }
  pg.endShape(CLOSE);
}
