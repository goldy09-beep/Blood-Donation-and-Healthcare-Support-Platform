// =====================================================
// RAKTSETU — UNIFIED NAVBAR (injects into every page)
// =====================================================
(function () {

  // Detect how many folders deep we are from project root
  // by checking which known subfolders appear in the URL path
  var path = window.location.pathname.replace(/\\/g, '/');
  var segments = path.split('/').filter(Boolean);

  // Known sub-folder names used in this project
  var subFolders = ['pages', 'Member4', 'auth', 'profile', 'js', 'css'];

  // Count how many path segments (excluding filename) are sub-folders
  var rootParts = 0;
  for (var i = 0; i < segments.length - 1; i++) {
    if (subFolders.indexOf(segments[i]) !== -1) rootParts++;
  }

  function root(relPath) {
    var prefix = '';
    for (var i = 0; i < rootParts; i++) prefix += '../';
    return prefix + relPath;
  }

  // ---- Inject Font Awesome (professional icons) ----
  if (!document.querySelector('#rs-fa-cdn')) {
    var fa = document.createElement('link');
    fa.id = 'rs-fa-cdn';
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    document.head.appendChild(fa);
  }

  // ---- Inject navbar CSS ----
  var style = document.createElement('style');
  style.textContent = `
    /* Hide original navbars from individual member pages */
    .site-header, .simple-navbar, header.topbar { display: none !important; }

    #rs-navbar {
      position: sticky; top: 0; z-index: 9999;
      background: #0f0c29;
      border-bottom: 2px solid #ef4444;
      font-family: 'Segoe UI', sans-serif;
      box-shadow: 0 2px 20px rgba(239,68,68,0.3);
    }
    #rs-navbar .rs-inner {
      max-width: 1400px; margin: 0 auto;
      display: flex; align-items: center;
      gap: 6px; padding: 0 16px; height: 48px;
      flex-wrap: nowrap; overflow-x: auto;
    }
    #rs-navbar .rs-inner::-webkit-scrollbar { height: 2px; }
    #rs-navbar .rs-logo {
      font-size: 1.15em; font-weight: 800; color: white;
      text-decoration: none; letter-spacing: 1px; white-space: nowrap;
      flex-shrink: 0; margin-right: 8px;
    }
    #rs-navbar .rs-logo span { color: #ef4444; }
    #rs-navbar .rs-nav {
      display: flex; align-items: center; gap: 1px;
      list-style: none; margin: 0; padding: 0;
      flex-wrap: nowrap; flex: 1; min-width: 0;
    }
    #rs-navbar .rs-nav a {
      display: block; padding: 5px 9px; color: #bbb;
      text-decoration: none; border-radius: 5px;
      font-size: 0.78em; font-weight: 500; white-space: nowrap;
      transition: all 0.2s;
    }
    #rs-navbar .rs-nav a:hover, #rs-navbar .rs-nav a.rs-active {
      background: rgba(239,68,68,0.18); color: #ef4444;
    }
    #rs-navbar .rs-nav .rs-divider {
      width: 1px; height: 18px; background: rgba(255,255,255,0.12);
      margin: 0 4px; flex-shrink: 0;
    }
    #rs-navbar .rs-user {
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0; margin-left: 8px;
    }
    #rs-navbar .rs-username {
      font-size: 0.75em; color: #aaa; white-space: nowrap;
    }
    #rs-navbar .rs-btn-logout {
      background: rgba(239,68,68,0.15); border: 1px solid #ef4444;
      color: #ef4444; padding: 4px 10px; border-radius: 5px;
      font-size: 0.75em; cursor: pointer; font-weight: 600;
      transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
    }
    #rs-navbar .rs-nav a i,
    #rs-navbar .rs-logo i,
    #rs-navbar .rs-user i,
    #rs-navbar .rs-btn-logout i { margin-right: 5px; font-size: 0.9em; }
  `;
  document.head.appendChild(style);

  // ---- Build navbar HTML ----
  var currentUser = null;
  try { currentUser = JSON.parse(localStorage.getItem('currentUser')); } catch(e) {}

  var curPage = window.location.pathname.replace(/\\/g, '/').split('/').pop();

  function navLink(href, icon, label) {
    var active = (curPage === href.split('/').pop()) ? ' rs-active' : '';
    return '<a href="' + root(href) + '" class="' + active + '"><i class="fa-solid ' + icon + '"></i>' + label + '</a>';
  }

  var userHTML = '';
  if (currentUser) {
    userHTML = '<div class="rs-user">' +
      '<span class="rs-username"><i class="fa-solid fa-circle-user"></i>' + (currentUser.name || currentUser.email) + '</span>' +
      '<button class="rs-btn-logout" onclick="rsLogout()"><i class="fa-solid fa-right-from-bracket"></i>Logout</button>' +
      '</div>';
  }

  var navbar = document.createElement('nav');
  navbar.id = 'rs-navbar';
  navbar.innerHTML = '<div class="rs-inner">' +
    '<a href="' + root('index.html') + '" class="rs-logo"><i class="fa-solid fa-droplet"></i>Rakt<span>Setu</span></a>' +
    '<ul class="rs-nav">' +

    '<li>' + navLink('index.html',                          'fa-gauge',           'Dashboard')       + '</li>' +
    '<li>' + navLink('requests.html',                       'fa-clipboard-list',  'Requests')        + '</li>' +

    '<li><div class="rs-divider"></div></li>' +

    '<li><a href="' + root(currentUser && currentUser.role === 'Hospital' ? 'pages/profile/hospital-profile.html' : 'pages/profile/donor-profile.html') + '" class="fa-user"><i class="fa-solid fa-circle-user"></i> My Profile</a></li>' +

    '<li><div class="rs-divider"></div></li>' +

    '<li>' + navLink('Member4/hospital-inventory.html',     'fa-boxes-stacked',   'Inventory')       + '</li>' +
    '<li>' + navLink('Member4/blood-stock-search.html',     'fa-magnifying-glass','Stock Search')    + '</li>' +
    '<li>' + navLink('Member4/healthcare-info.html',        'fa-heart-pulse',     'Healthcare')      + '</li>' +
    '<li>' + navLink('Member4/volunteer-dashboard.html',    'fa-people-group',    'Volunteers')      + '</li>' +

    '</ul>' +
    userHTML +
    '</div>';

  // Insert navbar as FIRST element in body
  document.body.insertBefore(navbar, document.body.firstChild);

  // ---- Global logout ----
  window.rsLogout = function () {
    localStorage.removeItem('currentUser');
    window.location.href = root('pages/auth/login.html');
  };

  // Override existing logout() if present (from auth.js)
  window.logout = window.rsLogout;

  // ---- Global Toast (overrides broken inline toast) ----
  // Create a fresh toast div directly on <body> so no parent CSS blocks it
  var rsToast = document.createElement('div');
  rsToast.id = 'rs-toast';
  rsToast.style.cssText = [
    'position:fixed',
    'bottom:28px',
    'right:28px',
    'z-index:999999',
    'background:#0f0c29',
    'color:#fff',
    'border-left:4px solid #ef4444',
    'padding:14px 20px',
    'border-radius:10px',
    'font-size:14px',
    'font-weight:600',
    'min-width:280px',
    'max-width:420px',
    'box-shadow:0 8px 30px rgba(0,0,0,0.35)',
    'display:none',
    'font-family:Segoe UI,sans-serif',
    'line-height:1.5'
  ].join(';');
  document.body.appendChild(rsToast);

  var rsToastTimer;
  window.showToast = function(msg) {
    // Also update original toast-banner if it exists (backward compat)
    var old = document.getElementById('toast-banner');
    if (old) { old.textContent = msg; old.classList.add('show'); }

    // Show our reliable floating toast
    rsToast.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#ef4444;margin-right:8px;"></i>' + msg;
    rsToast.style.display = 'block';
    rsToast.style.animation = 'none';
    rsToast.offsetHeight; // force reflow
    rsToast.style.animation = 'rsSlideIn 0.3s ease';

    clearTimeout(rsToastTimer);
    rsToastTimer = setTimeout(function() {
      rsToast.style.display = 'none';
      if (old) old.classList.remove('show');
    }, 4000);
  };

  // Inject keyframe for toast animation
  var toastAnim = document.createElement('style');
  toastAnim.textContent = '@keyframes rsSlideIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}';
  document.head.appendChild(toastAnim);

})();
