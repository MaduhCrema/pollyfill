const canvas = document.getElementById("myCanvas");
const context = canvas.getContext("2d");
const selectTriangleElement = document.getElementById("selectTriangle");
// Lista de vértices e triângulos
const vertices = [];
const triangles = [];

var selectedTriangleIndex = 0;

// Estrutura de um vértice
function Vertex(x, y, color) {
  this.x = x;
  this.y = y;
  this.color = color;
}

// Estrutura de um triângulo
function Triangle(vertex1, vertex2, vertex3) {
  this.vertices = [vertex1, vertex2, vertex3];
}

// Adiciona um vértice na lista de vértices
function addVertex(x, y, color) {
  const vertex = new Vertex(x, y, color);
  vertices.push(vertex);
  //console.log(vertices);
  if (vertices.length == 3) {
    addTriangle(vertices);
  }
}

// Adiciona um triângulo na lista de triângulos
function addTriangle(vertices) {
  const triangle = new Triangle(vertices[0], vertices[1], vertices[2]);
  triangles.push(triangle);
}

//Função para capturar os cliques do canvas
function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Adiciona o vértice clicado na lista
  addVertex(x, y, [0, 0, 0]);
  // Atualiza a visualização do canvas para rasterizar o triangulo
  updateCanvas();
}

function updateCanvas() {
  if (vertices.length >= 3) {
    getcolor();
    triangles.forEach((triangle) => {
      // Obtém os vértices do triângulo
      const vertic = triangle.vertices;
      // Define os vértices do triângulo
      const vertice = [vertic[0], vertic[1], vertic[2]];
    });
    createTriangle();
  }
}

//chamado quando um triangulo é excluído da lista triangulos
function update() {
  triangles.forEach((triangle) => {
    // Obtém os vértices do triângulo
    const vertic = triangle.vertices;
    // Define os vértices do triângulo
    const vertice = [vertic[0], vertic[1], vertic[2]];
    // Rasteriza o triângulo
    rasterizeTriangle(context, vertice);
  });
}

function cleanAll() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  selectTriangleElement.innerHTML = "";
  triangles.length = 0;
}

function cleanOne() {
  if (triangles.length > 1) {
    // Verifica se há um triângulo selecionado
    if (
      selectedTriangleIndex >= 0 &&
      selectedTriangleIndex < triangles.length
    ) {
      // Remove o triângulo da lista de triângulos
      triangles.splice(selectedTriangleIndex, 1);
      // Remove da opção de seleção
      selectTriangleElement.remove(selectedTriangleIndex);
      // Limpa o canvas inteiro
      context.clearRect(0, 0, canvas.width, canvas.height);
      // Redesenha os triângulos restantes
      update();
    }
  } else if (triangles.length == 1) {
    cleanAll();
    updateCanvas();
  }
}
function createTriangle() {
  triangles.forEach((triangle) => {
    // Obtém os vértices do triângulo
    const vertic = triangle.vertices;
    // Define os vértices do triângulo
    const vertice = [vertic[0], vertic[1], vertic[2]];
    // Rasteriza o triângulo
    rasterizeTriangle(context, vertice);
  });

  // Adiciona a opção de seleção do triângulo
  const option = document.createElement("option");
  option.value = triangles.length - 1;
  option.text = `Triângulo ${triangles.length}`;
  selectTriangleElement.add(option);
  //reseta as vertices
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

  triangles[selectedTriangleIndex].vertices[0].color = hexToRgb(
    color0Input.value
  );
  triangles[selectedTriangleIndex].vertices[1].color = hexToRgb(
    color1Input.value
  );
  triangles[selectedTriangleIndex].vertices[2].color = hexToRgb(
    color2Input.value
  );

  triangles.forEach((triangle) => {
    // Obtém os vértices do triângulo
    const vertic = triangle.vertices;
    // Define os vértices do triângulo
    const vertice = [vertic[0], vertic[1], vertic[2]];
    // Rasteriza o triângulo
    rasterizeTriangle(context, vertice);
  });
}

function rasterizeTriangle(context, vertices) {
  // Ordena os vértices verticalmente e horizontalmente
  vertices.sort((a, b) => {
    if (a.y !== b.y) {
      return a.y - b.y;
    } else {
      return a.x - b.x;
    }
  });

  // Encontra a coordenada y máxima e mínima do triângulo
  const minY = Math.floor(vertices[0].y);
  const maxY = Math.ceil(vertices[2].y);

  for (let y = minY; y <= maxY; y++) {
    let intersections = [];

    // Calcula as interseções com cada aresta do triângulo
    for (let i = 0; i < 3; i++) {
      const v1 = vertices[i];
      const v2 = vertices[(i + 1) % 3];

      // Ignora arestas horizontais
      if ((v1.y <= y && v2.y > y) || (v2.y <= y && v1.y > y)) {
        // Calcula a interseção da aresta com a linha de varredura
        const x = v1.x + ((y - v1.y) / (v2.y - v1.y)) * (v2.x - v1.x);
        //console.log(x);
        intersections.push({ x, vertex1: v1, vertex2: v2 });
      }
    }

    // Ordena as interseções horizontalmente
    intersections.sort((a, b) => a.x - b.x);

    // Preenche os pixels entre as interseções com o degradê de cores
    if (intersections.length >= 2) {
      const xStart = intersections[0].x;
      const xEnd = intersections[1].x;
      //console.log(xStart);

      // Calcula as cores iniciais e finais para a interpolação
      const colorStart = coresInterpoladas(
        intersections[0].vertex1.color,
        intersections[0].vertex2.color,
        (xStart - intersections[0].vertex1.x) /
          (intersections[0].vertex2.x - intersections[0].vertex1.x)
      );
      const colorEnd = coresInterpoladas(
        intersections[1].vertex1.color,
        intersections[1].vertex2.color,
        (xEnd - intersections[1].vertex1.x) /
          (intersections[1].vertex2.x - intersections[1].vertex1.x)
      );

      for (let x = Math.floor(xStart); x <= Math.ceil(xEnd); x++) {
        const t = (x - xStart) / (xEnd - xStart);
        const colorInterpolated = coresInterpoladas(colorStart, colorEnd, t);

        // Imprime as cores no console
        //console.log(
        //  `Pixel at (${x}, ${y}): RGB(${colorInterpolated[0]}, ${colorInterpolated[1]}, ${colorInterpolated[2]})`
        //);

        context.fillStyle = `rgb(${colorInterpolated[0]}, ${colorInterpolated[1]}, ${colorInterpolated[2]})`;
        context.fillRect(x, y, 1, 1); // Desenha o pixel
      }
    }
  }
}

function coresInterpoladas(color1, color2, t) {
  const r = Math.round(color1[0] + t * (color2[0] - color1[0]));

  const g = Math.round(color1[1] + t * (color2[1] - color1[1]));

  const b = Math.round(color1[2] + t * (color2[2] - color1[2]));

  return [r, g, b];
}
