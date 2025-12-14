# claude.md — Standard de production des modules AR pédagogiques
## (Inspection 3D & AR interactive — A-Frame)

> **Version** : 2.0
> **Statut** : Document de référence
> **Scope** : Tous les modules AR / 3D d'inspection avec interactivité
> **Stack imposée** : A-Frame + AR.js + HTML/CSS/JS vanilla
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
11. **AR.js : AR cross-platform avec marqueurs** ← NOUVEAU
12. **Compatibilité navigateurs & appareils** ← NOUVEAU
13. **Test mobile avec ngrok** ← NOUVEAU
14. Problèmes connus & solutions
15. Performance & optimisation
16. Politique de code propre
17. Workflow standard de création
18. Checklist avant livraison
19. Template de démarrage rapide
20. **Template AR.js** ← NOUVEAU

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
## 11. AR.JS : AR CROSS-PLATFORM AVEC MARQUEURS
=====================================================================

### Pourquoi AR.js ?

WebXR n'est pas disponible partout :
- iOS Safari : WebXR expérimental (désactivé par défaut)
- Navigateurs anciens : pas de support

AR.js offre une solution universelle basée sur des marqueurs.

| Critère | WebXR | AR.js |
|---------|-------|-------|
| iOS Safari | ❌ Expérimental | ✅ Natif |
| Android Chrome | ✅ | ✅ |
| Marqueur requis | ❌ | ✅ |
| Placement libre | ✅ | ❌ |
| Interactivité | ✅ | ✅ |

### Installation

```html
<!-- A-Frame PUIS AR.js -->
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
<script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
```

### Configuration scène AR.js

```html
<a-scene
  embedded
  arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
  renderer="logarithmicDepthBuffer: true; colorManagement: true"
  vr-mode-ui="enabled: false"
>
  <a-marker preset="hiro">
    <!-- Contenu 3D ici -->
  </a-marker>
  <a-entity camera></a-entity>
</a-scene>
```

### Marqueur Hiro

Le marqueur standard : https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png

L'utilisateur doit imprimer ou afficher ce marqueur sur un écran.

### Rotation tactile en AR

```javascript
var rotationX = 0, rotationY = 0;
var engineEntity = document.getElementById('ar-engine');

document.addEventListener('touchmove', function(e) {
  if (e.touches.length === 1) {
    var deltaX = e.touches[0].clientX - touchStartX;
    var deltaY = e.touches[0].clientY - touchStartY;

    // Rotation libre 360°
    rotationY += deltaX * 0.5;
    rotationX += deltaY * 0.3;

    engineEntity.object3D.rotation.x = THREE.MathUtils.degToRad(rotationX);
    engineEntity.object3D.rotation.y = THREE.MathUtils.degToRad(rotationY);

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});
```

### Zoom pinch en AR

```javascript
var currentScale = 1;

function getPinchDistance(touches) {
  var dx = touches[0].clientX - touches[1].clientX;
  var dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

document.addEventListener('touchmove', function(e) {
  if (e.touches.length === 2) {
    var currentDistance = getPinchDistance(e.touches);
    var delta = (currentDistance - initialPinchDistance) * 0.005;
    currentScale = Math.max(0.3, Math.min(3, currentScale + delta));

    engineEntity.object3D.scale.set(currentScale, currentScale, currentScale);
    initialPinchDistance = currentDistance;
  }
});
```

### Hotspots cliquables en AR (IMPORTANT)

Le raycasting classique est trop précis pour le tactile. Utiliser la **détection par distance écran** :

```javascript
function checkHotspotTap(touchX, touchY) {
  var scene = document.querySelector('a-scene');
  if (!scene || !scene.camera) return null;

  var canvas = document.querySelector('canvas');
  var rect = canvas.getBoundingClientRect();
  var tolerance = 60; // Pixels de tolérance

  var closestHotspot = null;
  var closestDistance = Infinity;

  document.querySelectorAll('.ar-hotspot').forEach(function(hs) {
    if (!hs.object3D || hs.getAttribute('visible') === 'false') return;

    // Position monde → écran
    var worldPos = new THREE.Vector3();
    hs.object3D.getWorldPosition(worldPos);
    var screenPos = worldPos.clone().project(scene.camera);

    var screenX = (screenPos.x + 1) / 2 * rect.width + rect.left;
    var screenY = (-screenPos.y + 1) / 2 * rect.height + rect.top;

    // Ignorer si derrière la caméra
    if (screenPos.z > 1) return;

    var dx = touchX - screenX;
    var dy = touchY - screenY;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < tolerance && distance < closestDistance) {
      closestDistance = distance;
      closestHotspot = hs;
    }
  });

  return closestHotspot;
}
```

