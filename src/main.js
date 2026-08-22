import './style.css';

import * as THREE from 'three';
import Papa from 'papaparse';

import {
  CSS3DRenderer,
  CSS3DObject
} from 'three/addons/renderers/CSS3DRenderer.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ============================================================
// THREE.JS SETUP
// ============================================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  1,
  10000
);

camera.position.set(0, 0, 3000);


const renderer = new CSS3DRenderer();

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.pointerEvents = 'auto';

document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.minDistance = 500;
controls.maxDistance = 6000;


// ============================================================
// GLOBAL DATA
// ============================================================

const objects = [];

window.peopleData = [];

let currentLayout = 'table';


// ============================================================
// LOAD CSV DATA
// ============================================================

async function loadData() {

  try {

    const sheetUrl =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXZiamxTyOtEVJRzkFGUDJGVA8mNMkmaeiM7lVng1_ZaPCH_Eken8-5UJxPxHwvn1dZ_RgYWUG--uL/pub?output=csv';

    const response =
      await fetch(sheetUrl);

    if (!response.ok) {
      throw new Error(
        'Could not load data from Google Sheet'
      );
    }

    const csvText =
      await response.text();

    const result =
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true
      });

    if (result.errors.length > 0) {

      console.warn(
        'Google Sheet CSV parsing warnings:',
        result.errors
      );

    }

    console.log(
      'Loaded data from Google Sheet:',
      result.data
    );

    createTable(result.data);

    populateFilters(result.data);

    setTableLayout();

  } catch (error) {

    console.error(
      'Error loading Google Sheet data:',
      error
    );

  }

}


// ============================================================
// CREATE PEOPLE CARDS
// ============================================================

function createTable(data) {

  window.peopleData = data;

  data.forEach((person, index) => {

    const element = document.createElement('div');

    element.className = 'element';

    element.style.pointerEvents = 'auto';


    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    const name = document.createElement('div');

    name.className = 'name';

    name.textContent =
      person.Name || 'Unknown';


    // --------------------------------------------------------
    // DETAILS
    // --------------------------------------------------------

    const details = document.createElement('div');

    details.className = 'details';

    details.innerHTML = `
      <div>Age: ${person.Age || '-'}</div>
      <div>Country: ${person.Country || '-'}</div>
      <div>Interest: ${person.Interest || '-'}</div>
      <div>Net Worth: ${person['Net Worth'] || '-'}</div>
    `;


    element.appendChild(name);
    element.appendChild(details);


    // --------------------------------------------------------
    // CARD CLICK
    // --------------------------------------------------------

    element.addEventListener(
      'pointerdown',
      (event) => {

        event.stopPropagation();

        console.log(
          'Clicked:',
          person.Name
        );

        showProfile(person);

      }
    );


    // --------------------------------------------------------
    // NET WORTH COLOR
    // --------------------------------------------------------

    const netWorth = parseFloat(
      String(person['Net Worth'] || '')
        .replace(/[$,]/g, '')
    );


    if (netWorth < 100000) {

      element.style.backgroundColor =
        'rgba(255, 0, 0, 0.65)';

    } else if (netWorth < 200000) {

      element.style.backgroundColor =
        'rgba(255, 165, 0, 0.65)';

    } else {

      element.style.backgroundColor =
        'rgba(0, 180, 0, 0.65)';

    }


    // --------------------------------------------------------
    // CSS3D OBJECT
    // --------------------------------------------------------

    const objectCSS =
      new CSS3DObject(element);

    objectCSS.element = element;

    objectCSS.userData.index = index;

    objectCSS.userData.person = person;

    objectCSS.userData.target =
      objectCSS.position.clone();


    scene.add(objectCSS);

    objects.push(objectCSS);

  });


  console.log(
    `Created ${objects.length} tiles`
  );

}


// ============================================================
// TABLE LAYOUT
// ============================================================

