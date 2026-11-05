import * as THREE from 'three';
import { BETTA_VARIETIES } from './bettaTypes.js';

/**
 * Procedural animated 3D Betta Fish model
 */
export class BettaMesh extends THREE.Group {
  constructor(varietyId = 1, isFemale = false, isFry = false) {
    super();
    this.variety = BETTA_VARIETIES.find(v => v.id === varietyId) || BETTA_VARIETIES[0];
    this.isFemale = isFemale;
    this.isFry = isFry;
    this.animTime = Math.random() * 10;
    this.swimSpeed = 1.0;

    this.scaleModifier = isFry ? 0.35 : (isFemale ? 0.75 : 1.0);
    this.scale.set(this.scaleModifier, this.scaleModifier, this.scaleModifier);

    this.buildMesh();
  }

  buildMesh() {
    const colors = this.variety.colors;

    // Body Material with subtle iridescence/specular sheen
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: this.isFemale ? this.blendColors(colors.body, 0xdddddd, 0.3) : colors.body,
      roughness: 0.3,
      metalness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9
    });

    // Fin Material: translucent, double sided, glowing
    const finMat = new THREE.MeshPhysicalMaterial({
      color: this.isFemale ? this.blendColors(colors.fins, 0xffffff, 0.4) : colors.fins,
      transmission: 0.4,
      opacity: 0.85,
      transparent: true,
      roughness: 0.25,
      side: THREE.DoubleSide,
      clearcoat: 0.5
    });

    const finEdgeMat = new THREE.MeshBasicMaterial({
      color: colors.finEdges,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });

    // Main Body (Tapered ellipsoid)
    const bodyGeo = new THREE.ConeGeometry(0.35, 1.6, 16);
    bodyGeo.rotateZ(Math.PI / 2);
    bodyGeo.scale(1.0, 0.65, 0.45); // Flattened laterally like a true fish
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.x = 0.2;
    this.add(this.bodyMesh);

    // Fish Head / Snout
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    headGeo.scale(1.0, 0.75, 0.55);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.position.set(0.8, 0, 0);
    this.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ color: colors.eye, roughness: 0.1 });
    const pupilGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Left Eye
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.9, 0.08, 0.18);
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0.93, 0.08, 0.22);
    this.add(leftEye, leftPupil);

    // Right Eye
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.9, 0.08, -0.18);
    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.93, 0.08, -0.22);
    this.add(rightEye, rightPupil);

    // Mouth
    const mouthGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: colors.body });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(1.08, -0.02, 0);
    mouth.rotation.y = Math.PI / 2;
    mouth.rotation.x = Math.PI;
    this.add(mouth);

    // Tail Bone Pivot Hierarchy (for realistic undulating wave)
    this.tailBone1 = new THREE.Group();
    this.tailBone1.position.set(-0.55, 0, 0);
    this.add(this.tailBone1);

    const tailGeo1 = new THREE.ConeGeometry(0.24, 0.7, 12);
    tailGeo1.rotateZ(Math.PI / 2);
    tailGeo1.scale(1.0, 0.6, 0.35);
    const tailMesh1 = new THREE.Mesh(tailGeo1, bodyMat);
    tailMesh1.position.set(-0.35, 0, 0);
    this.tailBone1.add(tailMesh1);

    this.tailBone2 = new THREE.Group();
    this.tailBone2.position.set(-0.7, 0, 0);
    this.tailBone1.add(this.tailBone2);

    // Caudal (Tail) Fin
    this.createCaudalFin(this.tailBone2, finMat, finEdgeMat);

    // Dorsal Fin (Top)
    this.createDorsalFin(bodyMat, finMat, finEdgeMat);

    // Anal Fin (Bottom rear)
    this.createAnalFin(finMat, finEdgeMat);

    // Pelvic/Ventral Fins (Two long thread-like feelers below chin)
    this.createVentralFins(finEdgeMat);

    // Pectoral Fins (Left & Right flapping fins)
    this.createPectoralFins(finMat);
  }

  createCaudalFin(parent, mat, edgeMat) {
    const style = this.variety.finStyle;
    const finGroup = new THREE.Group();

    if (style === 'crowntail') {
      // Rayed comb fin
      const rayCount = 14;
      for (let i = 0; i < rayCount; i++) {
        const angle = ((i / (rayCount - 1)) - 0.5) * Math.PI * 0.85;
        const length = 1.2 + Math.cos(angle * 1.5) * 0.4;
        const rayGeo = new THREE.CylinderGeometry(0.015, 0.03, length, 6);
        rayGeo.rotateZ(Math.PI / 2);
        const ray = new THREE.Mesh(rayGeo, edgeMat);
        ray.position.set(-length / 2, 0, 0);
        ray.rotation.z = angle;
        finGroup.add(ray);
      }
    } else if (style === 'plakat') {
      // Short athletic rounded tail
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(-0.5, 0.45, -0.9, 0.2);
      shape.quadraticCurveTo(-1.1, 0, -0.9, -0.2);
      shape.quadraticCurveTo(-0.5, -0.45, 0, 0);
      const geo = new THREE.ShapeGeometry(shape);
      const fin = new THREE.Mesh(geo, mat);
      finGroup.add(fin);
    } else if (style === 'veiltail') {
      // Long cascading downward tail
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.2);
      shape.bezierCurveTo(-0.8, 0.3, -1.6, -0.3, -2.1, -1.0);
      shape.bezierCurveTo(-1.8, -1.2, -1.2, -0.8, -0.6, -0.4);
      shape.quadraticCurveTo(-0.2, -0.2, 0, -0.15);
      const geo = new THREE.ShapeGeometry(shape);
      const fin = new THREE.Mesh(geo, mat);
      finGroup.add(fin);
    } else if (style === 'rosetail') {
      // Layered ruffled petal tail
      for (let layer = 0; layer < 3; layer++) {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.bezierCurveTo(-0.7, 0.8 + layer * 0.1, -1.4, 0.7, -1.6 - layer * 0.1, 0);
        shape.bezierCurveTo(-1.4, -0.7, -0.7, -0.8 - layer * 0.1, 0, 0);
        const geo = new THREE.ShapeGeometry(shape);
        const fin = new THREE.Mesh(geo, mat);
        fin.position.z = (layer - 1) * 0.05;
        finGroup.add(fin);
      }
    } else {
      // Classic Halfmoon 180 degree fan
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.05);
      shape.absarc(0, 0, 1.4, Math.PI * 0.6, Math.PI * 1.4, false);
      shape.lineTo(0, -0.05);
      const geo = new THREE.ShapeGeometry(shape);
      const fin = new THREE.Mesh(geo, mat);
      finGroup.add(fin);

      // Accent border
      const borderGeo = new THREE.RingGeometry(1.36, 1.44, 24, 1, Math.PI * 0.6, Math.PI * 0.8);
      const border = new THREE.Mesh(borderGeo, edgeMat);
      finGroup.add(border);
    }

    parent.add(finGroup);
  }

  createDorsalFin(bodyMat, mat, edgeMat) {
    const shape = new THREE.Shape();
    shape.moveTo(0.3, 0.3);
    shape.bezierCurveTo(0.0, 0.75, -0.7, 0.85, -1.0, 0.4);
    shape.quadraticCurveTo(-0.4, 0.3, -0.3, 0.15);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    const dorsal = new THREE.Mesh(geo, mat);
    dorsal.position.set(0, 0, 0);
    this.add(dorsal);
  }

  createAnalFin(mat, edgeMat) {
    const shape = new THREE.Shape();
    shape.moveTo(0.1, -0.25);
    shape.bezierCurveTo(-0.3, -0.8, -0.9, -0.85, -1.2, -0.3);
    shape.quadraticCurveTo(-0.5, -0.25, -0.2, -0.15);
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    const analFin = new THREE.Mesh(geo, mat);
    this.add(analFin);
  }

  createVentralFins(edgeMat) {
    // Two long pelvic tendrils
    const geo = new THREE.CylinderGeometry(0.015, 0.005, 0.75, 4);
    geo.rotateZ(-Math.PI * 0.25);

    this.ventralLeft = new THREE.Mesh(geo, edgeMat);
    this.ventralLeft.position.set(0.4, -0.35, 0.07);
    this.add(this.ventralLeft);

    this.ventralRight = new THREE.Mesh(geo, edgeMat);
    this.ventralRight.position.set(0.4, -0.35, -0.07);
    this.add(this.ventralRight);
  }

  createPectoralFins(mat) {
    const isDumbo = this.variety.finStyle === 'dumbo';
    const finScale = isDumbo ? 0.75 : 0.35;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.3, 0.6, 0.1, 0.7, -0.2);
    shape.bezierCurveTo(0.4, -0.3, 0.2, -0.2, 0, 0);
    const geo = new THREE.ShapeGeometry(shape);

    this.pectoralLeft = new THREE.Mesh(geo, mat);
    this.pectoralLeft.scale.set(finScale, finScale, finScale);
    this.pectoralLeft.position.set(0.55, -0.05, 0.25);
    this.pectoralLeft.rotation.y = Math.PI * 0.25;
    this.add(this.pectoralLeft);

    this.pectoralRight = new THREE.Mesh(geo, mat);
    this.pectoralRight.scale.set(finScale, finScale, finScale);
    this.pectoralRight.position.set(0.55, -0.05, -0.25);
    this.pectoralRight.rotation.y = -Math.PI * 0.25;
    this.add(this.pectoralRight);
  }

  blendColors(hex1, hex2, ratio) {
    const c1 = new THREE.Color(hex1);
    const c2 = new THREE.Color(hex2);
    c1.lerp(c2, ratio);
    return c1.getHex();
  }

  /**
   * Update swimming kinematics
   */
  update(delta = 0.016, moving = true) {
    const speed = moving ? 8.0 * this.swimSpeed : 3.5;
    this.animTime += delta * speed;

    const angle1 = Math.sin(this.animTime) * (moving ? 0.38 : 0.18);
    const angle2 = Math.sin(this.animTime - 0.7) * (moving ? 0.52 : 0.25);

    if (this.tailBone1) this.tailBone1.rotation.y = angle1;
    if (this.tailBone2) this.tailBone2.rotation.y = angle2;

    // Flutter pectoral fins
    const flap = Math.sin(this.animTime * 1.5) * 0.35;
    if (this.pectoralLeft) this.pectoralLeft.rotation.y = 0.3 + flap;
    if (this.pectoralRight) this.pectoralRight.rotation.y = -0.3 - flap;

    // Ventral fin trailing swing
    if (this.ventralLeft) this.ventralLeft.rotation.x = Math.sin(this.animTime * 0.8) * 0.15;
    if (this.ventralRight) this.ventralRight.rotation.x = -Math.sin(this.animTime * 0.8) * 0.15;
  }
}
