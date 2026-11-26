/**
 * F&J REPAIRS SRL - Main Application Logic
 * Comprehensive Fleet Control, Pre-Use Inspection & Maintenance System
 */

const App = (function () {
  // Application State
  const state = {
    company: null,
    users: [],
    currentUser: null,
    equipos: [],
    selectedEquipoId: 'F-07',
    documentos: [],
    repuestosSuplidores: [],
    solicitudesDocumentos: [],
    mantenimientos: [],
    inspecciones: [],
    correosEnviados: [],
    checklistSecciones: [],
    viewMode: 'mobile', // 'mobile' | 'fleet-dashboard'
    authorizedDocs: {}, // session authorization per equipment
    uploadedPhotos: [], // temporary photos for current form
    signaturePadDrawing: false,
    signaturePadHasContent: false,
    currentFormView: null, // null | { type: 'maintenance'|'inspection'|'upload-doc'|'docs', equipoId }
    selectedMaintenanceProgramId: 'pm-250',
    fleetStatusFilter: 'all',
    fleetSearchQuery: '',
    emailSearchQuery: '',
    emailFilterCategory: 'all'
  };

  // Toast Helper
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `app-toast toast-${type}`;
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><div style="flex:1;">${message}</div>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // DATOS DE RESPALDO GARANTIZADOS (PREVIENE PANTALLAS BLANCAS EN SERVIDORES ESTÁTICOS / NGINX)
  // =========================================================================
  const FALLBACK_DB_DATA = {
    company: {
      name: "F&J REPAIRS SRL",
      rnc: "132-45892-1",
      sector: "Instalación de Torres Eléctricas de Alta Tensión y Montaje de Subestaciones",
      manager: "Frankely de Jesús Gil López",
      managerRole: "Gerente Técnico & Operaciones",
      executive: "Jonathan Gil",
      executiveRole: "Gerencia General",
      email: "operaciones@fjrepairs.com",
      supportEmail: "contacto@fjrepairs.com",
      phone: "+1 (809) 555-0192",
      address: "Av. Luperón, Zona Industrial Herrera, Santo Domingo, R.D.",
      website: "www.fjrepairs.com"
    },
    users: [
      { id: "u1", username: "frankely.gil", name: "Frankely de Jesús Gil López", role: "Gerente Técnico / Encargado", email: "frankely.gil@fjrepairs.com" },
      { id: "u2", username: "jonathan.gil", name: "Jonathan Gil", role: "Gerencia General", email: "jonathan.gil@fjrepairs.com" },
      { id: "u3", username: "operador.azua", name: "Carlos M. Santana", role: "Operador Certificado Grúa", email: "csantana@fjrepairs.com" },
      { id: "u4", username: "mantenimiento.taller", name: "Ramón Almonte", role: "Técnico Mecánico Hidráulico", email: "ralmonte@fjrepairs.com" }
    ],
    equipos: [
      {
        id: "F-07",
        codigo: "F-07 28 TNS",
        nombre: "Grúa Telescópica 28 TNS",
        tipo: "Grúa sobre Camión",
        capacidad: "28 Toneladas",
        marca: "Terex / National Crane",
        modelo: "Series 900A",
        anio: 2021,
        placa: "L-392811",
        chasis: "3FDNF82X0MA194821",
        proyecto: "Proyecto Subestación 345KV Azua",
        ubicacion: "Azua de Compostela, R.D.",
        estado: "Operativo",
        horometroActual: 4890,
        intervaloMantenimiento: 500,
        ultimoMantenimientoHoras: 4890,
        proximoMantenimientoHoras: 5390,
        foto: "assets/crane_f07_28t.jpg",
        encargadoAsignado: "Frankely de Jesús Gil López",
        operadorAsignado: "Carlos M. Santana",
        qrUrl: "?equipo=F-07"
      },
      {
        id: "F-02",
        codigo: "F-02 24 TNS",
        nombre: "Grúa Camión 24 TNS",
        tipo: "Grúa Montada en Camión",
        capacidad: "24 Toneladas",
        marca: "Manitowoc / Grove",
        modelo: "TMS500E",
        anio: 2019,
        placa: "L-281903",
        chasis: "1HTMNAAM8CH638192",
        proyecto: "Línea de Transmisión 138KV Monte Plata",
        ubicacion: "Monte Plata, R.D.",
        estado: "Mantenimiento Próximo",
        horometroActual: 3465,
        intervaloMantenimiento: 250,
        ultimoMantenimientoHoras: 3250,
        proximoMantenimientoHoras: 3500,
        foto: "assets/crane_f04_40t.jpg",
        encargadoAsignado: "Frankely de Jesús Gil López",
        operadorAsignado: "Manuel E. Rosario",
        qrUrl: "?equipo=F-02"
      },
      {
        id: "F-04",
        codigo: "F-04 40 TNS",
        nombre: "Grúa Todo Terreno 40 TNS",
        tipo: "Grúa Telescópica All-Terrain",
        capacidad: "40 Toneladas",
        marca: "Liebherr",
        modelo: "LTM 1040-2.1",
        anio: 2022,
        placa: "L-441029",
        chasis: "W09104021NN019283",
        proyecto: "Subestación Norte 138KV Santiago",
        ubicacion: "Santiago de los Caballeros, R.D.",
        estado: "Operativo",
        horometroActual: 6120,
        intervaloMantenimiento: 500,
        ultimoMantenimientoHoras: 6000,
        proximoMantenimientoHoras: 6500,
        foto: "assets/crane_f04_40t.jpg",
        encargadoAsignado: "Frankely de Jesús Gil López",
        operadorAsignado: "Jorge L. Peña",
        qrUrl: "?equipo=F-04"
      },
      {
        id: "F-06",
        codigo: "F-06 35 TNS",
        nombre: "Grúa Móvil 35 TNS",
        tipo: "Grúa Rough Terrain",
        capacidad: "35 Toneladas",
        marca: "Tadano",
        modelo: "GR-350XL",
        anio: 2020,
        placa: "L-352018",
        chasis: "TDN350X900281",
        proyecto: "Línea de Interconexión Autopista Duarte",
        ubicacion: "Bonao / Monseñor Nouel, R.D.",
        estado: "Operativo",
        horometroActual: 2780,
        intervaloMantenimiento: 250,
        ultimoMantenimientoHoras: 2750,
        proximoMantenimientoHoras: 3000,
        foto: "assets/crane_f07_28t.jpg",
        encargadoAsignado: "Frankely de Jesús Gil López",
        operadorAsignado: "Pedro J. Martínez",
        qrUrl: "?equipo=F-06"
      },
      {
        id: "F-01",
        codigo: "F-01 18 TNS",
        nombre: "Camión Grúa Canasta 18 TNS",
        tipo: "Camión con Brazo Articulado y Cesta Dieléctrica",
        capacidad: "18 Toneladas / Altura 26m",
        marca: "Freightliner / Palfinger",
        modelo: "PK 23500 Performance",
        anio: 2018,
        placa: "L-180042",
        chasis: "1FVACWDC9HH491023",
        proyecto: "Taller Central & Mantenimiento Flota",
        ubicacion: "Santo Domingo Oeste, R.D.",
        estado: "Mantenimiento Vencido",
        horometroActual: 2005,
        intervaloMantenimiento: 250,
        ultimoMantenimientoHoras: 1750,
        proximoMantenimientoHoras: 2000,
        foto: "assets/repuesto_referencia.jpg",
        encargadoAsignado: "Frankely de Jesús Gil López",
        operadorAsignado: "Ramón Almonte",
        qrUrl: "?equipo=F-01"
      }
    ],
    checklistSecciones: [
      {
        seccion: "1. Condiciones de Sitio y Operación",
        icono: "🗺️",
        items: [
          { id: "chk-01", pregunta: "Área de trabajo delimitada con conos y cinta de advertencia" },
          { id: "chk-02", pregunta: "Distancia mínima de seguridad a líneas energizadas verificada" },
          { id: "chk-03", pregunta: "Terreno nivelado y almohadillas de estabilizadores colocadas" }
        ]
      },
      {
        seccion: "2. Niveles de Fluidos y Motor Diesel",
        icono: "🛢️",
        items: [
          { id: "chk-04", pregunta: "Nivel de aceite de motor y refrigerante en rango adecuado" },
          { id: "chk-05", pregunta: "Nivel de aceite hidráulico en visor del depósito principal" },
          { id: "chk-06", pregunta: "Purga de agua en filtro separador de combustible realizada" }
        ]
      },
      {
        seccion: "3. Sistema Hidráulico, Pluma y Estabilizadores",
        icono: "🏗️",
        items: [
          { id: "chk-07", pregunta: "Cilindros estabilizadores sin fuga ni deformación física" },
          { id: "chk-08", pregunta: "Mangueras y acoples hidráulicos de pluma sin fugas de presión" },
          { id: "chk-09", pregunta: "Cable de acero de izaje sin alambres rotos ni aplastamiento (ISO 4309)" }
        ]
      },
      {
        seccion: "4. Dispositivos de Seguridad y Computadora LMI",
        icono: "⚠️",
        items: [
          { id: "chk-10", pregunta: "Interruptor de final de carrera Anti-Two Block (A2B) operativo" },
          { id: "chk-11", pregunta: "Indicador de Momento de Carga (LMI) encendido y calibrado" },
          { id: "chk-12", pregunta: "Pestillo de seguridad del gancho principal en buen estado" }
        ]
      }
    ]
  };

  // Load Initial Data with Multi-Tier Fallback (API -> static db.json -> localStorage -> Fallback)
  async function loadData() {
    let loaded = false;

    // TIER 1: Try Node.js Backend API
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.equipos) && data.equipos.length > 0) {
          populateState(data);
          localStorage.setItem('fj_repairs_data', JSON.stringify(data));
          loaded = true;
        }
      }
    } catch (err) {
      console.warn('Backend API /api/data not reached, trying static file fallback...');
    }

    // TIER 2: If API is not available (e.g. running under static Nginx or CDN), fetch static data/db.json
    if (!loaded) {
      try {
        const response = await fetch('data/db.json');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.equipos) && data.equipos.length > 0) {
            populateState(data);
            localStorage.setItem('fj_repairs_data', JSON.stringify(data));
            loaded = true;
            console.log('Successfully loaded initial data from static data/db.json (Nginx fallback)');
          }
        }
      } catch (err) {
        console.warn('Could not load static data/db.json:', err);
      }
    }

    // TIER 3: Fallback to cached LocalStorage data if server/static fetch failed
    if (!loaded) {
      const cached = localStorage.getItem('fj_repairs_data');
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data && Array.isArray(data.equipos) && data.equipos.length > 0) {
            populateState(data);
            loaded = true;
            console.log('Loaded data from localStorage cache');
          }
        } catch (e) {
          console.warn('Corrupt cached data');
        }
      }
    }

    // TIER 4: Guaranteed in-memory fallback so app NEVER crashes with a blank screen
    if (!loaded || !state.equipos || state.equipos.length === 0) {
      console.log('Applying embedded fallback fleet data');
      populateState(FALLBACK_DB_DATA);
    }

    // Detect mobile page context (mobile.html or /mobile)
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');

    // Restore saved user if available
    const savedUserId = localStorage.getItem('fj_user_id');
    if (savedUserId && state.users.some(u => u.id === savedUserId)) {
      state.currentUser = state.users.find(u => u.id === savedUserId);
    } else if (!state.currentUser && state.users.length > 0) {
      if (isMobilePage) {
        state.currentUser = state.users.find(u => u.role.includes('Operador')) || state.users[0];
      } else {
        state.currentUser = state.users[0];
      }
    }

    state.viewMode = isMobilePage ? 'mobile' : 'fleet-dashboard';

    // Check URL parameters for direct QR scan simulation (?equipo=F-07)
    const urlParams = new URLSearchParams(window.location.search);
    const equipoParam = urlParams.get('equipo');
    if (equipoParam && state.equipos.some(e => e.id === equipoParam)) {
      state.selectedEquipoId = equipoParam;
      if (isMobilePage || urlParams.get('view') === 'mobile') {
        state.viewMode = 'mobile';
      }
    }

    renderApp();
  }

  function populateState(data) {
    if (!data) return;
    state.company = data.company || state.company || FALLBACK_DB_DATA.company;
    state.users = (data.users && data.users.length > 0) ? data.users : (state.users && state.users.length > 0 ? state.users : FALLBACK_DB_DATA.users);
    state.equipos = (data.equipos && data.equipos.length > 0) ? data.equipos : (state.equipos && state.equipos.length > 0 ? state.equipos : FALLBACK_DB_DATA.equipos);
    state.documentos = data.documentos || state.documentos || [];
    state.repuestosSuplidores = data.repuestosSuplidores || state.repuestosSuplidores || [];
    state.solicitudesDocumentos = data.solicitudesDocumentos || state.solicitudesDocumentos || [];
    state.mantenimientos = data.mantenimientos || state.mantenimientos || [];
    state.inspecciones = data.inspecciones || state.inspecciones || [];
    state.correosEnviados = data.correosEnviados || state.correosEnviados || [];
    state.checklistSecciones = (data.checklistSecciones && data.checklistSecciones.length > 0) ? data.checklistSecciones : FALLBACK_DB_DATA.checklistSecciones;
  }

  function getSelectedEquipo() {
    if (!state.equipos || state.equipos.length === 0) {
      return FALLBACK_DB_DATA.equipos[0];
    }
    return state.equipos.find(e => e.id === state.selectedEquipoId) || state.equipos[0] || FALLBACK_DB_DATA.equipos[0];
  }

  // Master Render Function
  function renderApp() {
    renderHeader();
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');
    const isMobile = isMobilePage || state.viewMode === 'mobile';

    if (state.currentFormView) {
      if (state.currentFormView.type === 'maintenance') {
        renderInPageMaintenanceForm(state.currentFormView.equipoId, state.currentFormView.programaId);
      } else if (state.currentFormView.type === 'maintenance-programs') {
        renderInPageMaintenanceProgramsCatalog(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'inspection') {
        renderInPageInspectionForm(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'upload-doc') {
        renderInPageUploadDocForm(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'docs') {
        renderInPageDocsView(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'doc-request') {
        renderInPageDocRequest(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'user-profile') {
        renderInPageUserProfile();
      } else if (state.currentFormView.type === 'emails') {
        renderInPageEmails();
      } else if (state.currentFormView.type === 'qr-scanner') {
        renderInPageQRScanner();
      } else if (state.currentFormView.type === 'qr-plate') {
        renderInPageQRPlate(state.currentFormView.equipoId);
      } else if (state.currentFormView.type === 'print-all-qr') {
        renderInPagePrintAllQR();
      }
    } else if (isMobile) {
      renderMobileView();
    } else {
      renderDashboardView();
    }

    updateEnterpriseNavState();

    // Enhance every select/combobox with instant search
    setTimeout(() => enhanceAllSelects(), 30);
  }

  // Header Rendering
  function renderHeader() {
    const user = state.currentUser || { name: 'Invitado', role: 'Operador' };
    const userRoleEl = document.getElementById('header-user-display');
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');
    const isMobile = isMobilePage || state.viewMode === 'mobile' || (typeof window !== 'undefined' && window.innerWidth <= 768);
    if (userRoleEl) {
      if (isMobile) {
        const firstName = user.name.split(' ')[0] || user.name;
        userRoleEl.innerHTML = `
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div class="user-name-text user-name-mobile">${firstName}</div>
          <span class="user-dropdown-arrow">▾</span>
        `;
        userRoleEl.classList.add('mobile-user-badge');
      } else {
        userRoleEl.innerHTML = `
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div class="user-name-text">${user.name}</div>
          <span class="user-dropdown-arrow">▾</span>
        `;
        userRoleEl.classList.remove('mobile-user-badge');
      }
      userRoleEl.setAttribute('title', `${user.name} — ${user.role} (Clic para ver perfil / cambiar usuario)`);
      userRoleEl.style.cursor = 'pointer';
      userRoleEl.onclick = () => App.openUserProfileModal();
    }

    const emailBadge = document.getElementById('email-badge-count');
    if (emailBadge) {
      emailBadge.innerText = (state.correosEnviados || []).length;
    }

    // Update active mode button
    const btnMobile = document.getElementById('btn-mode-mobile');
    const btnDash = document.getElementById('btn-mode-dashboard');
    if (btnMobile && btnDash) {
      if (state.viewMode === 'mobile') {
        btnMobile.classList.add('active');
        btnDash.classList.remove('active');
      } else {
        btnMobile.classList.remove('active');
        btnDash.classList.add('active');
      }
    }
  }

  // Render Mobile View (Optimized for smartphones and QR field scans)
  function renderMobileView() {
    const mainContainer = document.getElementById('app-main-content');
    const equipo = getSelectedEquipo();
    const company = state.company || {};

    const horasRestantes = equipo.proximoMantenimientoHoras - equipo.horometroActual;
    const interval = equipo.intervaloMantenimiento || 500;
    const progressPercent = Math.max(0, Math.min(100, (horasRestantes / interval) * 100));

    let statusClass = 'safe';
    let statusFillClass = 'fill-safe';
    let chipClass = 'chip-operativo';

    if (horasRestantes <= 0) {
      statusClass = 'danger';
      statusFillClass = 'fill-danger';
      chipClass = 'chip-vencido';
    } else if (horasRestantes <= 50) {
      statusClass = 'warning';
      statusFillClass = 'fill-warning';
      chipClass = 'chip-proximo';
    }

    // Generate unit QR code vector pointing directly to mobile endpoint
    const qrUrl = window.location.origin + '/mobile?equipo=' + equipo.id;
    const qrSvg = QREngine.generateSVG(qrUrl, 90);

    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');

    const innerMobileHtml = `
      <!-- Unit Header with Company Logo & Quick Selector -->
      <div class="mobile-unit-header">
        <div class="header-top-row">
          <div class="company-badge-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <span>${company.name || 'F&J REPAIRS SRL'}</span>
          </div>
          <select class="quick-unit-selector" id="mobile-unit-dropdown" onchange="App.selectEquipo(this.value)">
            ${state.equipos.map(e => `<option value="${e.id}" ${e.id === equipo.id ? 'selected' : ''}>${e.codigo} (${e.capacidad}) · ${e.proyecto}</option>`).join('')}
          </select>
        </div>

        <!-- Manager / Encargado Presentation Card (Jonathan Gil Requirement) -->
        <div class="manager-card">
          <div class="manager-header">
            <div class="manager-avatar">${(company.manager || 'FG').split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
            <div class="manager-info">
              <h4>${company.manager}</h4>
              <p>${company.managerRole}</p>
              <p style="font-size:0.7rem; color:#0284c7; font-weight:600;">Gerencia General: ${company.executive}</p>
            </div>
          </div>
          <div class="manager-actions">
            <a href="tel:${company.phone}" class="contact-action-btn btn-phone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.43-3.9-6.63-6.83l1.88-1.54c.3-.3.42-.72.32-1.13A13.8 13.8 0 018.9 4c0-.55-.45-1-1-1H4.5c-.55 0-1 .45-1 1C3.5 13.28 10.73 20.5 19.5 20.5c.55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.12z"/></svg>
              <span>Llamar</span>
            </a>
            <a href="https://wa.me/${company.whatsapp}?text=Hola%20${encodeURIComponent(company.manager)},%20le%20contacto%20sobre%20el%20equipo%20${encodeURIComponent(equipo.codigo)}" target="_blank" class="contact-action-btn btn-whatsapp">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Unit Showcase Hero & Status -->
      <div class="unit-showcase-card">
        <div class="unit-hero">
          <img src="${equipo.foto}" alt="${equipo.codigo}" onerror="this.src='assets/crane_f07_28t.jpg'">
          <span class="unit-status-chip ${chipClass}">● ${equipo.estado}</span>
        </div>

        <div class="unit-title-row">
          <div>
            <h2>${equipo.codigo}</h2>
            <div style="font-size:0.85rem; font-weight:600; color:#475569;">${equipo.nombre} (${equipo.marca} ${equipo.modelo})</div>
          </div>
          <div style="background:#fff; padding:4px; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;" onclick="App.openQRPlateModal('${equipo.id}')" title="Ver Placa QR Completa">
            ${qrSvg}
          </div>
        </div>

        <div class="unit-project-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span>${equipo.proyecto} (${equipo.ubicacion})</span>
        </div>

        <!-- Horometro Countdown Box (Jonathan Gil Requirement) -->
        <div class="horometro-box">
          <div class="horometro-header">
            <div>
              <div class="horometro-label">Lectura de Horómetro</div>
              <div class="horometro-val">${equipo.horometroActual.toLocaleString()} hrs</div>
            </div>
            <div style="text-align:right;">
              <div class="horometro-label">Próximo Mantenimiento</div>
              <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">${equipo.proximoMantenimientoHoras.toLocaleString()} hrs</div>
            </div>
          </div>

          <div class="pm-countdown-bar-container">
            <div class="pm-countdown-fill ${statusFillClass}" style="width: ${progressPercent}%;"></div>
          </div>

          <div class="horometro-footer">
            <span class="hours-remaining-text ${statusClass}">
              ${horasRestantes > 0 
                ? `⏱️ Restan ${horasRestantes} horas de operación` 
                : `⚠️ Mantenimiento vencido por ${Math.abs(horasRestantes)} horas`}
            </span>
            <span style="color:#64748b; font-size:0.7rem;">Ciclo: cada ${interval} hrs</span>
          </div>
        </div>
      </div>

      <!-- The 3 Core Modules Navigation Buttons (Jonathan Gil Requirement) -->
      <div class="modules-container">
        <div class="section-label">Módulos de la Unidad</div>

        <!-- Module 1: Documentos del Equipo -->
        <button class="module-card-btn btn-docs" onclick="App.openModuleDocs('${equipo.id}')">
          <div class="module-icon-circle icon-docs">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </div>
          <div class="module-info">
            <h3>1. Documentos del Equipo</h3>
            <p>Matrícula, certificación de izaje, licencia operador, bitácoras y suplidores.</p>
          </div>
          <span class="module-arrow">›</span>
        </button>

        <!-- Module 2: Inspección Pre-Uso del Equipo -->
        <button class="module-card-btn btn-insp" onclick="App.openModuleInspection('${equipo.id}')">
          <div class="module-icon-circle icon-insp">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          </div>
          <div class="module-info">
            <h3>2. Realizar Inspección Pre-Uso</h3>
            <p>Checklist diario con horómetro, captura de fotos/video y reporte por correo.</p>
          </div>
          <span class="module-arrow">›</span>
        </button>

        <!-- Module 3: Documentación de Mantenimiento -->
        <button class="module-card-btn btn-mant" onclick="App.openModuleMaintenance('${equipo.id}')">
          <div class="module-icon-circle icon-mant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>
          </div>
          <div class="module-info">
            <h3>3. Documentar Mantenimiento</h3>
            <p>Formulario con programas PM (250h, 500h, 1000h, 2000h) y correctivos.</p>
          </div>
          <span class="module-arrow">›</span>
        </button>

        <!-- Module 4: Catálogo de Programas Técnicos -->
        <button class="module-card-btn btn-prog-mant" onclick="App.openMaintenanceProgramsView('${equipo.id}')">
          <div class="module-icon-circle icon-prog-mant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div class="module-info">
            <h3>4. Programas Técnicos de Flota</h3>
            <p>Protocolos estandarizados de fabricante OEM, repuestos y costos estimados.</p>
          </div>
          <span class="module-arrow">›</span>
        </button>
      </div>

      <!-- Bottom Mobile Tabs Navigation -->
      <div class="field-bottom-nav">
        <button class="nav-tab-item active" onclick="window.scrollTo({top:0, behavior:'smooth'})">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span>Unidad</span>
        </button>
        <button class="nav-tab-item" onclick="App.openQRScannerModal()">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm9.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM17.5 13H19v1.5h-1.5V13z"/></svg>
          <span>Escanear QR</span>
        </button>
        <button class="nav-tab-item" onclick="App.openModuleDocs('${equipo.id}')">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <span>Docs</span>
        </button>
        <button class="nav-tab-item" onclick="App.openEmailsDrawer()">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          <span>Correos</span>
        </button>
        ${!isMobilePage ? `
        <button class="nav-tab-item" onclick="App.switchView('fleet-dashboard')" title="Ir al Panel Central de Escritorio">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span>Escritorio</span>
        </button>
        ` : ''}
      </div>
    `;

    if (isMobilePage) {
      mainContainer.innerHTML = `<div class="mobile-pure-app">${innerMobileHtml}</div>`;
    } else {
      mainContainer.innerHTML = `
        <div class="mobile-viewport-container">
          <div class="mobile-frame" id="mobile-frame-element">
            ${innerMobileHtml}
          </div>
        </div>
      `;
    }
  }

  // Render Central Web Fleet Dashboard (Desktop view - INFOTEP Enterprise Layout)
  function renderDashboardView() {
    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    // Update top bar title and sidebar active state
    const pageLabel = document.getElementById('top-bar-page-label');
    if (pageLabel) pageLabel.textContent = 'Consultar Flota de Grúas';
    document.querySelectorAll('.sidebar-nav-item').forEach(el => el.classList.remove('active'));
    const navItem = document.getElementById('nav-item-flota');
    if (navItem) navItem.classList.add('active');

    const company = state.company || {};
    const equipos = state.equipos || [];

    const totalEquipos = equipos.length;
    const operativos = equipos.filter(e => e.estado === 'Operativo').length;
    const alertasProx = equipos.filter(e => e.estado === 'Mantenimiento Próximo').length;
    const alertasVenc = equipos.filter(e => e.estado === 'Mantenimiento Vencido').length;
    const alertas = alertasProx + alertasVenc;
    const inspeccionesHoy = state.inspecciones.length;
    const solicitudesPendientes = state.solicitudesDocumentos.filter(s => s.estado === 'Pendiente').length;

    // Filter by status if filter active
    const statusFilter = state.fleetStatusFilter || 'all';
    let filteredEquipos = equipos;
    if (statusFilter !== 'all') {
      filteredEquipos = equipos.filter(e => e.estado === statusFilter);
    }
    if (state.fleetSearchQuery) {
      const q = state.fleetSearchQuery.toLowerCase();
      filteredEquipos = filteredEquipos.filter(e => 
        (e.codigo && e.codigo.toLowerCase().includes(q)) ||
        (e.nombre && e.nombre.toLowerCase().includes(q)) ||
        (e.proyecto && e.proyecto.toLowerCase().includes(q)) ||
        (e.capacidad && e.capacidad.toLowerCase().includes(q)) ||
        (e.ubicacion && e.ubicacion.toLowerCase().includes(q))
      );
    }

    mainContainer.innerHTML = `
      <div class="central-dashboard-view">
        <!-- List Header (Exact INFOTEP Image 1 Style) -->
        <div class="infotep-list-header">
          <div>
            <h2 class="infotep-page-title">Consultar Flota de Grúas</h2>
            <p class="infotep-page-subtitle">Gestión y seguimiento operativo por estados de unidades en República Dominicana</p>
          </div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <div style="min-width:240px; position:relative;">
              <input type="text" id="input-search-fleet" class="form-input" 
                placeholder="🔍 Escribe para buscar..." 
                value="${state.fleetSearchQuery || ''}" 
                oninput="App.handleFleetSearch(this.value)"
                style="height:40px; font-size:0.85rem; padding-left:14px;">
            </div>
            <button class="btn-infotep-submit" onclick="App.openModuleMaintenance()" style="margin:0; height:40px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>+ Registrar Mantenimiento</span>
            </button>
            <button class="btn-infotep-cancel" onclick="App.openMaintenanceProgramsView()" style="margin:0; height:40px; display:inline-flex; align-items:center; gap:6px; color:#002b66; font-weight:700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              <span>Programas PM</span>
            </button>
            <button class="btn-infotep-cancel" onclick="App.openModuleInspection()" style="margin:0; height:40px; display:inline-flex; align-items:center; gap:6px; color:#002b66; font-weight:700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              <span>+ Nueva Inspección</span>
            </button>
          </div>
        </div>

        <!-- Status Filter Pills (Exact INFOTEP Image 1 Match) -->
        <div class="infotep-status-pills">
          <button class="infotep-status-pill ${statusFilter === 'all' ? 'active' : ''}" onclick="App.filterFleetStatus('all')">
            📁 Todos (${totalEquipos})
          </button>
          <button class="infotep-status-pill ${statusFilter === 'Operativo' ? 'active' : ''}" onclick="App.filterFleetStatus('Operativo')">
            🟢 Operativo (${operativos})
          </button>
          <button class="infotep-status-pill ${statusFilter === 'Mantenimiento Próximo' ? 'active' : ''}" onclick="App.filterFleetStatus('Mantenimiento Próximo')">
            ⏳ Mantenimiento Próximo (${alertasProx})
          </button>
          <button class="infotep-status-pill ${statusFilter === 'Mantenimiento Vencido' ? 'active' : ''}" onclick="App.filterFleetStatus('Mantenimiento Vencido')">
            🔴 Mantenimiento Vencido (${alertasVenc})
          </button>
        </div>

        <!-- Enterprise Data Table (Exact INFOTEP Image 1 Match) -->
        <div class="infotep-table-card">
          <div style="overflow-x:auto;">
            <table class="infotep-data-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>MODELO & CAPACIDAD</th>
                  <th>PROYECTO ASIGNADO</th>
                  <th>HORÓMETRO</th>
                  <th>PRÓX. MANTENIMIENTO</th>
                  <th>ESTADO</th>
                  <th style="text-align:right;">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEquipos.length > 0 ? filteredEquipos.map(e => {
                  const horasRestantes = e.proximoMantenimientoHoras - e.horometroActual;
                  const isAlert = horasRestantes <= 50;
                  const isVencido = horasRestantes <= 0;
                  const stateClass = isVencido ? 'chip-vencido' : isAlert ? 'chip-proximo' : 'chip-operativo';

                  return `
                    <tr class="fleet-table-row">
                      <td style="font-weight:800; color:#002b66; font-size:0.88rem;">
                        <span style="display:inline-flex; align-items:center; gap:6px;">
                          🏗️ ${e.codigo}
                        </span>
                      </td>
                      <td>
                        <div style="font-weight:700; color:#0f172a;">${e.nombre}</div>
                        <div style="font-size:0.75rem; color:#64748b;">${e.capacidad} | Chasis: ${e.chasis}</div>
                      </td>
                      <td>
                        <div style="font-weight:600; color:#1e293b;">📍 ${e.proyecto}</div>
                        <div style="font-size:0.72rem; color:#64748b;">${e.ubicacion}</div>
                      </td>
                      <td>
                        <strong style="color:#0f172a;">${e.horometroActual.toLocaleString()} hrs</strong>
                      </td>
                      <td>
                        <span style="font-weight:700; color:${isVencido ? '#dc2626' : isAlert ? '#d97706' : '#059669'};">
                          ${horasRestantes} hrs restantes
                        </span>
                        <div style="font-size:0.72rem; color:#64748b;">(Meta: ${e.proximoMantenimientoHoras}h)</div>
                      </td>
                      <td>
                        <span class="unit-status-chip ${stateClass}">● ${e.estado}</span>
                      </td>
                      <td style="text-align:right;">
                        <div class="infotep-action-btn-group" style="justify-content:flex-end;">
                          <button class="btn-table-action" onclick="App.openModuleMaintenance('${e.id}')" title="Registrar Mantenimiento de la Unidad">
                            <span>🛠️ Mant.</span>
                          </button>
                          <button class="btn-table-action" onclick="App.openModuleInspection('${e.id}')" title="Completar Checklist Pre-Uso">
                            <span>📋 Insp.</span>
                          </button>
                          <button class="btn-table-action" onclick="App.openModuleDocs('${e.id}')" title="Ver Documentación Técnica">
                            <span>📄 Docs</span>
                          </button>
                          <button class="btn-table-action" onclick="App.openQRPlateModal('${e.id}')" title="Placa QR Laminada">
                            <span>⚏ QR</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="7" style="text-align:center; padding:32px; color:#94a3b8; font-style:italic;">
                      No se encontraron equipos que coincidan con la búsqueda o filtro seleccionado.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
          <div class="infotep-pagination-bar">
            <div>Mostrando ${filteredEquipos.length} de ${totalEquipos} entradas</div>
            <div style="font-size:0.75rem; color:#64748b;">F&J REPAIRS SRL · Sistema de Flota</div>
          </div>
        </div>

        <!-- KPI Cards Grid -->
        <div class="dashboard-grid-kpis" style="margin-bottom:2rem;">
          <div class="kpi-card kpi-green">
            <div class="kpi-label">Equipos Operativos</div>
            <div class="kpi-number" style="color:#0f172a;">${operativos} / ${totalEquipos}</div>
            <div class="kpi-subtext">Disponibles para izaje y montaje</div>
          </div>
          <div class="kpi-card ${alertas > 0 ? 'kpi-amber' : ''}">
            <div class="kpi-label">Mantenimiento Próximo / Vencido</div>
            <div class="kpi-number" style="${alertas > 0 ? 'color:#d97706;' : 'color:#0f172a;'}">${alertas} Unidades</div>
            <div class="kpi-subtext">Monitoreo activo por horómetro</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Inspecciones Pre-Uso</div>
            <div class="kpi-number" style="color:#0f172a;">${inspeccionesHoy}</div>
            <div class="kpi-subtext">Checklists completados con firma y fotos</div>
          </div>
          <div class="kpi-card ${solicitudesPendientes > 0 ? 'kpi-red' : ''}">
            <div class="kpi-label">Solicitudes de Documentos</div>
            <div class="kpi-number" style="${solicitudesPendientes > 0 ? 'color:#dc2626;' : 'color:#0f172a;'}">${solicitudesPendientes}</div>
            <div class="kpi-subtext">Peticiones de clientes/auditores</div>
          </div>
        </div>

        <!-- Section: Fleet Distribution Across Dominican Republic -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#002b66;">Ubicación Geográfica en Proyectos Eléctricos R.D.</h3>
              <p style="font-size:0.8rem; color:#64748b;">Distribución de grúas asignadas a subestaciones y líneas de transmisión</p>
            </div>
            <span style="background:#e0f2fe; color:#0284c7; font-size:0.75rem; font-weight:700; padding:4px 12px; border-radius:20px;">Red Nacional</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
            ${equipos.map(e => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; cursor:pointer; transition:var(--transition);" onclick="App.openEquipoMobilePreview('${e.id}')">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-weight:800; font-size:0.9rem; color:#002b66;">${e.codigo}</span>
                  ${renderUnitStateBadge(e.estado)}
                </div>
                <div style="font-size:0.78rem; color:#1e293b; font-weight:600;">📍 ${e.proyecto}</div>
                <div style="font-size:0.72rem; color:#64748b;">${e.ubicacion}</div>
                <div style="margin-top:8px; font-size:0.72rem; color:#0284c7; font-weight:700; display:flex; justify-content:space-between;">
                  <span>Horómetro: ${e.horometroActual}h</span>
                  <span>Restan: ${e.proximoMantenimientoHoras - e.horometroActual}h</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Document Requests Approval Table -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:1.5rem; margin-bottom:2rem; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:8px;">
            <div>
              <h3 style="font-size:1.15rem; font-weight:800; color:#002b66;">Solicitudes de Acceso a Documentación Técnica</h3>
              <p style="font-size:0.8rem; color:#64748b;">Autorizaciones requeridas para contratistas, auditores e inspectores externos</p>
            </div>
            <span style="font-size:0.8rem; color:#002b66; font-weight:700;">${solicitudesPendientes} Pendientes de Aprobación</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="infotep-data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Equipo</th>
                  <th>Solicitante</th>
                  <th>Empresa</th>
                  <th>Cargo / Justificación</th>
                  <th>Estado</th>
                  <th style="text-align:right;">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${state.solicitudesDocumentos.map(sol => `
                  <tr>
                    <td>${sol.fecha}</td>
                    <td style="font-weight:700; color:#002b66;">${sol.equipoNombre}</td>
                    <td>
                      <div style="font-weight:700; color:#0f172a;">${sol.solicitante}</div>
                      <div style="font-size:0.72rem; color:#64748b;">${sol.correo} | ${sol.telefono}</div>
                    </td>
                    <td style="font-weight:600; color:#334155;">${sol.empresa}</td>
                    <td style="max-width:240px;">
                      <div style="font-weight:600; color:#0f172a;">${sol.cargo}</div>
                      <div style="font-size:0.72rem; color:#64748b; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">"${sol.justificacion}"</div>
                    </td>
                    <td>
                      <span style="padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700; background:${sol.estado==='Aprobado'?'#d1fae5':'#fef3c7'}; color:${sol.estado==='Aprobado'?'#065f46':'#92400e'};">
                        ${sol.estado}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      ${sol.estado === 'Pendiente' ? `
                        <button class="btn-infotep-submit" onclick="App.approveRequest('${sol.id}')" style="padding:5px 12px; font-size:0.75rem; margin:0;">
                          Autorizar Lector
                        </button>
                      ` : `
                        <span style="font-size:0.75rem; color:#059669; font-weight:700;">Autorizado (${sol.permisoOtorgado || '24 hrs'})</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  function returnToDashboard() {
    state.currentFormView = null;
    closeActiveModal();
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');
    if (isMobilePage || state.viewMode === 'mobile') {
      renderMobileView();
    } else {
      renderDashboardView();
    }
    setTimeout(() => enhanceAllSelects(), 30);
  }

  function filterFleetStatus(status) {
    state.fleetStatusFilter = status;
    renderDashboardView();
  }

  function handleFleetSearch(query) {
    state.fleetSearchQuery = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('.fleet-table-row');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (!state.fleetSearchQuery || text.includes(state.fleetSearchQuery)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  // Navigation & Top Breadcrumb Synchronization for Enterprise INFOTEP Layout
  function updateEnterpriseNavState() {
    const topLabel = document.getElementById('top-bar-page-label');
    const navFlota = document.getElementById('nav-item-flota');
    const navMant = document.getElementById('nav-item-mantenimiento');
    const navProgMant = document.getElementById('nav-item-programas-mant');
    const navInsp = document.getElementById('nav-item-inspeccion');
    const navDocs = document.getElementById('nav-item-docs');
    const navQR = document.getElementById('nav-item-qr');
    const navPrintQR = document.getElementById('nav-item-print-qr');
    const navEmails = document.getElementById('nav-item-emails');

    [navFlota, navMant, navProgMant, navInsp, navDocs, navQR, navPrintQR, navEmails].forEach(el => el && el.classList.remove('active'));

    if (!state.currentFormView) {
      if (topLabel) topLabel.textContent = 'Consultar Flota de Grúas';
      if (navFlota) navFlota.classList.add('active');
    } else if (state.currentFormView.type === 'maintenance') {
      if (topLabel) topLabel.textContent = 'Registrar Mantenimiento';
      if (navMant) navMant.classList.add('active');
    } else if (state.currentFormView.type === 'maintenance-programs') {
      if (topLabel) topLabel.textContent = 'Programas de Mantenimiento Estandarizados';
      if (navProgMant) navProgMant.classList.add('active');
    } else if (state.currentFormView.type === 'inspection') {
      if (topLabel) topLabel.textContent = 'Nueva Inspección Pre-Uso';
      if (navInsp) navInsp.classList.add('active');
    } else if (state.currentFormView.type === 'upload-doc') {
      if (topLabel) topLabel.textContent = 'Subir Documento Técnico';
      if (navDocs) navDocs.classList.add('active');
    } else if (state.currentFormView.type === 'docs') {
      if (topLabel) topLabel.textContent = 'Bóveda de Documentación Técnica';
      if (navDocs) navDocs.classList.add('active');
    } else if (state.currentFormView.type === 'doc-request') {
      if (topLabel) topLabel.textContent = 'Solicitud de Acceso a Documentación';
      if (navDocs) navDocs.classList.add('active');
    } else if (state.currentFormView.type === 'user-profile') {
      if (topLabel) topLabel.textContent = 'Perfil de Usuario y Sesión Activa';
    } else if (state.currentFormView.type === 'emails') {
      if (topLabel) topLabel.textContent = 'Bandeja de Notificaciones y Correos';
      if (navEmails) navEmails.classList.add('active');
    } else if (state.currentFormView.type === 'qr-scanner') {
      if (topLabel) topLabel.textContent = 'Escáner de Código QR de Unidad';
      if (navQR) navQR.classList.add('active');
    } else if (state.currentFormView.type === 'qr-plate') {
      if (topLabel) topLabel.textContent = 'Placa QR Oficial de Unidad';
    } else if (state.currentFormView.type === 'print-all-qr') {
      if (topLabel) topLabel.textContent = 'Placas de Identificación QR (Flota)';
      if (navPrintQR) navPrintQR.classList.add('active');
    }
  }

  function getUnitStateBadgeClass(estado) {
    if (!estado || estado === 'Operativo' || estado === 'Aprobado' || estado === 'Aprobado Operativo' || estado === 'Sesión Activa' || estado === 'Servidor Activo' || estado === 'Cámara Lista') {
      return 'state-operativo';
    }
    if (estado === 'Mantenimiento Próximo' || estado === 'Con Observaciones') {
      return 'state-proximo';
    }
    if (estado === 'Mantenimiento Vencido' || estado === 'No Conforme' || estado === 'No Operativo') {
      return 'state-vencido';
    }
    return 'state-operativo';
  }

  function renderUnitStateBadge(estado) {
    const st = estado || 'Operativo';
    let bg = '#10b981'; // Solid emerald green fill (matching image 2)
    let textColor = '#ffffff';
    let shadow = '0 2px 6px rgba(16, 185, 129, 0.4)';
    let cls = 'state-operativo';

    if (st === 'Mantenimiento Próximo' || st === 'Con Observaciones' || st === 'Próximo') {
      bg = '#f59e0b';
      shadow = '0 2px 6px rgba(245, 158, 11, 0.4)';
      cls = 'state-proximo';
    } else if (st === 'Mantenimiento Vencido' || st === 'No Conforme' || st === 'No Operativo' || st === 'Vencido') {
      bg = '#ef4444';
      shadow = '0 2px 6px rgba(239, 68, 68, 0.4)';
      cls = 'state-vencido';
    }

    return `<span class="badge-unit-state ${cls}" style="display:inline-flex !important; align-items:center !important; gap:5px !important; background:${bg} !important; color:${textColor} !important; padding:5px 14px !important; border-radius:9999px !important; font-size:0.78rem !important; font-weight:700 !important; box-shadow:${shadow} !important; line-height:1 !important; white-space:nowrap !important; vertical-align:middle !important; letter-spacing:0.01em !important;">● ${st}</span>`;
  }

  function selectServiceLocation(loc) {
    const btnSitu = document.getElementById('btn-loc-situ');
    const btnTaller = document.getElementById('btn-loc-taller');
    const inputLoc = document.getElementById('input-service-location');
    const eq = getSelectedEquipo();
    if (loc === 'In-situ') {
      if (btnSitu) btnSitu.classList.add('active');
      if (btnTaller) btnTaller.classList.remove('active');
      if (inputLoc) inputLoc.value = `In-situ en el proyecto (${eq ? eq.proyecto : 'Azua'})`;
    } else {
      if (btnTaller) btnTaller.classList.add('active');
      if (btnSitu) btnSitu.classList.remove('active');
      if (inputLoc) inputLoc.value = 'En el taller de la empresa (Santo Domingo)';
    }
  }

  // =========================================================================
  // CATÁLOGO MAESTRO DE PROGRAMAS DE MANTENIMIENTO TÉCNICO (OEM STANDARDS)
  // =========================================================================
  const MAINTENANCE_PROGRAMS = [
    {
      id: 'pm-250',
      codigo: 'PM-1',
      badgeClass: 'badge-pm-250',
      color: '#059669',
      nombre: 'Programa 250 Horas (PM-1 Básico)',
      intervaloHoras: 250,
      nivel: 'Servicio Básico / Rutinario',
      descripcionCorta: 'Servicio ligero regular: drenaje de aceite de motor y filtro de flujo pleno, filtro primario de combustible con separador de agua, engrase general de articulaciones, purga neumática e inspección de fugas.',
      piezasSugeridas: 'Filtro Aceite Motor Cat 1R-1808 (1 ud), Filtro Combustible/Agua Cat 1R-0770 (1 ud), Aceite Motor Chevron Delo 400 15W-40 (8 galones), Grasa Litio EP-2 Chevron Ultra-Duty (2 tubos)',
      suplidorSugerido: 'Distribuidora Corripio Industrial / Santo Domingo Motors',
      costoManoObra: 9500,
      costoRepuestos: 14200,
      tareas: [
        { id: 't250-1', subsistema: 'Motor Diesel', tarea: 'Drenaje y reemplazo de aceite de motor diesel 15W-40 y filtro de flujo pleno.' },
        { id: 't250-2', subsistema: 'Combustible', tarea: 'Cambio de filtro primario de combustible y purga de vaso sedimentador / trampa de agua.' },
        { id: 't250-3', subsistema: 'Chasis & Pluma', tarea: 'Engrase manual a presión de todos los puntos de lubricación (pluma, estabilizadores, cilindros de levante).' },
        { id: 't250-4', subsistema: 'Fluidos', tarea: 'Inspección y nivelación de fluidos: refrigerante, transmisión Powershift y dirección hidráulica.' },
        { id: 't250-5', subsistema: 'Neumático', tarea: 'Purga de humedad y condensación en calderines y tanques de aire comprimido.' },
        { id: 't250-6', subsistema: 'Hidráulica', tarea: 'Inspección visual de fugas en mangueras, racores y cilindros hidráulicos de alta presión.' },
        { id: 't250-7', subsistema: 'Motor Diesel', tarea: 'Verificación de tensión y estado físico de correas de alternador, ventilador y compresor.' },
        { id: 't250-8', subsistema: 'Operacional', tarea: 'Prueba de arranque, comprobación de presión de aceite y verificación de códigos de falla en cabina.' }
      ]
    },
    {
      id: 'pm-500',
      codigo: 'PM-2',
      badgeClass: 'badge-pm-500',
      color: '#0284c7',
      nombre: 'Programa 500 Horas (PM-2 Intermedio)',
      intervaloHoras: 500,
      nivel: 'Servicio Intermedio / Integral',
      descripcionCorta: 'Servicio integral: incluye todas las tareas de 250h más cambio de filtros de aire, combustible secundario (2 micras), filtro retorno hidráulico HF-6510, zapatas de desgaste de pluma y prueba de baterías de 24V.',
      piezasSugeridas: 'Kit Filtros Motor & Aire Donaldson P181054 / P119374, Filtro Combustible Secundario Cat 1R-0749 (2 micras), Filtro Retorno Hidráulico Fleetguard HF-6510, Filtro Respirador Tanque Hidráulico, Aceite 15W-40 (8 gal), Grasa de Grafito / Moly para pluma (2 gal)',
      suplidorSugerido: 'Repuestos Hidráulicos del Caribe SRL / Santo Domingo Motors',
      costoManoObra: 15000,
      costoRepuestos: 26800,
      tareas: [
        { id: 't500-1', subsistema: 'General', tarea: 'Ejecución integral de todas las tareas del Programa PM-1 (250 horas).' },
        { id: 't500-2', subsistema: 'Admisión Motor', tarea: 'Reemplazo de filtros de aire de motor (elemento primario exterior y de seguridad interior).' },
        { id: 't500-3', subsistema: 'Combustible', tarea: 'Reemplazo de filtro secundario de combustible de alta eficiencia (2 micras) y purga de riel común.' },
        { id: 't500-4', subsistema: 'Hidráulica', tarea: 'Reemplazo de elemento filtrante del retorno hidráulico principal HF-6510 y filtro respirador del depósito.' },
        { id: 't500-5', subsistema: 'Pluma Telescópica', tarea: 'Limpieza, ajuste y lubricación con pasta de grafito en zapatas de desgaste (wear pads) de secciones de pluma.' },
        { id: 't500-6', subsistema: 'Cables & Malacates', tarea: 'Inspección de cables de extensión y retracción de pluma telescópica (tensión, deformación, hilos rotos).' },
        { id: 't500-7', subsistema: 'Sistema Eléctrico', tarea: 'Prueba de densidad de electrolito en baterías 24V, limpieza de bornes y medición de voltaje del alternador (27.5V - 28.5V).' },
        { id: 't500-8', subsistema: 'Frenos & Rodaje', tarea: 'Inspección de carrera de cilindros de freno, desgaste de zapatas/pastillas y prueba de hermeticidad de aire.' }
      ]
    },
    {
      id: 'pm-1000',
      codigo: 'PM-3',
      badgeClass: 'badge-pm-1000',
      color: '#7c3aed',
      nombre: 'Programa 1,000 Horas (PM-3 Mayor / Anual)',
      intervaloHoras: 1000,
      nivel: 'Servicio Mayor / Certificado Anual',
      descripcionCorta: 'Servicio mayor anual de tren motriz y estructura: fluido y filtros de transmisión Powershift, diferenciales y cubos planetarios (85W-140), torque de pernos de corona de giro y calibración de válvulas y sensores LMI/A2B.',
      piezasSugeridas: 'Filtro y Aceite Transmisión ATF Allison C-4 (12 galones), Aceite Engranajes SAE 85W-140 API GL-5 (10 galones para diferenciales y mandos finales planetarios), Filtro Presión Hidráulica P164378 (2 uds), Empacadura Tapa Válvulas, Sellos O-Ring tapones magnéticos',
      suplidorSugerido: 'Distribuidora Corripio Industrial / Santo Domingo Motors',
      costoManoObra: 28000,
      costoRepuestos: 58500,
      tareas: [
        { id: 't1000-1', subsistema: 'General', tarea: 'Ejecución integral de todas las tareas de los Programas PM-1 (250h) y PM-2 (500h).' },
        { id: 't1000-2', subsistema: 'Transmisión', tarea: 'Drenaje, limpieza de tapones magnéticos y cambio de aceite en transmisión Powershift con cambio de filtro.' },
        { id: 't1000-3', subsistema: 'Tren Motriz', tarea: 'Reemplazo de aceite SAE 85W-140 en diferencial delantero, trasero y los 4 cubos planetarios de rueda.' },
        { id: 't1000-4', subsistema: 'Corona de Giro', tarea: 'Drenaje y reemplazo de aceite en reductora de giro (swing gearbox) y engrase de corona dentada.' },
        { id: 't1000-5', subsistema: 'Estructura Tornamesa', tarea: 'Verificación de torque con torquímetro calibrado en pernos de corona de giro (grado 10.9/12.9).' },
        { id: 't1000-6', subsistema: 'Hidráulica de Presión', tarea: 'Reemplazo de filtros hidráulicos de alta presión (línea de salida de bomba principal y pilotaje).' },
        { id: 't1000-7', subsistema: 'Motor Diesel', tarea: 'Calibración de holgura de válvulas de admisión/escape e inyectores mecánicos/electrónicos del motor.' },
        { id: 't1000-8', subsistema: 'Seguridad LMI / A2B', tarea: 'Calibración y prueba funcional del sistema LMI / Indicador de Momento de Carga y switch Anti-Two Block (A2B).' }
      ]
    },
    {
      id: 'pm-2000',
      codigo: 'PM-4',
      badgeClass: 'badge-pm-2000',
      color: '#dc2626',
      nombre: 'Programa 2,000 Horas (PM-4 Overhaul de Fluidos Totales)',
      intervaloHoras: 2000,
      nivel: 'Overhaul de Fluidos & Certificación Estructural',
      descripcionCorta: 'Overhaul integral y certificación: reemplazo de 110 gal de aceite hidráulico ISO VG 46, enjuague químico de refrigerante ELC con termostatos, inspección ISO 4309 de cables de acero, ensayos NDT en gancho/pluma y prueba de carga.',
      piezasSugeridas: 'Aceite Hidráulico Antidesgaste ISO VG 46 (2 tambores / 110 galones), Refrigerante Heavy Duty Extended Life Coolant 50/50 (14 galones), Kit Termostatos Cat y sellos de bomba de agua, Cable de acero antigiratorio 19x7 o 35x7 (150 m si aplica reemplazo), Kit filtros totales',
      suplidorSugerido: 'Repuestos Hidráulicos del Caribe / Distribuidora Corripio Industrial',
      costoManoObra: 48000,
      costoRepuestos: 145000,
      tareas: [
        { id: 't2000-1', subsistema: 'General', tarea: 'Ejecución integral de todas las tareas de los Programas PM-1 (250h), PM-2 (500h) y PM-3 (1,000h).' },
        { id: 't2000-2', subsistema: 'Sistema Hidráulico', tarea: 'Drenaje completo, enjuague químico del depósito y llenado de 110 galones de aceite hidráulico ISO VG 46 nuevo.' },
        { id: 't2000-3', subsistema: 'Refrigeración Motor', tarea: 'Drenaje y lavado químico del radiador; reemplazo de termostatos, mangueras de agua y refrigerante ELC 50/50.' },
        { id: 't2000-4', subsistema: 'Cables de Izaje', tarea: 'Inspección profunda de cables de izaje principal y auxiliar bajo norma ISO 4309 (descarte por rotura o aplastamiento).' },
        { id: 't2000-5', subsistema: 'Cilindros Hidráulicos', tarea: 'Prueba de retención y deriva hidráulica (drift test) en cilindros de levante de pluma y cilindros estabilizadores.' },
        { id: 't2000-6', subsistema: 'Ensayos NDT', tarea: 'Inspección no destructiva (NDT) por partículas magnéticas o tintas penetrantes en gancho de carga y cuello.' },
        { id: 't2000-7', subsistema: 'Estructura & Soldaduras', tarea: 'Inspección de soldaduras estructurales en tornamesa, soporte de pluma (pivot pin) y vigas estabilizadoras.' },
        { id: 't2000-8', subsistema: 'Certificación de Carga', tarea: 'Prueba dinámica de izaje con carga certificada y verificación de curvas de carga en computadora LMI.' }
      ]
    },
    {
      id: 'correctivo',
      codigo: 'Avería',
      badgeClass: 'badge-pm-corr',
      color: '#d97706',
      nombre: 'Mantenimiento Correctivo / Reparación de Avería',
      intervaloHoras: 0,
      nivel: 'Atención Correctiva Imprevista',
      descripcionCorta: 'Atención técnica a fallas imprevistas: diagnóstico hidráulico/mecánico, despresurización LOTO, reemplazo de componentes averiados, prensado de mangueras de 4 mallas, sellos y prueba de funcionamiento bajo carga.',
      piezasSugeridas: 'Kit de Sellos Hidráulicos Parker/Hallite, Mangueras de alta presión 4 mallas SAE 100R12 con terminales JIC/BSP, Válvula de contrabalance o componente específico averiado',
      suplidorSugerido: 'Mangueras y Conexiones Dominicana (MANCODOM) / Hydraulic Seals & Gaskets RD',
      costoManoObra: 18500,
      costoRepuestos: 32000,
      tareas: [
        { id: 'tcorr-1', subsistema: 'Diagnóstico', tarea: 'Diagnóstico de falla con manómetros / escáner electrónico y aislamiento del subsistema afectado.' },
        { id: 'tcorr-2', subsistema: 'Seguridad LOTO', tarea: 'Despresurización segura del circuito hidráulico y bloqueo/etiquetado de energía (LOTO).' },
        { id: 'tcorr-3', subsistema: 'Desmontaje', tarea: 'Desmontaje cuidadoso del componente averiado y evaluación de causa raíz (desgaste, contaminación, fatiga).' },
        { id: 'tcorr-4', subsistema: 'Limpieza Circuito', tarea: 'Limpieza minuciosa de tuberías, fitting y verificación de no presencia de virutas metálicas en el circuito.' },
        { id: 'tcorr-5', subsistema: 'Instalación', tarea: 'Instalación de componente nuevo o rectificado con empaquetaduras y O-rings de vitón/nitrilo nuevos.' },
        { id: 'tcorr-6', subsistema: 'Torque & Purga', tarea: 'Purga de aire en líneas hidráulicas y verificación de torques de apriete según manual de taller del fabricante.' },
        { id: 'tcorr-7', subsistema: 'Regulación de Presión', tarea: 'Ajuste y calibración de válvulas de alivio o presiones de trabajo con manómetro certificado.' },
        { id: 'tcorr-8', subsistema: 'Prueba Operacional', tarea: 'Prueba funcional en vacío y bajo ciclo operativo real con carga antes de liberar la grúa al proyecto.' }
      ]
    }
  ];

  // =========================================================================
  // IN-PAGE INFOTEP VIEW: CATÁLOGO DE PROGRAMAS DE MANTENIMIENTO
  // =========================================================================
  function renderInPageMaintenanceProgramsCatalog(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista de grúas">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver a Flota</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Programas de Mantenimiento Estandarizados</h2>
          <div class="infotep-page-subtitle">Especificaciones técnicas OEM de fabricante (Grove, Tadano, Liebherr, Manitowoc) para la flota de grúas de F&J Repairs SRL</div>
        </div>
      </div>

      <!-- Selector rápido de unidad -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.1rem;">⚙️</span>
          <span style="font-weight:700; color:#002b66; font-size:0.88rem;">Unidad Seleccionada:</span>
          <strong style="color:#0284c7;">${equipo.codigo} - ${equipo.nombre}</strong>
          <span style="font-size:0.8rem; color:#64748b;">(${equipo.horometroActual} hrs actuales)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="font-size:0.8rem; font-weight:600; color:#475569;">Cambiar Unidad:</label>
          <select class="form-select" style="width:auto; height:34px; font-size:0.8rem; padding:4px 8px;" onchange="App.selectEquipo(this.value); App.openMaintenanceProgramsView(this.value)">
            ${state.equipos.map(e => `
              <option value="${e.id}" ${e.id === equipo.id ? 'selected' : ''}>
                ${e.codigo} - ${e.nombre}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Grid de Programas de Mantenimiento -->
      <div class="program-catalog-grid">
        ${MAINTENANCE_PROGRAMS.map(prog => {
          const totalCost = prog.costoManoObra + prog.costoRepuestos;
          const isCorr = prog.id === 'correctivo';
          const nextHoroCalc = isCorr ? equipo.proximoMantenimientoHoras : equipo.horometroActual + prog.intervaloHoras;

          return `
            <div class="program-catalog-card ${prog.badgeClass}" style="border-top: 4px solid ${prog.color};">
              <div class="program-catalog-header">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:8px;">
                  <span class="program-badge-pill" style="background:${prog.color}; color:#ffffff; font-weight:800; font-size:0.75rem; padding:4px 10px; border-radius:20px;">
                    ${prog.codigo}
                  </span>
                  <span style="font-size:0.75rem; font-weight:700; color:#475569; background:#f1f5f9; padding:4px 8px; border-radius:4px;">
                    ${prog.intervaloHoras ? `⏱️ Cada ${prog.intervaloHoras} hrs` : '⚠️ A Demanda'}
                  </span>
                </div>
                <h3 style="font-size:1.05rem; font-weight:800; color:#002b66; margin:0 0 4px 0;">
                  ${prog.nombre}
                </h3>
                <div style="font-size:0.75rem; font-weight:600; color:${prog.color}; margin-bottom:8px;">
                  ${prog.nivel}
                </div>
                <p style="font-size:0.8rem; color:#475569; margin:0; line-height:1.45;">
                  ${prog.descripcionCorta}
                </p>
              </div>

              <div class="program-catalog-body">
                <!-- Horómetro proyectado -->
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; margin-bottom:12px; font-size:0.78rem;">
                  <span style="color:#64748b;">Próximo hito proyectado en ${equipo.codigo}:</span>
                  <strong style="color:#002b66; display:block; font-size:0.88rem; margin-top:2px;">
                    ${nextHoroCalc} hrs ${!isCorr ? `(+${prog.intervaloHoras} hrs)` : '(Preserva preventivo)'}
                  </strong>
                </div>

                <!-- Repuestos sugeridos -->
                <div style="margin-bottom:12px;">
                  <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
                    📦 Repuestos & Fluidos Clave:
                  </div>
                  <div style="font-size:0.78rem; color:#1e293b; background:#f1f5f9; padding:6px 10px; border-radius:6px; line-height:1.4;">
                    ${prog.piezasSugeridas}
                  </div>
                  <div style="font-size:0.72rem; color:#64748b; margin-top:4px;">
                    Suplidor en RD: <strong>${prog.suplidorSugerido.split(' / ')[0]}</strong>
                  </div>
                </div>

                <!-- Costos estimados -->
                <div style="display:flex; justify-content:space-between; align-items:center; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:8px 12px; margin-bottom:14px;">
                  <div>
                    <span style="font-size:0.7rem; color:#065f46; font-weight:600; display:block;">Costo Estimado (M.O. + Repuestos):</span>
                    <strong style="font-size:0.95rem; color:#047857; font-weight:800;">
                      RD$ ${totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div style="text-align:right; font-size:0.7rem; color:#065f46;">
                    <div>M.O: RD$ ${prog.costoManoObra.toLocaleString()}</div>
                    <div>Rep: RD$ ${prog.costoRepuestos.toLocaleString()}</div>
                  </div>
                </div>

                <!-- Checklist tareas preview -->
                <div>
                  <div style="font-size:0.72rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">
                    ✓ Protocolo Técnico (${prog.tareas.length} Tareas Específicas):
                  </div>
                  <div style="display:flex; flex-direction:column; gap:6px; max-height:170px; overflow-y:auto; padding-right:4px;">
                    ${prog.tareas.map((t, idx) => `
                      <div style="display:flex; align-items:flex-start; gap:6px; font-size:0.74rem; color:#334155; line-height:1.35; padding:4px 0; border-bottom:1px solid #f1f5f9;">
                        <span style="font-weight:700; color:${prog.color}; font-size:0.7rem; flex-shrink:0;">${idx+1}.</span>
                        <div style="flex:1;">
                          <span class="task-subsystem-badge" style="font-size:0.65rem; padding:1px 5px; border-radius:3px; background:#e2e8f0; color:#334155; font-weight:600; margin-right:4px;">
                            ${t.subsistema}
                          </span>
                          <span>${t.tarea}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="program-catalog-footer">
                <button type="button" class="btn-start-program" style="background:${prog.color};" onclick="App.openMaintenanceWithProgram('${prog.id}', '${equipo.id}')">
                  <span>🛠️ Iniciar Formulario (${prog.codigo})</span>
                  <span style="font-size:1.1rem; line-height:1;">›</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  // =========================================================================
  // IN-PAGE INFOTEP FORM: REGISTRO DE MANTENIMIENTO POR PROGRAMA
  // =========================================================================
  function renderInPageMaintenanceForm(equipoId, programaId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const activeProgId = programaId || state.selectedMaintenanceProgramId || 'pm-250';
    state.selectedMaintenanceProgramId = activeProgId;
    const activeProg = MAINTENANCE_PROGRAMS.find(p => p.id === activeProgId) || MAINTENANCE_PROGRAMS[0];
    const isCorrectivo = activeProg.id === 'correctivo';
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    // Calculate target next horometer based on current equipment horometer
    const currentHoro = equipo.horometroActual || 4890;
    const nextHoroCalc = isCorrectivo 
      ? `${equipo.proximoMantenimientoHoras} hrs (Preserva intervalo estándar)` 
      : `${currentHoro + activeProg.intervaloHoras} hrs (+${activeProg.intervaloHoras} hrs según ${activeProg.codigo})`;

    const totalEstCost = activeProg.costoManoObra + activeProg.costoRepuestos;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista de grúas">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Registrar Mantenimiento de Flota</h2>
          <div class="infotep-page-subtitle">Formulario especializado por programa técnico (250h, 500h, 1000h, 2000h y correctivo) con piezas OEM y control de costos</div>
        </div>
      </div>

      <!-- SELECTOR INTERACTIVO DE PROGRAMAS DE MANTENIMIENTO -->
      <div class="maintenance-program-tabs-container">
        <div class="maintenance-program-tabs-title">
          <span>📋 SELECCIONE EL PROGRAMA DE MANTENIMIENTO TÉCNICO:</span>
        </div>
        <div class="maintenance-program-tabs">
          ${MAINTENANCE_PROGRAMS.map(prog => `
            <button type="button" 
              class="program-tab-btn ${prog.id === activeProg.id ? 'active' : ''} ${prog.badgeClass}" 
              onclick="App.selectMaintenanceProgram('${prog.id}', '${equipo.id}')">
              <span class="program-tab-code">${prog.codigo}</span>
              <span class="program-tab-name">${prog.nombre.split(' (')[0]}</span>
              <span class="program-tab-hrs">${prog.intervaloHoras ? `${prog.intervaloHoras} hrs` : 'Avería'}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- BANNER EXPLICATIVO DEL PROGRAMA ACTIVO -->
      <div class="program-banner-summary" style="border-left-color: ${activeProg.color};">
        <div class="program-banner-title">
          <span class="program-banner-badge" style="background:${activeProg.color};">${activeProg.codigo}</span>
          <strong style="color:#002b66; font-size:1rem;">${activeProg.nombre}</strong>
          <span class="program-banner-level" style="color:${activeProg.color};">• ${activeProg.nivel}</span>
        </div>
        <div class="program-banner-desc">
          ${activeProg.descripcionCorta}
        </div>
      </div>

      <div class="infotep-form-card">
        <form id="maintenance-form" onsubmit="App.handleMaintenanceSubmit(event, '${equipo.id}')">
          <input type="hidden" name="programaId" id="input-programa-id" value="${activeProg.id}">
          <input type="hidden" name="programaNombre" id="input-programa-nombre" value="${activeProg.nombre}">
          
          <!-- SECTION 1: DATOS GENERALES -->
          <div class="infotep-section-header">
            <span class="section-icon">💳</span>
            <span class="section-title">DATOS GENERALES DE LA UNIDAD</span>
          </div>
          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Unidad / Grúa Asignada <span class="required-star">*</span></label>
              <select name="equipoIdSelect" class="form-select" onchange="App.selectEquipo(this.value); App.openModuleMaintenance(this.value, '${activeProg.id}')">
                ${state.equipos.map(e => `
                  <option value="${e.id}" ${e.id === equipo.id ? 'selected' : ''}>
                    ${e.codigo} - ${e.nombre} (${e.proyecto})
                  </option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="infotep-label">Proyecto / Ubicación Operativa</label>
              <input type="text" class="form-input" value="${equipo.proyecto} · ${equipo.ubicacion}" readonly style="background:#f8fafc; font-weight:600; color:#334155;">
            </div>
          </div>
          
          <div class="infotep-form-grid-2" style="margin-top:1.25rem;">
            <div>
              <label class="infotep-label">Lugar de Ejecución del Servicio <span class="required-star">*</span></label>
              <div class="infotep-pill-toggle-group">
                <button type="button" class="infotep-pill-btn active" id="btn-loc-situ" onclick="App.selectServiceLocation('In-situ')">
                  📍 In-situ en Proyecto
                </button>
                <button type="button" class="infotep-pill-btn" id="btn-loc-taller" onclick="App.selectServiceLocation('Taller')">
                  🏢 Taller Central F&J
                </button>
              </div>
              <div style="font-size:0.72rem; color:#64748b; margin-top:4px;">
                📍 Proyecto asignado: <strong>${equipo.proyecto}</strong>
              </div>
              <input type="hidden" name="ubicacion" id="input-service-location" value="In-situ en el proyecto (${equipo.proyecto})">
            </div>
            <div>
              <label class="infotep-label">Técnico o Taller Responsable <span class="required-star">*</span></label>
              <input type="text" name="realizadoPor" class="form-input" value="${state.currentUser ? state.currentUser.name : 'Frankely Gil'} (Técnico F&J Repairs SRL)" placeholder="Nombre del técnico o taller externo" required>
            </div>
          </div>

          <!-- SECTION 2: TIPO DE SERVICIO Y HORÓMETRO -->
          <div class="infotep-section-header">
            <span class="section-icon">🔧</span>
            <span class="section-title">TIPO DE SERVICIO Y HORÓMETRO</span>
          </div>
          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Clasificación de Mantenimiento <span class="required-star">*</span></label>
              <div class="infotep-radio-group">
                <div class="infotep-radio-box" id="box-mant-prev" style="${!isCorrectivo ? 'border-color:#10b981; background:#ecfdf5;' : 'border-color:#cbd5e1; background:#ffffff;'}" onclick="App.selectMaintenanceType('Preventivo')">
                  <input type="radio" name="tipoMantenimiento" value="Preventivo" ${!isCorrectivo ? 'checked' : ''} id="radio-mant-prev" style="margin-right:8px;">
                  <label for="radio-mant-prev" style="cursor:pointer; font-weight:700; color:#065f46; font-size:0.82rem;">🟢 Preventivo Programado</label>
                </div>
                <div class="infotep-radio-box" id="box-mant-corr" style="${isCorrectivo ? 'border-color:#f59e0b; background:#fffbeb;' : 'border-color:#cbd5e1; background:#ffffff;'}" onclick="App.selectMaintenanceType('Correctivo')">
                  <input type="radio" name="tipoMantenimiento" value="Correctivo" ${isCorrectivo ? 'checked' : ''} id="radio-mant-corr" style="margin-right:8px;">
                  <label for="radio-mant-corr" style="cursor:pointer; font-weight:700; color:#b45309; font-size:0.82rem;">🟠 Correctivo / Avería</label>
                </div>
              </div>
            </div>
            <div>
              <label class="infotep-label">Fecha y Hora de Intervención <span class="required-star">*</span></label>
              <input type="datetime-local" name="fecha" class="form-input" value="${new Date().toISOString().slice(0,16)}" required>
            </div>
          </div>

          <div class="infotep-form-grid-2" style="margin-top:1.25rem;">
            <div>
              <label class="infotep-label">Lectura de Horómetro Actual (hrs) <span class="required-star">*</span></label>
              <input type="number" name="horometro" id="mant-horometro-input" class="form-input" value="${equipo.horometroActual}" required style="font-weight:700; color:#002b66;" oninput="App.updateNextMaintenancePrediction(this.value)">
              <div style="font-size:0.72rem; color:#64748b; margin-top:3px;">Horómetro registrado en bitácora de la grúa</div>
            </div>
            <div>
              <label class="infotep-label">Próximo Mantenimiento Programado Proyectado</label>
              <input type="text" id="mant-next-horometro-display" class="form-input" value="${nextHoroCalc}" readonly style="background:#f8fafc; color:#002b66; font-weight:700;">
            </div>
          </div>

          <!-- SECTION 3: SUPLIDOR Y REPUESTOS -->
          <div class="infotep-section-header">
            <span class="section-icon">🏢</span>
            <span class="section-title">SUPLIDOR Y COMPRA DE REPUESTOS EN REPÚBLICA DOMINICANA</span>
          </div>
          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Suplidor / Proveedor de Repuestos <span class="required-star">*</span></label>
              <select name="suplidorRepuestos" class="form-select" id="select-mant-suplidor" required>
                <option value="Distribuidora Corripio Industrial / Santo Domingo Motors" ${activeProg.suplidorSugerido.includes('Corripio') ? 'selected' : ''}>Distribuidora Corripio Industrial / Santo Domingo Motors</option>
                <option value="Repuestos Hidráulicos del Caribe SRL" ${activeProg.suplidorSugerido.includes('Hidráulicos') ? 'selected' : ''}>Repuestos Hidráulicos del Caribe SRL</option>
                <option value="Mangueras y Conexiones Dominicana (MANCODOM)" ${activeProg.suplidorSugerido.includes('MANCODOM') ? 'selected' : ''}>Mangueras y Conexiones Dominicana (MANCODOM)</option>
                <option value="Hydraulic Seals & Gaskets RD" ${activeProg.suplidorSugerido.includes('Seals') ? 'selected' : ''}>Hydraulic Seals & Gaskets RD</option>
                <option value="Equipos y Cables Industriales del Norte">Equipos y Cables Industriales del Norte</option>
                <option value="Taller Central F&J Repairs (Stock Interno)">Taller Central F&J Repairs (Stock Interno)</option>
                <option value="Repuestos Pesados Santo Domingo SRL">Repuestos Pesados Santo Domingo SRL</option>
                <option value="Otro Suplidor Local">Otro Suplidor Local</option>
              </select>
            </div>
            <div>
              <label class="infotep-label">Factura / NCF / Comprobante Fiscal</label>
              <input type="text" name="facturaSuplidor" class="form-input" placeholder="Ej. B01-00049102" value="B01-00049102">
            </div>
          </div>

          <div style="margin-top:1.25rem;">
            <label class="infotep-label">Piezas o Repuestos Utilizados (${activeProg.codigo}) <span class="required-star">*</span></label>
            <input type="text" name="piezasUtilizadas" class="form-input" placeholder="Detalle piezas y lubricantes..." value="${activeProg.piezasSugeridas}" required>
          </div>

          <div style="margin-top:1.25rem;">
            <label class="infotep-label">Descripción Detallada de Trabajos Realizados <span class="required-star">*</span></label>
            <textarea name="descripcion" class="form-textarea" rows="3" placeholder="Detalle los trabajos mecánicos realizados..." required>${activeProg.descripcionCorta}</textarea>
          </div>

          <!-- SECTION 4: PROTOCOLO TÉCNICO & CHECKLIST DEL PROGRAMA -->
          <div class="infotep-section-header" style="justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="section-icon">⚙️</span>
              <span class="section-title">CHECKLIST TÉCNICO DEL ${activeProg.codigo} (${activeProg.tareas.length} TAREAS OBLIGATORIAS)</span>
            </div>
            <button type="button" class="btn-infotep-submit" onclick="App.markAllProgramTasksOK()" style="padding:5px 12px; font-size:0.75rem; margin:0; background:#f0fdf4; color:#166534; border:1px solid #86efac;">
              ✓ Marcar Todas Conformes
            </button>
          </div>

          <div class="program-checklist-container">
            ${activeProg.tareas.map((t, idx) => `
              <div class="program-task-card">
                <div class="program-task-info">
                  <div class="task-number-subsystem">
                    <span class="task-idx" style="color:${activeProg.color}; font-weight:800;">${idx + 1}.</span>
                    <span class="task-subsystem-badge">${t.subsistema}</span>
                  </div>
                  <div class="task-desc-text">${t.tarea}</div>
                </div>
                <div class="program-task-options">
                  <label class="prog-task-radio-label label-ok">
                    <input type="radio" class="prog-chk-radio prog-chk-radio-ok" name="task_${t.id}" value="Conforme" checked>
                    <span>✓ Conforme</span>
                  </label>
                  <label class="prog-task-radio-label label-obs">
                    <input type="radio" class="prog-chk-radio" name="task_${t.id}" value="Observación">
                    <span>⚠️ Obs.</span>
                  </label>
                  <label class="prog-task-radio-label label-na">
                    <input type="radio" class="prog-chk-radio" name="task_${t.id}" value="N/A">
                    <span>N/A</span>
                  </label>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- SECTION 5: COSTOS Y FINANZAS -->
          <div class="infotep-section-header" style="margin-top:2rem;">
            <span class="section-icon">💰</span>
            <span class="section-title">COSTOS Y FINANZAS ESTIMADAS (RD$)</span>
          </div>
          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Costo Mano de Obra (RD$) <span class="required-star">*</span></label>
              <input type="number" id="costo-mano-obra" name="costoManoObra" class="form-input" value="${activeProg.costoManoObra}" oninput="App.calculateTotalMaintenanceCost()" required>
            </div>
            <div>
              <label class="infotep-label">Costo de Repuestos y Materiales (RD$) <span class="required-star">*</span></label>
              <input type="number" id="costo-repuestos" name="costoRepuestos" class="form-input" value="${activeProg.costoRepuestos}" oninput="App.calculateTotalMaintenanceCost()" required>
            </div>
          </div>

          <div class="infotep-total-cost-box" style="margin-top:1.25rem;">
            <span style="font-size:0.9rem; font-weight:700; color:#166534;">Costo Total Estimado del Servicio:</span>
            <span id="costo-total-display" style="font-size:1.35rem; font-weight:900; color:#15803d;">RD$ ${totalEstCost.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
          </div>

          <!-- SECTION 6: REGISTRO FOTOGRÁFICO -->
          <div class="infotep-section-header">
            <span class="section-icon">📸</span>
            <span class="section-title">EVIDENCIA Y REGISTRO FOTOGRÁFICO</span>
          </div>
          <div class="infotep-photo-upload-box">
            <div style="width:75px; height:75px; border-radius:8px; overflow:hidden; border:1px solid #cbd5e1; flex-shrink:0; background:#f1f5f9;">
              <img id="mant-photo-thumb" src="assets/repuesto_referencia.jpg" alt="Foto Repuesto" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="flex:1;">
              <div style="font-weight:700; color:#002b66; font-size:0.85rem; margin-bottom:4px;">Foto del Repuesto Nuevo o Pieza Reemplazada</div>
              <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">Adjunte fotografía legible de la pieza o del trabajo terminado para la bitácora técnica de F&J Repairs.</p>
              <input type="file" id="mant-photo-input" accept="image/*" capture="environment" class="form-input" onchange="App.handleMaintenancePhotoSelection(event)">
            </div>
          </div>

          <!-- ACTIONS FOOTER -->
          <div class="infotep-form-actions-footer">
            <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
              Cancelar
            </button>
            <button type="submit" class="btn-infotep-submit" style="background:#002b66;">
              💾 Guardar ${activeProg.codigo} en Bitácora
            </button>
          </div>

        </form>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  // =========================================================================
  // IN-PAGE INFOTEP FORM: INSPECCIÓN PRE-USO DEL EQUIPO
  // =========================================================================
  function renderInPageInspectionForm(equipoId) {
    state.uploadedPhotos = [];
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const sections = state.checklistSecciones || [];
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Inspección Pre-Uso de Equipo</h2>
          <div class="infotep-page-subtitle">Checklist operacional diario, horómetro y certificación obligatoria antes de izaje</div>
        </div>
      </div>

      <div class="infotep-form-card">
        <form id="inspection-form" onsubmit="App.handleInspectionSubmit(event, '${equipo.id}')">
          
          <!-- SECTION 1: HOROMETRO Y CUENTA REGRESIVA -->
          <div class="infotep-section-header">
            <span class="section-icon">⏱️</span>
            <span class="section-title">LECTURA ACTUAL DE HORÓMETRO Y CUENTA REGRESIVA</span>
          </div>
          
          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Lectura Actual del Horómetro (Horas) <span class="required-star">*</span></label>
              <input type="number" id="insp-horometro-input" class="form-input" style="font-size:1.15rem; font-weight:800; color:#002b66;" value="${equipo.horometroActual}" min="${equipo.horometroActual}" oninput="App.calculateRemainingHours(this.value, ${equipo.proximoMantenimientoHoras})" required>
              <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Último registro confirmado: ${equipo.horometroActual} hrs</div>
            </div>
            <div>
              <label class="infotep-label">Estado de Próximo Mantenimiento Preventivo</label>
              <div id="insp-countdown-display" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:6px; padding:12px 14px; font-weight:700; color:#059669; font-size:0.92rem;">
                Faltan ${equipo.proximoMantenimientoHoras - equipo.horometroActual} horas (Meta programada: ${equipo.proximoMantenimientoHoras} hrs)
              </div>
            </div>
          </div>

          <!-- SECTION 2: CHECKLIST PRE-OPERACIONAL -->
          <div class="infotep-section-header" style="justify-content:space-between; margin-top:2rem;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="section-icon">🔍</span>
              <span class="section-title">CHECKLIST OPERACIONAL (PUNTOS CRÍTICOS)</span>
            </div>
            <button type="button" class="btn-infotep-submit" onclick="App.markAllChecklistOK()" style="padding:6px 14px; font-size:0.75rem; margin:0; background:#f1f5f9; color:#002b66; border:1px solid #cbd5e1;">
              ✓ Marcar Todo Conforme
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:16px;">
            ${sections.map((sec, secIdx) => `
              <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
                <div style="background:#f8fafc; padding:10px 14px; border-bottom:1px solid #e2e8f0; font-weight:700; color:#002b66; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                  <span>${sec.icono || '📌'}</span>
                  <span>${sec.seccion}</span>
                </div>
                <div style="padding:8px 14px; background:#ffffff;">
                  ${sec.items.map((it, itIdx) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:${itIdx === sec.items.length - 1 ? 'none' : '1px solid #f1f5f9'}; flex-wrap:wrap; gap:8px;">
                      <div style="flex:1 1 200px; min-width:0; font-size:0.82rem; color:#1e293b; font-weight:500;">
                        ${it.pregunta}
                      </div>
                      <div style="display:inline-flex; flex-wrap:wrap; gap:6px;">
                        <label style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem; cursor:pointer; background:#ffffff;">
                          <input type="radio" class="chk-radio chk-radio-ok" name="${it.id}" value="Conforme" checked>
                          <span style="color:#059669; font-weight:700;">✓ Conforme</span>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem; cursor:pointer; background:#ffffff;">
                          <input type="radio" class="chk-radio chk-radio-bad" name="${it.id}" value="No Conforme" onchange="App.handleNonConformingItem('${it.id}', '${it.pregunta}')">
                          <span style="color:#dc2626; font-weight:700;">✕ Falla</span>
                        </label>
                        <label style="display:inline-flex; align-items:center; gap:4px; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:0.75rem; cursor:pointer; background:#ffffff;">
                          <input type="radio" class="chk-radio" name="${it.id}" value="N/A">
                          <span style="color:#64748b;">N/A</span>
                        </label>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- SECTION 3: FOTOS Y EVIDENCIAS -->
          <div class="infotep-section-header" style="margin-top:2rem;">
            <span class="section-icon">📸</span>
            <span class="section-title">EVIDENCIA FOTOGRÁFICA Y CONDICIONES DEL EQUIPO</span>
          </div>
          <div class="infotep-photo-upload-box" onclick="document.getElementById('insp-photo-input').click()" style="cursor:pointer;">
            <div style="font-size:1.8rem; margin-right:12px;">📷</div>
            <div style="flex:1;">
              <div style="font-weight:700; color:#002b66; font-size:0.85rem;">Haga clic para capturar fotos o adjuntar videos del equipo</div>
              <div style="font-size:0.75rem; color:#64748b;">Compatible con cámara de celular, fotos de estabilizadores, cables, neumáticos y panel LMI</div>
              <input type="file" id="insp-photo-input" accept="image/*,video/*" capture="environment" style="display:none;" onchange="App.handlePhotoSelection(event)">
            </div>
            <button type="button" class="btn-infotep-upload" style="margin:0;">Seleccionar</button>
          </div>
          <div class="media-previews-grid" id="insp-media-preview-box" style="margin-top:10px;"></div>

          <!-- SECTION 4: OBSERVACIONES Y FIRMA DIGITAL -->
          <div class="infotep-section-header" style="margin-top:2rem;">
            <span class="section-icon">✍️</span>
            <span class="section-title">OBSERVACIONES Y FIRMA DIGITAL DEL OPERADOR</span>
          </div>
          <div style="margin-bottom:1.25rem;">
            <label class="infotep-label">Observaciones Generales o Hallazgos Adicionales</label>
            <textarea id="insp-observaciones" class="form-textarea" rows="3" placeholder="Describa cualquier condición detectada o notas para el equipo de mantenimiento..."></textarea>
          </div>

          <div style="margin-bottom:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <label class="infotep-label" style="margin-bottom:0;">Firma Digital del Inspector / Operador <span class="required-star">*</span></label>
              <button type="button" class="btn-infotep-cancel" onclick="App.clearSignature()" style="padding:4px 10px; font-size:0.72rem;">Limpiar Firma</button>
            </div>
            <div class="signature-box" style="border:1.5px solid #cbd5e1; border-radius:6px; background:#f8fafc; padding:4px;">
              <canvas id="insp-sig-canvas" class="signature-canvas" style="width:100%; height:120px; display:block; background:#ffffff; border-radius:4px;"></canvas>
            </div>
            <div style="font-size:0.72rem; color:#64748b; margin-top:4px;">Firme con el dedo o puntero en la pantalla para certificar la veracidad de la inspección.</div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="infotep-form-actions-footer">
            <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
              Cancelar
            </button>
            <button type="submit" id="btn-submit-inspection" class="btn-infotep-submit">
              🚀 Completar Inspección y Enviar Reporte por Correo
            </button>
          </div>

        </form>
      </div>
    `;

    setTimeout(initSignaturePad, 150);
  }

  // =========================================================================
  // IN-PAGE INFOTEP FORM: SUBIR DOCUMENTO TÉCNICO
  // =========================================================================
  function renderInPageUploadDocForm(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Adjuntar Documento Técnico</h2>
          <div class="infotep-page-subtitle">Carga de certificados de izaje, pólizas de seguro, matrículas y manuales</div>
        </div>
      </div>

      <div class="infotep-form-card">
        <form onsubmit="App.handleUploadDocSubmit(event, '${equipo.id}')">
          
          <div class="infotep-section-header">
            <span class="section-icon">💳</span>
            <span class="section-title">IDENTIFICACIÓN DEL DOCUMENTO</span>
          </div>

          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Título del Documento <span class="required-star">*</span></label>
              <input type="text" name="titulo" class="form-input" placeholder="Ej. Póliza de Seguro Todo Riesgo 2026-2027" required>
            </div>
            <div>
              <label class="infotep-label">Categoría del Archivo <span class="required-star">*</span></label>
              <select name="categoria" class="form-select">
                <option value="Certificación del Equipo">Certificación del Equipo (Inspección Técnica)</option>
                <option value="Seguros y Pólizas">Seguros y Pólizas (Todo Riesgo / Responsabilidad Civil)</option>
                <option value="Matrícula y Propiedad">Matrícula y Propiedad (DGII R.D.)</option>
                <option value="Certificación Operador">Certificación Operador (Carnet de Operador)</option>
                <option value="Bitácoras Mantenimiento">Bitácoras Mantenimiento</option>
                <option value="Repuestos y Suplidores">Repuestos y Suplidores</option>
              </select>
            </div>
          </div>

          <div class="infotep-form-grid-2" style="margin-top:1.25rem;">
            <div>
              <label class="infotep-label">Formato del Documento</label>
              <select name="formato" class="form-select">
                <option value="PDF">PDF (Documento Digital)</option>
                <option value="JPG">JPG / Imagen</option>
                <option value="PNG">PNG / Imagen</option>
                <option value="DOCX">Word / DOCX</option>
              </select>
            </div>
            <div>
              <label class="infotep-label">Fecha de Vencimiento / Vigencia</label>
              <input type="date" name="vencimiento" class="form-input" value="${new Date(Date.now() + 365*24*3600*1000).toISOString().slice(0,10)}">
            </div>
          </div>

          <div class="infotep-section-header" style="margin-top:2rem;">
            <span class="section-icon">📁</span>
            <span class="section-title">ARCHIVO ADJUNTO Y NOTAS</span>
          </div>

          <div class="infotep-photo-upload-box" style="margin-bottom:1.25rem;">
            <div style="font-size:2rem; margin-right:12px;">📄</div>
            <div style="flex:1;">
              <div style="font-weight:700; color:#002b66; font-size:0.85rem; margin-bottom:4px;">Seleccione el archivo PDF o imagen a subir</div>
              <input type="file" name="archivo" class="form-input" accept=".pdf,image/*">
              <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Máximo 25 MB por archivo. Formatos permitidos: PDF, JPG, PNG.</div>
            </div>
          </div>

          <div>
            <label class="infotep-label">Descripción o Notas de Validez</label>
            <textarea name="descripcion" class="form-textarea" rows="3" placeholder="Ej. Certificado emitido por inspectores autorizados conforme a normas ASME B30.5 con vigencia anual..."></textarea>
          </div>

          <div class="infotep-form-actions-footer">
            <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
              Cancelar
            </button>
            <button type="submit" class="btn-infotep-submit">
              📎 Guardar y Publicar Documento
            </button>
          </div>

        </form>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  // =========================================================================
  // IN-PAGE INFOTEP VIEW: BÓVEDA DE DOCUMENTACIÓN TÉCNICA
  // =========================================================================
  function renderInPageDocsView(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const docs = state.documentos.filter(d => d.equipoId === equipo.id || !d.equipoId);
    const repuestos = state.repuestosSuplidores.filter(r => r.equipoId === equipo.id || !r.equipoId);
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
            <button class="btn-infotep-submit" onclick="App.openUploadDocModal('${equipo.id}')" style="margin:0; padding:6px 14px; font-size:0.78rem;">
              + Adjuntar Documento
            </button>
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Bóveda de Documentación: ${equipo.codigo}</h2>
          <div class="infotep-page-subtitle">Acceso autorizado | ${equipo.nombre} (${equipo.proyecto})</div>
        </div>
      </div>

      <div class="infotep-form-card" style="padding:1.5rem;">
        <div class="infotep-status-pills" style="margin-bottom:1.5rem;">
          <button id="doc-tab-btn-1" class="infotep-status-pill active" onclick="App.switchDocTab(1)">
            📄 Documentos Oficiales (${docs.length})
          </button>
          <button id="doc-tab-btn-2" class="infotep-status-pill" onclick="App.switchDocTab(2)">
            ⚙️ Repuestos & Suplidores por Ítem (${repuestos.length})
          </button>
        </div>

        <!-- TAB 1: Documentos -->
        <div id="doc-tab-panel-1">
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${docs.map(doc => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border:1px solid #e2e8f0; border-radius:8px; background:#ffffff; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:14px;">
                  <div style="width:42px; height:42px; border-radius:6px; background:#e0f2fe; color:#002b66; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8rem;">
                    ${doc.formato || 'PDF'}
                  </div>
                  <div>
                    <h4 style="font-size:0.92rem; font-weight:800; color:#0f172a; margin-bottom:2px;">${doc.titulo}</h4>
                    <p style="font-size:0.75rem; color:#64748b; margin:0;">
                      <strong>Categoría:</strong> ${doc.categoria} · <strong>Vigencia:</strong> ${doc.vencimiento} · <strong>Tamaño:</strong> ${doc.tamano}
                    </p>
                    <p style="font-size:0.72rem; color:#475569; margin:4px 0 0 0;">${doc.descripcion}</p>
                  </div>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn-table-action" onclick="App.previewDocumentFile('${doc.titulo}', '${doc.categoria}')" style="padding:6px 12px; font-size:0.78rem;">
                    👁️ Ver
                  </button>
                  <button class="btn-table-action" onclick="App.downloadSimulatedDoc('${doc.titulo}')" style="padding:6px 12px; font-size:0.78rem; background:#ecfdf5; border-color:#a7f3d0; color:#065f46;">
                    ⬇️ Descargar
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- TAB 2: Repuestos y Suplidores por Ítem -->
        <div id="doc-tab-panel-2" style="display:none;">
          <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:10px 14px; border-radius:6px; margin-bottom:1.25rem; font-size:0.78rem; color:#92400e;">
            Catálogo oficial de repuestos críticos para <strong>${equipo.codigo}</strong> con proveedores directos en República Dominicana.
          </div>

          <div style="overflow-x:auto;">
            <table class="infotep-data-table">
              <thead>
                <tr>
                  <th>Pieza / Descripción</th>
                  <th>Nro. Parte (OEM)</th>
                  <th>Suplidor / Proveedor en R.D.</th>
                  <th>Contacto Directo</th>
                  <th style="text-align:right;">Precio Ref.</th>
                </tr>
              </thead>
              <tbody>
                ${repuestos.map(r => `
                  <tr>
                    <td style="font-weight:700; color:#0f172a;">${r.nombre}</td>
                    <td style="font-family:monospace; color:#002b66; font-weight:700;">${r.numeroParte}</td>
                    <td>${r.suplidor}</td>
                    <td>
                      <a href="tel:${r.telefonoSuplidor}" style="color:#0284c7; text-decoration:none; font-weight:600;">📞 ${r.telefonoSuplidor}</a>
                    </td>
                    <td style="font-weight:800; color:#059669; text-align:right;">${r.precioAprox}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  // =========================================================================
  // IN-PAGE INFOTEP VIEW: SOLICITUD DE ACCESO A DOCUMENTACIÓN
  // =========================================================================
  function renderInPageDocRequest(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
            <button class="btn-infotep-submit" onclick="App.authorizeDocsDirectly('${equipo.id}')" style="margin:0; padding:6px 14px; font-size:0.75rem; background:#059669; border-color:#059669;">
              🔓 Acceso Supervisor F&J (Demo)
            </button>
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Solicitud de Acceso a Documentación</h2>
          <div class="infotep-page-subtitle">Equipo: <strong>${equipo.codigo}</strong> (${equipo.proyecto})</div>
        </div>
      </div>

      <div class="infotep-form-card">
        <div style="background:#e0f2fe; border-left:4px solid #002b66; padding:14px; border-radius:6px; margin-bottom:1.5rem; font-size:0.82rem; color:#002b66;">
          Para consultar matrículas DGII, certificaciones de carga, pólizas de seguro y bitácoras de este equipo, complete sus datos. <strong>F&J REPAIRS SRL</strong> validará su solicitud para concederle acceso como lector autorizado.
        </div>

        <form id="form-doc-request" onsubmit="App.handleDocRequestSubmit(event, '${equipo.id}')">
          
          <div class="infotep-section-header">
            <span class="section-icon">💳</span>
            <span class="section-title">DATOS DEL SOLICITANTE</span>
          </div>

          <div class="infotep-form-grid-2">
            <div>
              <label class="infotep-label">Nombre Completo <span class="required-star">*</span></label>
              <input type="text" name="solicitante" class="form-input" placeholder="Ej. Ing. Rafael Montes de Oca" required>
            </div>
            <div>
              <label class="infotep-label">Empresa / Contratista <span class="required-star">*</span></label>
              <input type="text" name="empresa" class="form-input" placeholder="Ej. ETED / Edesur / Consorcio Eléctrico" required>
            </div>
          </div>

          <div class="infotep-form-grid-3" style="margin-top:1.25rem;">
            <div>
              <label class="infotep-label">Cargo u Ocupación <span class="required-star">*</span></label>
              <input type="text" name="cargo" class="form-input" placeholder="Ej. Supervisor SST / Auditor" required>
            </div>
            <div>
              <label class="infotep-label">Correo Electrónico <span class="required-star">*</span></label>
              <input type="email" name="correo" class="form-input" placeholder="auditor@empresa.com.do" required>
            </div>
            <div>
              <label class="infotep-label">Teléfono Móvil <span class="required-star">*</span></label>
              <input type="tel" name="telefono" class="form-input" placeholder="809-555-0192" required>
            </div>
          </div>

          <div style="margin-top:1.25rem;">
            <label class="infotep-label">Justificación o Motivo de la Solicitud <span class="required-star">*</span></label>
            <textarea name="justificacion" class="form-textarea" rows="3" placeholder="Indique para qué proyecto o auditoría requiere consultar los certificados de esta grúa..." required></textarea>
          </div>

          <div class="infotep-form-actions-footer">
            <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
              Cancelar
            </button>
            <button type="submit" class="btn-infotep-submit">
              📨 Enviar Solicitud a F&J Repairs
            </button>
          </div>

        </form>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  // Action: Switch view between Mobile Phone View and Central Dashboard
  function switchView(mode) {
    state.viewMode = mode;
    renderApp();
  }

  function selectEquipo(id) {
    state.selectedEquipoId = id;
    renderApp();
  }

  function openEquipoMobilePreview(id) {
    state.selectedEquipoId = id;
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');
    if (isMobilePage) {
      state.viewMode = 'mobile';
      renderApp();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.open('mobile.html?equipo=' + id, '_blank');
    }
  }

  // =========================================================================
  // MODULO 1: DOCUMENTOS DEL EQUIPO (Jonathan Gil requirement)
  // =========================================================================
  function openModuleDocs(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const isAuthorized = state.authorizedDocs[equipo.id] || (state.currentUser && state.currentUser.role.includes('Gerente'));

    if (!isAuthorized) {
      state.currentFormView = { type: 'doc-request', equipoId: equipo.id };
    } else {
      state.currentFormView = { type: 'docs', equipoId: equipo.id };
    }
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Access Request Gate Form
  function renderDocRequestModal(equipo) {
    const modalContainer = document.getElementById('modal-mount-point');
    modalContainer.innerHTML = `
      <div class="app-modal-overlay active" id="doc-req-modal">
        <div class="modal-content-card">
          <div class="modal-header">
            <div>
              <h3>📂 Solicitud de Acceso a Documentación</h3>
              <p style="font-size:0.75rem; color:#64748b;">Equipo: <strong>${equipo.codigo}</strong> (${equipo.proyecto})</p>
            </div>
            <button class="btn-close-modal" onclick="App.closeActiveModal()">✕</button>
          </div>
          <div class="modal-body">
            <div style="background:#e0f2fe; border-left:4px solid #0284c7; padding:12px; border-radius:6px; margin-bottom:1.25rem; font-size:0.8rem; color:#075985;">
              Para consultar matrículas, certificaciones de carga, carnet de operador y bitácoras de este equipo, complete los datos para que <strong>F&J REPAIRS SRL</strong> autorice su acceso como lector.
            </div>

            <form id="form-doc-request" onsubmit="App.handleDocRequestSubmit(event, '${equipo.id}')">
              <div class="form-group">
                <label class="form-label">Nombre Completo <span class="required-star">*</span></label>
                <input type="text" name="solicitante" class="form-input" placeholder="Ej. Ing. Rafael Montes de Oca" required>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Empresa para la que trabaja <span class="required-star">*</span></label>
                  <input type="text" name="empresa" class="form-input" placeholder="Ej. ETED / Edesur / Consorcio" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Posición / Cargo <span class="required-star">*</span></label>
                  <input type="text" name="cargo" class="form-input" placeholder="Ej. Supervisor de Seguridad HSE" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Correo Electrónico <span class="required-star">*</span></label>
                  <input type="email" name="correo" class="form-input" placeholder="ejemplo@empresa.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Número de Teléfono <span class="required-star">*</span></label>
                  <input type="tel" name="telefono" class="form-input" placeholder="+1 (829) 000-0000" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Justificación de la Solicitud <span class="required-star">*</span></label>
                <textarea name="justificacion" class="form-textarea" placeholder="Indique el motivo (Ej. Inspección y aprobación de izaje de torres eléctricas en proyecto Azua)" required></textarea>
              </div>

              <div style="display:flex; gap:10px; margin-top:1.5rem;">
                <button type="submit" class="btn-primary-action">
                  <span>Enviar Solicitud de Autorización</span>
                </button>
              </div>
            </form>

            <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px dashed #cbd5e1; text-align:center;">
              <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">¿Es personal autorizado de F&J REPAIRS o supervisor con clave?</p>
              <button class="btn-secondary-action" onclick="App.authorizeDocsDirectly('${equipo.id}')" style="font-size:0.78rem; padding:6px 14px;">
                ⚡ Acceder con Autorización Inmediata (Demo / Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  async function handleDocRequestSubmit(e, equipoId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const payload = {
      equipoId,
      solicitante: formData.get('solicitante'),
      empresa: formData.get('empresa'),
      cargo: formData.get('cargo'),
      correo: formData.get('correo'),
      telefono: formData.get('telefono'),
      justificacion: formData.get('justificacion')
    };

    try {
      const res = await fetch('/api/document-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        state.solicitudesDocumentos.unshift(data.request);
        showToast('Solicitud enviada a gerencia. Le notificaremos por correo una vez aprobada.', 'success');
        // Give demo access for immediate viewing
        state.authorizedDocs[equipoId] = true;
        closeActiveModal();
        renderDocVaultModal(getSelectedEquipo());
      }
    } catch (err) {
      showToast('Error al enviar solicitud: ' + err.message, 'error');
    }
  }

  function authorizeDocsDirectly(equipoId) {
    state.authorizedDocs[equipoId] = true;
    showToast('Acceso temporal concedido como lector autorizado.', 'success');
    closeActiveModal();
    renderDocVaultModal(getSelectedEquipo());
  }

  // Document Vault View (Authorized)
  function renderDocVaultModal(equipo) {
    const docs = state.documentos.filter(d => d.equipoId === equipo.id || !d.equipoId);
    const repuestos = state.repuestosSuplidores.filter(r => r.equipoId === equipo.id || !r.equipoId);
    const modalContainer = document.getElementById('modal-mount-point');

    modalContainer.innerHTML = `
      <div class="app-modal-overlay active" id="doc-vault-modal">
        <div class="modal-content-card" style="max-width:800px;">
          <div class="modal-header">
            <div>
              <h3>📂 Carpeta de Documentos: ${equipo.codigo}</h3>
              <p style="font-size:0.75rem; color:#64748b;">Acceso Lector Autorizado | ${equipo.nombre}</p>
            </div>
            <button class="btn-close-modal" onclick="App.closeActiveModal()">✕</button>
          </div>
          <div class="modal-body">
            <!-- Tabs inside docs: Documentos vs Repuestos y Suplidores -->
            <div style="display:flex; gap:8px; border-bottom:2px solid #e2e8f0; margin-bottom:1.25rem;">
              <button id="doc-tab-btn-1" class="btn-secondary-action" onclick="App.switchDocTab(1)" style="border-radius:8px 8px 0 0; background:#0284c7; color:#fff; border-bottom:none;">
                📄 Documentos Oficiales (${docs.length})
              </button>
              <button id="doc-tab-btn-2" class="btn-secondary-action" onclick="App.switchDocTab(2)" style="border-radius:8px 8px 0 0;">
                ⚙️ Repuestos & Suplidores por Ítem (${repuestos.length})
              </button>
            </div>

            <!-- TAB 1: Documentos -->
            <div id="doc-tab-panel-1">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <p style="font-size:0.8rem; color:#475569;">Documentos adjuntos disponibles en formato digital:</p>
                <button class="btn-secondary-action" onclick="App.openUploadDocModal('${equipo.id}')" style="font-size:0.75rem; padding:6px 12px;">
                  + Adjuntar Documento
                </button>
              </div>

              <div class="doc-list-container">
                ${docs.map(doc => `
                  <div class="doc-item-row">
                    <div class="doc-info-col">
                      <div class="doc-type-icon">${doc.formato || 'PDF'}</div>
                      <div class="doc-details">
                        <h4>${doc.titulo}</h4>
                        <p><strong>Categoría:</strong> ${doc.categoria} | <strong>Vigencia:</strong> ${doc.vencimiento} | <strong>Tamaño:</strong> ${doc.tamano}</p>
                        <p style="font-size:0.7rem; color:#64748b; margin-top:2px;">${doc.descripcion}</p>
                      </div>
                    </div>
                    <div class="doc-actions-col">
                      <button class="btn-doc-view" onclick="App.previewDocumentFile('${doc.titulo}', '${doc.categoria}')">
                        👁️ Ver
                      </button>
                      <button class="btn-doc-view" style="background:#059669;" onclick="App.downloadSimulatedDoc('${doc.titulo}')">
                        ⬇️ Descargar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- TAB 2: Repuestos y Suplidores por Ítem (Jonathan Gil spec) -->
            <div id="doc-tab-panel-2" style="display:none;">
              <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:10px 12px; border-radius:6px; margin-bottom:1rem; font-size:0.78rem; color:#92400e;">
                Catálogo de números de partes críticas para <strong>${equipo.codigo}</strong> con casas comerciales y contactos directos en R.D.
              </div>

              <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                  <thead>
                    <tr style="background:#f1f5f9; text-align:left; color:#475569;">
                      <th style="padding:8px 10px; border-radius:6px 0 0 6px;">Pieza / Descripción</th>
                      <th style="padding:8px 10px;">Nro. Parte (OEM)</th>
                      <th style="padding:8px 10px;">Suplidor / Proveedor</th>
                      <th style="padding:8px 10px;">Teléfono</th>
                      <th style="padding:8px 10px; border-radius:0 6px 6px 0;">Precio Ref.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${repuestos.map(r => `
                      <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:10px; font-weight:700; color:#0f172a;">${r.nombre}</td>
                        <td style="padding:10px; font-family:monospace; color:#0284c7; font-weight:700;">${r.numeroParte}</td>
                        <td style="padding:10px;">${r.suplidor}</td>
                        <td style="padding:10px;">
                          <a href="tel:${r.telefonoSuplidor}" style="color:#0284c7; text-decoration:none; font-weight:600;">${r.telefonoSuplidor}</a>
                        </td>
                        <td style="padding:10px; font-weight:700; color:#059669;">${r.precioAprox}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  function switchDocTab(tabNumber) {
    const p1 = document.getElementById('doc-tab-panel-1');
    const p2 = document.getElementById('doc-tab-panel-2');
    const b1 = document.getElementById('doc-tab-btn-1');
    const b2 = document.getElementById('doc-tab-btn-2');

    if (tabNumber === 1) {
      p1.style.display = 'block';
      p2.style.display = 'none';
      b1.style.background = '#0284c7';
      b1.style.color = '#fff';
      b2.style.background = '#f1f5f9';
      b2.style.color = '#334155';
    } else {
      p1.style.display = 'none';
      p2.style.display = 'block';
      b2.style.background = '#0284c7';
      b2.style.color = '#fff';
      b1.style.background = '#f1f5f9';
      b1.style.color = '#334155';
    }
  }

  function openUploadDocModal(equipoId) {
    const eqId = equipoId || state.selectedEquipoId;
    state.currentFormView = { type: 'upload-doc', equipoId: eqId };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleUploadDocSubmit(e, equipoId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const payload = {
      equipoId,
      titulo: formData.get('titulo'),
      categoria: formData.get('categoria'),
      formato: formData.get('formato'),
      tamano: '2.1 MB',
      descripcion: formData.get('descripcion')
    };

    try {
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        state.documentos.push(data.documento);
        showToast('Documento guardado y adjuntado con éxito', 'success');
        closeActiveModal();
        renderDocVaultModal(getSelectedEquipo());
      }
    } catch (err) {
      showToast('Error al adjuntar: ' + err.message, 'error');
    }
  }

  function previewDocumentFile(titulo, categoria) {
    const modalContainer = document.getElementById('modal-mount-point');
    modalContainer.innerHTML = `
      <div class="app-modal-overlay active">
        <div class="modal-content-card" style="max-width:700px;">
          <div class="modal-header">
            <div>
              <h3>📄 ${titulo}</h3>
              <p style="font-size:0.75rem; color:#64748b;">${categoria} | Documento Oficial Digitalizado</p>
            </div>
            <button class="btn-close-modal" onclick="App.closeActiveModal()">✕</button>
          </div>
          <div class="modal-body" style="text-align:center; padding:2rem 1.5rem;">
            <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:12px; padding:2.5rem 1.5rem; margin-bottom:1.5rem;">
              <div style="font-size:3rem; margin-bottom:0.75rem;">📋</div>
              <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:6px;">${titulo}</h4>
              <p style="font-size:0.8rem; color:#64748b; max-width:450px; margin:0 auto 1.5rem;">
                Documento verificado con firma electrónica y sello de validez técnica emitido para F&J REPAIRS SRL.
              </p>
              <div style="display:inline-flex; gap:12px;">
                <button class="btn-primary-action" onclick="App.downloadSimulatedDoc('${titulo}')" style="width:auto; padding:8px 18px;">
                  ⬇️ Descargar Copia Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  function downloadSimulatedDoc(titulo) {
    showToast(`Descargando "${titulo}"...`, 'success');
  }

  // =========================================================================
  // MODULO 2: INSPECCIÓN PRE-USO DEL EQUIPO (Jonathan Gil requirement)
  // =========================================================================
  function openModuleInspection(equipoId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    state.currentFormView = { type: 'inspection', equipoId: equipo.id };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Operator Login Gate
  function renderOperatorLoginModal(equipo) {
    const modalContainer = document.getElementById('modal-mount-point');
    modalContainer.innerHTML = `
      <div class="app-modal-overlay active" id="operator-login-modal">
        <div class="modal-content-card" style="max-width:440px;">
          <div class="modal-header">
            <div>
              <h3>🔒 Acceso para Inspección</h3>
              <p style="font-size:0.75rem; color:#64748b;">Exclusivo para Operadores y Personal de Mantenimiento</p>
            </div>
            <button class="btn-close-modal" onclick="App.closeActiveModal()">✕</button>
          </div>
          <div class="modal-body">
            <form onsubmit="App.handleOperatorLoginSubmit(event, '${equipo.id}')">
              <div class="form-group">
                <label class="form-label">Usuario / Correo</label>
                <input type="text" id="login-username" class="form-input" value="operador.azua" required>
              </div>
              <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input type="password" id="login-password" class="form-input" value="123" required>
              </div>
              <button type="submit" class="btn-primary-action">
                Ingresar al Checklist de Inspección
              </button>
            </form>

            <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid #e2e8f0;">
              <p style="font-size:0.75rem; color:#64748b; margin-bottom:8px;">Usuarios de prueba preconfigurados:</p>
              <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
                <button onclick="document.getElementById('login-username').value='frankely.gil'; document.getElementById('login-password').value='123';" style="text-align:left; background:#f1f5f9; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">
                  👤 Frankely Gil (Gerente Técnico)
                </button>
                <button onclick="document.getElementById('login-username').value='operador.azua'; document.getElementById('login-password').value='123';" style="text-align:left; background:#f1f5f9; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">
                  👤 Carlos M. Santana (Operador Grúa Azua)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => enhanceAllSelects(), 20);
  }

  function handleOperatorLoginSubmit(e, equipoId) {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const found = state.users.find(user => user.username === u) || state.users[2];
    state.currentUser = found;
    renderHeader();
    showToast(`Bienvenido(a), ${found.name}`, 'success');
    closeActiveModal();
    renderInspectionChecklistModal(getSelectedEquipo());
  }

  // The Full Inspection Checklist Modal (with Horómetro, 43 questions, Photos, Signature)
  function renderInspectionChecklistModal(equipo) {
    state.uploadedPhotos = [];
    const modalContainer = document.getElementById('modal-mount-point');
    const sections = state.checklistSecciones || [];

    modalContainer.innerHTML = `
      <div class="app-modal-overlay active" id="inspection-modal">
        <div class="modal-content-card" style="max-width:850px;">
          <div class="modal-header">
            <div>
              <h3>📋 Inspección Pre-Uso de Equipo</h3>
              <p style="font-size:0.75rem; color:#64748b;">${equipo.codigo} | Inspector: <strong>${state.currentUser.name}</strong></p>
            </div>
            <button class="btn-close-modal" onclick="App.closeActiveModal()">✕</button>
          </div>
          <div class="modal-body">
            <form id="inspection-form" onsubmit="App.handleInspectionSubmit(event, '${equipo.id}')">
              
              <!-- STEP 1: HOROMETRO INPUT & AUTO COUNTDOWN (Jonathan Gil requirement) -->
              <div style="background:#f0f9ff; border:1.5px solid #0284c7; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                  <div>
                    <h4 style="font-size:1rem; font-weight:800; color:#0369a1;">⏱️ Registro de Horómetro de la Grúa</h4>
                    <p style="font-size:0.78rem; color:#075985;">Al ingresar la lectura actual, el sistema calcula y resta las horas restantes para el mantenimiento preventivo.</p>
                  </div>
                  <span style="font-size:0.75rem; background:#0284c7; color:#fff; padding:4px 8px; border-radius:6px; font-weight:700;">Obligatorio</span>
                </div>

                <div class="form-row">
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label">Lectura Actual del Horómetro (Horas) <span class="required-star">*</span></label>
                    <input type="number" id="insp-horometro-input" class="form-input" style="font-size:1.1rem; font-weight:800; color:#0f172a;" value="${equipo.horometroActual}" min="${equipo.horometroActual}" oninput="App.calculateRemainingHours(this.value, ${equipo.proximoMantenimientoHoras})" required>
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label">Cálculo Próximo Mantenimiento Preventivo</label>
                    <div id="insp-countdown-display" style="background:#ffffff; border:1.5px solid #cbd5e1; border-radius:var(--radius-md); padding:10px 14px; font-weight:700; color:#059669; font-size:0.95rem;">
                      Faltan ${equipo.proximoMantenimientoHoras - equipo.horometroActual} horas (Meta: ${equipo.proximoMantenimientoHoras} hrs)
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 2: CHECKLIST EVALUATION QUESTIONS -->
              <div style="margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                  <h4 style="font-size:1rem; font-weight:800; color:#0f172a;">Aspectos a Evaluar (Checklist Pre-Operacional)</h4>
                  <button type="button" class="btn-secondary-action" onclick="App.markAllChecklistOK()" style="font-size:0.75rem; padding:4px 10px;">
                    ✓ Marcar Todo Conforme
                  </button>
                </div>

                ${sections.map((sec, secIdx) => `
                  <div class="checklist-section-box">
                    <div class="checklist-section-title">
                      <span>${sec.icono || '📌'}</span>
                      <span>${sec.seccion}</span>
                    </div>

                    ${sec.items.map((it, itIdx) => `
                      <div class="checklist-item-card">
                        <div class="checklist-text">${it.pregunta}</div>
                        <div class="checklist-options">
                          <label class="checklist-option-label">
                            <input type="radio" class="chk-radio chk-radio-ok" name="${it.id}" value="Conforme" checked>
                            <span class="lbl-conforme">✓ Conforme</span>
                          </label>
                          <label class="checklist-option-label">
                            <input type="radio" class="chk-radio chk-radio-bad" name="${it.id}" value="No Conforme" onchange="App.handleNonConformingItem('${it.id}', '${it.pregunta}')">
                            <span class="lbl-noconforme">✕ Falla / Observación</span>
                          </label>
                          <label class="checklist-option-label">
                            <input type="radio" class="chk-radio" name="${it.id}" value="N/A">
                            <span class="lbl-na">N/A</span>
                          </label>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>

              <!-- STEP 3: PHOTO / VIDEO EVIDENCE (Jonathan Gil requirement) -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem;">
                <h4 style="font-size:1rem; font-weight:800; color:#0f172a; margin-bottom:6px;">📸 Evidencia Fotográfica y Hallazgos</h4>
                <p style="font-size:0.78rem; color:#64748b; margin-bottom:1rem;">Tome fotos o adjunte videos de las condiciones del equipo o hallazgos para mejorar.</p>

                <div class="media-upload-zone" onclick="document.getElementById('insp-photo-input').click()">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="#0284c7" style="margin-bottom:6px;"><path d="M12 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-1.8V6h-2.2l-.9-1H9.1l-.9 1H5v4.2c.6-.4 1.3-.7 2-.8V8h2.3l.9-1h3.6l.9 1H17v1.4c.7.1 1.4.4 2 .8zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/></svg>
                  <div style="font-weight:700; color:#0284c7; font-size:0.9rem;">Haga clic para tomar foto o adjuntar archivo</div>
                  <div style="font-size:0.75rem; color:#64748b;">Compatible con cámara de celular, fotos y video</div>
                  <input type="file" id="insp-photo-input" accept="image/*,video/*" capture="environment" style="display:none;" onchange="App.handlePhotoSelection(event)">
                </div>

                <div class="media-previews-grid" id="insp-media-preview-box">
                  <!-- Thumbnails injected here -->
                </div>
              </div>

              <!-- STEP 4: GENERAL OBSERVATIONS & DIGITAL SIGNATURE -->
              <div class="form-group">
                <label class="form-label">Observaciones Generales o Hallazgos Adicionales</label>
                <textarea id="insp-observaciones" class="form-textarea" placeholder="Describa cualquier condición detectada o notas para el equipo de mantenimiento..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Firma Digital del Inspector / Operador <span class="required-star">*</span></label>
                <div class="signature-box">
                  <canvas id="insp-sig-canvas" class="signature-canvas"></canvas>
                  <div class="sig-actions">
                    <button type="button" class="btn-clear-sig" onclick="App.clearSignature()">Limpiar Firma</button>
                  </div>
                </div>
                <div style="font-size:0.72rem; color:#64748b;">Firme con el dedo o puntero en la pantalla para certificar la veracidad de la inspección.</div>
              </div>

              <!-- SUBMIT BUTTON -->
              <button type="submit" id="btn-submit-inspection" class="btn-primary-action" onclick="App.handleInspectionSubmit(event, '${equipo.id}')" style="padding:14px; font-size:1rem; cursor:pointer;">
                <span>🚀 Completar Inspección y Enviar Reporte por Correo</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Initialize Signature Pad Canvas
    setTimeout(initSignaturePad, 150);
  }

  function calculateRemainingHours(currentVal, targetVal) {
    const curr = parseInt(currentVal, 10) || 0;
    const remaining = targetVal - curr;
    const displayEl = document.getElementById('insp-countdown-display');
    if (!displayEl) return;

    if (remaining <= 0) {
      displayEl.style.color = '#dc2626';
      displayEl.innerHTML = `⚠️ ¡MANTENIMIENTO VENCIDO! (${Math.abs(remaining)} hrs pasadas)`;
    } else if (remaining <= 50) {
      displayEl.style.color = '#d97706';
      displayEl.innerHTML = `⚠️ PRÓXIMO A MANTENIMIENTO: Restan ${remaining} hrs`;
    } else {
      displayEl.style.color = '#059669';
      displayEl.innerHTML = `✅ Faltan ${remaining} hrs para mantenimiento preventivo`;
    }
  }

  function markAllChecklistOK() {
    document.querySelectorAll('.chk-radio-ok').forEach(radio => {
      radio.checked = true;
    });
    showToast('Todos los ítems marcados como Conforme', 'info');
  }

  function handleNonConformingItem(itemId, itemPregunta) {
    showToast(`Observación registrada en: "${itemPregunta.substring(0, 35)}...". Por favor agregue fotos de evidencia.`, 'warning');
  }

  function handlePhotoSelection(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        state.uploadedPhotos.push({
          data: e.target.result,
          name: file.name
        });
        renderPhotoPreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoPreviews() {
    const container = document.getElementById('insp-media-preview-box');
    if (!container) return;

    container.innerHTML = state.uploadedPhotos.map((photo, idx) => `
      <div class="media-preview-thumb">
        <img src="${photo.data}" alt="Evidencia ${idx + 1}">
        <button type="button" class="media-delete-btn" onclick="App.deleteUploadedPhoto(${idx})">✕</button>
      </div>
    `).join('');
  }

  function deleteUploadedPhoto(idx) {
    state.uploadedPhotos.splice(idx, 1);
    renderPhotoPreviews();
  }

  function initSignaturePad() {
    const canvas = document.getElementById('insp-sig-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 120;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return [clientX - rect.left, clientY - rect.top];
    }

    function startDraw(e) {
      isDrawing = true;
      state.signaturePadHasContent = true;
      [lastX, lastY] = getCoords(e);
      if (e.cancelable) e.preventDefault();
    }

    function draw(e) {
      if (!isDrawing) return;
      const [x, y] = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      [lastX, lastY] = [x, y];
      if (e.cancelable) e.preventDefault();
    }

    function stopDraw() {
      isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
  }

  function clearSignature() {
    const canvas = document.getElementById('insp-sig-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.signaturePadHasContent = false;
  }

  async function handleInspectionSubmit(e, equipoId) {
    if (e && e.preventDefault) e.preventDefault();
    const horometroInput = document.getElementById('insp-horometro-input');
    const observacionesInput = document.getElementById('insp-observaciones');
    const eq = state.equipos.find(el => el.id === equipoId) || getSelectedEquipo();
    const horoVal = (horometroInput && horometroInput.value) ? parseInt(horometroInput.value, 10) : (eq ? eq.horometroActual : 4890);

    // Check non-conforming items
    const nonConforming = document.querySelectorAll('.chk-radio-bad:checked');
    const resultado = nonConforming.length > 0 ? 'Con Observaciones' : 'Aprobado Operativo';

    const payload = {
      equipoId,
      horometro: horoVal,
      resultado,
      observaciones: observacionesInput ? observacionesInput.value : '',
      usuario: state.currentUser ? state.currentUser.name : 'Carlos M. Santana (Operador)',
      rolUsuario: state.currentUser ? state.currentUser.role : 'Operador Certificado',
      hallazgos: Array.from(nonConforming).map(n => ({
        pregunta: n.name,
        estado: 'No Conforme'
      })),
      firmaDigital: state.signaturePadHasContent ? 'Firmado digitalmente' : 'Confirmado por usuario'
    };

    try {
      const res = await fetch('/api/inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          state.inspecciones.unshift(data.inspection);
          if (data.emailSent) state.correosEnviados.unshift(data.emailSent);

          // Update local unit
          const eqLocal = state.equipos.find(e => e.id === equipoId);
          if (eqLocal) {
            eqLocal.horometroActual = data.equipo.horometroActual;
            eqLocal.estado = data.equipo.estado;
          }

          showToast('Inspección guardada y correo enviado a Gerencia y Operaciones', 'success');
          closeActiveModal();
          renderInspectionSummaryModal(data.inspection, eqLocal);
          return;
        }
      }
      throw new Error(`Respuesta del servidor: ${res.status}`);
    } catch (err) {
      console.warn('Backend API /api/inspection failed, saving locally:', err);
      const localInsp = {
        id: `insp-${Date.now()}`,
        equipoId,
        equipoCodigo: eq ? eq.codigo : 'Unidad',
        fecha: new Date().toISOString().slice(0, 10),
        hora: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
        ...payload
      };
      state.inspecciones.unshift(localInsp);
      if (eq) {
        eq.horometroActual = horoVal;
      }
      try { localStorage.setItem('fj_repairs_data', JSON.stringify(state)); } catch(e){}
      showToast('Inspección guardada localmente (Modo Nginx Estático / Offline)', 'success');
      closeActiveModal();
      renderInspectionSummaryModal(localInsp, eq);
    }
  }

  // Inspection Summary View (In-Page INFOTEP Style, ready to print / share)
  function renderInspectionSummaryModal(insp, equipo) {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver a la lista">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${insp.equipoCodigo}</span>
            ${renderUnitStateBadge(insp.resultado)}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Inspección Pre-Uso Completada</h2>
          <div class="infotep-page-subtitle">Constancia digital certificada y notificada a Operaciones y Gerencia</div>
        </div>
      </div>

      <div class="infotep-form-card" style="max-width:760px; margin:0 auto; padding:2rem;">
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="font-size:3rem; margin-bottom:8px;">✅</div>
          <h3 style="font-size:1.3rem; font-weight:800; color:#002b66;">Registro Guardado Satisfactoriamente</h3>
          <p style="font-size:0.85rem; color:#64748b;">F&J REPAIRS SRL · Sistema de Gestión de Flota y Control Pre-Operacional</p>
        </div>

        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:1.25rem; background:#f8fafc; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
            <span style="font-size:0.82rem; color:#64748b;">Unidad Evaluada:</span>
            <strong style="color:#002b66;">${insp.equipoCodigo}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
            <span style="font-size:0.82rem; color:#64748b;">Fecha y Hora:</span>
            <strong style="color:#0f172a;">${insp.fecha} a las ${insp.hora}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
            <span style="font-size:0.82rem; color:#64748b;">Inspector Responsable:</span>
            <strong style="color:#0f172a;">${insp.usuario} (${insp.rolUsuario})</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
            <span style="font-size:0.82rem; color:#64748b;">Horómetro Registrado:</span>
            <strong style="color:#0284c7; font-size:1.05rem;">${insp.horometro.toLocaleString()} hrs</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
            <span style="font-size:0.82rem; color:#64748b;">Próximo Mantenimiento Preventivo:</span>
            <strong style="color:${insp.horasRestantesPM <= 50 ? '#d97706' : '#059669'};">Restan ${insp.horasRestantesPM} Horas</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="font-size:0.82rem; color:#64748b;">Estado de Operación:</span>
            <span style="padding:2px 10px; border-radius:12px; font-weight:700; font-size:0.8rem; background:#d1fae5; color:#065f46;">${insp.resultado}</span>
          </div>
        </div>

        <div style="background:#e0f2fe; border-left:4px solid #002b66; padding:12px 14px; border-radius:6px; font-size:0.82rem; color:#002b66; margin-bottom:1.5rem;">
          📧 Reporte digital emitido y enviado por correo a: <strong>operaciones@fjrepairs.com</strong> y gerencia técnica.
        </div>

        <div class="infotep-form-actions-footer" style="justify-content:center; gap:12px;">
          <button type="button" class="btn-infotep-cancel" onclick="window.print()">
            🖨️ Imprimir Constancia
          </button>
          <button type="button" class="btn-infotep-submit" onclick="App.returnToDashboard()">
            ← Volver a Flota
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MODULO 3: DOCUMENTACIÓN DE MANTENIMIENTO (Jonathan Gil requirement)
  // =========================================================================
  function openModuleMaintenance(equipoId, programaId) {
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    if (programaId) {
      state.selectedMaintenanceProgramId = programaId;
    }
    state.currentFormView = { 
      type: 'maintenance', 
      equipoId: equipo.id,
      programaId: state.selectedMaintenanceProgramId || 'pm-250'
    };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectMaintenanceProgram(progId, equipoId) {
    state.selectedMaintenanceProgramId = progId;
    const eqId = equipoId || state.selectedEquipoId;
    renderInPageMaintenanceForm(eqId, progId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMaintenanceWithProgram(programaId, equipoId) {
    state.selectedMaintenanceProgramId = programaId;
    openModuleMaintenance(equipoId, programaId);
  }

  function openMaintenanceProgramsView(equipoId) {
    closeActiveModal();
    const eq = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    state.currentFormView = { type: 'maintenance-programs', equipoId: eq.id };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function markAllProgramTasksOK() {
    const radios = document.querySelectorAll('.prog-chk-radio-ok');
    radios.forEach(r => { r.checked = true; });
    showToast('Todas las tareas del programa técnico marcadas como Conformes ✓', 'success');
  }

  function updateNextMaintenancePrediction(horoVal) {
    const progId = state.selectedMaintenanceProgramId || 'pm-250';
    const prog = MAINTENANCE_PROGRAMS.find(p => p.id === progId) || MAINTENANCE_PROGRAMS[0];
    const h = parseInt(horoVal, 10) || 0;
    const targetEl = document.getElementById('mant-next-horometro-display');
    if (targetEl) {
      if (prog.id === 'correctivo') {
        const eq = getSelectedEquipo();
        targetEl.value = `${eq ? eq.proximoMantenimientoHoras : h + 500} hrs (Preserva intervalo estándar)`;
      } else {
        targetEl.value = `${h + prog.intervaloHoras} hrs (+${prog.intervaloHoras} hrs según ${prog.codigo})`;
      }
    }
  }

  function selectMaintenanceType(tipo) {
    const lPrev = document.getElementById('lbl-mant-prev');
    const lCorr = document.getElementById('lbl-mant-corr');
    const boxPrev = document.getElementById('box-mant-prev');
    const boxCorr = document.getElementById('box-mant-corr');
    const rPrev = document.getElementById('radio-mant-prev');
    const rCorr = document.getElementById('radio-mant-corr');

    if (tipo === 'Preventivo') {
      if (lPrev) { lPrev.style.borderColor = '#10b981'; lPrev.style.background = '#d1fae5'; }
      if (lCorr) { lCorr.style.borderColor = '#cbd5e1'; lCorr.style.background = '#ffffff'; }
      if (boxPrev) { boxPrev.style.borderColor = '#10b981'; boxPrev.style.background = '#ecfdf5'; }
      if (boxCorr) { boxCorr.style.borderColor = '#cbd5e1'; boxCorr.style.background = '#ffffff'; }
      if (rPrev) rPrev.checked = true;
    } else {
      if (lCorr) { lCorr.style.borderColor = '#f59e0b'; lCorr.style.background = '#fef3c7'; }
      if (lPrev) { lPrev.style.borderColor = '#cbd5e1'; lPrev.style.background = '#ffffff'; }
      if (boxCorr) { boxCorr.style.borderColor = '#f59e0b'; boxCorr.style.background = '#fffbeb'; }
      if (boxPrev) { boxPrev.style.borderColor = '#cbd5e1'; boxPrev.style.background = '#ffffff'; }
      if (rCorr) rCorr.checked = true;
    }
  }

  function calculateTotalMaintenanceCost() {
    const mo = parseFloat(document.getElementById('costo-mano-obra').value) || 0;
    const rep = parseFloat(document.getElementById('costo-repuestos').value) || 0;
    const total = mo + rep;
    const display = document.getElementById('costo-total-display');
    if (display) {
      display.innerText = `RD$ ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
    }
  }

  function handleMaintenancePhotoSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('mant-photo-thumb').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  async function handleMaintenanceSubmit(e, equipoId) {
    if (e && e.preventDefault) e.preventDefault();
    const form = (e && e.target && e.target.tagName === 'FORM') ? e.target : (document.querySelector('#maintenance-form') || document.querySelector('#maintenance-modal form') || (e && e.target && e.target.closest('form')));
    const formData = form ? new FormData(form) : new FormData();

    const progId = formData.get('programaId') || state.selectedMaintenanceProgramId || 'pm-250';
    const prog = MAINTENANCE_PROGRAMS.find(p => p.id === progId) || MAINTENANCE_PROGRAMS[0];

    // Gather checklist tasks
    const checklistTareas = (prog.tareas || []).map(t => {
      const estadoVal = formData.get(`task_${t.id}`) || 'Conforme';
      return {
        id: t.id,
        subsistema: t.subsistema,
        tarea: t.tarea,
        estado: estadoVal
      };
    });

    const payload = {
      equipoId,
      tipo: formData.get('tipoMantenimiento') || (prog.id === 'correctivo' ? 'Correctivo' : 'Preventivo'),
      programaId: prog.id,
      programaNombre: prog.nombre,
      checklistTareas,
      fecha: formData.get('fecha') || new Date().toISOString().slice(0,16),
      horometro: formData.get('horometro') || 4890,
      ubicacion: formData.get('ubicacion') || 'In-situ en el proyecto',
      realizadoPor: formData.get('realizadoPor') || (state.currentUser ? state.currentUser.name : 'Técnico F&J Repairs'),
      descripcion: formData.get('descripcion') || prog.descripcionCorta,
      piezasUtilizadas: formData.get('piezasUtilizadas') || prog.piezasSugeridas,
      costoManoObra: formData.get('costoManoObra') || prog.costoManoObra,
      costoRepuestos: formData.get('costoRepuestos') || prog.costoRepuestos,
      suplidorRepuestos: formData.get('suplidorRepuestos') || prog.suplidorSugerido,
      facturaSuplidor: formData.get('facturaSuplidor') || 'B01-00049102',
      fotoReferencia: document.getElementById('mant-photo-thumb') ? document.getElementById('mant-photo-thumb').src : 'assets/repuesto_referencia.jpg'
    };

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          state.mantenimientos.unshift(data.maintenance);
          if (data.emailSent) state.correosEnviados.unshift(data.emailSent);

          const eq = state.equipos.find(e => e.id === equipoId);
          if (eq) {
            eq.horometroActual = data.equipo.horometroActual;
            eq.proximoMantenimientoHoras = data.equipo.proximoMantenimientoHoras;
            eq.estado = data.equipo.estado;
          }

          showToast(`Mantenimiento [${prog.codigo}] registrado con éxito y correo despachado`, 'success');
          returnToDashboard();
          return;
        }
      }
      throw new Error(`Respuesta del servidor: ${res.status}`);
    } catch (err) {
      console.warn('Backend API /api/maintenance failed, saving locally:', err);
      const manoObraNum = parseFloat(payload.costoManoObra) || 0;
      const repuestosNum = parseFloat(payload.costoRepuestos) || 0;
      const totalNum = manoObraNum + repuestosNum;
      const horoNum = parseInt(payload.horometro, 10) || 4890;
      const eq = state.equipos.find(e => e.id === equipoId);

      const localMaintenance = {
        id: `mant-${Date.now()}`,
        equipoId,
        equipoCodigo: eq ? eq.codigo : 'Unidad',
        ...payload,
        costoManoObra: manoObraNum,
        costoRepuestos: repuestosNum,
        costoTotal: totalNum,
        moneda: 'DOP'
      };

      state.mantenimientos.unshift(localMaintenance);
      if (eq) {
        eq.horometroActual = horoNum;
        if (payload.tipo === 'Preventivo') {
          eq.proximoMantenimientoHoras = horoNum + (prog.intervaloHoras || 500);
          eq.estado = 'Operativo';
        }
      }
      try { localStorage.setItem('fj_repairs_data', JSON.stringify(state)); } catch(e){}
      showToast(`Mantenimiento [${prog.codigo}] guardado localmente (Modo Nginx Estático / Offline)`, 'success');
      returnToDashboard();
    }
  }

  // =========================================================================
  // IN-PAGE FORMS & VIEWS (Replaces Floating Modals - Jonathan Gil & UX Req)
  // =========================================================================
  
  function openQRPlateModal(equipoId) {
    closeActiveModal();
    state.currentFormView = { type: 'qr-plate', equipoId: equipoId || state.selectedEquipoId };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPrintAllQRModal() {
    closeActiveModal();
    state.currentFormView = { type: 'print-all-qr' };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openQRScannerModal() {
    closeActiveModal();
    state.currentFormView = { type: 'qr-scanner' };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEmailsDrawer() {
    closeActiveModal();
    state.currentFormView = { type: 'emails' };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openUserProfileModal() {
    closeActiveModal();
    state.currentFormView = { type: 'user-profile' };
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 1. IN-PAGE USER PROFILE VIEW
  function renderInPageUserProfile() {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;
    const user = state.currentUser || state.users[0] || { name: 'Operador', role: 'Operador', email: 'operaciones@fjrepairs.com' };
    const users = state.users || [];

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver al panel">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">👤 ${user.role}</span>
            ${renderUnitStateBadge('Sesión Activa')}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Perfil de Usuario y Sesión Activa</h2>
          <div class="infotep-page-subtitle">Gestión de identidad, permisos operacionales y cambio de operador en este dispositivo</div>
        </div>
      </div>

      <div class="infotep-form-card" style="max-width:820px; margin:0 auto;">
        
        <!-- SECTION 1: USUARIO ACTUAL -->
        <div class="infotep-section-header">
          <span class="section-icon">👤</span>
          <span class="section-title">USUARIO ACTUALMENTE ACTIVO</span>
        </div>

        <div style="background:linear-gradient(135deg, #f0f9ff, #e0f2fe); border:1.5px solid #bae6fd; border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
          <div style="width:62px; height:62px; border-radius:50%; background:linear-gradient(135deg, #002b66, #0284c7); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.6rem; font-weight:800; box-shadow:0 4px 12px rgba(2,132,199,0.3); flex-shrink:0;">
            ${user.name.charAt(0)}
          </div>
          <div style="flex:1; min-width:200px;">
            <div style="font-weight:800; font-size:1.15rem; color:#002b66;">${user.name}</div>
            <div style="font-size:0.85rem; color:#0284c7; font-weight:700; margin-top:2px;">${user.role}</div>
            <div style="font-size:0.78rem; color:#64748b; margin-top:3px;">📧 ${user.email || 'operaciones@fjrepairs.com'}</div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="background:#dcfce7; color:#166534; font-weight:700; font-size:0.78rem; padding:6px 14px; border-radius:20px; border:1px solid #bbf7d0;">
              ✓ Sesión Iniciada
            </span>
          </div>
        </div>

        <!-- SECTION 2: SELECCIONAR OTRO USUARIO -->
        <div class="infotep-section-header">
          <span class="section-icon">🔄</span>
          <span class="section-title">CAMBIAR USUARIO EN ESTE DISPOSITIVO</span>
        </div>
        <p style="font-size:0.82rem; color:#64748b; margin-bottom:1rem;">
          Haga clic en cualquiera de los usuarios autorizados de la empresa para asumir su rol y permisos de forma inmediata:
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:12px; margin-bottom:1.75rem;">
          ${users.map(u => {
            const isCurrent = user.id === u.id;
            return `
              <div onclick="App.switchCurrentUser('${u.id}')" style="display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-radius:10px; border:1.5px solid ${isCurrent ? '#002b66' : '#e2e8f0'}; background:${isCurrent ? '#eff6ff' : '#ffffff'}; cursor:pointer; transition:all 0.2s ease; box-shadow:0 1px 3px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='#0284c7'; this.style.transform='translateY(-1px)';" onmouseout="this.style.borderColor='${isCurrent ? '#002b66' : '#e2e8f0'}'; this.style.transform='none';">
                <div style="display:flex; align-items:center; gap:12px; min-width:0;">
                  <div style="width:38px; height:38px; border-radius:50%; background:${isCurrent ? '#002b66' : '#f1f5f9'}; color:${isCurrent ? '#ffffff' : '#475569'}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem; flex-shrink:0;">
                    ${u.name.charAt(0)}
                  </div>
                  <div style="min-width:0;">
                    <div style="font-weight:700; font-size:0.88rem; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${u.name}</div>
                    <div style="font-size:0.75rem; color:#64748b;">${u.role}</div>
                  </div>
                </div>
                ${isCurrent 
                  ? `<span style="font-size:0.75rem; color:#002b66; font-weight:800; background:#dbeafe; padding:4px 10px; border-radius:12px; flex-shrink:0;">● Activo</span>`
                  : `<span style="font-size:0.75rem; color:#0284c7; font-weight:700; background:#f0f9ff; padding:4px 10px; border-radius:12px; border:1px solid #bae6fd; flex-shrink:0;">Seleccionar ›</span>`
                }
              </div>
            `;
          }).join('')}
        </div>

        <div class="infotep-form-actions-footer" style="justify-content:flex-end;">
          <button type="button" class="btn-infotep-submit" onclick="App.returnToDashboard()" style="width:auto; padding:8px 24px;">
            ← Volver al Panel
          </button>
        </div>

      </div>
    `;
  }

  // 2. IN-PAGE EMAILS DRAWER / VIEW
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFilteredEmails() {
    const emails = state.correosEnviados || [];
    const q = (state.emailSearchQuery || '').toLowerCase().trim();
    const cat = state.emailFilterCategory || 'all';

    return emails.filter(mail => {
      // Category match
      if (cat === 'inspeccion') {
        const isInsp = (mail.asunto || '').toUpperCase().includes('INSPECCIÓN') || (mail.remitente || '').includes('inspecciones');
        if (!isInsp) return false;
      } else if (cat === 'mantenimiento') {
        const isMant = (mail.asunto || '').toUpperCase().includes('MANTENIMIENTO') || (mail.remitente || '').includes('mantenimiento');
        if (!isMant) return false;
      } else if (cat === 'documentos') {
        const isDoc = (mail.asunto || '').toUpperCase().includes('DOCUMENT') || (mail.asunto || '').toUpperCase().includes('ACCESO') || (mail.asunto || '').toUpperCase().includes('SOLICITUD');
        if (!isDoc) return false;
      }

      // Query match
      if (!q) return true;

      const asunto = (mail.asunto || '').toLowerCase();
      const destinatario = (mail.destinatario || '').toLowerCase();
      const remitente = (mail.remitente || '').toLowerCase();
      const fecha = (mail.fecha || '').toLowerCase();
      const cuerpo = (mail.cuerpo || '').toLowerCase();

      return asunto.includes(q) || destinatario.includes(q) || remitente.includes(q) || fecha.includes(q) || cuerpo.includes(q);
    });
  }

  function renderEmailCardHTML(mail) {
    const isInspection = (mail.asunto || '').toUpperCase().includes('INSPECCIÓN') || (mail.remitente || '').includes('inspecciones');
    const isMaintenance = (mail.asunto || '').toUpperCase().includes('MANTENIMIENTO') || (mail.remitente || '').includes('mantenimiento');
    const isDoc = (mail.asunto || '').toUpperCase().includes('DOCUMENT') || (mail.asunto || '').toUpperCase().includes('ACCESO') || (mail.asunto || '').toUpperCase().includes('SOLICITUD');

    let badgeIcon = '📧';
    let badgeLabel = 'Transmisión General';
    let badgeBg = '#f1f5f9';
    let badgeColor = '#475569';
    let borderAccent = '#cbd5e1';

    if (isInspection) {
      badgeIcon = '📋';
      badgeLabel = 'Inspección Pre-Uso';
      badgeBg = '#e0f2fe';
      badgeColor = '#002b66';
      borderAccent = '#0284c7';
    } else if (isMaintenance) {
      badgeIcon = '🔧';
      badgeLabel = 'Mantenimiento';
      badgeBg = '#fef3c7';
      badgeColor = '#92400e';
      borderAccent = '#f59e0b';
    } else if (isDoc) {
      badgeIcon = '📑';
      badgeLabel = 'Documentación';
      badgeBg = '#ede9fe';
      badgeColor = '#5b21b6';
      borderAccent = '#8b5cf6';
    }

    return `
      <div class="email-history-card" style="border:1.5px solid #e2e8f0; border-left:4px solid ${borderAccent}; border-radius:10px; padding:16px; background:#f8fafc; transition:all 0.2s ease; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:12px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="background:${badgeBg}; color:${badgeColor}; font-weight:800; font-size:0.75rem; padding:3px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
              ${badgeIcon} ${badgeLabel}
            </span>
            <strong style="font-size:0.95rem; color:#002b66;">
              ${escapeHtml(mail.asunto)}
            </strong>
          </div>
          <span style="font-size:0.75rem; color:#64748b; background:#ffffff; border:1px solid #cbd5e1; padding:3px 8px; border-radius:12px; font-weight:600; white-space:nowrap;">
            🕒 ${escapeHtml(mail.fecha)}
          </span>
        </div>
        <div style="font-size:0.78rem; color:#0284c7; font-weight:600; margin-bottom:10px; background:#f0f9ff; padding:6px 10px; border-radius:6px; border:1px solid #e0f2fe;">
          <strong>Para:</strong> ${escapeHtml(mail.destinatario)} &nbsp;|&nbsp; <strong>De:</strong> ${escapeHtml(mail.remitente)}
        </div>
        <pre style="font-family:inherit; font-size:0.82rem; color:#334155; white-space:pre-wrap; background:#ffffff; padding:14px; border-radius:8px; border:1px solid #e2e8f0; line-height:1.5; margin:0; word-break:break-word;">${escapeHtml(mail.cuerpo)}</pre>
      </div>
    `;
  }

  function updateEmailsListUI() {
    const listContainer = document.getElementById('emails-list-container');
    const counterBadge = document.getElementById('email-search-counter');
    if (!listContainer) return;

    const allEmails = state.correosEnviados || [];
    const filtered = getFilteredEmails();

    if (counterBadge) {
      if (state.emailSearchQuery || (state.emailFilterCategory && state.emailFilterCategory !== 'all')) {
        counterBadge.textContent = `Mostrando ${filtered.length} de ${allEmails.length} registros`;
      } else {
        counterBadge.textContent = `${allEmails.length} registros`;
      }
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:3rem 1rem; color:#64748b; background:#ffffff; border:1.5px dashed #cbd5e1; border-radius:10px;">
          <div style="font-size:2.5rem; margin-bottom:8px;">🔍</div>
          <div style="font-weight:700; font-size:1rem; color:#334155;">No se encontraron correos que coincidan</div>
          <div style="font-size:0.82rem; margin-top:4px; color:#64748b;">
            ${state.emailSearchQuery ? `No hay resultados para "<strong>${escapeHtml(state.emailSearchQuery)}</strong>".` : 'No hay transmisiones registradas en esta categoría.'}
          </div>
          <button type="button" class="btn-infotep-submit" onclick="App.clearEmailSearch(); App.filterEmailCategory('all');" style="margin:1rem auto 0; padding:6px 18px; font-size:0.8rem;">
            Restablecer Búsqueda
          </button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${filtered.map(mail => renderEmailCardHTML(mail)).join('')}
      </div>
    `;
  }

  function handleEmailSearch(query) {
    state.emailSearchQuery = (query || '').trim();
    const btnClear = document.getElementById('btn-clear-email-search');
    if (btnClear) {
      btnClear.style.display = state.emailSearchQuery ? 'block' : 'none';
    }
    updateEmailsListUI();
  }

  function clearEmailSearch() {
    state.emailSearchQuery = '';
    const input = document.getElementById('input-search-emails');
    if (input) {
      input.value = '';
      input.focus();
    }
    const btnClear = document.getElementById('btn-clear-email-search');
    if (btnClear) {
      btnClear.style.display = 'none';
    }
    updateEmailsListUI();
  }

  function filterEmailCategory(cat) {
    state.emailFilterCategory = cat || 'all';
    renderInPageEmails();
  }

  function renderInPageEmails() {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;
    const emails = state.correosEnviados || [];
    const countInspeccion = emails.filter(m => (m.asunto || '').toUpperCase().includes('INSPECCIÓN') || (m.remitente || '').includes('inspecciones')).length;
    const countMantenimiento = emails.filter(m => (m.asunto || '').toUpperCase().includes('MANTENIMIENTO') || (m.remitente || '').includes('mantenimiento')).length;
    const countDocs = emails.filter(m => (m.asunto || '').toUpperCase().includes('DOCUMENT') || (m.asunto || '').toUpperCase().includes('ACCESO') || (m.asunto || '').toUpperCase().includes('SOLICITUD')).length;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver al panel">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">📬 ${emails.length} Notificaciones</span>
            ${renderUnitStateBadge('Servidor Activo')}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Bandeja de Notificaciones y Correos Emitidos</h2>
          <div class="infotep-page-subtitle">Copias digitales automáticas generadas y transmitidas a Operaciones, Gerencia y Supervisión</div>
        </div>
      </div>

      <div class="infotep-form-card" style="max-width:960px; margin:0 auto;">
        
        <div class="infotep-section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="section-icon">📬</span>
            <span class="section-title">HISTORIAL DE TRANSMISIONES DE CORREO</span>
          </div>
          <span id="email-search-counter" style="font-size:0.75rem; background:#e0f2fe; color:#002b66; font-weight:700; padding:4px 10px; border-radius:12px;">
            ${emails.length} registros
          </span>
        </div>

        <!-- SEARCH AND FILTER BAR -->
        <div class="email-search-toolbar" style="margin: 1rem 0 1.5rem; display:flex; flex-direction:column; gap:12px;">
          <div style="position:relative; width:100%;">
            <span style="position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:1.05rem; color:#64748b; pointer-events:none; display:flex; align-items:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input type="text" 
              id="input-search-emails" 
              class="form-input" 
              placeholder="Escribe para buscar por grúa (ej. F-07), asunto, destinatario, fecha o contenido..." 
              value="${state.emailSearchQuery || ''}" 
              oninput="App.handleEmailSearch(this.value)"
              style="width:100%; height:44px; padding-left:42px; padding-right:40px; font-size:0.88rem; border-radius:8px; border:1.5px solid #cbd5e1; box-sizing:border-box; background:#ffffff;">
            <button type="button" 
              id="btn-clear-email-search" 
              onclick="App.clearEmailSearch()" 
              title="Borrar búsqueda"
              style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#94a3b8; font-size:1.1rem; cursor:pointer; padding:6px; display:${state.emailSearchQuery ? 'block' : 'none'}; border-radius:50%; line-height:1;">
              ✕
            </button>
          </div>

          <!-- Quick Category Filters -->
          <div class="infotep-status-pills" style="margin-bottom:0; flex-wrap:wrap; gap:8px;">
            <button class="infotep-status-pill ${(!state.emailFilterCategory || state.emailFilterCategory === 'all') ? 'active' : ''}" onclick="App.filterEmailCategory('all')">
              📬 Todos (${emails.length})
            </button>
            <button class="infotep-status-pill ${state.emailFilterCategory === 'inspeccion' ? 'active' : ''}" onclick="App.filterEmailCategory('inspeccion')">
              📋 Inspecciones Pre-Uso (${countInspeccion})
            </button>
            <button class="infotep-status-pill ${state.emailFilterCategory === 'mantenimiento' ? 'active' : ''}" onclick="App.filterEmailCategory('mantenimiento')">
              🔧 Mantenimientos (${countMantenimiento})
            </button>
            <button class="infotep-status-pill ${state.emailFilterCategory === 'documentos' ? 'active' : ''}" onclick="App.filterEmailCategory('documentos')">
              📑 Documentación (${countDocs})
            </button>
          </div>
        </div>

        <div id="emails-list-container">
          <!-- Populated by updateEmailsListUI -->
        </div>

        <div class="infotep-form-actions-footer" style="justify-content:flex-end; margin-top:2rem;">
          <button type="button" class="btn-infotep-submit" onclick="App.returnToDashboard()" style="width:auto; padding:8px 24px;">
            ← Volver al Panel
          </button>
        </div>

      </div>
    `;

    updateEmailsListUI();
  }

  // 3. IN-PAGE QR SCANNER VIEW
  function renderInPageQRScanner() {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver al panel">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">📷 Escáner de Campo</span>
            ${renderUnitStateBadge('Cámara Lista')}
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Escáner de Código QR de Unidad</h2>
          <div class="infotep-page-subtitle">Alinee la cámara del dispositivo móvil con la placa física pegada en la cabina de la grúa</div>
        </div>
      </div>

      <div class="infotep-form-card" style="max-width:720px; margin:0 auto;">
        
        <!-- SECTION 1: VISOR DE CÁMARA QR -->
        <div class="infotep-section-header">
          <span class="section-icon">📷</span>
          <span class="section-title">VISOR ÓPTICO DE ESCANEO</span>
        </div>

        <div style="text-align:center; padding:1rem 0;">
          <div style="position:relative; width:min(100%, 280px); height:280px; margin:0 auto 1.5rem; border-radius:20px; overflow:hidden; border:3px solid #002b66; background:#0f172a; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(0,43,102,0.25);">
            <div style="position:absolute; inset:20px; border:2px dashed rgba(255,255,255,0.45); border-radius:14px;"></div>
            <!-- Simulated camera sweep animation -->
            <div style="position:absolute; left:0; right:0; height:3px; background:#38bdf8; box-shadow:0 0 16px #38bdf8; animation:qrScanSweep 2s ease-in-out infinite;"></div>
            <svg width="70" height="70" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm9.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM17.5 13H19v1.5h-1.5V13z"/>
            </svg>
          </div>

          <p style="font-size:0.85rem; color:#475569; font-weight:600; margin:0 0 1.5rem;">
            📱 Apunte la cámara hacia el código QR de la grúa para abrir de inmediato su bitácora técnica e inspección diaria.
          </p>
        </div>

        <!-- SECTION 2: SIMULACIÓN O SELECCIÓN DIRECTA -->
        <div class="infotep-section-header">
          <span class="section-icon">🏗️</span>
          <span class="section-title">O SELECCIONE DIRECTAMENTE LA UNIDAD DETECTADA</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:1.5rem;">
          ${state.equipos.map(eq => `
            <div onclick="App.simulateScanDetected('${eq.id}')" style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; border:1.5px solid #e2e8f0; border-radius:10px; background:#ffffff; cursor:pointer; transition:all 0.18s ease; box-shadow:0 1px 3px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='#002b66'; this.style.transform='translateX(3px)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.transform='none';">
              <div>
                <span style="font-weight:800; font-size:0.9rem; color:#002b66;">🏗️ ${eq.codigo}</span>
                <span style="font-size:0.82rem; color:#475569; margin-left:6px;">${eq.nombre}</span>
                <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">📍 ${eq.proyecto} · Horómetro: ${eq.horometroActual} hrs</div>
              </div>
              <button type="button" class="btn-infotep-submit" style="margin:0; padding:6px 14px; font-size:0.78rem;">
                Abrir Ficha ›
              </button>
            </div>
          `).join('')}
        </div>

        <div class="infotep-form-actions-footer" style="justify-content:flex-end;">
          <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
            ← Volver al Panel
          </button>
        </div>

      </div>
    `;
  }

  function simulateScanDetected(equipoId) {
    state.selectedEquipoId = equipoId;
    closeActiveModal();
    state.currentFormView = null;
    const isMobilePage = document.body.classList.contains('page-mobile') || 
                         window.location.pathname.includes('mobile') ||
                         window.location.pathname.includes('movil');
    if (isMobilePage) {
      state.viewMode = 'mobile';
      renderApp();
      showToast(`QR Detectado: ${equipoId}. Abriendo ficha de la unidad.`, 'success');
    } else {
      renderApp();
      showToast(`QR Detectado: ${equipoId}. Ficha seleccionada en el sistema.`, 'success');
    }
  }

  // 4. IN-PAGE QR PLATE VIEW
  function renderInPageQRPlate(equipoId) {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;
    const equipo = state.equipos.find(e => e.id === equipoId) || getSelectedEquipo();
    const qrUrl = window.location.origin + '/mobile.html?equipo=' + equipo.id;
    const qrSvg = QREngine.generateSVG(qrUrl, 220);

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver al panel">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <span class="badge-unit-code">🏗️ ${equipo.codigo}</span>
            ${renderUnitStateBadge(equipo.estado)}
            <button class="btn-infotep-submit" onclick="window.print()" style="margin:0; padding:6px 14px; font-size:0.78rem;">
              🖨️ Imprimir Placa
            </button>
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Placa de Identificación QR: ${equipo.codigo}</h2>
          <div class="infotep-page-subtitle">${equipo.nombre} · ${equipo.proyecto} (${equipo.ubicacion})</div>
        </div>
      </div>

      <div class="infotep-form-card" style="max-width:540px; margin:0 auto; text-align:center;">
        <div class="qr-plate-card" id="printable-qr-card" style="margin:0 auto 1.5rem;">
          <div class="qr-plate-header">
            <h2>${state.company ? state.company.name : 'F&J REPAIRS SRL'}</h2>
            <span>Torres Eléctricas & Montaje Pesado</span>
          </div>

          <div style="margin:12px 0;">
            <h3 style="font-size:1.45rem; font-weight:900; color:#0f172a;">${equipo.codigo}</h3>
            <p style="font-size:0.85rem; color:#475569; font-weight:700;">${equipo.nombre} (${equipo.capacidad})</p>
            <p style="font-size:0.75rem; color:#64748b; margin-top:2px;">Chasis: ${equipo.chasis} | Placa: ${equipo.placa}</p>
          </div>

          <div class="qr-svg-container" style="display:flex; justify-content:center; padding:10px 0;">
            ${qrSvg}
          </div>

          <div class="qr-plate-footer">
            ESCANEE CON LA CÁMARA PARA:<br>
            1. Documentos y Certificaciones<br>
            2. Inspección Pre-Uso Diaria<br>
            3. Registro de Mantenimiento
          </div>

          <div style="font-size:0.72rem; color:#64748b; margin-top:8px;">
            Encargado: ${state.company ? state.company.manager : 'Frankely Gil'} | Tel: ${state.company ? state.company.phone : '(809) 555-0199'}
          </div>
        </div>

        <div class="infotep-form-actions-footer" style="justify-content:center; gap:12px;">
          <button type="button" class="btn-infotep-cancel" onclick="App.returnToDashboard()">
            ← Volver a Flota
          </button>
          <button type="button" class="btn-infotep-submit" onclick="window.print()">
            🖨️ Imprimir Placa Laminada
          </button>
        </div>
      </div>
    `;
  }

  // 5. IN-PAGE PRINT ALL QR PLATES VIEW
  function renderInPagePrintAllQR() {
    const mainCanvas = document.getElementById('app-main-content');
    if (!mainCanvas) return;

    mainCanvas.innerHTML = `
      <div class="infotep-form-page-header">
        <div class="infotep-header-nav-row">
          <button class="btn-infotep-back" onclick="App.returnToDashboard()" title="Volver al panel">
            <span class="btn-back-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 19l-7-7 7-7"/>
              </svg>
            </span>
            <span class="btn-back-text">Volver</span>
          </button>
          <div class="infotep-header-badge">
            <button class="btn-infotep-submit" onclick="window.print()" style="margin:0; padding:6px 14px; font-size:0.78rem;">
              🖨️ Imprimir Todas las Placas
            </button>
          </div>
        </div>
        <div class="infotep-header-title-block">
          <h2 class="infotep-page-title">Placas de Identificación QR (Flota Completa)</h2>
          <div class="infotep-page-subtitle">Generación de códigos QR de alta densidad listos para imprimir en vinilo y pegar en cabina</div>
        </div>
      </div>

      <div class="infotep-form-card" style="padding:1.5rem;">
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:20px;">
          ${state.equipos.map(eq => {
            const url = window.location.origin + '/mobile.html?equipo=' + eq.id;
            const svg = QREngine.generateSVG(url, 180);
            return `
              <div class="qr-plate-card" style="margin:0;">
                <div class="qr-plate-header">
                  <h2>${state.company ? state.company.name : 'F&J REPAIRS SRL'}</h2>
                  <span>${eq.codigo}</span>
                </div>
                <div class="qr-svg-container">${svg}</div>
                <div class="qr-plate-footer">
                  ${eq.proyecto}<br>
                  Escanee para Inspección o Documentos
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="text-align:center; margin-top:2rem;">
          <button class="btn-infotep-submit" onclick="window.print()" style="max-width:300px; margin:0 auto; padding:10px 24px;">
            🖨️ Imprimir Todas las Placas
          </button>
        </div>
      </div>
    `;
  }

  function openPhotoPreviewModal(src) {
    const modalContainer = document.getElementById('modal-mount-point');
    modalContainer.innerHTML = `
      <div class="app-modal-overlay active">
        <div class="modal-content-card" style="max-width:600px; background:#000; text-align:center;">
          <div style="position:relative; padding:10px;">
            <button class="btn-close-modal" onclick="App.closeActiveModal()" style="position:absolute; top:10px; right:10px; background:#fff;">✕</button>
            <img src="${src}" alt="Foto" style="max-width:100%; max-height:80vh; border-radius:8px;">
          </div>
        </div>
      </div>
    `;
    setTimeout(() => enhanceAllSelects(), 20);
  }

  async function approveRequest(requestId) {
    try {
      const res = await fetch('/api/approve-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          estado: 'Aprobado',
          permisoOtorgado: 'Lectura y Descarga (72 hrs)'
        })
      });
      const data = await res.json();
      if (data.success) {
        const item = state.solicitudesDocumentos.find(s => s.id === requestId);
        if (item) {
          item.estado = 'Aprobado';
          item.permisoOtorgado = 'Lectura y Descarga (72 hrs)';
        }
        showToast('Solicitud aprobada y credencial de acceso enviada al correo del solicitante', 'success');
        renderApp();
      }
    } catch (err) {
      showToast('Error al aprobar: ' + err.message, 'error');
    }
  }

  function closeActiveModal() {
    const overlays = document.querySelectorAll('.app-modal-overlay');
    overlays.forEach(o => o.classList.remove('active'));
    setTimeout(() => {
      const mount = document.getElementById('modal-mount-point');
      if (mount) mount.innerHTML = '';
    }, 250);
  }

  function switchCurrentUser(userId) {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      state.currentUser = user;
      localStorage.setItem('fj_user_id', user.id);
      renderHeader();
      closeActiveModal();
      showToast(`Usuario cambiado a: ${user.name}`, 'success');
      renderApp();
    }
  }

  // =========================================================================
  // SEARCHABLE COMBOBOX ENHANCER
  // Converts standard <select> elements into custom searchable comboboxes
  // with live filter search, keyboard navigation, and native select sync
  // =========================================================================
  function enhanceAllSelects(container) {
    const root = container || document;
    const selects = root.querySelectorAll('select:not([data-combobox-enhanced])');

    selects.forEach(select => {
      // Mark as enhanced to prevent duplicate wrappers
      select.setAttribute('data-combobox-enhanced', 'true');
      select.style.display = 'none';

      // Wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'searchable-combobox-container';
      if (select.id) wrapper.id = `combobox-wrap-${select.id}`;
      if (select.classList.contains('quick-unit-selector')) {
        wrapper.classList.add('combobox-quick-unit');
      }

      const getSelectedOption = () => {
        return select.options[select.selectedIndex] || select.options[0] || { text: 'Seleccionar...', value: '' };
      };

      // Trigger button
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'combobox-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = `
        <span class="combobox-selected-text">${getSelectedOption().text}</span>
        <span class="combobox-arrow">▾</span>
      `;

      // Dropdown panel
      const dropdown = document.createElement('div');
      dropdown.className = 'combobox-dropdown';

      // Search input bar
      const searchWrap = document.createElement('div');
      searchWrap.className = 'combobox-search-wrap';
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'combobox-search-input';
      searchInput.placeholder = '🔍 Escribe para buscar...';
      searchInput.autocomplete = 'off';
      searchInput.spellcheck = false;
      searchWrap.appendChild(searchInput);

      // Options container
      const optionsList = document.createElement('div');
      optionsList.className = 'combobox-options-list';

      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'combobox-empty-message';
      emptyMsg.style.display = 'none';
      emptyMsg.textContent = 'No se encontraron resultados';

      const renderOptions = (filterText = '') => {
        optionsList.innerHTML = '';
        const filter = (filterText || '').trim().toLowerCase();
        let matchCount = 0;

        Array.from(select.options).forEach(opt => {
          const text = opt.text;
          const val = opt.value;
          const isMatch = !filter || text.toLowerCase().includes(filter) || val.toLowerCase().includes(filter);

          if (isMatch) {
            matchCount++;
            const optEl = document.createElement('div');
            optEl.className = 'combobox-option';
            if (select.value === val) {
              optEl.classList.add('selected');
            }
            optEl.dataset.value = val;
            optEl.innerHTML = `
              <span class="combobox-option-label">${text}</span>
              <span class="combobox-check-icon">✓</span>
            `;

            optEl.addEventListener('click', (e) => {
              e.stopPropagation();
              select.value = val;
              select.selectedIndex = opt.index;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              select.dispatchEvent(new Event('input', { bubbles: true }));
              if (typeof select.onchange === 'function') {
                try { select.onchange(); } catch (err) { console.error(err); }
              }

              // Update trigger text
              const selectedText = trigger.querySelector('.combobox-selected-text');
              if (selectedText) selectedText.textContent = text;

              closeDropdown();
            });

            optionsList.appendChild(optEl);
          }
        });

        if (matchCount === 0) {
          optionsList.appendChild(emptyMsg);
          emptyMsg.style.display = 'block';
        }
      };

      // Initial populate
      renderOptions('');

      // Filter input listener
      searchInput.addEventListener('input', () => {
        renderOptions(searchInput.value);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeDropdown();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const firstOption = optionsList.querySelector('.combobox-option');
          if (firstOption) {
            firstOption.click();
          }
        }
      });

      const openDropdown = () => {
        // Close all other open comboboxes
        document.querySelectorAll('.searchable-combobox-container.open').forEach(el => {
          if (el !== wrapper) {
            el.classList.remove('open');
            const trig = el.querySelector('.combobox-trigger');
            if (trig) trig.setAttribute('aria-expanded', 'false');
            const dd = el.querySelector('.combobox-dropdown');
            if (dd) dd.style.transform = '';
          }
        });

        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        searchInput.value = '';
        dropdown.style.transform = '';
        renderOptions('');

        // Ensure the dropdown never overflows left or right of the screen
        requestAnimationFrame(() => {
          const rect = dropdown.getBoundingClientRect();
          const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

          if (rect.left < 10) {
            // Shift right if clipped on the left
            const shiftX = 10 - rect.left;
            dropdown.style.transform = `translateX(${shiftX}px)`;
          } else if (rect.right > viewportWidth - 10) {
            // Shift left if clipped on the right
            const shiftX = (viewportWidth - 10) - rect.right;
            dropdown.style.transform = `translateX(${shiftX}px)`;
          }
        });

        setTimeout(() => searchInput.focus(), 60);
      };

      const closeDropdown = () => {
        wrapper.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.style.transform = '';
      };

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wrapper.classList.contains('open')) {
          closeDropdown();
        } else {
          openDropdown();
        }
      });

      // Synchronize trigger text if select value is modified externally
      select.addEventListener('change', () => {
        const selected = getSelectedOption();
        const selectedText = trigger.querySelector('.combobox-selected-text');
        if (selectedText) selectedText.textContent = selected.text;
      });

      // Assemble component
      wrapper.appendChild(trigger);
      dropdown.appendChild(searchWrap);
      dropdown.appendChild(optionsList);
      wrapper.appendChild(dropdown);

      // Insert adjacent to original select
      select.parentNode.insertBefore(wrapper, select.nextSibling);
    });
  }

  // Public API
  return {
    init: loadData,
    switchView,
    selectEquipo,
    openEquipoMobilePreview,
    openModuleDocs,
    openModuleInspection,
    openModuleMaintenance,
    openQRPlateModal,
    openPrintAllQRModal,
    openQRScannerModal,
    openEmailsDrawer,
    openPhotoPreviewModal,
    openUserProfileModal,
    switchCurrentUser,
    enhanceAllSelects,
    handleDocRequestSubmit,
    authorizeDocsDirectly,
    switchDocTab,
    openUploadDocModal,
    handleUploadDocSubmit,
    previewDocumentFile,
    downloadSimulatedDoc,
    handleOperatorLoginSubmit,
    calculateRemainingHours,
    markAllChecklistOK,
    handleNonConformingItem,
    handlePhotoSelection,
    deleteUploadedPhoto,
    clearSignature,
    handleInspectionSubmit,
    selectMaintenanceType,
    calculateTotalMaintenanceCost,
    handleMaintenancePhotoSelection,
    handleMaintenanceSubmit,
    selectMaintenanceProgram,
    openMaintenanceWithProgram,
    openMaintenanceProgramsView,
    markAllProgramTasksOK,
    updateNextMaintenancePrediction,
    renderInPageMaintenanceProgramsCatalog,
    simulateScanDetected,
    approveRequest,
    closeActiveModal,
    returnToDashboard,
    filterFleetStatus,
    handleFleetSearch,
    selectServiceLocation,
    renderInPageMaintenanceForm,
    renderInPageInspectionForm,
    renderInPageUploadDocForm,
    renderInPageDocsView,
    renderInPageDocRequest,
    renderInPageUserProfile,
    renderInPageEmails,
    renderInPageQRScanner,
    renderInPageQRPlate,
    renderInPagePrintAllQR,
    handleEmailSearch,
    clearEmailSearch,
    filterEmailCategory,
    updateEnterpriseNavState,
    renderApp
  };
})();

// Close comboboxes when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
  if (!e.target.closest('.searchable-combobox-container')) {
    document.querySelectorAll('.searchable-combobox-container.open').forEach(el => {
      el.classList.remove('open');
      const trig = el.querySelector('.combobox-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const dd = el.querySelector('.combobox-dropdown');
      if (dd) dd.style.transform = '';
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.searchable-combobox-container.open').forEach(el => {
      el.classList.remove('open');
      const trig = el.querySelector('.combobox-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const dd = el.querySelector('.combobox-dropdown');
      if (dd) dd.style.transform = '';
    });
  }
});

// CSS for QR scan animation
const styleScan = document.createElement('style');
styleScan.textContent = `
@keyframes qrScanSweep {
  0% { top: 15%; opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { top: 85%; opacity: 0; }
}
`;
document.head.appendChild(styleScan);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