function setTableLayout() {

  currentLayout = 'table';

  objects.forEach((object, index) => {

    const column = index % 20;

    const row =
      Math.floor(index / 20);

    object.userData.target.set(
      (column - 9.5) * 160,
      -(row - 4.5) * 180,
      0
    );

  });

}


// ============================================================
// SPHERE LAYOUT
// ============================================================

function setSphereLayout() {

  currentLayout = 'sphere';

  const radius = 1500;

  const count = objects.length;

  objects.forEach((object, index) => {

    const phi =
      Math.acos(
        1 -
        (2 * (index + 0.5)) /
        count
      );

    const theta =
      Math.PI *
      (1 + Math.sqrt(5)) *
      index;


    object.userData.target.set(

      radius *
      Math.sin(phi) *
      Math.cos(theta),

      radius *
      Math.cos(phi),

      radius *
      Math.sin(phi) *
      Math.sin(theta)

    );

  });

}


// ============================================================
// DOUBLE HELIX LAYOUT
// ============================================================

function setHelixLayout() {

  currentLayout = 'helix';

  const count = objects.length;

  const radius = 850;

  const height = 3000;

  const turns = 4;


  objects.forEach((object, index) => {

    const helix = index % 2;

    const positionInHelix =
      Math.floor(index / 2);

    const helixCount =
      Math.ceil(count / 2);

    const t =
      positionInHelix /
      Math.max(
        helixCount - 1,
        1
      );


    const angle =
      t *
      Math.PI *
      2 *
      turns +
      (
        helix === 1
          ? Math.PI
          : 0
      );


    object.userData.target.set(

      radius * Math.cos(angle),

      height / 2 -
      t * height,

      radius * Math.sin(angle)

    );

  });

}


// ============================================================
// GRID LAYOUT
// ============================================================

function setGridLayout() {

  currentLayout = 'grid';

  objects.forEach((object, index) => {

    const x =
      index % 5;

    const y =
      Math.floor(index / 5) % 4;

    const z =
      Math.floor(index / 20);


    object.userData.target.set(

      (x - 2) * 350,

      (y - 1.5) * 350,

      (z - 4.5) * 350

    );

  });

}


// ============================================================
// MOVE TO LAYOUT
// ============================================================

function moveToLayout(layout) {

  if (layout === 'table') {

    setTableLayout();

  }

  if (layout === 'sphere') {

    setSphereLayout();

  }

  if (layout === 'helix') {

    setHelixLayout();

  }

  if (layout === 'grid') {

    setGridLayout();

  }

}


// ============================================================
// FILTER DATA
// ============================================================

function applyFilters() {

  const searchInput =
    document.getElementById('search');

  const countryFilter =
    document.getElementById('country-filter');

  const interestFilter =
    document.getElementById('interest-filter');

  const worthFilter =
    document.getElementById('worth-filter');


  const searchTerm =
    searchInput.value
      .trim()
      .toLowerCase();


  const selectedCountry =
    countryFilter.value;


  const selectedInterest =
    interestFilter.value;


  const selectedWorth =
    worthFilter.value;


  const matchingObjects = [];


  objects.forEach((object) => {

    const person =
      object.userData.person;


    if (!person) {
      return;
    }


    const name =
      String(
        person.Name || ''
      )
        .trim()
        .toLowerCase();


    const country =
      String(
        person.Country || ''
      )
        .trim();


    const interest =
      String(
        person.Interest || ''
      )
        .trim();


    const netWorth =
      parseFloat(
        String(
          person['Net Worth'] || ''
        )
          .replace(/[$,]/g, '')
      );


    const matchesSearch =
      !searchTerm ||
      name.includes(searchTerm);


    const matchesCountry =
      !selectedCountry ||
      country === selectedCountry;


    const matchesInterest =
      !selectedInterest ||
      interest === selectedInterest;


    let matchesWorth = true;


    if (selectedWorth === 'low') {

      matchesWorth =
        netWorth < 100000;

    }

    else if (
      selectedWorth === 'medium'
    ) {

      matchesWorth =
        netWorth >= 100000 &&
        netWorth < 200000;

    }

    else if (
      selectedWorth === 'high'
    ) {

      matchesWorth =
        netWorth >= 200000;

    }


    const matches =
      matchesSearch &&
      matchesCountry &&
      matchesInterest &&
      matchesWorth;


    object.visible = matches;

    object.element.style.display =
      matches ? '' : 'none';


    if (matches) {

      matchingObjects.push(object);

    }

  });


  // ----------------------------------------------------------
  // ARRANGE FILTERED RESULTS
  // ----------------------------------------------------------

  if (
    searchTerm ||
    selectedCountry ||
    selectedInterest ||
    selectedWorth
  ) {

    matchingObjects.forEach(
      (object, index) => {

        const column =
          index % 5;

        const row =
          Math.floor(index / 5);


        object.userData.target.set(

          (column - 2) * 400,

          -(row - 2) * 250,

          0

        );

      }
    );

  }
  else {

    moveToLayout(currentLayout);

  }


  console.log(
    `Filters: ${matchingObjects.length} result(s)`
  );

}


