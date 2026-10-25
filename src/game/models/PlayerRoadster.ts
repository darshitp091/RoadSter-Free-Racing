/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import { THEME_COLORS } from '../constants';

export class PlayerRoadster {
  public group: THREE.Group;
  public chassisGroup: THREE.Group;
  public wheels: THREE.Group[] = [];
  public rocketThrusterGroup: THREE.Group;
  public rocketFlameCores: THREE.Mesh[] = [];
  public rocketFlameHalos: THREE.Mesh[] = [];

  constructor(paintColor?: number) {
    this.group = new THREE.Group();
    this.chassisGroup = new THREE.Group();
    this.group.add(this.chassisGroup);
    this.rocketThrusterGroup = new THREE.Group();
    this.chassisGroup.add(this.rocketThrusterGroup);

    this.buildHighFidelityRoadster(paintColor ?? THEME_COLORS.roadsterCherry);
  }

  private buildHighFidelityRoadster(paintColor: number) {
    // 1. Premium Automotive Materials
    // Multi-coat Deep Metallic Paint
    const carPaintMaterial = new THREE.MeshPhysicalMaterial({
      color: paintColor,
      metalness: 0.58,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 0.96,
    });

    const carbonFiberMaterial = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.roadsterCarbon,
      metalness: 0.88,
      roughness: 0.32,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: THEME_COLORS.roadsterGlass,
      metalness: 0.95,
      roughness: 0.03,
      transparent: true,
      opacity: 0.82,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.06,
    });

    // 2. Sculpted Aerodynamic Monocoque Hull (Smooth Bezier Spline Profile)
    // Tapered prow, flared front fenders, tucked waistline, muscular rear haunches
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.96, -2.18);
    hullShape.bezierCurveTo(-1.06, -1.4, -1.06, -0.7, -0.96, 0.05); // Muscular rear haunch
    hullShape.bezierCurveTo(-0.96, 0.5, -1.03, 1.1, -1.0, 1.45);   // Flared front fender
    hullShape.bezierCurveTo(-0.98, 1.85, -0.76, 2.22, -0.38, 2.32); // Swept front nose
    hullShape.lineTo(0.38, 2.32);
    hullShape.bezierCurveTo(0.76, 2.22, 0.98, 1.85, 1.0, 1.45);
    hullShape.bezierCurveTo(1.03, 1.1, 0.96, 0.5, 0.96, 0.05);
    hullShape.bezierCurveTo(1.06, -0.7, 1.06, -1.4, 0.96, -2.18);
    hullShape.bezierCurveTo(0.65, -2.26, -0.65, -2.26, -0.96, -2.18);
    hullShape.closePath();

    const hullExtrude: THREE.ExtrudeGeometryOptions = {
      depth: 0.38,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 3,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, hullExtrude);
    hullGeo.center();
    hullGeo.rotateX(-Math.PI / 2);
    hullGeo.computeVertexNormals();

    const hullMesh = new THREE.Mesh(hullGeo, carPaintMaterial);
    hullMesh.position.y = 0.42;
    hullMesh.castShadow = true;
    this.chassisGroup.add(hullMesh);

    // 3. Sculpted Aerodynamic Hood with Twin Air Channel Depressions
    // Smooth sloped hood profile with curved bevels
    const hoodShape = new THREE.Shape();
    hoodShape.moveTo(-0.72, -0.7);
    hoodShape.lineTo(-0.72, 0.2);
    hoodShape.bezierCurveTo(-0.7, 0.6, -0.55, 0.85, -0.28, 0.92);
    hoodShape.lineTo(0.28, 0.92);
    hoodShape.bezierCurveTo(0.55, 0.85, 0.7, 0.6, 0.72, 0.2);
    hoodShape.lineTo(0.72, -0.7);
    hoodShape.closePath();

    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    });
    hoodGeo.center();
    hoodGeo.rotateX(-Math.PI / 2);
    hoodGeo.computeVertexNormals();

    const hoodMesh = new THREE.Mesh(hoodGeo, carPaintMaterial);
    hoodMesh.position.set(0, 0.56, 1.25);
    hoodMesh.rotation.x = -0.11;
    this.chassisGroup.add(hoodMesh);

    // Front Nose Aero Dam & Splitter
    const splitterShape = new THREE.Shape();
    splitterShape.moveTo(-0.95, -0.2);
    splitterShape.lineTo(-0.95, 0.1);
    splitterShape.bezierCurveTo(-0.85, 0.38, -0.5, 0.5, 0, 0.52);
    splitterShape.bezierCurveTo(0.5, 0.5, 0.85, 0.38, 0.95, 0.1);
    splitterShape.lineTo(0.95, -0.2);
    splitterShape.closePath();

    const splitterGeo = new THREE.ExtrudeGeometry(splitterShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    splitterGeo.center();
    splitterGeo.rotateX(-Math.PI / 2);

    const splitter = new THREE.Mesh(splitterGeo, carbonFiberMaterial);
    splitter.position.set(0, 0.21, 2.08);
    this.chassisGroup.add(splitter);

    // 4. Curved Panoramic Targa Glass Canopy & Cockpit
    const canopyGeo = new THREE.CylinderGeometry(0.56, 0.82, 2.15, 24, 2, false, 0, Math.PI);
    canopyGeo.rotateZ(Math.PI / 2);
    canopyGeo.rotateY(Math.PI / 2);
    canopyGeo.scale(1.22, 0.65, 1.0);
    canopyGeo.computeVertexNormals();

    const canopy = new THREE.Mesh(canopyGeo, glassMaterial);
    canopy.position.set(0, 0.72, -0.16);
    this.chassisGroup.add(canopy);

    // Interior Sports Bucket Seats with sculpted headrests
    const seatBaseGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.45, 12);
    seatBaseGeo.scale(0.9, 0.85, 0.9);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.35 });

    const leftSeat = new THREE.Mesh(seatBaseGeo, seatMat);
    leftSeat.position.set(-0.35, 0.6, -0.2);
    const rightSeat = leftSeat.clone();
    rightSeat.position.x = 0.35;

    const headrestGeo = new THREE.SphereGeometry(0.1, 10, 8);
    headrestGeo.scale(1.0, 1.3, 0.8);
    const leftHeadrest = new THREE.Mesh(headrestGeo, seatMat);
    leftHeadrest.position.set(-0.35, 0.88, -0.38);
    const rightHeadrest = leftHeadrest.clone();
    rightHeadrest.position.x = 0.35;

    // Tesla Steering Yoke
    const yokeShape = new THREE.Shape();
    yokeShape.moveTo(-0.13, -0.06);
    yokeShape.lineTo(-0.13, 0.06);
    yokeShape.lineTo(0.13, 0.06);
    yokeShape.lineTo(0.13, -0.06);
    yokeShape.closePath();
    const yokeGeo = new THREE.ExtrudeGeometry(yokeShape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
    yokeGeo.center();
    const yoke = new THREE.Mesh(yokeGeo, carbonFiberMaterial);
    yoke.position.set(-0.35, 0.72, 0.38);
    yoke.rotation.x = -0.3;

    this.chassisGroup.add(leftSeat, rightSeat, leftHeadrest, rightHeadrest, yoke);

    // 5. Streamlined Aerodynamic Teardrop Side Mirrors
    const mirrorStemGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.16, 8);
    mirrorStemGeo.rotateZ(Math.PI / 3);
    const mirrorHousingGeo = new THREE.ConeGeometry(0.08, 0.24, 12);
    mirrorHousingGeo.rotateX(Math.PI / 2);
    mirrorHousingGeo.scale(1.2, 0.8, 1.0);

    const mirrorL = new THREE.Group();
    const stemL = new THREE.Mesh(mirrorStemGeo, carbonFiberMaterial);
    const housingL = new THREE.Mesh(mirrorHousingGeo, carPaintMaterial);
    housingL.position.set(-0.1, 0.07, 0);
    const glassFaceL = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), chromeMaterial);
    glassFaceL.position.set(-0.1, 0.07, -0.08);
    glassFaceL.rotation.y = Math.PI;
    mirrorL.add(stemL, housingL, glassFaceL);
    mirrorL.position.set(-0.92, 0.82, 0.65);

    const mirrorR = new THREE.Group();
    const stemR = new THREE.Mesh(mirrorStemGeo, carbonFiberMaterial);
    stemR.rotation.z = -Math.PI / 3;
    const housingR = new THREE.Mesh(mirrorHousingGeo, carPaintMaterial);
    housingR.position.set(0.1, 0.07, 0);
    const glassFaceR = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), chromeMaterial);
    glassFaceR.position.set(0.1, 0.07, -0.08);
    glassFaceR.rotation.y = Math.PI;
    mirrorR.add(stemR, housingR, glassFaceR);
    mirrorR.position.set(0.92, 0.82, 0.65);

    this.chassisGroup.add(mirrorL, mirrorR);

    // 6. Cambered Airfoil Rear Spoiler & High-Downforce Diffuser
    // True cambered airfoil wing profile
    const wingShape = new THREE.Shape();
    wingShape.moveTo(-0.18, 0.0);
    wingShape.bezierCurveTo(-0.15, 0.05, 0.05, 0.06, 0.18, 0.01);
    wingShape.bezierCurveTo(0.12, -0.02, -0.1, -0.02, -0.18, 0.0);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 1.84,
      bevelEnabled: true,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    wingGeo.center();
    wingGeo.rotateY(Math.PI / 2);

    const spoiler = new THREE.Mesh(wingGeo, carbonFiberMaterial);
    spoiler.position.set(0, 0.86, -2.18);
    spoiler.rotation.x = 0.06;

    // Wing pylons
    const pylonGeo = new THREE.BoxGeometry(0.04, 0.18, 0.16);
    const leftPylon = new THREE.Mesh(pylonGeo, carbonFiberMaterial);
    leftPylon.position.set(-0.62, 0.76, -2.14);
    const rightPylon = leftPylon.clone();
    rightPylon.position.x = 0.62;
    this.chassisGroup.add(spoiler, leftPylon, rightPylon);

    // Rear Underbody Diffuser with 4 swept strakes
    const diffuserBaseGeo = new THREE.BoxGeometry(1.68, 0.14, 0.72);
    const diffuser = new THREE.Mesh(diffuserBaseGeo, carbonFiberMaterial);
    diffuser.position.set(0, 0.22, -1.98);
    diffuser.rotation.x = -0.22;
    this.chassisGroup.add(diffuser);

    for (let s = -0.6; s <= 0.6; s += 0.4) {
      const strakeGeo = new THREE.BoxGeometry(0.03, 0.16, 0.65);
      const strake = new THREE.Mesh(strakeGeo, carbonFiberMaterial);
      strake.position.set(s, 0.24, -2.0);
      strake.rotation.x = -0.22;
      this.chassisGroup.add(strake);
    }

    // 7. Multi-Element LED Matrix Projector Headlights
    // Swept curved housing with twin projector spheres and bright DRL eyebrow
    for (const isRight of [false, true]) {
      const side = isRight ? 1 : -1;
      const headGroup = new THREE.Group();

      const housingGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.42, 10);
      housingGeo.rotateZ(Math.PI / 2);
      housingGeo.scale(0.8, 0.35, 1.0);
      const housing = new THREE.Mesh(housingGeo, carbonFiberMaterial);
      headGroup.add(housing);

      // Twin projector lens spheres
      const lensGeo = new THREE.SphereGeometry(0.045, 10, 8);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const innerLens = new THREE.Mesh(lensGeo, lensMat);
      innerLens.position.set(0.08, 0, 0.08);
      const outerLens = new THREE.Mesh(lensGeo, lensMat);
      outerLens.position.set(-0.08, 0, 0.08);

      // Swept LED DRL blade eyebrow
      const drlGeo = new THREE.BoxGeometry(0.38, 0.02, 0.06);
      const drlMat = new THREE.MeshBasicMaterial({ color: 0xe8f8ff });
      const drl = new THREE.Mesh(drlGeo, drlMat);
      drl.position.set(0, 0.04, 0.06);

      headGroup.add(innerLens, outerLens, drl);
      headGroup.position.set(side * 0.68, 0.48, 2.18);
      headGroup.rotation.y = -side * 0.22;
      headGroup.rotation.x = -0.06;
      this.chassisGroup.add(headGroup);
    }

    // Continuous Full-Width Rear Horizon Red Light Ribbon
    const tailRibbonGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.76, 16);
    tailRibbonGeo.rotateZ(Math.PI / 2);
    const tailRibbonMat = new THREE.MeshBasicMaterial({ color: 0xff142b });
    const tailRibbon = new THREE.Mesh(tailRibbonGeo, tailRibbonMat);
    tailRibbon.position.set(0, 0.62, -2.26);
    this.chassisGroup.add(tailRibbon);

    // 8. SpaceX Cold-Gas Rocket Thruster Nozzle at Center Rear
    const thrusterBellGeo = new THREE.CylinderGeometry(0.16, 0.28, 0.36, 18);
    thrusterBellGeo.rotateX(Math.PI / 2);
    const bellMat = new THREE.MeshStandardMaterial({
      color: 0x1f2127,
      metalness: 0.95,
      roughness: 0.18,
    });
    const thrusterBell = new THREE.Mesh(thrusterBellGeo, bellMat);
    thrusterBell.position.set(0, 0.42, -2.25);
    this.rocketThrusterGroup.add(thrusterBell);

    // Rocket Plasma Flame Cores
    const flameCoreGeo = new THREE.ConeGeometry(0.16, 1.4, 14);
    flameCoreGeo.rotateX(-Math.PI / 2);
    const flameCoreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });
    const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
    flameCore.position.set(0, 0.42, -2.95);
    flameCore.scale.set(0.01, 0.01, 0.01);
    this.rocketThrusterGroup.add(flameCore);
    this.rocketFlameCores.push(flameCore);

    const flameHaloGeo = new THREE.ConeGeometry(0.28, 1.8, 14);
    flameHaloGeo.rotateX(-Math.PI / 2);
    const flameHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff3b69,
      transparent: true,
      opacity: 0.65,
    });
    const flameHalo = new THREE.Mesh(flameHaloGeo, flameHaloMat);
    flameHalo.position.set(0, 0.42, -3.15);
    flameHalo.scale.set(0.01, 0.01, 0.01);
    this.rocketThrusterGroup.add(flameHalo);
    this.rocketFlameHalos.push(flameHalo);

    // 9. Realistic Multi-Part Turbine Wheels
    const wheelPositions = [
      { x: -0.98, y: 0.35, z: 1.36, isRight: false },
      { x: 0.98, y: 0.35, z: 1.36, isRight: true },
      { x: -1.02, y: 0.36, z: -1.42, isRight: false },
      { x: 1.02, y: 0.36, z: -1.42, isRight: true },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = this.createRealisticWheel(pos.isRight);
      wheel.position.set(pos.x, pos.y, pos.z);
      this.chassisGroup.add(wheel);
      this.wheels.push(wheel);
    });

    // 10. Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(2.38, 4.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x050608,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    this.group.add(shadow);
  }

  private createRealisticWheel(isRightSide: boolean): THREE.Group {
    const wheel = new THREE.Group();

    // Tire with rounded tread shoulder
    const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.28, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x141518,
      roughness: 0.88,
      metalness: 0.08,
    });
    const tire = new THREE.Mesh(tireGeo, tireMat);
    wheel.add(tire);

    // Drilled Brake Rotor Disc
    const rotorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x8a8e99,
      metalness: 0.95,
      roughness: 0.22,
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    wheel.add(rotor);

    // Brembo Performance Red Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.14, 0.18);
    const caliperMat = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.roadsterCalipers,
      roughness: 0.3,
      metalness: 0.4,
    });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isRightSide ? 0.06 : -0.06, 0.12, 0.08);
    wheel.add(caliper);

    // Gunmetal Multi-Spoke Turbine Rim
    const rimMat = new THREE.MeshStandardMaterial({
      color: THEME_COLORS.roadsterRims,
      metalness: 0.92,
      roughness: 0.18,
    });

    const rimLipGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.29, 18);
    rimLipGeo.rotateZ(Math.PI / 2);
    const rimLip = new THREE.Mesh(rimLipGeo, rimMat);
    wheel.add(rimLip);

    // 7 Directional turbine aero spokes
    const spokeCount = 7;
    const spokeGeo = new THREE.BoxGeometry(0.03, 0.24, 0.04);
    for (let i = 0; i < spokeCount; i++) {
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      const angle = (i * Math.PI * 2) / spokeCount;
      spoke.position.set(
        isRightSide ? 0.13 : -0.13,
        Math.cos(angle) * 0.12,
        Math.sin(angle) * 0.12
      );
      spoke.rotation.x = angle;
      spoke.rotation.z = isRightSide ? 0.18 : -0.18;
      wheel.add(spoke);
    }

    return wheel;
  }

  public update(
    delta: number,
    forwardSpeed: number,
    targetTilt: number,
    targetPitch: number,
    rollAngle: number,
    airFlopAngle: number,
    isFlying: boolean,
    isBoosting: boolean
  ) {
    // 1. Wheel spin with forward ground velocity
    const wheelRotSpeed = (forwardSpeed / 0.35) * delta;
    this.wheels.forEach((w) => {
      w.rotation.x += wheelRotSpeed;
    });

    // 2. Body lateral tilt & pitch damping
    this.chassisGroup.rotation.z = THREE.MathUtils.damp(
      this.chassisGroup.rotation.z,
      targetTilt,
      14,
      delta
    );
    this.chassisGroup.rotation.x = THREE.MathUtils.damp(
      this.chassisGroup.rotation.x,
      targetPitch,
      12,
      delta
    );

    // 3. Barrel roll & acrobatic air flop
    if (rollAngle !== 0) {
      this.chassisGroup.rotation.z += rollAngle;
    }
    if (airFlopAngle !== 0) {
      this.chassisGroup.rotation.x += airFlopAngle;
    }

    // 4. Rocket Thruster Plumes
    const isTurboActive = isBoosting;
    const isFlightActive = isFlying;
    const targetScale = isTurboActive ? 1.6 : isFlightActive ? 0.85 : 0.01;
    const flicker = 1 + (Math.random() * 0.25 - 0.12);

    this.rocketFlameCores.forEach((core) => {
      const current = core.scale.x;
      const next = THREE.MathUtils.damp(current, targetScale * flicker, 20, delta);
      core.scale.set(next, next, next * (isTurboActive ? 2.5 : 1.4));
      core.visible = next > 0.05;
    });

    this.rocketFlameHalos.forEach((halo) => {
      const current = halo.scale.x;
      const next = THREE.MathUtils.damp(current, targetScale * 1.3 * flicker, 18, delta);
      halo.scale.set(next, next, next * (isTurboActive ? 2.8 : 1.6));
      halo.visible = next > 0.05;
    });
  }
}
