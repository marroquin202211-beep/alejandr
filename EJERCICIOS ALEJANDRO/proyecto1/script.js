// =============================================
//  SISTEMA DE REGISTRO ESTUDIANTIL — script.js
// =============================================

// Array en memoria que almacena todos los registros
let estudiantes = [];

// Índice del estudiante que se está editando (-1 = modo registro nuevo)
let indiceEditando = -1;

// ── Referencias al DOM ──────────────────────
const form          = document.getElementById('studentForm');
const tbody         = document.querySelector('#studentTable tbody');
const downloadBtn   = document.getElementById('downloadBtn');
const loadBtn       = document.getElementById('loadBtn');
const fileInput     = document.getElementById('fileInput');
const editBanner    = document.getElementById('editBanner');
const editCodigo    = document.getElementById('editCodigo');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// ── 1. REGISTRAR O GUARDAR EDICIÓN ───────────
form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Capturar datos
    const nombre   = document.getElementById('nombre').value.trim();
    const nie      = document.getElementById('nie').value.trim();
    const edad     = document.getElementById('edad').value.trim();
    const grado    = document.getElementById('grado').value;
    const seccion  = document.getElementById('seccion').value;
    const correo   = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();

    // Validar que ningún campo esté vacío
    if (!nombre || !nie || !edad || !grado || !seccion || !correo || !telefono) {
        mostrarToast('⚠️ Por favor completá todos los campos.', true);
        return;
    }

    if (indiceEditando === -1) {
        // ── MODO NUEVO REGISTRO ──
        const codigo = String(estudiantes.length + 1).padStart(3, '0');
        const registro = { codigo, nombre, nie, edad, grado, seccion, correo, telefono };
        estudiantes.push(registro);
        agregarFila(registro, estudiantes.length - 1);
        mostrarToast(`✅ Estudiante ${nombre} registrado correctamente.`);
    } else {
        // ── MODO EDICIÓN: actualizar registro existente ──
        const codigo = estudiantes[indiceEditando].codigo; // conservar el código original
        estudiantes[indiceEditando] = { codigo, nombre, nie, edad, grado, seccion, correo, telefono };
        actualizarFila(indiceEditando);
        mostrarToast(`✏️ Registro de ${nombre} actualizado correctamente.`);
        salirModoEdicion();
    }

    form.reset();
});

// ── 2. AGREGAR FILA A LA TABLA ───────────────
function agregarFila(reg, idx) {
    // Quitar el estado vacío si existe
    const emptyRow = tbody.querySelector('.empty-row');
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement('tr');
    tr.setAttribute('data-idx', idx);
    tr.innerHTML = construirCeldas(reg, idx);
    tbody.appendChild(tr);
}

// ── 3. ACTUALIZAR FILA EXISTENTE ─────────────
function actualizarFila(idx) {
    const tr = tbody.querySelector(`tr[data-idx="${idx}"]`);
    if (tr) {
        tr.innerHTML = construirCeldas(estudiantes[idx], idx);
        // Efecto visual de "flash" para confirmar el cambio
        tr.classList.add('row-updated');
        setTimeout(() => tr.classList.remove('row-updated'), 1200);
    }
}

// ── 4. CONSTRUIR HTML DE CELDAS ──────────────
function construirCeldas(reg, idx) {
    return `
        <td>${reg.codigo}</td>
        <td>${reg.nombre}</td>
        <td>${reg.nie}</td>
        <td>${reg.edad}</td>
        <td>${reg.grado}</td>
        <td>${reg.seccion}</td>
        <td>${reg.correo}</td>
        <td>${reg.telefono}</td>
        <td>
            <button class="btn-edit" onclick="editarEstudiante(${idx})" title="Editar">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar
            </button>
        </td>
    `;
}

