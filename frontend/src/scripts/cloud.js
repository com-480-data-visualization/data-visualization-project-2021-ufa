import * as THREE from 'three';
import * as d3 from 'd3';
import { CATEGORIES, getCategoryIndexAndLabel } from './common';

export const drawCloud = papers => {

  const domContainer = document.getElementById('papers-cloud');
  const aspect = 1000 / 800; // TODO match the network
  const width = domContainer.clientWidth, height = width / aspect;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(10, aspect, 0.1, 10);
  const initialScale = 2;
  camera.position.z = initialScale;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
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

  const render = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  const zoom = d3.zoom()
    .scaleExtent([0.5, 4])
    // Function is taken from: https://github.com/d3/d3-zoom/blob/master/README.md#zoom_wheelDelta
    // Direction was inverted
    .wheelDelta(event => event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002))
    .on('zoom', event => {
      if (event.sourceEvent) {
        console.log(event);
        const newZ = event.transform.k;
        if (newZ !== camera.position.z) {
          const { offsetX, offsetY } = event.sourceEvent;
          const vector = new THREE.Vector3(
            offsetX / width * 2 - 1,
            -(offsetY / height) * 2 + 1,
            1
          );
          vector.unproject(camera);
          const direction = vector.sub(camera.position).normalize();
          const distance = (newZ - camera.position.z) / direction.z;
          const position = camera.position.clone().add(direction.multiplyScalar(distance));
          camera.position.set(position.x, position.y, newZ);
        } else {
          const { movementX, movementY } = event.sourceEvent;
          const vFOV = camera.fov * Math.PI / 180;
          const scaleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
          const currentScale = height / scaleHeight;
          camera.position.set(camera.position.x - movementX / currentScale, camera.position.y + movementY / currentScale, camera.position.z);
        }
      }
    });

  // Add zoom listener
  const view = d3.select(renderer.domElement).style('cursor', 'pointer');
  view.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(initialScale));

  // Start render loop
  render();
};
