import * as THREE from 'three';
import * as d3 from 'd3';
import * as seedrandom from 'seedrandom';
import { getPaperMetadata, urlForPaper } from './api';
// eslint-disable-next-line sort-imports
import { CATEGORIES, color, getCategoryIndexAndLabel } from './common';

export const drawCloud = papers => {

  const domContainer = document.getElementById('papers-cloud');
  const containerAspect = domContainer.clientWidth / domContainer.clientHeight;
  const aspect = containerAspect; // If we need to fix the aspect, change this value
  const width = containerAspect < aspect ? domContainer.clientWidth : domContainer.clientHeight * aspect,
    height = width / aspect;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(10, aspect, 0.1, 10);
  const initialScale = 2;
  camera.position.z = initialScale;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  renderer.domElement.classList.add('m-auto');
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

  const tooltip = d3.select('#cloud-tooltip'), tooltipLink = d3.select('#cloud-tooltip-link'),
    tooltipDescription = d3.select('#cloud-tooltip-description'),
    tooltipCategories = d3.select('#cloud-tooltip-categories');

  let bbMin = new THREE.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), bbMax = bbMin.clone().negate();
  Object.entries(papers).slice(0, 2500).forEach(([id, { categories, x, y }]) => {
    const categoriesList = categories.split(' ');
    const firstCategory = categoriesList[0];
    const categoryIndex = getCategoryIndexAndLabel(firstCategory).index;
    const particle = new THREE.Mesh(geometry, materials[categoryIndex]);
    parentContainer.add(particle);

    // Randomize the z-coordinates for depth effect (without affecting the data)
    const zRange = 0.2;
    particle.position.z = -zRange * seedrandom(id)();
    particle.position.x = x;
    particle.position.y = y;

    // Custom properties
    particle.userData = { id, categories: categoriesList };

    bbMin.min(particle.position);
    bbMax.max(particle.position);
  });

  let selectedObject = null;

  const render = () => {
    renderer.render(scene, camera);
    const c = 0.2;
    if (selectedObject !== null) {
      camera.position.x += (selectedObject.position.x - camera.position.x) * c;
      camera.position.y += (selectedObject.position.y - camera.position.y) * c;
    }
    requestAnimationFrame(render);
  };

  const minScale = 0.5, maxScale = 4;
  bbMin.setZ(minScale);
  bbMax.setZ(maxScale);
  const zoom = d3.zoom()
    .scaleExtent([minScale, maxScale])
    // Function is taken from: https://github.com/d3/d3-zoom/blob/master/README.md#zoom_wheelDelta
    // Direction was inverted
    .wheelDelta(event => event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002))
    .on('zoom', event => {
      selectedObject = null;
      tooltip.classed('hidden', true);

      if (event.sourceEvent) {
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
        camera.position.clamp(bbMin, bbMax);
      }
    });

  // Add zoom listener
  const view = d3.select(renderer.domElement).style('cursor', 'pointer');
  view.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(initialScale));
  view.call(zoom).on('dblclick.zoom', null);

  const raycaster = new THREE.Raycaster();

  d3.select(renderer.domElement).on('click', e => {
    const previousSelected = selectedObject;
    selectedObject = null;

    const bounds = renderer.domElement.getBoundingClientRect();
    const mouse = { x: ((e.clientX - bounds.left) / width) * 2 - 1, y: -((e.clientY - bounds.top) / height) * 2 + 1 };
    raycaster.setFromCamera(mouse, camera);
    const intersections = raycaster.intersectObjects(scene.children, true);
    if (intersections.length > 0) {
      const intersection = intersections[0];
      selectedObject = intersection.object;

      const id = selectedObject.userData.id;

      if (selectedObject !== previousSelected) {
        tooltip.classed('hidden', false);
        tooltipLink.text(id).attr('href', urlForPaper(id));
        tooltipDescription.text('...');
        tooltipCategories.text('...');

        getPaperMetadata(id).then(xml => {
          if (selectedObject !== null && selectedObject.userData.id === id) { // Verify that the object is still selected
            const entry = xml.querySelector('feed > entry');
            const title = entry.querySelector('title');
            tooltipDescription.text(title.textContent);
            tooltipCategories.html(null);
            tooltipCategories
              .selectAll('span')
              .data(selectedObject.userData.categories)
              .enter()
              .append('span')
              .text(d => d)
              .style('color', d => color({ id: d }))
              .classed('px-1', true)
              .classed('text-glow', true);
          }
        });
      }
    } else {
      tooltip.classed('hidden', true);
    }
  });

  // Start render loop
  render();
};