// ============================================================
// POPULATE FILTER DROPDOWNS
// ============================================================

function populateFilters(data) {

  const countryFilter =
    document.getElementById(
      'country-filter'
    );


  const interestFilter =
    document.getElementById(
      'interest-filter'
    );


  const countries =
    [
      ...new Set(
        data
          .map(
            person =>
              String(
                person.Country || ''
              ).trim()
          )
          .filter(Boolean)
      )
    ].sort();


  const interests =
    [
      ...new Set(
        data
          .map(
            person =>
              String(
                person.Interest || ''
              ).trim()
          )
          .filter(Boolean)
      )
    ].sort();


  countries.forEach(
    country => {

      const option =
        document.createElement(
          'option'
        );

      option.value =
        country;

      option.textContent =
        country;

      countryFilter.appendChild(
        option
      );

    }
  );


  interests.forEach(
    interest => {

      const option =
        document.createElement(
          'option'
        );

      option.value =
        interest;

      option.textContent =
        interest;

      interestFilter.appendChild(
        option
      );

    }
  );

}


// ============================================================
// PROFILE POPUP
// ============================================================

function showProfile(person) {

  const existingProfile =
    document.querySelector(
      '.profile-overlay'
    );


  if (existingProfile) {

    existingProfile.remove();

  }


  const overlay =
    document.createElement(
      'div'
    );

  overlay.className =
    'profile-overlay';


  const profile =
    document.createElement(
      'div'
    );

  profile.className =
    'profile-card';


  profile.innerHTML = `

    <button
      class="close-profile"
      type="button"
      aria-label="Close profile"
    >
      ×
    </button>

    <div class="profile-photo-container">

      ${
        person.Photo
          ? `
            <img
              class="profile-photo"
              src="${person.Photo}"
              alt="${person.Name || 'Profile'}"
              referrerpolicy="no-referrer"
            >
          `
          : `
            <div class="profile-photo-placeholder">
              ${getInitials(person.Name)}
            </div>
          `
      }

    </div>


    <h2>
      ${person.Name || 'Unknown'}
    </h2>


    <div class="profile-details">

      <p>
        <strong>Age:</strong>
        ${person.Age || '-'}
      </p>

      <p>
        <strong>Country:</strong>
        ${person.Country || '-'}
      </p>

      <p>
        <strong>Interest:</strong>
        ${person.Interest || '-'}
      </p>

      <p>
        <strong>Net Worth:</strong>
        ${person['Net Worth'] || '-'}
      </p>

    </div>

  `;


  overlay.appendChild(profile);

  document.body.appendChild(
    overlay
  );


  // ----------------------------------------------------------
  // BROKEN IMAGE FALLBACK
  // ----------------------------------------------------------

  const profilePhoto =
    profile.querySelector(
      '.profile-photo'
    );


  if (profilePhoto) {

    profilePhoto.addEventListener(
      'error',
      () => {

        const placeholder =
          document.createElement(
            'div'
          );

        placeholder.className =
          'profile-photo-placeholder';

        placeholder.textContent =
          getInitials(
            person.Name
          );


        profilePhoto.replaceWith(
          placeholder
        );

      }
    );

  }


  // ----------------------------------------------------------
  // CLOSE BUTTON
  // ----------------------------------------------------------

  profile
    .querySelector(
      '.close-profile'
    )
    .addEventListener(
      'click',
      () => {

        overlay.remove();

      }
    );


  // ----------------------------------------------------------
  // CLICK OUTSIDE
  // ----------------------------------------------------------

  overlay.addEventListener(
    'click',
    (event) => {

      if (
        event.target === overlay
      ) {

        overlay.remove();

      }

    }
  );

}


