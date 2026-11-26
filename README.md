# F&J REPAIRS SRL — Sistema de Control de Flota, Mantenimiento e Inspección con QR

Sistema web y aplicación móvil de gestión para empresas de montaje de torres eléctricas y subestaciones de alta tensión.

## 🚀 Inicio Rápido

Para iniciar el servidor localmente en cualquier momento:

```powershell
node server.js
```

El sistema cuenta con **dos interfaces separadas e independientes**:

1. 🖥️ **Panel Central de Escritorio**:
   - URL: **http://localhost:3000** o **http://localhost:3000/desktop**
   - Diseñado para pantallas de computadora y administración central.
   - Panel de control de flota completa a pantalla completa, mapa de distribución nacional en R.D., KPIs de operatividad, tabla de aprobación de solicitudes de documentos, bitácora de costos e impresión de placas QR.

2. 📱 **App Móvil de Campo & Escaneo QR**:
   - URL: **http://localhost:3000/mobile** o **http://localhost:3000/mobile?equipo=F-07**
   - Diseñado específicamente para teléfonos móviles, tablets y lectura directa de códigos QR en las grúas.
   - 100% responsivo sin marcos simulados ni biseles artificiales.
   - Cuenta con contacto directo por WhatsApp y llamada a Frankely Gil y Jonathan Gil, cuenta regresiva de horómetro en tiempo real, los 3 módulos operativos (Documentos, Inspección Pre-Uso y Mantenimiento) y navegación inferior táctil.

---

## 📋 Módulos y Especificaciones Implementadas

### 1. Presentación y Cabecera de la Unidad (Al escanear QR)
- Logo oficial de **F&J REPAIRS SRL**.
- Ficha del Encargado / Gerente:
  - **Encargado Técnico**: Frankely de Jesús Gil López
  - **Gerencia General**: Jonathan Gil
  - Botones de llamada telefónica y enlace directo a WhatsApp.
- **Horómetro Inteligente**: Muestra el horómetro actual y resta automáticamente las horas restantes para el mantenimiento preventivo con alerta por colores (Verde / Ámbar / Rojo).

### 2. Módulo 1: Documentos del Equipo (Carpeta Digital & Acceso Controlado)
- **Formulario de Solicitud para Terceros**:
  - Nombre completo, Empresa, Correo electrónico, Cargo/Posición, Teléfono y Justificación de la solicitud.
  - Bandeja de autorización para que la empresa otorgue acceso como lector o descargue.
- **Contenido Técnico**:
  - Matrícula y permiso de circulación.
  - Certificación de izaje y prueba de carga técnica.
  - Certificación y carnet del operador.
  - Bitácoras históricas de mantenimiento.
  - Catálogo de repuestos, números de parte OEM y suplidores aprobados en R.D.
  - Adjuntar nuevos documentos en cualquier formato (PDF, DOCX, JPG, PNG).

### 3. Módulo 2: Inspección Pre-Uso del Equipo (Checklist Diario)
- Acceso con usuario y contraseña para operadores y técnicos (`operador.azua`, `frankely.gil`).
- Registro del horómetro con recálculo automático del mantenimiento preventivo.
- Evaluación de 43 puntos clave (Pluma, cables, gancho, motor, fluidos, estabilizadores, cabina LMI, seguridad).
- Captura de fotos y videos de condiciones o hallazgos.
- Firma digital del inspector en pantalla.
- Envío automático de constancia al correo (`operaciones@fjrepairs.com`) y almacenamiento en la ficha del equipo.

### 4. Módulo 3: Documentación de Mantenimiento
- Selector de tipo: **Preventivo** o **Correctivo**.
- Horómetro, fecha, descripción de trabajos y técnico responsable.
- Selector de ubicación: **In-situ en el proyecto** (ej. Subestación Azua) o **En el taller de la empresa**.
- Desglose de costos: Mano de Obra (RD$) + Repuestos (RD$) = Total.
- Suplidor donde se compraron los repuestos y número de factura / NCF.
- Foto de referencia del repuesto o pieza reemplazada.
- Envío automático a gerencia y carga inmediata a la **Bitácora 1** del equipo.

### 5. Generador de Códigos QR
- Generador de placas oficiales laminables con logo, datos del equipo y código QR de alta densidad.
- Escáner con cámara de celular o selección rápida por ficha.