### Distinguer tap et drag en AR

```javascript
var isDragging = false;
var dragStartTime = 0;

document.addEventListener('touchstart', function(e) {
  isDragging = false;
  dragStartTime = Date.now();
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', function(e) {
  var deltaX = e.touches[0].clientX - touchStartX;
  var deltaY = e.touches[0].clientY - touchStartY;

  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging = true;
  }
});

document.addEventListener('touchend', function(e) {
  // Tap = court et sans mouvement
  if (!isDragging && Date.now() - dragStartTime < 300) {
    var touch = e.changedTouches[0];
    var hotspot = checkHotspotTap(touch.clientX, touch.clientY);
    if (hotspot) {
      // Afficher info hotspot
    }
  }
});
```

---

=====================================================================
## 12. COMPATIBILITÉ NAVIGATEURS & APPAREILS
=====================================================================

### Tableau de compatibilité

| Navigateur | 3D Viewer | AR.js | WebXR |
|------------|-----------|-------|-------|
| Chrome Desktop | ✅ | N/A | ❌ |
| Firefox Desktop | ✅ | N/A | ❌ |
| Safari Desktop | ✅ | N/A | ❌ |
| Chrome Android | ✅ | ✅ | ✅ |
| Firefox Android | ✅ | ✅ | ⚠️ |
| Safari iOS | ✅ | ✅ | ❌ |
| Chrome iOS | ✅ | ✅ | ❌ |
| **Samsung Internet** | ⚠️ | ❌ | ❌ |

### ⚠️ Samsung Internet : NON SUPPORTÉ

Samsung Internet a des problèmes majeurs avec WebGL et AR.js :
- UI HTML peut être masquée par le canvas
- Comportements imprévisibles

**Recommandation** : Ajouter un message invitant à utiliser Chrome ou Firefox.

### Fix CSS obligatoire pour Android

Le canvas WebGL peut masquer les éléments HTML. Solution :

```css
/* Force les éléments UI au-dessus du canvas AR */
#ar-ui, #instructions, #hotspot-info {
  position: fixed !important;
  z-index: 999999 !important;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  pointer-events: auto !important;
}

/* Force le canvas en arrière-plan */
a-scene, .a-canvas {
  z-index: 0 !important;
}
```

### Safe areas (écrans avec encoche)

```css
#ar-ui {
  padding-top: max(10px, env(safe-area-inset-top));
}

#instructions {
  bottom: max(20px, env(safe-area-inset-bottom));
}
```

### Optimisations tactiles

```css
.ar-btn {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
```

---

=====================================================================
## 13. TEST MOBILE AVEC NGROK
=====================================================================

### Pourquoi ngrok ?

L'accès caméra (AR) nécessite HTTPS. En développement local :
- `localhost` fonctionne sur desktop
- Les mobiles ne peuvent pas accéder à `localhost`
- HTTP simple = caméra refusée

**ngrok** crée un tunnel HTTPS public vers votre serveur local.

### Installation

```bash
# macOS
brew install ngrok

# Ou télécharger sur https://ngrok.com/download
```

### Utilisation

```bash
# Terminal 1 : serveur local
cd projet/
python3 -m http.server 8080

# Terminal 2 : tunnel ngrok
ngrok http 8080
```

ngrok affiche une URL du type : `https://abc123def456.ngrok-free.app`

### Tester sur mobile

1. Ouvrir l'URL ngrok sur le mobile
2. Accepter l'avertissement ngrok (gratuit)
3. Autoriser l'accès caméra
4. Pointer vers le marqueur Hiro

### Obtenir l'URL ngrok programmatiquement

```bash
curl -s http://127.0.0.1:4040/api/tunnels | python3 -c \
  "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"
```

### Limites ngrok gratuit

- URL change à chaque redémarrage
- Page d'avertissement au premier accès
- Limite de connexions simultanées