// ============================================================
// INITIALS HELPER
// ============================================================

function getInitials(name) {

  const words =
    String(name || 'User')
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

}


// ============================================================
// CLEAR FILTERS
// ============================================================

function clearAllFilters() {

  document.getElementById(
    'search'
  ).value = '';


  document.getElementById(
    'country-filter'
  ).value = '';


  document.getElementById(
    'interest-filter'
  ).value = '';


  document.getElementById(
    'worth-filter'
  ).value = '';


  objects.forEach(
    object => {

      object.visible = true;

      object.element.style.display =
        '';

    }
  );


  moveToLayout(
    currentLayout
  );


  console.log(
    'Filters cleared'
  );

}


// ============================================================
// GOOGLE SIGN-IN
// ============================================================

window.handleCredentialResponse =
  function (response) {

    console.log(
      'Google login successful'
    );


    try {

      const payload =
        JSON.parse(
          atob(
            response.credential
              .split('.')[1]
          )
        );


      console.log(
        'Google user:',
        payload
      );


      const userInfo =
        document.getElementById(
          'user-info'
        );


      const userPhoto =
        document.getElementById(
          'user-photo'
        );


      const userName =
        document.getElementById(
          'user-name'
        );


      const googleLogin =
        document.getElementById(
          'google-login'
        );


      const dropdownUserPhoto =
        document.getElementById(
          'dropdown-user-photo'
        );


      const dropdownUserName =
        document.getElementById(
          'dropdown-user-name'
        );


      const displayName =
        payload.name ||
        'Google User';


      // ------------------------------------------------------
      // HEADER PROFILE
      // ------------------------------------------------------

      userName.textContent =
        displayName;


      if (payload.picture) {

        userPhoto.src =
          payload.picture;

        userPhoto.style.display =
          'block';

      }
      else {

        userPhoto.style.display =
          'none';

      }


      // ------------------------------------------------------
      // DROPDOWN PROFILE
      // ------------------------------------------------------

      dropdownUserName.textContent =
        displayName;


      if (payload.picture) {

        dropdownUserPhoto.src =
          payload.picture;

        dropdownUserPhoto.style.display =
          'block';

      }
      else {

        dropdownUserPhoto.style.display =
          'none';

      }


      // ------------------------------------------------------
      // SWITCH LOGIN TO PROFILE
      // ------------------------------------------------------

      googleLogin.style.display =
        'none';


      userInfo.style.display =
        'flex';


      userInfo.classList.remove(
        'dropdown-open'
      );


    }
    catch (error) {

      console.error(
        'Could not process Google login:',
        error
      );

    }

  };


// ============================================================
// INITIALIZE GOOGLE SIGN-IN
// ============================================================

function initializeGoogleSignIn() {

  if (
    typeof google === 'undefined' ||
    !google.accounts ||
    !google.accounts.id
  ) {

    return false;

  }


  const googleLogin =
    document.getElementById(
      'google-login'
    );


  if (!googleLogin) {

    return false;

  }


  google.accounts.id.initialize({

    client_id:
      '396809853551-rs9otnuvbdb89bhtvb1le61j2nsqitgd.apps.googleusercontent.com',

    callback:
      window.handleCredentialResponse

  });


  google.accounts.id.renderButton(

    googleLogin,

    {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular'
    }

  );


  return true;

}


