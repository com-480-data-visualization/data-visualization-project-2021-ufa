import * as THREE from 'three';
import * as d3 from 'd3';
import * as seedrandom from 'seedrandom';
import variables from '../styles/_export.scss';
import { getPaperMetadata, urlForPaper } from './api';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { ALL, CATEGORIES, categoriesColors, color, getCategoryIndexAndLabel } from './common';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

const RectangleVignetteFilter = {
  uniforms: {
    'tDiffuse': { value: null },
    'color': { value: new THREE.Color(variables['background-color']) },
  },
  vertexShader: [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform sampler2D tDiffuse;',
    'uniform vec3 color;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 texel = texture2D(tDiffuse, vUv);',
    '  vec2 p = vUv * 2.0 - 1.0;',
    '  float b = 5.0;',
    '  float d = clamp(b * (1.0 - abs(p.x)), 0.0, 1.0) * clamp(b * (1.0 - abs(p.y)), 0.0, 1.0);',
    '  gl_FragColor.xyz = texel.xyz * d + color.xyz * (1.0 - d);',
    '}',
  ].join('\n'),
};


export class Cloud {

  constructor(papers) {
    this.domContainer = document.getElementById('papers-cloud');
    const containerAspect = this.domContainer.clientWidth / this.domContainer.clientHeight;
    this.aspect = containerAspect; // If we need to fix the aspect, change this value
    this.width = containerAspect < this.aspect ? this.domContainer.clientWidth : this.domContainer.clientHeight * this.aspect;
    this.height = this.width / this.aspect;

    this.tooltip = d3.select('#cloud-tooltip');
    this.tooltipLink = d3.select('#cloud-tooltip-link');
    this.tooltipDescription = d3.select('#cloud-tooltip-description');
    this.tooltipCategories = d3.select('#cloud-tooltip-categories');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(10, this.aspect, 0.1, 10);
    this.initialScale = 2;
    this.camera.position.z = this.initialScale;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.classList.add('m-auto');
    this.domContainer.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.width, this.height);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    const vignettePass = new ShaderPass(RectangleVignetteFilter);
    vignettePass.renderToScreen = true;
    this.composer.addPass(vignettePass);
    const squareSize = 0.004;
    this.geometry = new THREE.PlaneGeometry(squareSize, squareSize);
    this.materials = CATEGORIES.map(category => new THREE.MeshBasicMaterial({
      //transparent: true,
      color: new THREE.Color(categoriesColors[category.index]),
      //opacity: 0.8,
      //side: THREE.DoubleSide,
    }));

    this.parentContainer = new THREE.Object3D();
    this.scene.add(this.parentContainer);

    this.scene.background = new THREE.Color(variables['background-color']);

    let bbMin = new THREE.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE), bbMax = bbMin.clone().negate();
    Object.entries(papers).forEach(([id, { categories, x, y, date }]) => {
      const categoriesList = categories.split(' ');
      const firstCategory = categoriesList[0];
      const categoryIndex = getCategoryIndexAndLabel(firstCategory).index;
      const particle = new THREE.Mesh(this.geometry, this.materials[categoryIndex]);
      const year = new Date(date).getFullYear();

      this.parentContainer.add(particle);
      particle.visible = false; // Hidden by default

      // Randomize the z-coordinates for depth effect (without affecting the data)
      const zRange = 0.2;
      particle.position.z = -zRange * seedrandom(id)();
      particle.position.x = x;
      particle.position.y = y;

      // Custom properties
      particle.userData = { id, categories: categoriesList, year };

      bbMin.min(particle.position);
      bbMax.max(particle.position);
    });

    this.selectedObject = null;

    const minScale = 0.5, maxScale = 4;
    bbMin.setZ(minScale);
    bbMax.setZ(maxScale);
    const zoom = d3.zoom()
      .scaleExtent([minScale, maxScale])
    // Function is taken from: https://github.com/d3/d3-zoom/blob/master/README.md#zoom_wheelDelta
    // Direction was inverted
      .wheelDelta(event => event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002))
      .on('zoom', event => {
        this.selectedObject = null;
        this.tooltip.classed('hidden', true);

        if (event.sourceEvent) {
          const newZ = event.transform.k;
          if (newZ !== this.camera.position.z) {
            const { offsetX, offsetY } = event.sourceEvent;
            const vector = new THREE.Vector3(
              offsetX / this.width * 2 - 1,
              -(offsetY / this.height) * 2 + 1,
              1
            );
            vector.unproject(this.camera);
            const direction = vector.sub(this.camera.position).normalize();
            const distance = (newZ - this.camera.position.z) / direction.z;
            const position = this.camera.position.clone().add(direction.multiplyScalar(distance));
            this.camera.position.set(position.x, position.y, newZ);
          } else {
            const { movementX, movementY } = event.sourceEvent;
            const vFOV = this.camera.fov * Math.PI / 180;
            const scaleHeight = 2 * Math.tan(vFOV / 2) * this.camera.position.z;
            const currentScale = this.height / scaleHeight;
            this.camera.position.set(this.camera.position.x - movementX / currentScale,
              this.camera.position.y + movementY / currentScale, this.camera.position.z);
          }
          this.camera.position.clamp(bbMin, bbMax);
        }
      });

    // Add zoom listener
    const view = d3.select(this.renderer.domElement).style('cursor', 'pointer');
    view.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(this.initialScale));
    view.call(zoom).on('dblclick.zoom', null);

    const raycaster = new THREE.Raycaster();

    d3.select(this.renderer.domElement).on('click', e => {
      const previousSelected = this.selectedObject;
      this.selectedObject = null;

      const bounds = this.renderer.domElement.getBoundingClientRect();
      const mouse = { x: ((e.clientX - bounds.left) / this.width) * 2 - 1, y: -((e.clientY - bounds.top) / this.height) * 2 + 1 };
      raycaster.setFromCamera(mouse, this.camera);
      const intersections = raycaster.intersectObjects(this.scene.children, true).filter(intersection => intersection.object.visible);
      if (intersections.length > 0) {
        const intersection = intersections[0];
        this.selectedObject = intersection.object;

        const id = this.selectedObject.userData.id;

        if (this.selectedObject !== previousSelected) {
          this.tooltip.classed('hidden', false);
          this.tooltipLink.text(id).attr('href', urlForPaper(id));
          this.tooltipDescription.text('...');
          this.tooltipCategories.text('...');

          getPaperMetadata(id).then(xml => {
            if (this.selectedObject !== null && this.selectedObject.userData.id === id) { // Verify that the object is still selected
              const entry = xml.querySelector('feed > entry');
              const title = entry.querySelector('title');
              this.tooltipDescription.text(title.textContent);
              this.tooltipCategories.html(null);
              this.tooltipCategories
                .selectAll('span')
                .data(this.selectedObject.userData.categories)
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
        this.tooltip.classed('hidden', true);
      }
    });


    const render = () => {
      this.composer.render();
      const c = 0.2;
      if (this.selectedObject !== null) {
        this.camera.position.x += (this.selectedObject.position.x - this.camera.position.x) * c;
        this.camera.position.y += (this.selectedObject.position.y - this.camera.position.y) * c;
      }
      requestAnimationFrame(render);
    };

    // Start render loop
    render();
  }

  update(year = ALL) {
    this.tooltip.classed('hidden', true);

    const maxPointsShown = 2500;
    let shown = 0;
    const particles = this.parentContainer.children;
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const visible = shown < maxPointsShown && (year === ALL || particle.userData.year === year);
      particle.visible = visible;
      if (visible) {
        shown++;
      }
    }
  }
}


