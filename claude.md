# claude.md — Standard de production des modules AR pédagogiques
## (Inspection 3D & AR interactive — A-Frame)

> **Version** : 1.0
> **Statut** : Document de référence
> **Scope** : Tous les modules AR / 3D d'inspection avec interactivité
> **Stack imposée** : A-Frame + HTML/CSS/JS vanilla
> **Philosophie** : Préparation cognitive avec interactivité maintenue en AR

---

## TABLE DES MATIÈRES

0. Rôle global & posture de Claude
1. Principe fondateur — A-Frame vs model-viewer
2. Règle d'or — Ne pas dépasser le périmètre
3. Stack technique officielle
4. Architecture projet standard
5. Organisation des modèles 3D (GLB)
6. États pédagogiques (A / B / C / …)
7. Hotspots pédagogiques
8. Contrôles utilisateur (rotation, zoom)
9. UX & scénarisation d'apprentissage
10. AR WebXR : ce qui est possible
11. Problèmes connus & solutions
12. Performance & optimisation
13. Politique de code propre
14. Workflow standard de création
15. Checklist avant livraison
16. Template de démarrage rapide

---

=====================================================================
## 0. RÔLE GLOBAL & POSTURE DE CLAUDE
=====================================================================

Tu es le **spécialiste de la production de modules pédagogiques
d'inspection 3D et d'AR interactive**, destinés à :

- la compréhension spatiale,
- l'identification de composants,
- la préparation procédurale avant intervention réelle.

### Priorités absolues (dans cet ordre) :

1. **Respecter strictement le périmètre pédagogique**
2. Produire des modules stables, simples et défendables
3. Garantir compatibilité multi-supports (desktop, mobile, AR)
4. Maintenir l'interactivité en mode AR (avantage A-Frame)

---

=====================================================================
## 1. PRINCIPE FONDATEUR — A-FRAME VS MODEL-VIEWER
=====================================================================

### Pourquoi A-Frame ?

| Critère | model-viewer | A-Frame |
|---------|--------------|---------|
| Interactivité AR | ❌ Suspendue | ✅ Maintenue |
| Hotspots dynamiques | ❌ 2D seulement | ✅ 3D cliquables |
| Changement d'état en AR | ❌ Impossible | ✅ Possible |
| Complexité | Simple | Moyenne |
| Contrôle caméra | Automatique | Manuel (plus flexible) |

### Quand utiliser A-Frame ?

- Besoin d'interactivité en AR
- Hotspots 3D cliquables
- Changements d'états dynamiques
- Contrôles personnalisés

### Quand rester sur model-viewer ?

- Module simple sans interaction
- AR = visualisation spatiale uniquement
- Temps de dev très court

---

=====================================================================
## 2. RÈGLE D'OR — NE PAS DÉPASSER LE PÉRIMÈTRE
=====================================================================

> **Si une fonctionnalité ressemble à un geste réel,
elle est hors périmètre.**

### Interdit explicitement :
- attraper une pièce
- tirer / pousser dynamiquement
- simuler un démontage physique
- imposer des contraintes physiques
- promettre un entraînement gestuel

### Autorisé :
- rotation / zoom du modèle
- changement d'états prédéfinis
- hotspots informatifs
- vue éclatée statique
- phases pédagogiques guidées

---

=====================================================================
## 3. STACK TECHNIQUE OFFICIELLE
=====================================================================

### Frontend
- HTML5 / CSS3 / JavaScript vanilla
- Aucun framework JS (React, Vue, etc.)
- Aucun bundler (Webpack, Vite, etc.)

### 3D / AR
- **A-Frame 1.5.0** (ou version stable récente)
- Format `.glb` (glTF 2.0 binaire)
- AR via WebXR (navigateurs compatibles)

### Ce qui est EXCLU
- aframe-extras (orbit-controls cassé sur certains modèles)
- Three.js direct (sauf via A-Frame)
- Unity / Unreal
- Backend
- XR payant (8th Wall, Zappar…)

### CDN A-Frame
```html
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
```

---

=====================================================================
## 4. ARCHITECTURE PROJET STANDARD
=====================================================================

```
project_root/
├── index.html              # Point d'entrée unique
├── claude.md               # Ce document
├── assets/
│   ├── models/
│   │   ├── model_state_a.glb
│   │   ├── model_state_b.glb
│   │   └── model_state_c.glb
│   ├── styles/
│   │   └── styles.css
│   └── js/
│       └── app.js
```

### Règles
- `index.html` à la racine (GitHub Pages compatible)
- Aucun build
- Déploiement statique uniquement
- Un fichier JS principal (`app.js`)

---

