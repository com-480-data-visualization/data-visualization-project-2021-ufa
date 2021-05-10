import * as THREE from 'three';
import * as d3 from 'd3';
import { CATEGORIES, getCategoryIndexAndLabel } from './utils';

export const drawCloud = papers => {

  let mousePos = { x: 0, y: 0 };

  const domContainer = document.getElementById('papers-cloud');
  const aspect = 1000 / 800; // TODO match the network

  domContainer.addEventListener('mousemove', event => {
    mousePos = { x: event.clientX / domContainer.clientWidth - 0.5, y: event.clientY / domContainer.clientHeight - 0.5 };
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(10, aspect, 0.1, 10);
  camera.position.z = 2;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(domContainer.clientWidth, domContainer.clientWidth / aspect);
  domContainer.appendChild(renderer.domElement);

  const squareSize = 0.004;
  const geometry = new THREE.PlaneGeometry(squareSize, squareSize);
  const colorScheme = d3.schemeCategory10; // TODO improve this
  const materials = CATEGORIES.map(category => new THREE.MeshBasicMaterial({
    //transparent: true,
    color: new THREE.Color(colorScheme[category.index]),
    //opacity: 0.8,
    //side: THREE.DoubleSide,
  }));

  const parentContainer = new THREE.Object3D();
  scene.add(parentContainer);

  scene.background = new THREE.Color('#fffdf5');

  // eslint-disable-next-line no-unused-vars
  Object.entries(papers).slice(0, 2500).forEach(([id, { categories, x, y }]) => {
    const firstCategory = categories.split(' ')[0];
    const categoryIndex = getCategoryIndexAndLabel(firstCategory).index;
    const particle = new THREE.Mesh(geometry, materials[categoryIndex]);
    parentContainer.add(particle);

    particle.position.z = -Math.random();
    particle.position.x = x;
    particle.position.y = y;
  });

  function render() {
    const sensitivity = 0.03;
    camera.position.x = mousePos.x * sensitivity;
    camera.position.y = -mousePos.y * sensitivity;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
};
