const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const selectTriangleElement = document.getElementById("selectTriangle");

const vertices = [];
const triangles = [];
var selectedTriangleIndex = 0;

function Vertex(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = color;
}

function Triangle(
  vertex1,
  vertex2,
  vertex3,
  edgeColor = [0, 0, 0],
  edgethickness
) {
  this.vertices = [vertex1, vertex2, vertex3];
  this.edgeColor = edgeColor;
  this.edgethickness = edgethickness;
}

function addVertex(x, y, color) {
  const vertex = new Vertex(x, y, color);
  vertices.push(vertex);
  if (vertices.length == 3) {
    addTriangle(vertices);
  }
}

function addTriangle(vertices) {
  const thickness = document.getElementById("thickness").value;
  const edgecolorInput = document.getElementById("edgeColor");
  const edgecolor = hexToRgb(edgecolorInput.value);
  const triangle = new Triangle(
    vertices[0],
    vertices[1],
    vertices[2],
    edgecolor,
    thickness
  );
  triangles.push(triangle);
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  addVertex(x, y, [0, 0, 0]);
  updateCanvas();
}

function updateCanvas() {
  if (vertices.length >= 3) {
    getcolor();
    triangles.forEach((triangle) => {
      const vertice = triangle.vertices;
      rasterizeTriangle(context, vertice);
      drawEdges(triangle, triangle.edgeColor);
    });
    createTriangle();
  }
}

function update() {
  triangles.forEach((triangle) => {
    const vertice = triangle.vertices;
    rasterizeTriangle(context, vertice);
    drawEdges(triangle, triangle.edgeColor, thickness);
  });
}

function cleanAll() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  selectTriangleElement.innerHTML = "";
  triangles.length = 0;
}

function cleanOne() {
  if (triangles.length > 1) {
    if (
      selectedTriangleIndex >= 0 &&
      selectedTriangleIndex < triangles.length
    ) {
      triangles.splice(selectedTriangleIndex, 1);
      selectTriangleElement.remove(selectedTriangleIndex);
      context.clearRect(0, 0, canvas.width, canvas.height);
      update();
    }
  } else if (triangles.length == 1) {
    cleanAll();
    updateCanvas();
  }
}