// ── 5. ENTRAR EN MODO EDICIÓN ────────────────
function editarEstudiante(idx) {
    const reg = estudiantes[idx];
    indiceEditando = idx;

    // Llenar el formulario con los datos actuales
    document.getElementById('nombre').value   = reg.nombre;
    document.getElementById('nie').value      = reg.nie;
    document.getElementById('edad').value     = reg.edad;
    document.getElementById('grado').value    = reg.grado;
    document.getElementById('seccion').value  = reg.seccion;
    document.getElementById('correo').value   = reg.correo;
    document.getElementById('telefono').value = reg.telefono;

    // Cambiar la UI al modo edición
    editCodigo.textContent     = reg.codigo;
    editBanner.style.display   = 'flex';
    submitBtnText.textContent  = 'GUARDAR CAMBIOS';
    cancelEditBtn.style.display = 'inline-flex';

    // Marcar la fila que se está editando
    tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('row-editing'));
    const trActual = tbody.querySelector(`tr[data-idx="${idx}"]`);
    if (trActual) trActual.classList.add('row-editing');

    // Scroll suave al formulario
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── 6. CANCELAR EDICIÓN ──────────────────────
cancelEditBtn.addEventListener('click', function () {
    salirModoEdicion();
    form.reset();
    mostrarToast('❌ Edición cancelada.');
});

function salirModoEdicion() {
    indiceEditando = -1;
    editBanner.style.display    = 'none';
    submitBtnText.textContent   = 'REGISTRAR ESTUDIANTE';
    cancelEditBtn.style.display = 'none';
    tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('row-editing'));
}

// ── 7. DESCARGAR ESTUDIANTES.TXT ─────────────
downloadBtn.addEventListener('click', function () {
    if (estudiantes.length === 0) {
        mostrarToast('⚠️ No hay estudiantes registrados aún.', true);
        return;
    }

    const contenido = estudiantes
        .map(r => `${r.codigo}|${r.nombre}|${r.nie}|${r.edad}|${r.grado}|${r.seccion}|${r.correo}|${r.telefono}`)
        .join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'estudiantes.txt';
    a.click();
    URL.revokeObjectURL(url);

    mostrarToast('📥 Archivo estudiantes.txt descargado.');
});

// ── 8. CARGAR ARCHIVO TXT ────────────────────
loadBtn.addEventListener('click', function () {
    fileInput.click();
});

fileInput.addEventListener('change', function () {
    const archivo = fileInput.files[0];
    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const texto = e.target.result.trim();
        if (!texto) {
            mostrarToast('⚠️ El archivo está vacío.', true);
            return;
        }

        estudiantes = [];
        tbody.innerHTML = '';
        salirModoEdicion();
        form.reset();

        const lineas = texto.split('\n');
        let cargados = 0;

        lineas.forEach(linea => {
            linea = linea.trim();
            if (!linea) return;

            const campos = linea.split('|');
            if (campos.length < 8) return;

            const registro = {
                codigo  : campos[0],
                nombre  : campos[1],
                nie     : campos[2],
                edad    : campos[3],
                grado   : campos[4],
                seccion : campos[5],
                correo  : campos[6],
                telefono: campos[7]
            };

            estudiantes.push(registro);
            agregarFila(registro, estudiantes.length - 1);
            cargados++;
        });

        if (cargados === 0) {
            mostrarToast('⚠️ No se encontraron registros válidos en el archivo.', true);
            mostrarEstadoVacio();
        } else {
            mostrarToast(`📂 ${cargados} estudiante(s) cargado(s) desde el archivo.`);
        }
    };

    reader.onerror = function () {
        mostrarToast('❌ Error al leer el archivo.', true);
    };

    reader.readAsText(archivo, 'UTF-8');
    fileInput.value = '';
});

// ── 9. TOAST (notificación temporal) ─────────
function mostrarToast(mensaje, esError = false) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.classList.add('toast');
        document.body.appendChild(toast);
    }

    toast.textContent = mensaje;
    toast.classList.toggle('error', esError);
    toast.classList.add('show');

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ── 10. ESTADO VACÍO INICIAL ──────────────────
function mostrarEstadoVacio() {
    const tr = document.createElement('tr');
    tr.classList.add('empty-row');
    tr.innerHTML = `
        <td colspan="9">
            <div class="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>Aún no hay estudiantes registrados.<br>Completá el formulario para comenzar.</p>
            </div>
        </td>
    `;
    tbody.appendChild(tr);
}

mostrarEstadoVacio();