// ============================================================
// WAIT FOR GOOGLE SCRIPT
// ============================================================

function waitForGoogle() {

  if (
    initializeGoogleSignIn()
  ) {

    console.log(
      'Google Sign-In initialized'
    );

    return;

  }


  setTimeout(
    waitForGoogle,
    300
  );

}


// ============================================================
// SIGN OUT
// ============================================================

function signOutGoogle() {

  if (
    typeof google !== 'undefined' &&
    google.accounts &&
    google.accounts.id
  ) {

    google.accounts.id.disableAutoSelect();

  }


  const googleLogin =
    document.getElementById(
      'google-login'
    );


  const userInfo =
    document.getElementById(
      'user-info'
    );


  googleLogin.style.display =
    'block';


  userInfo.style.display =
    'none';


  userInfo.classList.remove(
    'dropdown-open'
  );


  console.log(
    'Google user signed out'
  );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

document
  .getElementById('table')
  .addEventListener(
    'click',
    () => {

      moveToLayout(
        'table'
      );

    }
  );


document
  .getElementById('sphere')
  .addEventListener(
    'click',
    () => {

      moveToLayout(
        'sphere'
      );

    }
  );


document
  .getElementById('helix')
  .addEventListener(
    'click',
    () => {

      moveToLayout(
        'helix'
      );

    }
  );


document
  .getElementById('grid')
  .addEventListener(
    'click',
    () => {

      moveToLayout(
        'grid'
      );

    }
  );


document
  .getElementById('search')
  .addEventListener(
    'input',
    applyFilters
  );


document
  .getElementById('country-filter')
  .addEventListener(
    'change',
    applyFilters
  );


document
  .getElementById('interest-filter')
  .addEventListener(
    'change',
    applyFilters
  );


document
  .getElementById('worth-filter')
  .addEventListener(
    'change',
    applyFilters
  );


document
  .getElementById('clear-filters')
  .addEventListener(
    'click',
    clearAllFilters
  );


// ============================================================
// USER PROFILE DROPDOWN
// ============================================================

const userProfileButton =
  document.getElementById(
    'user-profile-button'
  );


const userInfo =
  document.getElementById(
    'user-info'
  );


if (userProfileButton) {

  userProfileButton.addEventListener(
    'click',
    (event) => {

      event.stopPropagation();

      userInfo.classList.toggle(
        'dropdown-open'
      );

    }
  );

}


// ------------------------------------------------------------
// KEEP DROPDOWN OPEN WHEN CLICKING INSIDE IT
// ------------------------------------------------------------

const userDropdown =
  document.getElementById(
    'user-dropdown'
  );


if (userDropdown) {

  userDropdown.addEventListener(
    'click',
    (event) => {

      event.stopPropagation();

    }
  );

}


// ------------------------------------------------------------
// CLOSE DROPDOWN OUTSIDE CLICK
// ------------------------------------------------------------

document.addEventListener(
  'click',
  () => {

    if (userInfo) {

      userInfo.classList.remove(
        'dropdown-open'
      );

    }

  }
);


// ------------------------------------------------------------
// SIGN OUT
// ------------------------------------------------------------

document
  .getElementById('sign-out')
  .addEventListener(
    'click',
    signOutGoogle
  );


// ============================================================
// START APPLICATION
// ============================================================

loadData();

waitForGoogle();


// ============================================================
// ANIMATION LOOP
// ============================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  objects.forEach(
    object => {

      if (
        object.userData.target
      ) {

        object.position.lerp(
          object.userData.target,
          0.08
        );

      }

    }
  );


  controls.update();

  renderer.render(
    scene,
    camera
  );

}


animate();


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);