function createTriangle() {
  triangles.forEach((triangle) => {
    const vertice = triangle.vertices;
    rasterizeTriangle(context, vertice);
    drawEdges(triangle, triangle.edgeColor);
  });

  const option = document.createElement("option");
  option.value = triangles.length - 1;
  option.text = `Triângulo ${triangles.length}`;
  selectTriangleElement.add(option);

  vertices.length = 0;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function getcolor() {
  const color0Input = document.getElementById("color0");
  const color1Input = document.getElementById("color1");
  const color2Input = document.getElementById("color2");

  vertices[0].color = hexToRgb(color0Input.value);
  vertices[1].color = hexToRgb(color1Input.value);
  vertices[2].color = hexToRgb(color2Input.value);
}

function selectTriangle() {
  selectedTriangleIndex = selectTriangleElement.selectedIndex;
}

function changecolor() {
  const color0Input = document.getElementById("color0");
  const color1Input = document.getElementById("color1");
  const color2Input = document.getElementById("color2");
  const edgeColorInput = document.getElementById("edgeColor");

  triangles[selectedTriangleIndex].vertices[0].color = hexToRgb(
    color0Input.value
  );
  triangles[selectedTriangleIndex].vertices[1].color = hexToRgb(
    color1Input.value
  );
  triangles[selectedTriangleIndex].vertices[2].color = hexToRgb(
    color2Input.value
  );
  triangles[selectedTriangleIndex].edgeColor = hexToRgb(edgeColorInput.value);

  context.clearRect(0, 0, canvas.width, canvas.height);

  triangles.forEach((triangle) => {
    const vertice = triangle.vertices;
    rasterizeTriangle(context, vertice);
    drawEdges(triangle, triangle.edgeColor);
  });
}

function changeedgethickness() {
  const thickness = document.getElementById("thickness").value;
  triangles[selectedTriangleIndex].edgethickness = thickness;
  context.clearRect(0, 0, canvas.width, canvas.height);

  triangles.forEach((triangle) => {
    const vertice = triangle.vertices;
    rasterizeTriangle(context, vertice);
    drawEdges(triangle, triangle.edgeColor);
  });
}

function drawLine(x1, y1, x2, y2, color, thickness) {
  //console.log(thickness);
  let dx = Math.abs(x2 - x1); //Diferença absoluta
  let dy = Math.abs(y2 - y1);
  //incrementa ou decrementa na direção
  let dirx = x1 < x2 ? 1 : -1;
  let diry = y1 < y2 ? 1 : -1;
  let err_hv = dx - dy; // proximo ponto horizontal ou vertical

  while (true) {
    for (
      let i = -Math.floor(thickness / 2);
      i <= Math.floor(thickness / 2);
      i++
    ) {
      for (
        let j = -Math.floor(thickness / 2);
        j <= Math.floor(thickness / 2);
        j++
      ) {
        drawPixel(x1 + i, y1 + j, color); //depende da espessura
      }
    }

    if (x1 === x2 && y1 === y2) break;
    let e2 = 2 * err_hv; //decide onde
    if (e2 > -dy) {
      err_hv -= dy;
      x1 += dirx; //horizontal
    }
    if (e2 < dx) {
      err_hv += dx;
      y1 += diry; //vertical
    }
  }
}

function drawPixel(x, y, color) {
  context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  context.fillRect(x, y, 1, 1);
}

function drawEdges(triangle, color) {
  const [v1, v2, v3] = triangle.vertices;
  const thickness = triangle.edgethickness;

  drawLine(v1.x, v1.y, v2.x, v2.y, color, thickness);
  drawLine(v2.x, v2.y, v3.x, v3.y, color, thickness);
  drawLine(v3.x, v3.y, v1.x, v1.y, color, thickness);
}

function rasterizeTriangle(context, vertices) {
  const [v1, v2, v3] = vertices;
  const minY = Math.min(v1.y, v2.y, v3.y);
  const maxY = Math.max(v1.y, v2.y, v3.y);
  const intersections = {};
  const verticesArr = [v1, v2, v3];

  verticesArr.forEach((v_start, i) => {
    let v_end = verticesArr[(i + 1) % 3];
    if (v_start.y === v_end.y) return;
    if (v_start.y > v_end.y) [v_start, v_end] = [v_end, v_start];
    //taxas
    const dy = v_end.y - v_start.y;
    const dx = v_end.x - v_start.x;
    const taxa_inversa = dx / dy;
    let x = v_start.x;
    let r = v_start.color[0],
      g = v_start.color[1],
      b = v_start.color[2];
    const dr = (v_end.color[0] - v_start.color[0]) / dy;
    const dg = (v_end.color[1] - v_start.color[1]) / dy;
    const db = (v_end.color[2] - v_start.color[2]) / dy;

    for (let y = Math.round(v_start.y); y < Math.round(v_end.y); y++) {
      if (!intersections[y]) {
        intersections[y] = [];
      }
      intersections[y].push({ x, color: [r, g, b] });
      x += taxa_inversa;
      r += dr;
      g += dg;
      b += db;
    }
  });

  for (let y = Math.round(minY); y <= Math.round(maxY); y++) {
    if (!intersections[y]) {
      continue;
    }
    intersections[y].sort((a, b) => a.x - b.x);

    for (let i = 0; i < 1; i += 2) {
      const { x: xStart, color: colorStart } = intersections[y][i];
      const { x: xEnd, color: colorEnd } = intersections[y][i + 1];

      const pixels = xEnd - xStart;
      const dr = (colorEnd[0] - colorStart[0]) / pixels;
      const dg = (colorEnd[1] - colorStart[1]) / pixels;
      const db = (colorEnd[2] - colorStart[2]) / pixels;
      let r = colorStart[0],
        g = colorStart[1],
        b = colorStart[2];

      for (let x = Math.ceil(xStart); x <= Math.floor(xEnd); x++) {
        drawPixel(x, y, [Math.round(r), Math.round(g), Math.round(b)]);
        r += dr;
        g += dg;
        b += db;
      }
    }
  }
}
