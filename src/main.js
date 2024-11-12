import * as THREE from "three";

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#three-canvas"),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("../globe.jpg");

// Globe (Earth)
const globeGeometry = new THREE.IcosahedronGeometry(1, 12);
const globeMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
const globe = new THREE.Mesh(globeGeometry, globeMaterial);
globe.scale.set(2, 2, 2);

scene.add(globe);

// Sprite Data
const spriteData = [
  {
    position: new THREE.Vector3(0.3, 0.3, 1),
    tooltip: "../src/dialogImg/Mural Tile-1.png",
  },
  {
    position: new THREE.Vector3(-0.5, 0.8, 0.5),
    tooltip: "../src/dialogImg/Mural Tile-2.png",
  },
  {
    position: new THREE.Vector3(0.5, 0.2, 1),
    tooltip: "../src/dialogImg/Mural Tile-3.png",
  },
  {
    position: new THREE.Vector3(-1, -0.3, 0.6),
    tooltip: "../src/dialogImg/Mural Tile-4.png",
  },
  {
    position: new THREE.Vector3(0.2, -0.9, -1),
    tooltip: "../src/dialogImg/Mural Tile-5.png",
  },
];

// Create sprites and tooltips
const sprites = [];
spriteData.forEach((data) => {
  const pngTexture = textureLoader.load("../src/beep2.png"); // Replace with your PNG path
  const pngMaterial = new THREE.SpriteMaterial({ map: pngTexture });
  const pngSprite = new THREE.Sprite(pngMaterial);

  // Scale and position the sprite
  pngSprite.scale.set(0.2, 0.2, 0.2); // Adjust scale as needed
  pngSprite.position.copy(data.position);

  globe.add(pngSprite);
  sprites.push({ sprite: pngSprite, tooltip: data.tooltip });
});

// Tooltip Image for Hover
const tooltipImage = document.createElement("img");
tooltipImage.style.position = "absolute";
tooltipImage.style.borderRadius = "4px";
tooltipImage.style.marginTop = "30px";
tooltipImage.style.pointerEvents = "none";
tooltipImage.style.display = "none"; // Initially hidden
tooltipImage.style.width = "200px"; // Adjust size as needed
tooltipImage.style.height = "100px";
document.body.appendChild(tooltipImage);

// Variables for rotation
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = { x: 0, y: 0 };
const dampingFactor = 0.95;
let baseRotationSpeed = { x: 0.0002, y: 0.001 };

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Apply velocity and base rotation
  if (!isDragging) {
    rotationVelocity.x += (baseRotationSpeed.x - rotationVelocity.x) * 0.02;
    rotationVelocity.y += (baseRotationSpeed.y - rotationVelocity.y) * 0.02;
  }

  globe.rotation.y += rotationVelocity.y;
  globe.rotation.x += rotationVelocity.x;

  // Raycasting
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    sprites.map((data) => data.sprite)
  );

  if (intersects.length > 0) {
    const hoveredSprite = sprites.find(
      (data) => data.sprite === intersects[0].object
    );
    if (hoveredSprite) {
      tooltipImage.style.display = "block";
      tooltipImage.src = hoveredSprite.tooltip; // Set the tooltip image
      tooltipImage.style.left = `${
        (mouse.x * window.innerWidth) / 2 + window.innerWidth / 2
      }px`;
      tooltipImage.style.top = `${
        (-mouse.y * window.innerHeight) / 2 + window.innerHeight / 2
      }px`;
    }
  } else {
    tooltipImage.style.display = "none";
  }

  renderer.render(scene, camera);
}
animate();

// Event listeners for dragging
window.addEventListener("mousedown", (event) => {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };
});

window.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const deltaMove = {
      x: event.clientX - previousMousePosition.x,
      y: event.clientY - previousMousePosition.y,
    };

    globe.rotation.y += deltaMove.x * 0.005;
    globe.rotation.x += deltaMove.y * 0.005;

    rotationVelocity.x = deltaMove.y * 0.0005;
    rotationVelocity.y = deltaMove.x * 0.0005;

    previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  // Update mouse position for raycasting
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
