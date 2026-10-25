/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';

interface ActiveParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

export class ParticleSystem {
  public points: THREE.Points;
  private maxParticles = 300;
  private activeCount = 0;
  private particles: ActiveParticle[] = [];

  private positions: Float32Array;
  private colors: Float32Array;
  private geometry: THREE.BufferGeometry;

  // Speed lines geometry
  public speedLines: THREE.LineSegments;
  private speedLineGeo: THREE.BufferGeometry;
  private numSpeedLines = 60;

  constructor() {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        size: 0.1,
        color: new THREE.Color(1, 1, 1),
      });
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Particle sprite using procedural canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(62,225,245,0.8)');
    grad.addColorStop(1, 'rgba(62,225,245,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.PointsMaterial({
      size: 0.45,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    this.points = new THREE.Points(this.geometry, material);

    // Speed lines
    const linePos = new Float32Array(this.numSpeedLines * 6);
    this.speedLineGeo = new THREE.BufferGeometry();
    this.speedLineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3ee1f5,
      transparent: true,
      opacity: 0,
    });

    this.speedLines = new THREE.LineSegments(this.speedLineGeo, lineMat);
    this.initSpeedLines();
  }

  private initSpeedLines() {
    const pos = this.speedLineGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < this.numSpeedLines; i++) {
      const idx = i * 6;
      const x = (Math.random() - 0.5) * 16;
      const y = Math.random() * 5 + 0.5;
      const z = -Math.random() * 50;
      const len = 3 + Math.random() * 4;

      pos[idx] = x;
      pos[idx + 1] = y;
      pos[idx + 2] = z;

      pos[idx + 3] = x;
      pos[idx + 4] = y;
      pos[idx + 5] = z - len;
    }
    this.speedLineGeo.attributes.position.needsUpdate = true;
  }

  public emitOrbBurst(x: number, y: number, z: number) {
    const burstCount = 28;
    const cyan = new THREE.Color(0x3ee1f5);
    const gold = new THREE.Color(0xffe29a);

    for (let i = 0; i < burstCount; i++) {
      const p = this.particles[(this.activeCount + i) % this.maxParticles];
      p.x = x;
      p.y = y;
      p.z = z;

      const angle = Math.random() * Math.PI * 2;
      const speed = 3.5 + Math.random() * 5;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed + 2;
      p.vz = (Math.random() - 0.5) * 6;

      p.life = 0;
      p.maxLife = 0.5 + Math.random() * 0.35;
      p.color.copy(Math.random() > 0.4 ? cyan : gold);
    }
    this.activeCount = (this.activeCount + burstCount) % this.maxParticles;
  }

  public emitCrashDebris(x: number, y: number, z: number) {
    const count = 75;
    const orange = new THREE.Color(0xff7a6b);
    const white = new THREE.Color(0xf4f1ea);
    const dark = new THREE.Color(0x2a2b33);

    for (let i = 0; i < count; i++) {
      const p = this.particles[(this.activeCount + i) % this.maxParticles];
      p.x = x + (Math.random() - 0.5) * 0.6;
      p.y = y + Math.random() * 0.5;
      p.z = z + (Math.random() - 0.5) * 0.6;

      p.vx = (Math.random() - 0.5) * 14;
      p.vy = 4 + Math.random() * 12;
      p.vz = -10 + (Math.random() - 0.5) * 16;

      p.life = 0;
      p.maxLife = 0.8 + Math.random() * 0.6;
      const rnd = Math.random();
      p.color.copy(rnd < 0.4 ? orange : rnd < 0.7 ? white : dark);
    }
    this.activeCount = (this.activeCount + count) % this.maxParticles;
  }

  public emitThrusterSparks(x: number, y: number, z: number, isBoosting: boolean) {
    const count = isBoosting ? 4 : 2;
    const cyan = new THREE.Color(0x3ee1f5);

    for (let i = 0; i < count; i++) {
      const p = this.particles[(this.activeCount + i) % this.maxParticles];
      p.x = x + (Math.random() - 0.5) * 0.5;
      p.y = y + (Math.random() - 0.5) * 0.2;
      p.z = z;

      p.vx = (Math.random() - 0.5) * 1.5;
      p.vy = (Math.random() - 0.5) * 1.2;
      p.vz = -(isBoosting ? 22 : 12) - Math.random() * 4;

      p.life = 0;
      p.maxLife = 0.2 + Math.random() * 0.15;
      p.color.copy(cyan);
    }
    this.activeCount = (this.activeCount + count) % this.maxParticles;
  }

  public update(delta: number, carSpeed: number, isBoosting: boolean, carPos: THREE.Vector3) {
    const pos = this.positions;
    const col = this.colors;

    // Update particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      const idx = i * 3;

      if (p.life < p.maxLife) {
        p.life += delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 18 * delta; // gravity

        const alpha = Math.max(0, 1 - p.life / p.maxLife);
        pos[idx] = p.x;
        pos[idx + 1] = p.y;
        pos[idx + 2] = p.z;

        col[idx] = p.color.r * alpha;
        col[idx + 1] = p.color.g * alpha;
        col[idx + 2] = p.color.b * alpha;
      } else {
        pos[idx + 1] = -500;
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    // Update speed lines around car
    const lineMat = this.speedLines.material as THREE.LineBasicMaterial;
    const linePos = this.speedLineGeo.attributes.position.array as Float32Array;

    const targetOpacity = isBoosting ? 0.75 : carSpeed > 55 ? (carSpeed - 55) / 20 * 0.45 : 0;
    lineMat.opacity = THREE.MathUtils.damp(lineMat.opacity, targetOpacity, 10, delta);

    if (lineMat.opacity > 0.02) {
      for (let i = 0; i < this.numSpeedLines; i++) {
        const idx = i * 6;
        let z = linePos[idx + 2] + carSpeed * delta * 1.6;
        if (z > carPos.z + 5) {
          z = carPos.z - 45 - Math.random() * 20;
          linePos[idx] = carPos.x + (Math.random() - 0.5) * 14;
          linePos[idx + 1] = Math.random() * 5 + 0.5;
          linePos[idx + 3] = linePos[idx];
          linePos[idx + 4] = linePos[idx + 1];
        }
        linePos[idx + 2] = z;
        linePos[idx + 5] = z - (isBoosting ? 8 : 4);
      }
      this.speedLineGeo.attributes.position.needsUpdate = true;
    }
  }
}
