/* ==========================================================================
   Module AR Moteur Hemi - A-Frame
   ========================================================================== */

/**
 * Variables globales pour les controles
 */
var rotationY = 0;
var rotationX = 0;
var currentZoom = 2;
var engineContainer = null;
var camera = null;
var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;

/**
 * Configuration des etats pedagogiques - URLs directes pour eviter les problemes de cache
 */
var STATES = {
  'state_a': {
    model: 'assets/models/hemi_state_a_full.glb',
    label: 'Complet',
    description: 'Vue d\'ensemble',
    hotspots: ['hotspot-blower', 'hotspot-culasse-l', 'hotspot-echappement']
  },
  'state_b': {
    model: 'assets/models/hemi_state_b_no_blower.glb',
    label: 'Sans blower',
    description: 'Bloc visible',
    hotspots: ['hotspot-culasse-l', 'hotspot-echappement']
  },
  'state_c': {
    model: 'assets/models/hemi_state_c_bloc.glb',
    label: 'Bloc seul',
    description: 'Structure de base',
    hotspots: []
  }
};

/**
 * Configuration des phases pedagogiques
 */
var PHASES = [
  {
    id: 0,
    name: 'Contexte',
    consigne: '<strong>Contexte :</strong> Ce module presente un moteur Hemi V8 suralimente. Explorez librement le modele 3D.',
    state: 'state_a'
  },
  {
    id: 1,
    name: 'Vue globale',
    consigne: '<strong>Observation :</strong> Identifiez les principaux sous-ensembles. Cliquez sur les points rouges pour plus d\'informations.',
    state: 'state_a'
  },
  {
    id: 2,
    name: 'Inspection',
    consigne: '<strong>Inspection :</strong> Observez le bloc moteur sans le blower. Reperez les culasses hemispheriques.',
    state: 'state_b'
  },
  {
    id: 3,
    name: 'Structure',
    consigne: '<strong>Structure :</strong> Analysez le bloc moteur seul. Notez la disposition en V des cylindres.',
    state: 'state_c'
  },
  {
    id: 4,
    name: 'Synthese',
    consigne: '<strong>Synthese :</strong> Revenez a la vue complete. Vous pouvez maintenant identifier chaque composant.',
    state: 'state_a'
  }
];

var currentPhase = 0;
var currentState = 'state_a';

/* ==========================================================================
   Controles de rotation et zoom
   ========================================================================== */

function updateRotation() {
  if (engineContainer && engineContainer.object3D) {
    // Utiliser object3D.rotation directement (en radians)
    engineContainer.object3D.rotation.x = THREE.MathUtils.degToRad(rotationX);
    engineContainer.object3D.rotation.y = THREE.MathUtils.degToRad(rotationY);
  }
}

function updateZoom() {
  if (camera && camera.object3D) {
    camera.object3D.position.z = currentZoom;
  }
}

function resetView() {
  rotationX = 0;
  rotationY = 0;
  currentZoom = 2;
  updateRotation();
  updateZoom();
  console.log('[AR Module] Vue reinitialise');
}

/**
 * Initialise les controles souris pour rotation et zoom
 */
