/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import type { RoadEnvironment } from './models/RoadEnvironment';

export interface SunsetStageConfig {
  name: string;
  distance: number;
  skyZenith: number;
  skyHorizon: number;
  skyHaze: number;
  fogColor: number;
  sunColor: number;
  coronaColor: number;
  sunY: number;
  dirLightColor: number;
  dirLightIntensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  mountainColor: number;
  starsAlpha: number;
}

export const SUNSET_STAGES: SunsetStageConfig[] = [
  {
    name: 'GOLDEN HOUR',
    distance: 0,
    skyZenith: 0x191238,      // Deep twilight indigo
    skyHorizon: 0xf85d26,     // Vibrant warm sunset orange
    skyHaze: 0xff9040,        // Warm golden haze
    fogColor: 0x3d1628,       // Warm atmospheric twilight haze
    sunColor: 0xffaa36,       // Golden glowing sun
    coronaColor: 0xff4d22,    // Warm sunset corona
    sunY: 32,                 // High sunset position
    dirLightColor: 0xffa850,  // Golden sunlight
    dirLightIntensity: 2.2,
    hemiSkyColor: 0xffcaa0,
    hemiGroundColor: 0x2d1a28,
    mountainColor: 0x3d1428,
    starsAlpha: 0.0,
  },
  {
    name: 'CRIMSON DUSK',
    distance: 400,
    skyZenith: 0x120726,      // Deep violet nightfall
    skyHorizon: 0xe62650,     // Vivid magenta-crimson sunset
    skyHaze: 0xff546a,        // Radiant coral-pink haze
    fogColor: 0x2f0e24,       // Deep ruby-plum fog
    sunColor: 0xff3830,       // Blood orange setting sun
    coronaColor: 0xc91838,    // Crimson outer corona
    sunY: 18,                 // Sinking behind ridges
    dirLightColor: 0xff5e62,  // Warm crimson sunlight
    dirLightIntensity: 1.8,
    hemiSkyColor: 0xe86b8b,
    hemiGroundColor: 0x1a0d20,
    mountainColor: 0x2e0d1e,
    starsAlpha: 0.15,
  },
  {
    name: 'PURPLE TWILIGHT',
    distance: 800,
    skyZenith: 0x09071c,      // Inky velvet navy
    skyHorizon: 0x6a1b7e,     // Deep royal violet
    skyHaze: 0x962886,        // Electric violet glow
    fogColor: 0x190b28,       // Mysterious violet fog
    sunColor: 0xb81e55,       // Deep ruby solar ember
    coronaColor: 0x730f55,    // Plum corona
    sunY: 5,                  // Horizon silhouette line
    dirLightColor: 0xaa4b9c,  // Twilight violet wash
    dirLightIntensity: 1.3,
    hemiSkyColor: 0x8b4ea8,
    hemiGroundColor: 0x0e0818,
    mountainColor: 0x1a0a1f,
    starsAlpha: 0.55,
  },
  {
    name: 'CYBER MIDNIGHT',
    distance: 1200,
    skyZenith: 0x030612,      // Deepest cosmic space
    skyHorizon: 0x0a4a68,     // Radiant dark teal/cyan horizon
    skyHaze: 0x136c84,        // Neon cyan atmospheric haze
    fogColor: 0x061520,       // Cyber midnight fog
    sunColor: 0x38bdf8,       // Celestial moon halo
    coronaColor: 0x0ea5e9,    // Cyan corona ring
    sunY: -10,                // Below mountain line
    dirLightColor: 0x38bdf8,  // Moonlight / cyber glow
    dirLightIntensity: 0.95,
    hemiSkyColor: 0x38bdf8,
    hemiGroundColor: 0x040912,
    mountainColor: 0x0a121d,
    starsAlpha: 0.9,
  },
  {
    name: 'GOLDEN DAWN',
    distance: 1600,
    skyZenith: 0x0b1430,      // Deep sapphire dawn
    skyHorizon: 0xf97316,     // Brilliant dawn orange
    skyHaze: 0xfbbf24,        // Golden morning mist
    fogColor: 0x2d1726,       // Morning rose haze
    sunColor: 0xfef08a,       // Rising morning sun
    coronaColor: 0xf97316,    // Warm dawn corona
    sunY: 22,                 // Rising above horizon
    dirLightColor: 0xfed7aa,  // Fresh morning light
    dirLightIntensity: 2.0,
    hemiSkyColor: 0xfed7aa,
    hemiGroundColor: 0x1c1326,
    mountainColor: 0x2e1824,
    starsAlpha: 0.1,
  },
];

export const CYCLE_TOTAL_DISTANCE = 2000;