### Alternative production

Pour la production, utiliser :
- **GitHub Pages** (gratuit, HTTPS automatique)
- **Netlify** ou **Vercel** (gratuit, déploiement auto)

---

=====================================================================
## 14. PROBLÈMES CONNUS & SOLUTIONS
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

=====================================================================
## 20. TEMPLATE AR.JS
=====================================================================

### ar.html (page AR complète)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Module AR</title>

  <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>

  <style>
    body { margin: 0; overflow: hidden; font-family: -apple-system, sans-serif; }

    /* Fix Android : UI au-dessus du canvas */
    #ar-ui, #instructions, #hotspot-info {
      position: fixed !important;
      z-index: 999999 !important;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      pointer-events: auto !important;
    }

    #ar-ui {
      top: 0; left: 0; right: 0;
      padding: 10px;
      padding-top: max(10px, env(safe-area-inset-top));
      display: flex; flex-wrap: wrap; gap: 8px;
      justify-content: center;
      background: rgba(0,0,0,0.7);
    }

    .ar-btn {
      padding: 10px 16px;
      background: rgba(233, 69, 96, 0.95);
      color: white; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    .ar-btn.active { background: #4CAF50; }

    #instructions {
      bottom: max(20px, env(safe-area-inset-bottom));
      left: 50%;
      transform: translateX(-50%) translateZ(0);
      padding: 12px 20px;
      background: rgba(0,0,0,0.85);
      color: white; border-radius: 10px;
      font-size: 13px; text-align: center;
    }

    #hotspot-info {
      bottom: 80px; left: 50%;
      transform: translateX(-50%) translateZ(0);
      padding: 15px 20px;
      background: rgba(22,33,62,0.98);
      color: white; border-radius: 10px;
      display: none;
      border: 1px solid #e94560;
    }

    a-scene, .a-canvas { z-index: 0 !important; }
    .a-enter-vr { display: none !important; }
  </style>