function initMouseControls() {
  var startX = 0;
  var startY = 0;
  var isMouseDown = false;
  var dragThreshold = 5; // pixels avant de commencer le drag

  document.addEventListener('mousedown', function(e) {
    // Ignorer si clic sur UI
    if (e.target.tagName === 'BUTTON' || e.target.closest('.ui-overlay') || e.target.closest('#hotspot-panel') || e.target.closest('footer')) return;

    isMouseDown = true;
    isDragging = false;
    startX = e.clientX;
    startY = e.clientY;
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  document.addEventListener('mousemove', function(e) {
    if (!isMouseDown) return;

    // Verifier si on a depasse le seuil pour commencer le drag
    var distX = Math.abs(e.clientX - startX);
    var distY = Math.abs(e.clientY - startY);

    if (!isDragging && (distX > dragThreshold || distY > dragThreshold)) {
      isDragging = true;
    }

    if (!isDragging) return;

    var deltaX = e.clientX - previousMouseX;
    var deltaY = e.clientY - previousMouseY;

    rotationY += deltaX * 0.5;
    rotationX -= deltaY * 0.5;  // Rotation libre 360°

    updateRotation();

    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  document.addEventListener('mouseup', function() {
    isMouseDown = false;
    isDragging = false;
  });

  // Gestion molette - Zoom
  document.addEventListener('wheel', function(e) {
    if (e.target.closest('.ui-overlay') || e.target.closest('#hotspot-panel')) return;
    e.preventDefault();
    currentZoom += e.deltaY * 0.03;  // Zoom plus rapide
    currentZoom = Math.max(-2, Math.min(10, currentZoom));  // Zoom tres proche (-2) jusqu'a tres loin (10)
    updateZoom();
  }, { passive: false });
}

/**
 * Initialise les controles tactiles
 */
function initTouchControls() {
  var touchStartX = 0;
  var touchStartY = 0;
  var initialPinchDistance = 0;

  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.ui-overlay') || e.target.closest('#hotspot-panel')) return;

    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (e.target.closest('.ui-overlay') || e.target.closest('#hotspot-panel')) return;

    if (e.touches.length === 1) {
      var deltaX = e.touches[0].clientX - touchStartX;
      var deltaY = e.touches[0].clientY - touchStartY;

      rotationY += deltaX * 0.5;
      rotationX -= deltaY * 0.5;  // Rotation libre 360°

      updateRotation();

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2 && initialPinchDistance > 0) {
      // Pinch to zoom - plus sensible
      var dx = e.touches[0].clientX - e.touches[1].clientX;
      var dy = e.touches[0].clientY - e.touches[1].clientY;
      var currentDistance = Math.sqrt(dx * dx + dy * dy);

      var delta = (initialPinchDistance - currentDistance) * 0.08;  // Zoom tactile plus rapide
      currentZoom = Math.max(-2, Math.min(10, currentZoom + delta));
      updateZoom();

      initialPinchDistance = currentDistance;
    }
  });

  document.addEventListener('touchend', function() {
    initialPinchDistance = 0;
  });
}

/* ==========================================================================
   Composant A-Frame : Hotspot interactif
   ========================================================================== */
AFRAME.registerComponent('hotspot', {
  schema: {
    label: { type: 'string', default: '' },
    description: { type: 'string', default: '' }
  },

  init: function() {
    var el = this.el;
    var data = this.data;

    // Trouver la sphere enfant (c'est elle qui recoit les clics)
    var sphere = el.querySelector('a-sphere');
    if (!sphere) {
      console.warn('[Hotspot] Pas de sphere trouvee dans', el.id);
      return;
    }

    // Evenement clic sur la sphere
    sphere.addEventListener('click', function(e) {
      e.stopPropagation();
      console.log('[Hotspot] Clic sur:', data.label);
      showHotspotPanel(data.label, data.description);
    });

    // Evenement survol - agrandir
    sphere.addEventListener('mouseenter', function() {
      sphere.setAttribute('scale', '1.5 1.5 1.5');
      sphere.setAttribute('color', '#ff8080');
    });

    // Evenement sortie - retour normal
    sphere.addEventListener('mouseleave', function() {
      sphere.setAttribute('scale', '1 1 1');
      sphere.setAttribute('color', '#e94560');
    });

    console.log('[Hotspot] Initialise:', data.label);
  }
});

/* ==========================================================================
   Fonctions d'interface
   ========================================================================== */

/**
 * Affiche le panneau d'information hotspot
 */
function showHotspotPanel(title, description) {
  var panel = document.getElementById('hotspot-panel');
  var titleEl = document.getElementById('panel-title');
  var descEl = document.getElementById('panel-description');

  titleEl.textContent = title;
  descEl.textContent = description;
  panel.classList.remove('hidden');
}

/**
 * Ferme le panneau d'information
 */
function closeHotspotPanel() {
  var panel = document.getElementById('hotspot-panel');
  panel.classList.add('hidden');
}

/**
 * Change l'etat du modele 3D
 */
function setState(stateId) {
  if (!STATES[stateId]) {
    console.error('[AR Module] Etat inconnu:', stateId);
    return;
  }

  var state = STATES[stateId];

  // Changer le modele seulement si different
  var engineModel = document.getElementById('engine-model');
  if (engineModel && currentState !== stateId) {
    // Reset scale et position avant de charger le nouveau modele
    engineModel.object3D.scale.set(1, 1, 1);
    engineModel.object3D.position.set(0, 0, 0);

    // Charger le nouveau modele
    engineModel.setAttribute('gltf-model', state.model);
    console.log('[AR Module] Chargement du modele:', state.model);
  }

  currentState = stateId;

  // Mettre a jour les boutons
  var buttons = document.querySelectorAll('.state-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.getAttribute('data-state') === stateId) {
      btn.classList.add('active');
    }
  });

  // Gerer la visibilite des hotspots
  updateHotspotsVisibility(stateId);

  // Fermer le panneau si ouvert
  closeHotspotPanel();

  console.log('[AR Module] Etat change:', stateId);
}

/**
 * Met a jour la visibilite des hotspots selon l'etat
 */
function updateHotspotsVisibility(stateId) {
  var state = STATES[stateId];
  var allHotspots = ['hotspot-blower', 'hotspot-culasse-l', 'hotspot-echappement'];

  allHotspots.forEach(function(hotspotId) {
    var hotspot = document.getElementById(hotspotId);
    if (hotspot) {
      if (state.hotspots.indexOf(hotspotId) !== -1) {
        hotspot.setAttribute('visible', 'true');
      } else {
        hotspot.setAttribute('visible', 'false');
      }
    }
  });
}

/**
 * Change la phase pedagogique
 */
