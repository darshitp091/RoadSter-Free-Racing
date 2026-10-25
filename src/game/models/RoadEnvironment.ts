/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import { ROAD_WIDTH, ROAD_SEGMENT_LENGTH, LANES, THEME_COLORS } from '../constants';
import type { CollectibleOrb, OverheadObstacle, LaneIndex } from '../../types';

export class RoadEnvironment {
  public roadSegments: THREE.Group[] = [];
  public cityBuildingsGroup: THREE.Group = new THREE.Group();
  public sunGroup: THREE.Group = new THREE.Group();

  // Dynamic sky references for sunset cycle lerping
  public sunDiscMesh?: THREE.Mesh;
  public sunCoronaMesh?: THREE.Mesh;
  public sunDiscMat?: THREE.MeshBasicMaterial;
  public sunCoronaMat?: THREE.MeshBasicMaterial;
  public mountainsMesh?: THREE.Mesh;
  public mountainMat?: THREE.MeshBasicMaterial;

  // High performance realistic materials
  private roadMaterial: THREE.MeshStandardMaterial;
  private roadMarkingMaterial: THREE.MeshStandardMaterial;
  private curbMaterial: THREE.MeshStandardMaterial;
  private railMaterial: THREE.MeshStandardMaterial;
  private lampHeadMaterial: THREE.MeshBasicMaterial;

  // 24K Polished Gold Coin Materials
  private goldCoinBodyMat: THREE.MeshPhysicalMaterial;
  private goldEmbossMat: THREE.MeshPhysicalMaterial;
  private goldHaloMat: THREE.MeshBasicMaterial;

  // Modern Overhead Highway Gantry Materials
  private gantrySteelMat: THREE.MeshStandardMaterial;
  private gantryDisplayMat: THREE.MeshBasicMaterial;
  private gantryTextMat: THREE.MeshBasicMaterial;