export class SkySystem {
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  // Working color instances to prevent per-frame garbage collection
  private currentZenith = new THREE.Color();
  private currentHorizon = new THREE.Color();
  private currentHaze = new THREE.Color();
  private currentFog = new THREE.Color();
  private currentSunColor = new THREE.Color();
  private currentCoronaColor = new THREE.Color();
  private currentDirColor = new THREE.Color();
  private currentHemiSky = new THREE.Color();
  private currentHemiGround = new THREE.Color();
  private currentMountainColor = new THREE.Color();

  private c1 = new THREE.Color();
  private c2 = new THREE.Color();
  private sunDirection = new THREE.Vector3(15, 30, 350);

  private currentPhaseName: string = SUNSET_STAGES[0].name;

  constructor() {
    // Large inverted hemisphere/sphere for continuous sky dome
    const skyGeo = new THREE.SphereGeometry(720, 32, 24);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(SUNSET_STAGES[0].skyZenith) },
        horizonColor: { value: new THREE.Color(SUNSET_STAGES[0].skyHorizon) },
        hazeColor: { value: new THREE.Color(SUNSET_STAGES[0].skyHaze) },
        sunColor: { value: new THREE.Color(SUNSET_STAGES[0].sunColor) },
        sunDirection: { value: new THREE.Vector3(15, 30, 350).normalize() },
        starsAlpha: { value: 0.0 },
      },
      vertexShader: `
        varying vec3 vLocalPosition;
        void main() {
          vLocalPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 hazeColor;
        uniform vec3 sunColor;
        uniform vec3 sunDirection;
        uniform float starsAlpha;

        varying vec3 vLocalPosition;

        // Fast hash for stars
        float hash21(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        void main() {
          vec3 viewDir = normalize(vLocalPosition);
          float y = viewDir.y;

          // 1. Smooth vertical multi-stop sky gradient
          float horizonFactor = smoothstep(-0.08, 0.45, y);
          vec3 sky = mix(horizonColor, topColor, horizonFactor);

          // 2. Warm atmospheric haze band near horizon
          float hazeBand = exp(-abs(y - 0.04) * 7.5);
          sky = mix(sky, hazeColor, hazeBand * 0.62);

          // 3. Sun disc radial scattering in sky dome
          vec3 normSunDir = normalize(sunDirection);
          float sunDot = max(0.0, dot(viewDir, normSunDir));
          float sunScatter = pow(sunDot, 14.0) * 0.45 + pow(sunDot, 90.0) * 0.95;
          sky += sunColor * sunScatter;

          // 4. Procedural starry sky during twilight/night
          if (starsAlpha > 0.01 && y > 0.12) {
            vec2 starCoord = viewDir.xz / (y + 0.12) * 220.0;
            vec2 gridId = floor(starCoord);
            float h = hash21(gridId);
            if (h > 0.981) {
              vec2 center = gridId + 0.5;
              float d = length(starCoord - center);
              float star = smoothstep(0.4, 0.0, d) * (0.65 + 0.35 * sin(h * 73.0));
              sky += vec3(0.92, 0.95, 1.0) * star * starsAlpha * smoothstep(0.12, 0.40, y);
            }
          }

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(skyGeo, this.material);
    this.mesh.renderOrder = -100;
  }

  /**
   * Updates sky dome, lights, fog, sun disc, and mountains based on current distance traveled.
   */
  public update(
    distance: number,
    cameraPos: THREE.Vector3,
    scene: THREE.Scene,
    dirLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight,
    roadEnv?: RoadEnvironment
  ) {
    // Keep sky dome locked to camera position so it surrounds the player endlessly
    this.mesh.position.copy(cameraPos);

    // Compute cycle progress within [0, CYCLE_TOTAL_DISTANCE)
    const cycleDist = Math.max(0, distance) % CYCLE_TOTAL_DISTANCE;
    const stageCount = SUNSET_STAGES.length;

    // Find the current stage index
    let idxA = 0;
    for (let i = 0; i < stageCount; i++) {
      if (cycleDist >= SUNSET_STAGES[i].distance) {
        idxA = i;
      }
    }
    const idxB = (idxA + 1) % stageCount;

    const stageA = SUNSET_STAGES[idxA];
    const stageB = SUNSET_STAGES[idxB];

    // Distance span between stageA and stageB
    let span = stageB.distance - stageA.distance;
    if (span <= 0) {
      span += CYCLE_TOTAL_DISTANCE;
    }

    let progressInStage = cycleDist - stageA.distance;
    if (progressInStage < 0) {
      progressInStage += CYCLE_TOTAL_DISTANCE;
    }

    const t = Math.min(1, Math.max(0, progressInStage / span));
    // Smooth cosine/cubic easing for liquid-smooth gradient transitions
    const smoothT = t * t * (3 - 2 * t);

    this.currentPhaseName = stageA.name;

    // 1. Lerp Zenith Sky Color
    this.c1.setHex(stageA.skyZenith);
    this.c2.setHex(stageB.skyZenith);
    this.currentZenith.lerpColors(this.c1, this.c2, smoothT);
    this.material.uniforms.topColor.value.copy(this.currentZenith);

    // 2. Lerp Horizon Sky Color
    this.c1.setHex(stageA.skyHorizon);
    this.c2.setHex(stageB.skyHorizon);
    this.currentHorizon.lerpColors(this.c1, this.c2, smoothT);
    this.material.uniforms.horizonColor.value.copy(this.currentHorizon);

    // 3. Lerp Atmospheric Haze Color
    this.c1.setHex(stageA.skyHaze);
    this.c2.setHex(stageB.skyHaze);
    this.currentHaze.lerpColors(this.c1, this.c2, smoothT);
    this.material.uniforms.hazeColor.value.copy(this.currentHaze);

    // 4. Lerp Scene Fog
    this.c1.setHex(stageA.fogColor);
    this.c2.setHex(stageB.fogColor);
    this.currentFog.lerpColors(this.c1, this.c2, smoothT);
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(this.currentFog);
    }
    if (scene.background && scene.background instanceof THREE.Color) {
      scene.background.copy(this.currentHorizon);
    }

    // 5. Lerp Sun Elevation & Colors
    this.c1.setHex(stageA.sunColor);
    this.c2.setHex(stageB.sunColor);
    this.currentSunColor.lerpColors(this.c1, this.c2, smoothT);
    this.material.uniforms.sunColor.value.copy(this.currentSunColor);

    this.c1.setHex(stageA.coronaColor);
    this.c2.setHex(stageB.coronaColor);
    this.currentCoronaColor.lerpColors(this.c1, this.c2, smoothT);

    const currentSunY = THREE.MathUtils.lerp(stageA.sunY, stageB.sunY, smoothT);
    this.sunDirection.set(15, Math.max(-5, currentSunY), 350).normalize();
    this.material.uniforms.sunDirection.value.copy(this.sunDirection);

    // 6. Lerp Starry Sky Alpha
    const starsAlpha = THREE.MathUtils.lerp(stageA.starsAlpha, stageB.starsAlpha, smoothT);
    this.material.uniforms.starsAlpha.value = starsAlpha;

    // 7. Lerp Lighting (Directional Sunlight & Hemisphere Ambient)
    this.c1.setHex(stageA.dirLightColor);
    this.c2.setHex(stageB.dirLightColor);
    this.currentDirColor.lerpColors(this.c1, this.c2, smoothT);
    dirLight.color.copy(this.currentDirColor);

    const dirIntensity = THREE.MathUtils.lerp(stageA.dirLightIntensity, stageB.dirLightIntensity, smoothT);
    dirLight.intensity = dirIntensity;

    this.c1.setHex(stageA.hemiSkyColor);
    this.c2.setHex(stageB.hemiSkyColor);
    this.currentHemiSky.lerpColors(this.c1, this.c2, smoothT);
    hemiLight.color.copy(this.currentHemiSky);

    this.c1.setHex(stageA.hemiGroundColor);
    this.c2.setHex(stageB.hemiGroundColor);
    this.currentHemiGround.lerpColors(this.c1, this.c2, smoothT);
    hemiLight.groundColor.copy(this.currentHemiGround);

    // 8. Update physical Sun Disc and Mountain Silhouettes in RoadEnvironment
    if (roadEnv) {
      if (roadEnv.sunDiscMesh) {
        roadEnv.sunDiscMesh.position.y = currentSunY;
      }
      if (roadEnv.sunCoronaMesh) {
        roadEnv.sunCoronaMesh.position.y = currentSunY;
      }
      if (roadEnv.sunDiscMat) {
        roadEnv.sunDiscMat.color.copy(this.currentSunColor);
        // Dim sun disc when under horizon
        roadEnv.sunDiscMat.opacity = currentSunY < 0 ? Math.max(0.2, 0.95 + currentSunY * 0.05) : 0.95;
      }
      if (roadEnv.sunCoronaMat) {
        roadEnv.sunCoronaMat.color.copy(this.currentCoronaColor);
        roadEnv.sunCoronaMat.opacity = currentSunY < 0 ? Math.max(0.1, 0.45 + currentSunY * 0.03) : 0.45;
      }
      if (roadEnv.mountainMat) {
        this.c1.setHex(stageA.mountainColor);
        this.c2.setHex(stageB.mountainColor);
        this.currentMountainColor.lerpColors(this.c1, this.c2, smoothT);
        roadEnv.mountainMat.color.copy(this.currentMountainColor);
      }
    }
  }

  public getPhaseName(distance: number): string {
    const cycleDist = Math.max(0, distance) % CYCLE_TOTAL_DISTANCE;
    let idx = 0;
    for (let i = 0; i < SUNSET_STAGES.length; i++) {
      if (cycleDist >= SUNSET_STAGES[i].distance) {
        idx = i;
      }
    }
    return SUNSET_STAGES[idx].name;
  }

  public dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
