const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp'
};

// Helper to read DB
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return {};
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

// Helper to write DB
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Helper to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 20 * 1024 * 1024) { // 20MB limit
        reject(new Error('Payload Too Large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) return resolve({});
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  // API Endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // 1. GET /api/data
    if (req.method === 'GET' && pathname === '/api/data') {
      const db = readDb();
      res.writeHead(200);
      res.end(JSON.stringify(db));
      return;
    }

    // 2. POST /api/inspection
    if (req.method === 'POST' && pathname === '/api/inspection') {
      try {
        const body = await parseBody(req);
        const db = readDb();
        const { equipoId, horometro, resultado, observaciones, hallazgos, usuario, rolUsuario, firmaDigital } = body;

        const equipo = (db.equipos || []).find(e => e.id === equipoId);
        if (!equipo) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Equipo no encontrado' }));
          return;
        }

        const horometroNum = parseInt(horometro, 10) || equipo.horometroActual;
        equipo.horometroActual = horometroNum;

        // Horas restantes para proximo mantenimiento
        const horasRestantes = equipo.proximoMantenimientoHoras - horometroNum;
        if (horasRestantes <= 0) {
          equipo.estado = 'Mantenimiento Vencido';
        } else if (horasRestantes <= 50) {
          equipo.estado = 'Mantenimiento Próximo';
        } else {
          equipo.estado = 'Operativo';
        }

        const now = new Date();
        const fechaStr = now.toISOString().split('T')[0];
        const horaStr = now.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });

        const newInspection = {
          id: `insp-${Date.now()}`,
          equipoId,
          equipoCodigo: equipo.codigo,
          fecha: fechaStr,
          hora: horaStr,
          usuario: usuario || 'Operador',
          rolUsuario: rolUsuario || 'Operador de Grúa',
          horometro: horometroNum,
          horasRestantesPM: horasRestantes,
          resultado: resultado || 'Aprobado',
          observaciones: observaciones || '',
          hallazgos: hallazgos || [],
          firmaDigital: firmaDigital || null,
          correoEnviado: `${db.company.email}, ${db.company.supportEmail}`
        };

        db.inspecciones = db.inspecciones || [];
        db.inspecciones.unshift(newInspection);

        // Generar correo simulado automático a gerencia y operaciones
        const newEmail = {
          id: `email-${Date.now()}`,
          destinatario: `${db.company.email}, ${db.company.manager}`,
          asunto: `[INSPECCIÓN PRE-USO] ${equipo.codigo} - Horómetro: ${horometroNum}h - Estado: ${resultado}`,
          fecha: `${fechaStr} ${horaStr}`,
          remitente: 'inspecciones@fjrepairs.com',
          cuerpo: `Se ha registrado una nueva inspección pre-operacional:\n` +
            `• Equipo: ${equipo.codigo} (${equipo.nombre})\n` +
            `• Proyecto: ${equipo.proyecto}\n` +
            `• Inspector/Operador: ${usuario}\n` +
            `• Horómetro actual: ${horometroNum} hrs (Restan ${horasRestantes} hrs para Mantenimiento Preventivo de ${equipo.proximoMantenimientoHoras} hrs)\n` +
            `• Resultado: ${resultado}\n` +
            `• Observaciones: ${observaciones || 'Sin novedades'}\n` +
            `• Hallazgos reportados: ${(hallazgos || []).length} elementos.\n\n` +
            `La inspección ha sido archivada automáticamente en la ficha técnica del equipo.`
        };

        db.correosEnviados = db.correosEnviados || [];
        db.correosEnviados.unshift(newEmail);

        writeDb(db);

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          inspection: newInspection,
          equipo,
          emailSent: newEmail
        }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // 3. POST /api/maintenance
    if (req.method === 'POST' && pathname === '/api/maintenance') {
      try {
        const body = await parseBody(req);
        const db = readDb();
        const {
          equipoId,
          tipo,
          programaId,
          programaNombre,
          checklistTareas,
          fecha,
          horometro,
          descripcion,
          piezasUtilizadas,
          realizadoPor,
          ubicacion,
          costoManoObra,
          costoRepuestos,
          suplidorRepuestos,
          facturaSuplidor,
          fotoReferencia
        } = body;

        const equipo = (db.equipos || []).find(e => e.id === equipoId);
        if (!equipo) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Equipo no encontrado' }));
          return;
        }

        const manoObraNum = parseFloat(costoManoObra) || 0;
        const repuestosNum = parseFloat(costoRepuestos) || 0;
        const totalNum = manoObraNum + repuestosNum;
        const horometroNum = parseInt(horometro, 10) || equipo.horometroActual;

        // Calcular intervalo según el programa seleccionado
        let incrementoIntervalo = equipo.intervaloMantenimiento || 500;
        if (programaId === 'pm-250') incrementoIntervalo = 250;
        else if (programaId === 'pm-500') incrementoIntervalo = 500;
        else if (programaId === 'pm-1000') incrementoIntervalo = 1000;
        else if (programaId === 'pm-2000') incrementoIntervalo = 2000;

        const isPreventivo = tipo === 'Preventivo' || (programaId && programaId.startsWith('pm-'));

        // Si es preventivo o de programa, actualizar el próximo umbral
        if (isPreventivo) {
          equipo.ultimoMantenimientoHoras = horometroNum;
          equipo.proximoMantenimientoHoras = horometroNum + incrementoIntervalo;
          equipo.estado = 'Operativo';
        }

        const newMaintenance = {
          id: `mant-${Date.now()}`,
          equipoId,
          equipoCodigo: equipo.codigo,
          tipo: tipo || 'Preventivo',
          programaId: programaId || (tipo === 'Correctivo' ? 'correctivo' : 'pm-250'),
          programaNombre: programaNombre || (tipo === 'Correctivo' ? 'Mantenimiento Correctivo / Avería' : 'Programa 250 Horas (PM-1 Básico)'),
          checklistTareas: checklistTareas || [],
          fecha: fecha || new Date().toISOString().replace('T', ' ').substring(0, 16),
          horometro: horometroNum,
          descripcion: descripcion || '',
          piezasUtilizadas: piezasUtilizadas || '',
          realizadoPor: realizadoPor || 'Taller F&J Repairs',
          ubicacion: ubicacion || 'In-situ en el proyecto',
          costoManoObra: manoObraNum,
          costoRepuestos: repuestosNum,
          costoTotal: totalNum,
          moneda: 'DOP',
          suplidorRepuestos: suplidorRepuestos || 'Suplidor Autorizado',
          facturaSuplidor: facturaSuplidor || 'N/A',
          fotoReferencia: fotoReferencia || 'assets/repuesto_referencia.jpg'
        };

        db.mantenimientos = db.mantenimientos || [];
        db.mantenimientos.unshift(newMaintenance);

        // Generar correo automático a gerencia y contabilidad
        const tituloCorreo = `[REGISTRO MANTENIMIENTO: ${newMaintenance.programaNombre.toUpperCase()}] ${equipo.codigo} - Total: RD$ ${totalNum.toLocaleString()}`;
        const tareasEjecutadas = (checklistTareas || []).filter(t => t.estado === 'OK' || t.estado === 'Conforme').length;
        const totalTareas = (checklistTareas || []).length;

        const newEmail = {
          id: `email-${Date.now()}`,
          destinatario: `${db.company.email}, ${db.company.executive}`,
          asunto: tituloCorreo,
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          remitente: 'taller@fjrepairs.com',
          cuerpo: `Se ha registrado una nueva orden de mantenimiento en el sistema:\n` +
            `• Programa: ${newMaintenance.programaNombre}\n` +
            `• Tipo: Mantenimiento ${tipo || 'Preventivo'}\n` +
            `• Equipo: ${equipo.codigo} (${equipo.nombre})\n` +
            `• Ubicación de trabajo: ${ubicacion}\n` +
            `• Responsable: ${realizadoPor}\n` +
            `• Horómetro actual: ${horometroNum} hrs (Próximo servicio programado a las ${equipo.proximoMantenimientoHoras} hrs)\n` +
            `• Tareas completadas: ${totalTareas > 0 ? `${tareasEjecutadas} de ${totalTareas} tareas técnicas conformes` : 'Protocolo estándar verificado'}\n` +
            `• Costo Mano de Obra: RD$ ${manoObraNum.toLocaleString()}\n` +
            `• Costo Repuestos: RD$ ${repuestosNum.toLocaleString()}\n` +
            `• Costo Total: RD$ ${totalNum.toLocaleString()}\n` +
            `• Suplidor: ${suplidorRepuestos} (Factura/NCF: ${facturaSuplidor})\n` +
            `• Piezas/Repuestos: ${piezasUtilizadas}\n` +
            `• Descripción del trabajo: ${descripcion}\n\n` +
            `Este registro ha sido anexado de forma permanente a la Bitácora 1 de la unidad.`
        };

        db.correosEnviados = db.correosEnviados || [];
        db.correosEnviados.unshift(newEmail);

        writeDb(db);

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          maintenance: newMaintenance,
          equipo,
          emailSent: newEmail
        }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // 4. POST /api/document-request
    if (req.method === 'POST' && pathname === '/api/document-request') {
      try {
        const body = await parseBody(req);
        const db = readDb();
        const { equipoId, solicitante, empresa, correo, cargo, telefono, justificacion } = body;

        const equipo = (db.equipos || []).find(e => e.id === equipoId);
        const newRequest = {
          id: `sol-${Date.now()}`,
          equipoId: equipoId || 'F-07',
          equipoNombre: equipo ? equipo.codigo : 'Unidad',
          solicitante: solicitante || 'Solicitante Externo',
          empresa: empresa || 'Empresa Tercera',
          correo: correo || '',
          cargo: cargo || 'Inspector / Supervisor',
          telefono: telefono || '',
          justificacion: justificacion || 'Auditoría de izaje',
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          estado: 'Pendiente',
          permisoOtorgado: null
        };

        db.solicitudesDocumentos = db.solicitudesDocumentos || [];
        db.solicitudesDocumentos.unshift(newRequest);

        // Correo simulado de notificación a la gerencia
        const newEmail = {
          id: `email-${Date.now()}`,
          destinatario: db.company.email,
          asunto: `[SOLICITUD ACCESO DOCUMENTOS] ${solicitante} (${empresa}) para ${equipo ? equipo.codigo : equipoId}`,
          fecha: newRequest.fecha,
          remitente: 'seguridad-portal@fjrepairs.com',
          cuerpo: `Se ha recibido una nueva solicitud de acceso a documentos de equipo:\n` +
            `• Solicitante: ${solicitante}\n` +
            `• Empresa: ${empresa}\n` +
            `• Cargo: ${cargo}\n` +
            `• Teléfono: ${telefono}\n` +
            `• Correo: ${correo}\n` +
            `• Unidad solicitada: ${equipo ? equipo.codigo : equipoId}\n` +
            `• Justificación: ${justificacion}\n\n` +
            `Ingrese al panel de F&J REPAIRS para autorizar o denegar el acceso lector/descarga.`
        };

        db.correosEnviados = db.correosEnviados || [];
        db.correosEnviados.unshift(newEmail);

        writeDb(db);

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          request: newRequest
        }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // 5. POST /api/approve-request
    if (req.method === 'POST' && pathname === '/api/approve-request') {
      try {
        const body = await parseBody(req);
        const db = readDb();
        const { requestId, estado, permisoOtorgado } = body;

        const reqItem = (db.solicitudesDocumentos || []).find(r => r.id === requestId);
        if (!reqItem) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Solicitud no encontrada' }));
          return;
        }

        reqItem.estado = estado || 'Aprobado';
        reqItem.permisoOtorgado = permisoOtorgado || 'Lectura y Descarga (24 Horas)';

        // Correo confirmación al solicitante
        const confirmEmail = {
          id: `email-${Date.now()}`,
          destinatario: reqItem.correo,
          asunto: `[ACCESO AUTORIZADO] Documentación de Unidad ${reqItem.equipoNombre} - F&J REPAIRS SRL`,
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          remitente: db.company.email,
          cuerpo: `Estimado(a) ${reqItem.solicitante},\n\n` +
            `F&J REPAIRS SRL ha autorizado su solicitud de acceso a la documentación técnica del equipo ${reqItem.equipoNombre}.\n` +
            `Nivel de permiso: ${reqItem.permisoOtorgado}\n` +
            `Puede consultar y descargar matrículas, certificaciones de carga, carnet de operador y bitácoras vigentes.\n\n` +
            `Atentamente,\n` +
            `${db.company.manager} - ${db.company.managerRole}\n` +
            `${db.company.name}`
        };

        db.correosEnviados = db.correosEnviados || [];
        db.correosEnviados.unshift(confirmEmail);

        writeDb(db);

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, request: reqItem }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // 6. POST /api/upload-document
    if (req.method === 'POST' && pathname === '/api/upload-document') {
      try {
        const body = await parseBody(req);
        const db = readDb();
        const { equipoId, categoria, titulo, formato, tamano, descripcion, archivoBase64 } = body;

        const newDoc = {
          id: `doc-${Date.now()}`,
          equipoId: equipoId || 'F-07',
          categoria: categoria || 'General',
          titulo: titulo || 'Documento Adjunto',
          formato: formato || 'PDF',
          tamano: tamano || '1.5 MB',
          fecha: new Date().toISOString().split('T')[0],
          vencimiento: 'Vigente',
          descripcion: descripcion || '',
          archivoData: archivoBase64 || null
        };

        db.documentos = db.documentos || [];
        db.documentos.push(newDoc);
        writeDb(db);

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, documento: newDoc }));
        return;
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // 7. GET /api/emails
    if (req.method === 'GET' && pathname === '/api/emails') {
      const db = readDb();
      res.writeHead(200);
      res.end(JSON.stringify(db.correosEnviados || []));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
    return;
  }

  // Static File Serving & Clean Routing
  let cleanPath = pathname.replace(/\\/g, '/').toLowerCase();
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  let safePath;
  if (cleanPath === '' || cleanPath === '/' || cleanPath === '/desktop' || cleanPath === '/desktop.html' || cleanPath === '/index.html') {
    safePath = 'index.html';
  } else if (cleanPath === '/mobile' || cleanPath === '/mobil' || cleanPath === '/movil' || 
             cleanPath === '/mobile.html' || cleanPath === '/mobil.html' || cleanPath === '/movil.html') {
    safePath = 'mobile.html';
  } else {
    safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  }

  let filePath = path.join(__dirname, safePath);

  // Fallback: If path does not exist, check if appending .html matches a file
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Archivo no encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  F&J REPAIRS SRL - SISTEMA DE CONTROL DE FLOTA   `);
  console.log(`  Servidor iniciado en: http://localhost:${PORT}   `);
  console.log(`===================================================`);
});
