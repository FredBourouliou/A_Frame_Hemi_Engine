# Moteur Hemi V8 - Module AR A-Frame

Module pédagogique interactif pour visualiser un moteur Hemi V8 suralimenté en 3D et en réalité augmentée.

## Fonctionnalités

### Mode 3D (index.html)
- Visualisation 3D interactive du moteur
- Rotation libre 360° (souris/tactile)
- Zoom (molette/pinch)
- Hotspots cliquables avec informations
- 3 états : Complet / Sans blower / Bloc seul
- 5 phases pédagogiques

### Mode AR (ar.html)
- Réalité augmentée avec marqueur Hiro (AR.js)
- Rotation 3D tactile
- Zoom pinch (2 doigts)
- Hotspots interactifs
- Changement d'état en temps réel

## Compatibilité

- **Desktop** : Chrome, Firefox, Safari, Edge
- **iOS** : Safari, Chrome
- **Android** : Chrome, Firefox

⚠️ Samsung Internet non supporté

## Installation

1. Cloner le repo
2. Servir avec un serveur HTTPS (requis pour l'AR)
3. Pour tester localement : `python3 -m http.server 8080`

## Utilisation AR

1. Imprimer ou afficher le [marqueur Hiro](https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png)
2. Ouvrir ar.html sur mobile
3. Autoriser l'accès caméra
4. Pointer vers le marqueur

## Structure

```
├── index.html          # Viewer 3D principal
├── ar.html             # Mode AR avec AR.js
├── assets/
│   ├── models/         # Modèles GLB
│   │   ├── hemi_state_a_full.glb
│   │   ├── hemi_state_b_no_blower.glb
│   │   └── hemi_state_c_bloc.glb
│   ├── js/
│   │   └── app.js      # Logique applicative
│   └── styles/
│       └── styles.css  # Styles CSS
├── blender/            # Fichiers source Blender
└── claude.md           # Documentation technique
```

## Technologies

- [A-Frame 1.5.0](https://aframe.io/) - Framework WebXR
- [AR.js](https://ar-js-org.github.io/AR.js-Docs/) - Réalité augmentée web
- Three.js (inclus dans A-Frame)

## Licence

MIT
