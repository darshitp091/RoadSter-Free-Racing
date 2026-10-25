/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import type { TrafficType } from '../../types';

export interface TrafficMeshResult {
  group: THREE.Group;
  wheels: THREE.Group[];
  width: number;
  height: number;
  length: number;
}

export class TrafficVehicleBuilder {
  private static tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 18).rotateZ(Math.PI / 2);
  private static rimLipGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 16).rotateZ(Math.PI / 2);

  private static tireMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    roughness: 0.88,
    metalness: 0.08,
  });

  private static rimMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    metalness: 0.88,
    roughness: 0.22,
  });

  private static chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.08,
  });

  // Zero-transmission high performance tinted automotive glass
  private static glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0c0e14,
    metalness: 0.92,
    roughness: 0.04,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
  });

  private static headlampMat = new THREE.MeshBasicMaterial({ color: 0xfff9e6 });
  private static taillampMat = new THREE.MeshBasicMaterial({ color: 0xee1525 });

  public static createVehicle(type: TrafficType, colorHex: number): TrafficMeshResult {
    const group = new THREE.Group();
    const wheels: THREE.Group[] = [];

    // Automotive Metallic Paint Material
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      metalness: 0.45,
      roughness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x1e2025,
      roughness: 0.5,
      metalness: 0.5,
    });

    let width = 1.95;
    let height = 1.38;
    let length = 4.4;

    switch (type) {
      case 'tempo': {
        // Commercial delivery tempo / mini-truck
        width = 1.85;
        height = 1.95;
        length = 4.2;
        this.buildCommercialTempo(group, paintMat, trimMat, wheels);
        break;
      }
      case 'truck': {
        // Heavy 18-wheeler semi-truck & shipping container trailer
        width = 2.45;
        height = 2.9;
        length = 7.0;
        this.buildSemiTrailerTruck(group, paintMat, trimMat, wheels);
        break;
      }
      case 'xuv': {
        // Modern rugged aerodynamic XUV / Crossover
        width = 2.15;
        height = 1.85;
        length = 4.9;
        this.buildRuggedXUV(group, paintMat, trimMat, wheels);
        break;
      }
      case 'sports': {
        // Performance supercar
        width = 2.05;
        height = 1.18;
        length = 4.3;
        this.buildSupercar(group, paintMat, trimMat, wheels);
        break;
      }
      case 'car':
      default: {
        // Executive electric sedan
        width = 1.95;
        height = 1.38;
        length = 4.5;
        this.buildExecutiveCar(group, paintMat, trimMat, wheels);
        break;
      }
    }

    // Realistic Contact Shadow under vehicle
    const shadowGeo = new THREE.PlaneGeometry(width * 1.08, length * 1.06);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05060a,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    group.add(shadow);

    return { group, wheels, width, height, length };
  }

  private static addRealisticWheel(
    parent: THREE.Group,
    wheels: THREE.Group[],
    x: number,
    y: number,
    z: number,
    radius: number = 0.35
  ) {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(this.tireGeo, this.tireMat);
    const rim = new THREE.Mesh(this.rimLipGeo, this.rimMat);

    if (radius !== 0.35) {
      const s = radius / 0.35;
      tire.scale.set(s, s, s);
      rim.scale.set(s, s, s);
    }

    wheelGroup.add(tire, rim);
    wheelGroup.position.set(x, y, z);
    parent.add(wheelGroup);
    wheels.push(wheelGroup);
  }

  // --- 1. REFINED COMMERCIAL DELIVERY TEMPO ---
  private static buildCommercialTempo(
    group: THREE.Group,
    paint: THREE.Material,
    trim: THREE.Material,
    wheels: THREE.Group[]
  ) {
    // Sculpted aerodynamic cab with sloped front profile
    const cabShape = new THREE.Shape();
    cabShape.moveTo(-0.85, 0.4);
    cabShape.lineTo(-0.88, 1.3);
    cabShape.bezierCurveTo(-0.85, 1.8, -0.6, 2.05, 0.0, 2.05);
    cabShape.bezierCurveTo(0.6, 2.05, 0.85, 1.8, 0.88, 1.3);
    cabShape.lineTo(0.85, 0.4);
    cabShape.closePath();

    const cabGeo = new THREE.ExtrudeGeometry(cabShape, {
      depth: 1.45,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    cabGeo.center();
    cabGeo.rotateY(Math.PI / 2);
    cabGeo.computeVertexNormals();

    const cab = new THREE.Mesh(cabGeo, paint);
    cab.position.set(0, 1.15, 1.25);
    cab.castShadow = true;

    // Curved Panoramic Windshield
    const winGeo = new THREE.CylinderGeometry(0.75, 0.82, 1.5, 16, 1, false, 0, Math.PI);
    winGeo.rotateZ(Math.PI / 2);
    winGeo.rotateY(Math.PI / 2);
    winGeo.scale(1.05, 0.5, 0.9);
    winGeo.computeVertexNormals();
    const windshield = new THREE.Mesh(winGeo, this.glassMat);
    windshield.position.set(0, 1.38, 1.45);
    windshield.rotation.x = -0.18;

    // Rear Flatbed Cargo Floor & Corrugated Side Walls
    const cargoFloor = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.18, 2.4), trim);
    cargoFloor.position.set(0, 0.6, -0.8);
    cargoFloor.castShadow = true;

    // Corrugated side walls
    const cargoSideL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 2.38), paint);
    cargoSideL.position.set(-0.88, 1.0, -0.8);
    const cargoSideR = cargoSideL.clone();
    cargoSideR.position.x = 0.88;

    const cargoBack = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.85, 0.08), paint);
    cargoBack.position.set(0, 1.0, -1.98);

    // Round classic tempo headlights with chrome bezels
    const headGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.06, 14).rotateX(Math.PI / 2);
    const bezelGeo = new THREE.TorusGeometry(0.14, 0.02, 8, 16);

    for (const side of [-0.62, 0.62]) {
      const head = new THREE.Mesh(headGeo, this.headlampMat);
      const bezel = new THREE.Mesh(bezelGeo, this.chromeMat);
      head.position.set(side, 0.72, 2.05);
      bezel.position.set(side, 0.72, 2.06);
      group.add(head, bezel);
    }

    // Front contoured bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.22, 0.25), trim);
    bumper.position.set(0, 0.35, 2.05);

    // Rear taillights
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.05), this.taillampMat);
    tailL.position.set(-0.75, 0.65, -2.02);
    const tailR = tailL.clone();
    tailR.position.x = 0.75;

    group.add(cab, windshield, cargoFloor, cargoSideL, cargoSideR, cargoBack, bumper, tailL, tailR);

    // Wheels
    this.addRealisticWheel(group, wheels, -0.92, 0.34, 1.25, 0.34);
    this.addRealisticWheel(group, wheels, 0.92, 0.34, 1.25, 0.34);
    this.addRealisticWheel(group, wheels, -0.92, 0.34, -1.1, 0.34);
    this.addRealisticWheel(group, wheels, 0.92, 0.34, -1.1, 0.34);
  }

  // --- 2. REFINED HEAVY 18-WHEELER SEMI-TRUCK ---
  private static buildSemiTrailerTruck(
    group: THREE.Group,
    paint: THREE.Material,
    trim: THREE.Material,
    wheels: THREE.Group[]
  ) {
    // Sculpted aerodynamic cab with sloped prow and roof deflector
    const cabShape = new THREE.Shape();
    cabShape.moveTo(-1.15, 0.4);
    cabShape.lineTo(-1.18, 1.6);
    cabShape.bezierCurveTo(-1.1, 2.4, -0.6, 2.55, 0.0, 2.55);
    cabShape.bezierCurveTo(0.6, 2.55, 1.1, 2.4, 1.18, 1.6);
    cabShape.lineTo(1.15, 0.4);
    cabShape.closePath();

    const cabGeo = new THREE.ExtrudeGeometry(cabShape, {
      depth: 2.15,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    });
    cabGeo.center();
    cabGeo.rotateY(Math.PI / 2);
    cabGeo.computeVertexNormals();

    const cab = new THREE.Mesh(cabGeo, paint);
    cab.position.set(0, 1.35, 2.25);
    cab.castShadow = true;

    // Curved cab windshield
    const winGeo = new THREE.CylinderGeometry(1.0, 1.05, 2.05, 16, 1, false, 0, Math.PI);
    winGeo.rotateZ(Math.PI / 2);
    winGeo.rotateY(Math.PI / 2);
    winGeo.scale(1.0, 0.45, 0.75);
    winGeo.computeVertexNormals();
    const windshield = new THREE.Mesh(winGeo, this.glassMat);
    windshield.position.set(0, 1.68, 2.65);
    windshield.rotation.x = -0.12;

    // Chrome front radiator grille
    const grilleGeo = new THREE.BoxGeometry(1.55, 0.85, 0.08);
    const grille = new THREE.Mesh(grilleGeo, this.chromeMat);
    grille.position.set(0, 0.95, 3.38);

    // Chrome twin vertical exhaust stacks
    const stackGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 12);
    const stackL = new THREE.Mesh(stackGeo, this.chromeMat);
    stackL.position.set(-1.22, 2.3, 1.35);
    const stackR = stackL.clone();
    stackR.position.x = 1.22;

    // Chrome cylindrical fuel tanks
    const tankGeo = new THREE.CylinderGeometry(0.32, 0.32, 1.4, 16).rotateZ(Math.PI / 2);
    const tankL = new THREE.Mesh(tankGeo, this.chromeMat);
    tankL.position.set(-1.18, 0.5, 0.6);
    const tankR = tankL.clone();
    tankR.position.x = 1.18;

    // 40ft Shipping Container with realistic corrugated wall appearance
    const containerMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde8,
      metalness: 0.35,
      roughness: 0.4,
    });
    const cargoBox = new THREE.Mesh(new THREE.BoxGeometry(2.44, 2.25, 4.8), containerMat);
    cargoBox.position.set(0, 1.72, -1.25);
    cargoBox.castShadow = true;

    // Headlights
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.06), this.headlampMat);
    headL.position.set(-0.85, 0.8, 3.38);
    const headR = headL.clone();
    headR.position.x = 0.85;

    // Rear trailer safety underride bar
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.06), this.taillampMat);
    tailBar.position.set(0, 0.55, -3.66);

    group.add(cab, windshield, grille, stackL, stackR, tankL, tankR, cargoBox, headL, headR, tailBar);

    // 6 wheels
    const wheelY = 0.44;
    const r = 0.44;
    this.addRealisticWheel(group, wheels, -1.22, wheelY, 2.35, r);
    this.addRealisticWheel(group, wheels, 1.22, wheelY, 2.35, r);
    this.addRealisticWheel(group, wheels, -1.22, wheelY, -1.5, r);
    this.addRealisticWheel(group, wheels, 1.22, wheelY, -1.5, r);
    this.addRealisticWheel(group, wheels, -1.22, wheelY, -2.8, r);
    this.addRealisticWheel(group, wheels, 1.22, wheelY, -2.8, r);
  }

  // --- 3. REFINED RUGGED ELECTRIC XUV / CROSSOVER ---
  private static buildRuggedXUV(
    group: THREE.Group,
    paint: THREE.Material,
    trim: THREE.Material,
    wheels: THREE.Group[]
  ) {
    // Muscular aerodynamic coupe-SUV body
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.05, -2.35);
    bodyShape.bezierCurveTo(-1.08, -1.2, -1.06, 0.5, -1.02, 1.6);
    bodyShape.bezierCurveTo(-0.95, 2.2, -0.6, 2.45, 0, 2.46);
    bodyShape.bezierCurveTo(0.6, 2.45, 0.95, 2.2, 1.02, 1.6);
    bodyShape.bezierCurveTo(1.06, 0.5, 1.08, -1.2, 1.05, -2.35);
    bodyShape.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.6,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    });
    bodyGeo.center();
    bodyGeo.rotateX(-Math.PI / 2);
    bodyGeo.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeo, paint);
    body.position.set(0, 0.72, 0);
    body.castShadow = true;

    // Curved Greenhouse Cabin
    const cabinGeo = new THREE.CylinderGeometry(0.72, 0.95, 2.85, 20, 1, false, 0, Math.PI);
    canopyGeoFix: {
      cabinGeo.rotateZ(Math.PI / 2);
      cabinGeo.rotateY(Math.PI / 2);
      cabinGeo.scale(1.15, 0.62, 1.0);
      cabinGeo.computeVertexNormals();
    }
    const cabin = new THREE.Mesh(cabinGeo, this.glassMat);
    cabin.position.set(0, 1.42, -0.15);

    // Silver roof luggage rails
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 2.5), this.chromeMat);
    railL.position.set(-0.82, 1.84, -0.15);
    const railR = railL.clone();
    railR.position.x = 0.82;

    // Front skid plate & bull guard
    const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.4), this.chromeMat);
    skidPlate.position.set(0, 0.36, 2.42);

    // Dual-bar LED headlights
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.06), this.headlampMat);
    headL.position.set(-0.72, 0.82, 2.44);
    const headR = headL.clone();
    headR.position.x = 0.72;

    // Full-width connected LED taillight strip
    const tailStrip = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.06, 0.06), this.taillampMat);
    tailStrip.position.set(0, 1.05, -2.44);

    group.add(body, cabin, railL, railR, skidPlate, headL, headR, tailStrip);

    // Large SUV wheels
    const wheelY = 0.45;
    const r = 0.44;
    this.addRealisticWheel(group, wheels, -1.06, wheelY, 1.55, r);
    this.addRealisticWheel(group, wheels, 1.06, wheelY, 1.55, r);
    this.addRealisticWheel(group, wheels, -1.06, wheelY, -1.55, r);
    this.addRealisticWheel(group, wheels, 1.06, wheelY, -1.55, r);
  }

  // --- 4. REFINED EXECUTIVE ELECTRIC SEDAN ---
  private static buildExecutiveCar(
    group: THREE.Group,
    paint: THREE.Material,
    trim: THREE.Material,
    wheels: THREE.Group[]
  ) {
    // Sleek aerodynamic sedan body with smooth curves
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-0.94, -2.2);
    bodyShape.bezierCurveTo(-0.98, -1.2, -0.96, 0.4, -0.96, 1.4);
    bodyShape.bezierCurveTo(-0.92, 1.9, -0.6, 2.22, 0, 2.25);
    bodyShape.bezierCurveTo(0.6, 2.22, 0.92, 1.9, 0.96, 1.4);
    bodyShape.bezierCurveTo(0.96, 0.4, 0.98, -1.2, 0.94, -2.2);
    bodyShape.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    });
    bodyGeo.center();
    bodyGeo.rotateX(-Math.PI / 2);
    bodyGeo.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeo, paint);
    body.position.set(0, 0.44, 0);
    body.castShadow = true;

    // Curved Fastback Greenhouse
    const cabinGeo = new THREE.CylinderGeometry(0.62, 0.85, 2.45, 20, 1, false, 0, Math.PI);
    cabinGeo.rotateZ(Math.PI / 2);
    cabinGeo.rotateY(Math.PI / 2);
    cabinGeo.scale(1.15, 0.55, 1.0);
    cabinGeo.computeVertexNormals();
    const cabin = new THREE.Mesh(cabinGeo, this.glassMat);
    cabin.position.set(0, 0.88, -0.1);

    // Aerodynamic side mirrors
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.1), paint);
    mirrorL.position.set(-0.95, 0.84, 0.55);
    const mirrorR = mirrorL.clone();
    mirrorR.position.x = 0.95;

    // Matrix LED headlights
    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.08), this.headlampMat);
    headL.position.set(-0.65, 0.48, 2.22);
    const headR = headL.clone();
    headR.position.x = 0.65;

    // Full-width rear horizon taillight
    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.045, 0.06), this.taillampMat);
    tailBar.position.set(0, 0.56, -2.22);

    group.add(body, cabin, mirrorL, mirrorR, headL, headR, tailBar);

    this.addRealisticWheel(group, wheels, -0.96, 0.35, 1.4);
    this.addRealisticWheel(group, wheels, 0.96, 0.35, 1.4);
    this.addRealisticWheel(group, wheels, -0.96, 0.35, -1.4);
    this.addRealisticWheel(group, wheels, 0.96, 0.35, -1.4);
  }

  // --- 5. REFINED PERFORMANCE SUPERCAR ---
  private static buildSupercar(
    group: THREE.Group,
    paint: THREE.Material,
    trim: THREE.Material,
    wheels: THREE.Group[]
  ) {
    // Ultra-low wedge body
    const bodyShape = new THREE.Shape();
    bodyShape.moveTo(-1.0, -2.1);
    bodyShape.bezierCurveTo(-1.02, -1.2, -1.0, 0.4, -0.98, 1.3);
    bodyShape.bezierCurveTo(-0.92, 1.8, -0.5, 2.15, 0, 2.18);
    bodyShape.bezierCurveTo(0.5, 2.15, 0.92, 1.8, 0.98, 1.3);
    bodyShape.bezierCurveTo(1.0, 0.4, 1.02, -1.2, 1.0, -2.1);
    bodyShape.closePath();

    const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    bodyGeo.center();
    bodyGeo.rotateX(-Math.PI / 2);
    bodyGeo.computeVertexNormals();

    const body = new THREE.Mesh(bodyGeo, paint);
    body.position.set(0, 0.35, 0);
    body.castShadow = true;

    // Curved cockpit canopy
    const canopyGeo = new THREE.CylinderGeometry(0.52, 0.72, 1.95, 20, 1, false, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);
    canopyGeo.rotateY(Math.PI / 2);
    canopyGeo.scale(1.15, 0.52, 1.0);
    canopyGeo.computeVertexNormals();
    const canopy = new THREE.Mesh(canopyGeo, this.glassMat);
    canopy.position.set(0, 0.68, -0.15);

    // Front carbon splitter
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.05, 0.5), trim);
    splitter.position.set(0, 0.18, 2.05);

    // High downforce rear wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.04, 0.32), trim);
    wing.position.set(0, 0.82, -2.0);

    const headL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.06), this.headlampMat);
    headL.position.set(-0.7, 0.42, 2.14);
    const headR = headL.clone();
    headR.position.x = 0.7;

    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.04, 0.05), this.taillampMat);
    tailBar.position.set(0, 0.52, -2.12);

    group.add(body, canopy, splitter, wing, headL, headR, tailBar);

    this.addRealisticWheel(group, wheels, -1.0, 0.33, 1.3);
    this.addRealisticWheel(group, wheels, 1.0, 0.33, 1.3);
    this.addRealisticWheel(group, wheels, -1.0, 0.33, -1.3);
    this.addRealisticWheel(group, wheels, 1.0, 0.33, -1.3);
  }
}