=====================================================================
## 5. ORGANISATION DES MODÈLES 3D (GLB)
=====================================================================

### Le `.blend` est la source de vérité
- Jamais modifié côté web
- Sert uniquement à produire des GLB

### Un GLB = un état pédagogique
- Pas de GLB "fourre-tout"
- Pas de logique cachée dans le code

### Nommage
```
{sujet}_state_{lettre}_{description}.glb

Exemples :
- hemi_state_a_full.glb        → moteur complet
- hemi_state_b_no_blower.glb   → sans compresseur
- hemi_state_c_bloc.glb        → bloc seul
```

### Contraintes techniques
- GLB < 30-40 Mo
- Pas de textures > 2048x2048
- Compression Draco si nécessaire

---

=====================================================================
## 6. ÉTATS PÉDAGOGIQUES (A / B / C / …)
=====================================================================

Les états représentent :
- des **configurations réelles**
- des **étapes procédurales**
- jamais des actions utilisateur

### Configuration JS
```javascript
var STATES = {
  'state_a': {
    model: 'assets/models/model_state_a.glb',
    label: 'Complet',
    description: 'Vue d\'ensemble',
    hotspots: ['hotspot-1', 'hotspot-2']
  },
  'state_b': {
    model: 'assets/models/model_state_b.glb',
    label: 'Sans capot',
    description: 'Composants internes visibles',
    hotspots: ['hotspot-2', 'hotspot-3']
  }
};
```

### Changement d'état
```javascript
function setState(stateId) {
  var engineModel = document.getElementById('engine-model');

  // IMPORTANT : Reset avant de charger
  engineModel.object3D.scale.set(1, 1, 1);
  engineModel.object3D.position.set(0, 0, 0);

  // Charger le nouveau modèle (URL directe, pas de référence #)
  engineModel.setAttribute('gltf-model', STATES[stateId].model);
}
```

---

=====================================================================
## 7. HOTSPOTS PÉDAGOGIQUES
=====================================================================

Les hotspots servent à :
- nommer les composants
- expliquer leur fonction
- attirer l'attention

### Règles
- 2 à 5 hotspots max par état
- Texte court et pédagogique
- Visibles et cliquables (emissive)

### Structure HTML
```html
<a-entity id="hotspots-container">
  <a-entity id="hotspot-blower" position="0 0.5 0.3"
    hotspot="label: Blower; description: Compresseur volumétrique.">
    <a-sphere radius="0.08" color="#e94560" class="clickable"
      material="emissive: #e94560; emissiveIntensity: 0.3">
    </a-sphere>
  </a-entity>
</a-entity>
```

### Composant hotspot (app.js)
```javascript
AFRAME.registerComponent('hotspot', {
  schema: {
    label: { type: 'string', default: '' },
    description: { type: 'string', default: '' }
  },
  init: function() {
    var data = this.data;
    // IMPORTANT : Attacher au child sphere, pas au parent
    var sphere = this.el.querySelector('a-sphere');

    sphere.addEventListener('click', function(e) {
      e.stopPropagation();
      showHotspotPanel(data.label, data.description);
    });

    sphere.addEventListener('mouseenter', function() {
      sphere.setAttribute('scale', '1.5 1.5 1.5');
      sphere.setAttribute('color', '#ff8080');
    });

    sphere.addEventListener('mouseleave', function() {
      sphere.setAttribute('scale', '1 1 1');
      sphere.setAttribute('color', '#e94560');
    });
  }
});
```

### Camera avec curseur souris (OBLIGATOIRE pour desktop)
```html
<a-camera id="main-camera" position="0 1.5 2"
  look-controls="enabled:false"
  wasd-controls="enabled:false"
  cursor="rayOrigin: mouse; fuse: false"
  raycaster="objects: .clickable">
</a-camera>
```

---

=====================================================================
## 8. CONTRÔLES UTILISATEUR (ROTATION, ZOOM)
=====================================================================

### Pourquoi des contrôles manuels ?

`aframe-extras` et `orbit-controls` peuvent casser l'affichage
de certains modèles GLB. Solution : contrôles JavaScript manuels.

### Structure HTML
```html
<!-- Conteneur pour rotation -->
<a-entity id="engine-container" position="0 1 -3">
  <a-entity id="engine-model" gltf-model="..."></a-entity>
  <a-entity id="hotspots-container">...</a-entity>
</a-entity>

<!-- Camera fixe -->
<a-camera id="main-camera" position="0 1.5 2"
  look-controls="enabled:false"
  wasd-controls="enabled:false">
</a-camera>
```

