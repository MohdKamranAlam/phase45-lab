import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function buildGeometry(gamma = [], energy = [], ct = []) {
  if (!gamma.length || !energy.length || !ct?.length) return null;
  const rows = gamma.length;
  const cols = energy.length;
  if (!Array.isArray(ct[0]) || ct[0].length !== cols) return null;

  const positions = new Float32Array(rows * cols * 3);
  const colors = new Float32Array(rows * cols * 3);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const value = Number(ct[i][j]) || 0;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  const range = max - min || 1;
  let vIndex = 0;
  let cIndex = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      positions[vIndex++] = gamma[i];
      positions[vIndex++] = energy[j];
      const value = Number(ct[i][j]) || 0;
      positions[vIndex++] = value;
      const lerp = (value - min) / range;
      const color = new THREE.Color().setHSL(0.08 + 0.5 * (1 - lerp), 0.7, 0.55 + 0.15 * lerp);
      colors[cIndex++] = color.r;
      colors[cIndex++] = color.g;
      colors[cIndex++] = color.b;
    }
  }
  const indices = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j;
      const b = a + 1;
      const c = (i + 1) * cols + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export default function PsiSurfaceCanvas({ gamma, energy, ct }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !gamma?.length || !energy?.length || !ct?.length) return undefined;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 360;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 6, 6);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(6, 10, 6);
    scene.add(directional);

    const grid = new THREE.GridHelper(12, 12, 0x1d4ed8, 0x0f172a);
    grid.rotateX(Math.PI / 2);
    scene.add(grid);

    const geometry = buildGeometry(gamma, energy, ct);
    if (geometry) {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.05, roughness: 0.3 })
      );
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);
    }

    let animationFrame;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const { clientWidth, clientHeight } = mount;
      camera.aspect = (clientWidth || width) / (clientHeight || height);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth || width, clientHeight || height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [gamma, energy, ct]);

  if (!gamma?.length || !energy?.length || !ct?.length) {
    return <div className="placeholder-card">Generate a ψ-surface run to unlock the 3D canvas.</div>;
  }

  return <div className="psi-canvas" ref={mountRef} />;
}
