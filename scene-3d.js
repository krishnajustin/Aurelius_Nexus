/* ============================================
   AURELIUS NEXUS — 3D Scenes (Three.js)
   ============================================ */

(function() {
  if (typeof THREE === 'undefined') return;

  // ===== HERO SCENE: Crystalline Nexus + Particle Field =====
  function initHero() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(amb);

    const key = new THREE.PointLight(0xd4b26a, 2.4, 30);
    key.position.set(4, 4, 5);
    scene.add(key);

    const rim = new THREE.PointLight(0xf2ebdd, 1.6, 30);
    rim.position.set(-5, -3, 4);
    scene.add(rim);

    const back = new THREE.PointLight(0xc9a35a, 1.2, 30);
    back.position.set(0, 0, -6);
    scene.add(back);

    // ===== CENTERPIECE: Layered crystal =====
    const group = new THREE.Group();
    scene.add(group);

    // Inner solid icosahedron (faceted gold)
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xc9a35a,
      metalness: 1.0,
      roughness: 0.22,
      flatShading: true,
      emissive: 0x4a3614,
      emissiveIntensity: 0.5
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Middle wireframe octahedron
    const midGeo = new THREE.OctahedronGeometry(1.6, 0);
    const midMat = new THREE.MeshBasicMaterial({
      color: 0xd4b26a,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    });
    const midMesh = new THREE.Mesh(midGeo, midMat);
    group.add(midMesh);

    // Outer wireframe icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xc9a35a,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // Outermost dodecahedron (very faint)
    const haloGeo = new THREE.DodecahedronGeometry(3.0, 0);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf7eed1,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    group.add(haloMesh);

    // Floating ring
    const ringGeo = new THREE.TorusGeometry(2.7, 0.008, 8, 128);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4b26a,
      transparent: true,
      opacity: 0.4
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2.2;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.material.opacity = 0.25;
    ring2.rotation.x = Math.PI / 1.5;
    ring2.rotation.y = Math.PI / 4;
    ring2.scale.setScalar(1.1);
    group.add(ring2);

    // ===== Particle field =====
    const PCOUNT = 600;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PCOUNT * 3);
    const sizes = new Float32Array(PCOUNT);
    for (let i = 0; i < PCOUNT; i++) {
      // Sphere shell with bias toward edges
      const r = 6 + Math.random() * 14;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
      sizes[i] = Math.random() * 0.03 + 0.005;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0xd4b26a,
      size: 0.025,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Smaller, brighter dust
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) {
      dustPos[i * 3]     = (Math.random() - 0.5) * 12;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf7eed1,
      size: 0.018,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // Mouse / scroll state
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let scrollY = 0;

    window.addEventListener('mousemove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });

    // Resize
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      const dt = clock.getDelta();

      // Ease mouse
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      // Rotate group; parallax with mouse
      group.rotation.y = t * 0.18 + mouse.x * 0.5;
      group.rotation.x = Math.sin(t * 0.4) * 0.12 + mouse.y * 0.3;
      group.position.y = Math.sin(t * 0.6) * 0.12 - scrollY * 0.0015;
      group.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);

      // Differential layer rotations
      innerMesh.rotation.y = -t * 0.5;
      innerMesh.rotation.x = t * 0.3;
      midMesh.rotation.y = t * 0.25;
      midMesh.rotation.z = -t * 0.18;
      outerMesh.rotation.y = -t * 0.12;
      outerMesh.rotation.x = -t * 0.08;
      haloMesh.rotation.y = t * 0.06;
      haloMesh.rotation.z = t * 0.04;
      ring1.rotation.z = t * 0.4;
      ring2.rotation.z = -t * 0.3;

      // Particles
      particles.rotation.y = t * 0.02 + mouse.x * 0.1;
      particles.rotation.x = mouse.y * 0.1;
      dust.rotation.y = -t * 0.04;
      dust.rotation.z = t * 0.02;

      // Light orbits
      key.position.x = Math.cos(t * 0.6) * 5;
      key.position.z = Math.sin(t * 0.6) * 5;

      // Fade out on scroll
      const fade = Math.max(0, 1 - scrollY / 800);
      group.scale.multiplyScalar(fade > 0.2 ? 1 : 0.0001 + fade);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ===== ABOUT SCENE: Floating wireframe emblem =====
  function initAbout() {
    const canvas = document.getElementById('about-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dl = new THREE.DirectionalLight(0xd4b26a, 1.6);
    dl.position.set(2, 3, 4);
    scene.add(dl);

    const dl2 = new THREE.DirectionalLight(0xf2ebdd, 0.8);
    dl2.position.set(-3, -2, 2);
    scene.add(dl2);

    const grp = new THREE.Group();
    scene.add(grp);

    // Faceted gold core
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.9, 0),
      new THREE.MeshStandardMaterial({
        color: 0xc9a35a,
        metalness: 1,
        roughness: 0.25,
        flatShading: true,
        emissive: 0x3a2a10,
        emissiveIntensity: 0.4
      })
    );
    grp.add(core);

    // Wire shells
    const shells = [];
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.2 + i * 0.35, 0),
        new THREE.MeshBasicMaterial({
          color: 0xd4b26a,
          wireframe: true,
          transparent: true,
          opacity: 0.35 - i * 0.08
        })
      );
      grp.add(s);
      shells.push(s);
    }

    // Orbiting tiny tetrahedra
    const orbs = [];
    for (let i = 0; i < 6; i++) {
      const o = new THREE.Mesh(
        new THREE.TetrahedronGeometry(0.08, 0),
        new THREE.MeshStandardMaterial({
          color: 0xf7eed1,
          metalness: 1,
          roughness: 0.2,
          emissive: 0xd4b26a,
          emissiveIntensity: 0.6
        })
      );
      o.userData.angle = (i / 6) * Math.PI * 2;
      o.userData.r = 2 + (i % 2) * 0.3;
      o.userData.speed = 0.3 + Math.random() * 0.3;
      o.userData.tilt = (Math.random() - 0.5) * 0.6;
      grp.add(o);
      orbs.push(o);
    }

    resize();

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -((e.clientY - r.top) / r.height) * 2 + 1;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.tx = 0; mouse.ty = 0;
    });

    const clock = new THREE.Clock();
    function tick() {
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      grp.rotation.y = t * 0.2 + mouse.x * 0.6;
      grp.rotation.x = mouse.y * 0.4 + Math.sin(t * 0.5) * 0.1;
      core.rotation.x = -t * 0.4;
      core.rotation.y = t * 0.3;
      shells.forEach((s, i) => {
        s.rotation.x = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1);
        s.rotation.y = t * (0.08 + i * 0.04);
      });
      orbs.forEach((o, i) => {
        o.userData.angle += o.userData.speed * 0.01;
        const a = o.userData.angle;
        const r = o.userData.r;
        o.position.x = Math.cos(a) * r;
        o.position.z = Math.sin(a) * r;
        o.position.y = Math.sin(a * 2 + i) * o.userData.tilt;
        o.rotation.x += 0.02;
        o.rotation.y += 0.03;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  // Boot when DOM is ready
  if (document.readyState !== 'loading') {
    initHero();
    initAbout();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initHero();
      initAbout();
    });
  }
})();