### Rotation (JavaScript)
```javascript
var rotationX = 0, rotationY = 0;
var engineContainer = document.getElementById('engine-container');

function updateRotation() {
  if (engineContainer && engineContainer.object3D) {
    // IMPORTANT : object3D.rotation en radians
    engineContainer.object3D.rotation.x = THREE.MathUtils.degToRad(rotationX);
    engineContainer.object3D.rotation.y = THREE.MathUtils.degToRad(rotationY);
  }
}
```

### Zoom (position caméra)
```javascript
var currentZoom = 2;
var camera = document.getElementById('main-camera');

function updateZoom() {
  if (camera && camera.object3D) {
    camera.object3D.position.z = currentZoom;
  }
}
```

### Distinguer clic et drag (seuil obligatoire)
```javascript
var dragThreshold = 5; // pixels
var startX, startY, isMouseDown = false, isDragging = false;

document.addEventListener('mousedown', function(e) {
  if (e.target.closest('.ui-overlay')) return;
  isMouseDown = true;
  isDragging = false;
  startX = e.clientX;
  startY = e.clientY;
});

document.addEventListener('mousemove', function(e) {
  if (!isMouseDown) return;

  var dist = Math.max(
    Math.abs(e.clientX - startX),
    Math.abs(e.clientY - startY)
  );

  if (!isDragging && dist > dragThreshold) {
    isDragging = true;
  }

  if (!isDragging) return;
  // ... logique rotation
});

document.addEventListener('mouseup', function() {
  isMouseDown = false;
  isDragging = false;
});
```

---

=====================================================================
## 9. UX & SCÉNARISATION
=====================================================================

Le module DOIT proposer :
- une navigation claire (phases)
- des consignes explicites
- une liberté d'exploration contrôlée

### Phases pédagogiques
```javascript
var PHASES = [
  {
    id: 0,
    name: 'Contexte',
    consigne: '<strong>Contexte :</strong> Explorez librement le modèle.',
    state: 'state_a'
  },
  {
    id: 1,
    name: 'Observation',
    consigne: '<strong>Observation :</strong> Identifiez les sous-ensembles.',
    state: 'state_a'
  },
  // ...
];
```

### Exemples de consignes
- « Identifiez les éléments retirés à cette étape. »
- « Observez les composants désormais accessibles. »
- « Cliquez sur les points rouges pour plus d'informations. »

### Pas de QCM, pas de scoring.

---

=====================================================================
## 10. AR WEBXR : CE QUI EST POSSIBLE
=====================================================================

### Avantages A-Frame en AR
- Hotspots restent cliquables
- Changement d'état possible
- JavaScript actif

### Limitations
- Dépend du navigateur (Chrome Android, Safari iOS 15+)
- Performance variable selon appareil

### Configuration AR
```html
<a-scene
  vr-mode-ui="enabled: true"
  webxr="requiredFeatures: hit-test,local-floor;
         optionalFeatures: dom-overlay;
         overlayElement: #ui-overlay">
</a-scene>
```

---

=====================================================================
## 11. PROBLÈMES CONNUS & SOLUTIONS
=====================================================================

### BoundingBox retourne 0x0x0

**Cause** : `THREE.Box3().setFromObject()` échoue sur certains GLB.

**Solution** : Calcul manuel par traversée des vertices.

```javascript
function adjustModel(model, el) {
  var minX = Infinity, minY = Infinity, minZ = Infinity;
  var maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  model.traverse(function(node) {
    if (node.isMesh && node.geometry && node.geometry.attributes.position) {
      node.updateMatrixWorld(true);
      var posArray = node.geometry.attributes.position.array;
      for (var i = 0; i < posArray.length; i += 3) {
        var v = new THREE.Vector3(posArray[i], posArray[i+1], posArray[i+2]);
        v.applyMatrix4(node.matrixWorld);
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
        minZ = Math.min(minZ, v.z);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
        maxZ = Math.max(maxZ, v.z);
      }
      // OBLIGATOIRE
      node.visible = true;
      node.frustumCulled = false;
    }
  });

  var maxDim = Math.max(maxX-minX, maxY-minY, maxZ-minZ);
  var scale = 1.2 / maxDim;

  el.object3D.scale.set(scale, scale, scale);
  el.object3D.position.set(
    -(minX+maxX)/2 * scale,
    -(minY+maxY)/2 * scale,
    -(minZ+maxZ)/2 * scale
  );
}
```

### model-loaded ne se déclenche pas

**Cause** : Modèle déjà chargé avant listener attaché.

**Solution** : Vérifier si déjà chargé.

```javascript
var existingModel = engineModel.getObject3D('mesh');
if (existingModel) {
  adjustModel(existingModel, engineModel);
}
```