function setPhase(phaseId) {
  if (phaseId < 0 || phaseId >= PHASES.length) {
    console.error('[AR Module] Phase invalide:', phaseId);
    return;
  }

  currentPhase = phaseId;
  var phase = PHASES[phaseId];

  // Mettre a jour la consigne
  var consigneEl = document.getElementById('consigne-text');
  if (consigneEl) {
    consigneEl.innerHTML = phase.consigne;
  }

  // Changer l'etat associe
  setState(phase.state);

  // Mettre a jour les boutons de phase
  var buttons = document.querySelectorAll('.phase-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active');
    if (parseInt(btn.getAttribute('data-phase'), 10) === phaseId) {
      btn.classList.add('active');
    }
  });

  console.log('[AR Module] Phase changee:', phaseId, '-', phase.name);
}

/**
 * Initialise les boutons d'etat
 */
function initStateButtons() {
  var buttons = document.querySelectorAll('.state-btn');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var stateId = this.getAttribute('data-state');
      setState(stateId);
    });
  });
}

/**
 * Initialise les boutons de phase
 */
function initPhaseButtons() {
  var buttons = document.querySelectorAll('.phase-btn');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var phaseId = parseInt(this.getAttribute('data-phase'), 10);
      setPhase(phaseId);
    });
  });
}

/**
 * Navigation clavier
 */
function initKeyboardNav() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight') {
      if (currentPhase < PHASES.length - 1) {
        setPhase(currentPhase + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentPhase > 0) {
        setPhase(currentPhase - 1);
      }
    } else if (e.key === 'Escape') {
      closeHotspotPanel();
    } else if (e.key === 'r' || e.key === 'R') {
      resetView();
    }
  });
}

/**
 * Gestion du mode AR
 */
function initARMode() {
  var scene = document.querySelector('a-scene');

  scene.addEventListener('enter-vr', function() {
    console.log('[AR Module] Mode immersif active');
    document.querySelector('.ui-overlay').classList.add('ar-mode');
  });

  scene.addEventListener('exit-vr', function() {
    console.log('[AR Module] Mode immersif desactive');
    document.querySelector('.ui-overlay').classList.remove('ar-mode');
  });
}

/**
 * Ajuste le modele apres chargement (calcul manuel de bounding box)
 */
function adjustModel(model, el) {
  // Calculer bounding box manuellement en traversant tous les vertices
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
      node.visible = true;
      node.frustumCulled = false;
    }
  });

  var sizeX = maxX - minX;
  var sizeY = maxY - minY;
  var sizeZ = maxZ - minZ;
  var centerX = (minX + maxX) / 2;
  var centerY = (minY + maxY) / 2;
  var centerZ = (minZ + maxZ) / 2;

  // Echelle pour 1.2m max
  var maxDim = Math.max(sizeX, sizeY, sizeZ);
  var scale = 1.2 / maxDim;

  el.object3D.scale.set(scale, scale, scale);
  el.object3D.position.set(-centerX * scale, -centerY * scale, -centerZ * scale);

  console.log('[AR Module] Modele ajuste. Taille:', sizeX.toFixed(2), 'x', sizeY.toFixed(2), 'x', sizeZ.toFixed(2));
}

/**
 * Configure les listeners pour le chargement des modeles
 */
function setupModelOnLoad() {
  var engineModel = document.getElementById('engine-model');

  // Listener pour les futurs chargements
  engineModel.addEventListener('model-loaded', function(e) {
    console.log('[AR Module] Evenement model-loaded recu');
    adjustModel(e.detail.model, engineModel);
  });

  engineModel.addEventListener('model-error', function(e) {
    console.error('[AR Module] Erreur chargement modele:', e.detail);
  });

  // Verifier si le modele est deja charge (cas du premier chargement)
  var existingModel = engineModel.getObject3D('mesh');
  if (existingModel) {
    console.log('[AR Module] Modele deja charge, ajustement...');
    adjustModel(existingModel, engineModel);
  }
}

/* ==========================================================================
   Initialisation
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {

  // Attendre que A-Frame soit pret
  var scene = document.querySelector('a-scene');

  if (scene.hasLoaded) {
    init();
  } else {
    scene.addEventListener('loaded', init);
  }
});

function init() {
  console.log('[AR Module] Initialisation A-Frame');

  // Recuperer les elements
  engineContainer = document.getElementById('engine-container');
  camera = document.getElementById('main-camera');

  console.log('[AR Module] Container trouve:', !!engineContainer);
  console.log('[AR Module] Camera trouvee:', !!camera);

  if (!engineContainer) {
    console.error('[AR Module] ERREUR: engine-container non trouve!');
    return;
  }

  // Configurer le chargement du modele
  setupModelOnLoad();

  // Initialiser les controles de rotation/zoom
  initMouseControls();
  initTouchControls();

  // Initialiser les controles UI
  initStateButtons();
  initPhaseButtons();
  initKeyboardNav();
  initARMode();

  // Afficher phase 0
  setPhase(0);

  console.log('[AR Module] Module pret - Glissez pour tourner, molette pour zoomer, R pour reset');
}