</head>
<body>
  <div id="ar-ui">
    <a href="index.html" class="ar-btn">← Retour</a>
    <button class="ar-btn active" onclick="setState('a')">A - Complet</button>
    <button class="ar-btn" onclick="setState('b')">B - État 2</button>
    <button class="ar-btn" onclick="resetTransform()">⟲ Reset</button>
  </div>

  <div id="instructions">
    Pointez vers le marqueur Hiro<br>
    <small>Glisser : rotation | Pincer : zoom</small>
  </div>

  <div id="hotspot-info">
    <h4 id="hotspot-title"></h4>
    <p id="hotspot-desc"></p>
  </div>

  <a-scene
    embedded
    arjs="sourceType: webcam; debugUIEnabled: false;"
    renderer="logarithmicDepthBuffer: true; colorManagement: true"
    vr-mode-ui="enabled: false"
  >
    <a-light type="ambient" color="#fff" intensity="1.2"></a-light>
    <a-light type="directional" color="#fff" intensity="0.8" position="1 1 1"></a-light>

    <a-marker preset="hiro">
      <a-entity id="ar-model" gltf-model="assets/models/model_state_a.glb"></a-entity>

      <a-entity id="ar-hotspots">
        <a-sphere class="ar-hotspot" position="0 0.5 0" radius="0.06"
          color="#e94560" material="emissive: #e94560; emissiveIntensity: 0.5"
          data-label="Composant" data-desc="Description du composant.">
        </a-sphere>
      </a-entity>
    </a-marker>

    <a-entity camera></a-entity>
  </a-scene>

  <script>
    // Variables globales
    var rotationX = 0, rotationY = 0, currentScale = 1;
    var modelEntity, hotspotsContainer;
    var touchStartX = 0, touchStartY = 0;
    var initialPinchDistance = 0, isPinching = false;
    var isDragging = false, dragStartTime = 0;

    var MODELS = {
      'a': 'assets/models/model_state_a.glb',
      'b': 'assets/models/model_state_b.glb'
    };

    // Changement d'état
    function setState(state) {
      modelEntity.setAttribute('gltf-model', MODELS[state]);
      document.querySelectorAll('#ar-ui .ar-btn').forEach(function(btn, i) {
        btn.classList.toggle('active', btn.textContent.includes(state.toUpperCase()));
      });
    }

    // Reset
    function resetTransform() {
      rotationX = 0; rotationY = 0; currentScale = 1;
      applyTransform();
    }

    // Appliquer transformation
    function applyTransform() {
      if (modelEntity) {
        modelEntity.object3D.rotation.x = THREE.MathUtils.degToRad(rotationX);
        modelEntity.object3D.rotation.y = THREE.MathUtils.degToRad(rotationY);
        modelEntity.object3D.scale.set(currentScale, currentScale, currentScale);
      }
      if (hotspotsContainer) {
        hotspotsContainer.object3D.rotation.x = THREE.MathUtils.degToRad(rotationX);
        hotspotsContainer.object3D.rotation.y = THREE.MathUtils.degToRad(rotationY);
        hotspotsContainer.object3D.scale.set(currentScale, currentScale, currentScale);
      }
    }

    // Distance pinch
    function getPinchDistance(touches) {
      var dx = touches[0].clientX - touches[1].clientX;
      var dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // Détection hotspot par distance écran
    function checkHotspotTap(touchX, touchY) {
      var scene = document.querySelector('a-scene');
      if (!scene || !scene.camera) return null;

      var canvas = document.querySelector('canvas');
      var rect = canvas.getBoundingClientRect();
      var tolerance = 60;

      var closest = null, closestDist = Infinity;

      document.querySelectorAll('.ar-hotspot').forEach(function(hs) {
        if (!hs.object3D) return;

        var worldPos = new THREE.Vector3();
        hs.object3D.getWorldPosition(worldPos);
        var screenPos = worldPos.clone().project(scene.camera);

        if (screenPos.z > 1) return;

        var screenX = (screenPos.x + 1) / 2 * rect.width + rect.left;
        var screenY = (-screenPos.y + 1) / 2 * rect.height + rect.top;
        var dist = Math.sqrt(Math.pow(touchX - screenX, 2) + Math.pow(touchY - screenY, 2));

        if (dist < tolerance && dist < closestDist) {
          closestDist = dist;
          closest = hs;
        }
      });

      return closest;
    }

    // Init
    document.addEventListener('DOMContentLoaded', function() {
      modelEntity = document.getElementById('ar-model');
      hotspotsContainer = document.getElementById('ar-hotspots');

      // Touch handlers
      document.addEventListener('touchstart', function(e) {
        if (e.target.closest('#ar-ui, #instructions, #hotspot-info')) return;

        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isPinching = false; isDragging = false;
          dragStartTime = Date.now();
        } else if (e.touches.length === 2) {
          isPinching = true;
          initialPinchDistance = getPinchDistance(e.touches);
        }
      });

      document.addEventListener('touchmove', function(e) {
        if (e.target.closest('#ar-ui, #instructions, #hotspot-info')) return;

        if (e.touches.length === 1 && !isPinching) {
          var deltaX = e.touches[0].clientX - touchStartX;
          var deltaY = e.touches[0].clientY - touchStartY;

          if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) isDragging = true;

          rotationY += deltaX * 0.5;
          rotationX += deltaY * 0.3;

          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          applyTransform();
        } else if (e.touches.length === 2) {
          var dist = getPinchDistance(e.touches);
          var delta = (dist - initialPinchDistance) * 0.005;
          currentScale = Math.max(0.3, Math.min(3, currentScale + delta));
          initialPinchDistance = dist;
          applyTransform();
        }
      });

      document.addEventListener('touchend', function(e) {
        if (e.touches.length < 2) isPinching = false;

        if (!isDragging && Date.now() - dragStartTime < 300) {
          var touch = e.changedTouches[0];
          var hs = checkHotspotTap(touch.clientX, touch.clientY);

          if (hs) {
            document.getElementById('hotspot-title').textContent = hs.getAttribute('data-label');
            document.getElementById('hotspot-desc').textContent = hs.getAttribute('data-desc');
            document.getElementById('hotspot-info').style.display = 'block';
          } else if (!e.target.closest('#hotspot-info')) {
            document.getElementById('hotspot-info').style.display = 'none';
          }
        }
        isDragging = false;
      });
    });
  </script>
</body>
</html>
```

---

**Fin du document — claude.md (AR / A-Frame) v2.0**