  constructor() {
    // Realistic asphalt with sunset specular sheen
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.roadAsphalt,
      roughness: 0.72,
      metalness: 0.2,
    });

    // Retroreflective warm white lane markings
    this.roadMarkingMaterial = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.roadLine,
      roughness: 0.35,
      metalness: 0.2,
    });

    this.curbMaterial = new THREE.MeshStandardMaterial({
      color: 0x24262e,
      roughness: 0.7,
      metalness: 0.25,
    });

    this.railMaterial = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.barrierMetal,
      roughness: 0.32,
      metalness: 0.82,
    });

    this.lampHeadMaterial = new THREE.MeshBasicMaterial({
      color: 0xfffae6,
    });

    // 24K Polished High-Gloss Metallic Gold
    this.goldCoinBodyMat = new THREE.MeshPhysicalMaterial({
      color: THEME_COLORS.goldCoinCore,
      metalness: 0.96,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.98,
    });

    this.goldEmbossMat = new THREE.MeshPhysicalMaterial({
      color: THEME_COLORS.goldCoinRim,
      metalness: 0.98,
      roughness: 0.12,
      clearcoat: 1.0,
    });

    this.goldHaloMat = new THREE.MeshBasicMaterial({
      color: THEME_COLORS.goldCoinGlint,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });

    this.gantrySteelMat = new THREE.MeshStandardMaterial({
      color: 0x3e424e,
      roughness: 0.4,
      metalness: 0.75,
    });

    this.gantryDisplayMat = new THREE.MeshBasicMaterial({
      color: 0x07090f,
    });

    this.gantryTextMat = new THREE.MeshBasicMaterial({
      color: 0xffaa2b, // Amber LED dot matrix
    });
  }

  public createRoadSegment(index: number): THREE.Group {
    const segment = new THREE.Group();
    const halfL = ROAD_SEGMENT_LENGTH / 2;

    // 1. Asphalt Deck
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, ROAD_SEGMENT_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.receiveShadow = true;
    segment.add(roadMesh);

    // 2. Continuous Solid White Shoulder Lines
    const edgeLineWidth = 0.24;
    const edgeLineGeo = new THREE.PlaneGeometry(edgeLineWidth, ROAD_SEGMENT_LENGTH);
    edgeLineGeo.rotateX(-Math.PI / 2);

    const leftEdge = new THREE.Mesh(edgeLineGeo, this.roadMarkingMaterial);
    leftEdge.position.set(-ROAD_WIDTH / 2 + 0.65, 0.015, 0);
    const rightEdge = new THREE.Mesh(edgeLineGeo, this.roadMarkingMaterial);
    rightEdge.position.set(ROAD_WIDTH / 2 - 0.65, 0.015, 0);
    segment.add(leftEdge, rightEdge);

    // 3. Dashed Highway Lane Dividers
    const dashLength = 4.5;
    const dashGap = 4.5;
    const numDashes = Math.floor(ROAD_SEGMENT_LENGTH / (dashLength + dashGap));

    const dashGeo = new THREE.PlaneGeometry(0.2, dashLength);
    dashGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < numDashes; i++) {
      const z = -halfL + i * (dashLength + dashGap) + dashLength / 2;

      const dashL = new THREE.Mesh(dashGeo, this.roadMarkingMaterial);
      dashL.position.set(-1.9, 0.015, z);

      const dashR = new THREE.Mesh(dashGeo, this.roadMarkingMaterial);
      dashR.position.set(1.9, 0.015, z);

      segment.add(dashL, dashR);
    }

    // 4. Galvanized Steel W-Beam Crash Barriers & Realistic Posts
    const barrierZ = ROAD_SEGMENT_LENGTH;
    const leftBarrierX = -ROAD_WIDTH / 2 - 0.35;
    const rightBarrierX = ROAD_WIDTH / 2 + 0.35;

    // Concrete base curb
    const curbGeo = new THREE.BoxGeometry(0.65, 0.24, barrierZ);
    const leftCurb = new THREE.Mesh(curbGeo, this.curbMaterial);
    leftCurb.position.set(leftBarrierX, 0.12, 0);
    const rightCurb = leftCurb.clone();
    rightCurb.position.x = rightBarrierX;
    segment.add(leftCurb, rightCurb);

    // Galvanized guardrail beam
    const railGeo = new THREE.BoxGeometry(0.14, 0.38, barrierZ);
    const leftRail = new THREE.Mesh(railGeo, this.railMaterial);
    leftRail.position.set(leftBarrierX + 0.12, 0.68, 0);
    const rightRail = leftRail.clone();
    rightRail.position.x = rightBarrierX - 0.12;
    segment.add(leftRail, rightRail);

    // Posts every 5 meters
    const postGeo = new THREE.BoxGeometry(0.12, 0.75, 0.12);
    for (let pz = -halfL + 2.5; pz <= halfL; pz += 5.0) {
      const postL = new THREE.Mesh(postGeo, this.railMaterial);
      postL.position.set(leftBarrierX + 0.12, 0.37, pz);
      const postR = postL.clone();
      postR.position.x = rightBarrierX - 0.12;
      segment.add(postL, postR);
    }

    // 5. Modern Highway Streetlamp
    const lamp = this.createModernHighwayLamp(index % 2 === 0);
    lamp.position.set(
      index % 2 === 0 ? rightBarrierX + 1.2 : leftBarrierX - 1.2,
      0,
      0
    );
    if (index % 2 !== 0) {
      lamp.rotation.y = Math.PI;
    }
    segment.add(lamp);

    // 6. Highway sound barrier walls with horizontal architectural panels
    const soundWallGeo = new THREE.BoxGeometry(0.35, 3.4, ROAD_SEGMENT_LENGTH);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c1e28,
      roughness: 0.85,
      metalness: 0.15,
    });
    const leftWall = new THREE.Mesh(soundWallGeo, wallMat);
    leftWall.position.set(-ROAD_WIDTH / 2 - 3.8, 1.7, 0);
    const rightWall = leftWall.clone();
    rightWall.position.x = ROAD_WIDTH / 2 + 3.8;
    segment.add(leftWall, rightWall);

    return segment;
  }

  private createModernHighwayLamp(reachRight: boolean): THREE.Group {
    const lamp = new THREE.Group();

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.15, 8.2, 10);
    const pole = new THREE.Mesh(poleGeo, this.gantrySteelMat);
    pole.position.set(0, 4.1, 0);
    lamp.add(pole);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.08, 3.5, 8);
    armGeo.rotateZ(Math.PI / 3);
    const arm = new THREE.Mesh(armGeo, this.gantrySteelMat);
    arm.position.set(reachRight ? -1.4 : 1.4, 8.2, 0);
    lamp.add(arm);

    const headGeo = new THREE.BoxGeometry(0.85, 0.14, 0.32);
    const head = new THREE.Mesh(headGeo, this.lampHeadMaterial);
    head.position.set(reachRight ? -2.8 : 2.8, 8.4, 0);
    lamp.add(head);

    return lamp;
  }

  // --- AUTHENTIC 3D EMBOSSED 24K GOLD COIN MEDALLION ---
  public createCollectibleOrb(): CollectibleOrb {
    const coinGroup = new THREE.Group();

    // Solid fluted coin cylinder
    const coinCylinderGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.08, 24);
    coinCylinderGeo.rotateX(Math.PI / 2);
    const coinMesh = new THREE.Mesh(coinCylinderGeo, this.goldCoinBodyMat);

    // Beveled raised rim
    const rimGeo = new THREE.TorusGeometry(0.44, 0.035, 10, 24);
    const rimFront = new THREE.Mesh(rimGeo, this.goldEmbossMat);
    rimFront.position.z = 0.042;
    const rimBack = rimFront.clone();
    rimBack.position.z = -0.042;

    // High relief embossed energy star/lightning
    const starShape = new THREE.Shape();
    starShape.moveTo(-0.06, 0.28);
    starShape.lineTo(0.12, 0.04);
    starShape.lineTo(0.0, 0.04);
    starShape.lineTo(0.08, -0.28);
    starShape.lineTo(-0.12, -0.02);
    starShape.lineTo(0.0, -0.02);
    starShape.closePath();

    const starExtrude = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    starExtrude.center();
    const starMesh = new THREE.Mesh(starExtrude, this.goldEmbossMat);

    // Sparkling halo
    const haloGeo = new THREE.RingGeometry(0.52, 0.62, 16);
    const halo = new THREE.Mesh(haloGeo, this.goldHaloMat);

    coinGroup.add(coinMesh, rimFront, rimBack, starMesh, halo);

    return {
      mesh: coinGroup,
      lane: 1,
      z: 0,
      y: 1.2,
      active: true,
      rotSpeed: 3.2,
    };
  }

  // --- MODERN HIGHWAY OVERHEAD GANTRY ---
  public createOverheadObstacle(blockedLanes: LaneIndex[]): OverheadObstacle {
    const gantry = new THREE.Group();
    const clearanceY = 3.8;
    const topY = 6.4;
    const spanWidth = ROAD_WIDTH + 3.2;

    // Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.28, 0.32, topY, 10);
    const leftPillar = new THREE.Mesh(pillarGeo, this.gantrySteelMat);
    leftPillar.position.set(-spanWidth / 2, topY / 2, 0);
    const rightPillar = leftPillar.clone();
    rightPillar.position.x = spanWidth / 2;

    const spanGeo = new THREE.BoxGeometry(spanWidth, 0.65, 0.85);
    const crossSpan = new THREE.Mesh(spanGeo, this.gantrySteelMat);
    crossSpan.position.set(0, 5.4, 0);
    gantry.add(leftPillar, rightPillar, crossSpan);

    blockedLanes.forEach((laneIdx) => {
      const laneX = LANES[laneIdx];
      const displayBoard = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 1.85, 0.22),
        this.gantryDisplayMat
      );
      displayBoard.position.set(laneX, 4.0, 0);

      const amberText = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.5, 0.24),
        this.gantryTextMat
      );
      amberText.position.set(laneX, 4.2, 0);

      const strobe = new THREE.Mesh(
        new THREE.BoxGeometry(2.9, 0.12, 0.25),
        new THREE.MeshBasicMaterial({ color: 0xff3b52 })
      );
      strobe.position.set(laneX, 3.2, 0);

      gantry.add(displayBoard, amberText, strobe);
    });

    return {
      mesh: gantry,
      z: 0,
      blockedLanes,
      active: true,
      clearanceY,
      topY,
    };
  }

  // --- REALISTIC ARCHITECTURAL SKYLINE & SUNSET ENVIRONMENT ---
  public createArchitecturalSkyline(): THREE.Group {
    const group = new THREE.Group();

    // 1. Glowing Sunset Sun Disc at Horizon
    const sunDiscGeo = new THREE.CircleGeometry(45, 32);
    this.sunDiscMat = new THREE.MeshBasicMaterial({
      color: 0xffa436,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    this.sunDiscMesh = new THREE.Mesh(sunDiscGeo, this.sunDiscMat);
    this.sunDiscMesh.position.set(0, 28, 420);
    group.add(this.sunDiscMesh);

    // Sun Corona Glow
    const coronaGeo = new THREE.RingGeometry(44, 95, 32);
    this.sunCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xff5d26,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.sunCoronaMesh = new THREE.Mesh(coronaGeo, this.sunCoronaMat);
    this.sunCoronaMesh.position.set(0, 28, 418);
    group.add(this.sunCoronaMesh);

    // 2. Layered Distant Mountain Ridges with sunset rim lighting
    const mountainShape = new THREE.Shape();
    mountainShape.moveTo(-350, 0);
    mountainShape.lineTo(-240, 55);
    mountainShape.lineTo(-170, 32);
    mountainShape.lineTo(-90, 75);
    mountainShape.lineTo(0, 42);
    mountainShape.lineTo(95, 82);
    mountainShape.lineTo(190, 48);
    mountainShape.lineTo(270, 68);
    mountainShape.lineTo(350, 0);
    mountainShape.closePath();

    const mountainGeo = new THREE.ShapeGeometry(mountainShape);
    this.mountainMat = new THREE.MeshBasicMaterial({
      color: 0x3d1428, // Deep sunset silhouette
    });
    this.mountainsMesh = new THREE.Mesh(mountainGeo, this.mountainMat);
    this.mountainsMesh.position.set(0, 0, 390);
    group.add(this.mountainsMesh);

    // 3. Realistic Tiered Architectural Skyscrapers
    const buildingMat1 = new THREE.MeshStandardMaterial({
      color: 0x1e192c,
      roughness: 0.3,
      metalness: 0.85,
    });
    const buildingMat2 = new THREE.MeshStandardMaterial({
      color: 0x2d1a32,
      roughness: 0.25,
      metalness: 0.9,
    });
    const spireMat = new THREE.MeshBasicMaterial({ color: 0xff7b48 });

    // Procedural multi-tier skyscrapers
    const towers = [
      { x: -55, z: 120, w: 22, h: 85, tiers: 3 },
      { x: 55, z: 140, w: 24, h: 95, tiers: 3 },
      { x: -85, z: 200, w: 28, h: 120, tiers: 4 },
      { x: 85, z: 220, w: 30, h: 135, tiers: 4 },
      { x: -130, z: 280, w: 36, h: 160, tiers: 4 },
      { x: 130, z: 300, w: 38, h: 175, tiers: 4 },
      { x: -65, z: 320, w: 26, h: 110, tiers: 3 },
      { x: 65, z: 330, w: 28, h: 125, tiers: 3 },
      { x: -160, z: 160, w: 30, h: 90, tiers: 2 },
      { x: 160, z: 180, w: 32, h: 100, tiers: 2 },
      { x: -45, z: 240, w: 20, h: 75, tiers: 2 },
      { x: 45, z: 250, w: 22, h: 80, tiers: 2 },
    ];

    towers.forEach((t, idx) => {
      const mat = idx % 2 === 0 ? buildingMat1 : buildingMat2;
      let currentY = 0;
      let currentW = t.w;
      const tierH = t.h / t.tiers;

      for (let tier = 0; tier < t.tiers; tier++) {
        const boxGeo = new THREE.BoxGeometry(currentW, tierH, currentW);
        const mesh = new THREE.Mesh(boxGeo, mat);
        mesh.position.set(t.x, currentY + tierH / 2, t.z);
        group.add(mesh);

        currentY += tierH;
        currentW *= 0.75; // Step inward
      }

      // Communication Spire on Top of Tallest Towers
      if (t.h > 100) {
        const spireGeo = new THREE.CylinderGeometry(0.2, 0.8, 18, 6);
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(t.x, currentY + 9, t.z);
        group.add(spire);
      }
    });

    return group;
  }
}