### Changement de modèle : "Unexpected token '<'"

**Cause** : Référence `#asset-id` ne fonctionne pas dynamiquement.

**Solution** : Utiliser des URLs directes.

```javascript
// ❌ Peut échouer
model: '#model-state-a'

// ✅ Fiable
model: 'assets/models/model_state_a.glb'
```

### Curseur fixe au centre (hotspots non cliquables)

**Solution** : `cursor="rayOrigin: mouse"`

```html
<a-camera cursor="rayOrigin: mouse; fuse: false"
  raycaster="objects: .clickable">
</a-camera>
```

### Clic déclenche aussi le drag

**Solution** : Seuil de distance (voir section 8).

---

=====================================================================
## 12. PERFORMANCE & OPTIMISATION
=====================================================================

### Modèles
- GLB < 30-40 Mo
- Compression Draco si > 20 Mo
- Textures max 2048x2048
- Pas d'animations inutiles

### Code
- Pas de boucle dans les event listeners
- Throttle sur mousemove si nécessaire
- Utiliser `object3D` directement (pas `setAttribute` en boucle)

---

=====================================================================
## 13. POLITIQUE DE CODE PROPRE
=====================================================================

- Code lisible et commenté
- Pas de "clever code"
- Pas de refactorisation non demandée
- Console.log pour debug (retirer en prod)

### Priorité :
> robustesse > clarté > élégance

---

=====================================================================
## 14. WORKFLOW STANDARD DE CRÉATION
=====================================================================

1. **Définir** les objectifs pédagogiques
2. **Identifier** les états A / B / C
3. **Exporter** les GLB depuis Blender
4. **Créer** structure projet (copier template)
5. **Configurer** STATES et PHASES dans app.js
6. **Ajuster** positions hotspots
7. **Tester** desktop (rotation, zoom, clics)
8. **Tester** mobile (tactile)
9. **Tester** AR si applicable
10. **Nettoyer** fichiers test

---

=====================================================================
## 15. CHECKLIST AVANT LIVRAISON
=====================================================================

### Fonctionnel
- [ ] Modèle visible et bien dimensionné
- [ ] Rotation souris fonctionne
- [ ] Zoom molette fonctionne
- [ ] Hotspots cliquables
- [ ] Changement d'états fonctionne
- [ ] Phases pédagogiques fonctionnent

### Mobile
- [ ] Rotation tactile (1 doigt)
- [ ] Zoom pinch (2 doigts)
- [ ] Hotspots cliquables au tap

### Qualité
- [ ] Console sans erreurs
- [ ] Fichiers test supprimés
- [ ] Code commenté
- [ ] GLB optimisés

---

=====================================================================
## 16. TEMPLATE DE DÉMARRAGE RAPIDE
=====================================================================

### index.html
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module AR - A-Frame</title>
  <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  <link rel="stylesheet" href="assets/styles/styles.css">
</head>
<body>
  <div class="ui-overlay">
    <header><h1>Titre du module</h1></header>
    <nav class="phases-nav"><!-- Boutons phases --></nav>
    <div class="consigne-bandeau"><p id="consigne-text"></p></div>
    <div class="state-controls"><!-- Boutons états --></div>
  </div>

  <a-scene background="color: #1a1a2e" vr-mode-ui="enabled: true">
    <a-light type="ambient" color="#fff" intensity="1.5"></a-light>
    <a-light type="directional" color="#fff" intensity="1.5" position="5 10 5"></a-light>

    <a-plane position="0 0 0" rotation="-90 0 0" width="20" height="20" color="#16213e"></a-plane>

    <a-entity id="engine-container" position="0 1 -3">
      <a-entity id="engine-model" gltf-model="assets/models/model_state_a.glb"></a-entity>
      <a-entity id="hotspots-container">
        <!-- Hotspots ici -->
      </a-entity>
    </a-entity>

    <a-camera id="main-camera" position="0 1.5 2"
      look-controls="enabled:false"
      wasd-controls="enabled:false"
      cursor="rayOrigin: mouse; fuse: false"
      raycaster="objects: .clickable">
    </a-camera>
  </a-scene>

  <div id="hotspot-panel" class="hotspot-panel hidden">
    <button class="panel-close" onclick="closeHotspotPanel()">&times;</button>
    <h3 id="panel-title"></h3>
    <p id="panel-description"></p>
  </div>

  <script src="assets/js/app.js"></script>
</body>
</html>
```

### Serveur de développement
```bash
cd projet/
python3 -m http.server 8080
```

> Note : Préférer Python à `npx serve` (moins de problèmes de redirection).

---

**Fin du document — claude.md (AR / A-Frame) v1.0**
