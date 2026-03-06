// Variables globales
let datosInscripcion = {};
const precios = { Solo: 3, Dúo: 10, Escuadra: 20 };

// Elementos del DOM
const jugadoresContainer = document.getElementById('jugadores-container');
const selectModalidad = document.getElementById('modalidad');
const precioMostrar = document.getElementById('precio-mostrar');

// Actualizar campos jugadores + precio
function actualizarCamposJugadores() {
  if (!selectModalidad || !jugadoresContainer) return;
  
  const mod = selectModalidad.value;
  jugadoresContainer.innerHTML = '';
  
  let cantidad = 1;
  if (mod === 'Dúo') cantidad = 2;
  if (mod === 'Escuadra') cantidad = 4;
  
  if (precioMostrar) {
    precioMostrar.textContent = mod && precios[mod] ? `Bs ${precios[mod]}` : 'Bs 0';
  }
  
  if (!mod) {
    jugadoresContainer.innerHTML = '<p class="text-zinc-500 text-center py-8 italic">Selecciona modalidad</p>';
    return;
  }
  
  const colores = {
    Solo: { border: 'orange', text: 'orange' },
    Dúo: { border: 'purple', text: 'purple' },
    Escuadra: { border: 'red', text: 'red' }
  };
  const color = colores[mod] || colores.Solo;
  
  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement('div');
    div.className = `rounded-2xl border border-${color.border}-500/40 bg-${color.border}-950/20 backdrop-blur-sm`;
    
    div.innerHTML = `
      <div class="px-6 py-4 border-b border-${color.border}-500/30 flex items-center gap-3 text-${color.text}-400 font-bold text-lg">
        <i class="fas fa-user-shield"></i> Jugador ${i}${i === 1 ? ' (Líder)' : ''}
      </div>
      <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm text-zinc-300 mb-2">Nombre Free Fire <span class="text-red-500">*</span></label>
          <input type="text" class="ff-nombre w-full bg-zinc-900 border border-zinc-700 focus:border-${color.border}-500 rounded-xl px-5 py-4 outline-none transition text-white" 
                 required placeholder="Nombre del jugador ${i}">
        </div>
        <div>
          <label class="block text-sm text-zinc-400 mb-2">ID (opcional)</label>
          <input type="text" class="ff-id w-full bg-zinc-900 border border-zinc-700 focus:border-${color.border}-500 rounded-xl px-5 py-4 outline-none transition text-white" 
                 placeholder="ID del jugador ${i}">
        </div>
      </div>
    `;
    jugadoresContainer.appendChild(div);
  }
}

// Evento change modalidad
if (selectModalidad) {
  selectModalidad.addEventListener('change', actualizarCamposJugadores);
}

// Enviar confirmación por WhatsApp
function enviarConfirmacion() {
  const nombres = [];
  const ids = [];
  
  document.querySelectorAll('.ff-nombre').forEach(inp => nombres.push(inp.value.trim() || '(vacío)'));
  document.querySelectorAll('.ff-id').forEach(inp => ids.push(inp.value.trim() || 'Sin ID'));
  
  let jugadoresTexto = '';
  nombres.forEach((nom, i) => {
    jugadoresTexto += `Jugador ${i+1}:\n  Nombre: ${nom}\n  ID: ${ids[i]}\n`;
  });
  
  const msg =
    `¡Pago realizado! ✅
Modalidad: ${datosInscripcion.modalidad || '(no indicada)'}
${jugadoresTexto}
Contacto: ${datosInscripcion.nombreContacto || '(no indicado)'}`;
  
  const url = `https://wa.me/59175761732?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  
  document.getElementById('success-modal')?.classList.remove('hidden');
}

// Submit formulario
const form = document.getElementById('form-inscripcion');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    datosInscripcion = {
      nombreContacto: document.getElementById('nombre-contacto')?.value.trim() || '(no indicado)',
      modalidad: selectModalidad?.value || ''
    };
    
    const nombresInputs = document.querySelectorAll('.ff-nombre');
    let todosLlenos = true;
    
    nombresInputs.forEach(input => {
      if (!input.value.trim()) {
        todosLlenos = false;
        input.classList.add('border-red-500', 'border-2');
      } else {
        input.classList.remove('border-red-500', 'border-2');
      }
    });
    
    if (!todosLlenos) {
      alert("Completa el nombre de todos los jugadores requeridos.");
      return;
    }
    
    form.classList.add('hidden');
    document.getElementById('pago-step')?.classList.remove('hidden');
    document.getElementById('pago-step')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// Cargar torneos de hoy
async function cargarTorneoHoy() {
  const container = document.getElementById('torneos-container');
  const noTorneo = document.getElementById('no-torneo');
  
  if (!container || !noTorneo) return;
  
  container.innerHTML = '<p class="text-center text-zinc-400 py-10">Cargando torneos...</p>';
  
  try {
    const res = await fetch('tournaments.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    const hoy = new Date().toISOString().split('T')[0];
    const torneoHoy = data.tournaments?.find(t => t.date === hoy);
    
    container.innerHTML = '';
    
    if (torneoHoy && torneoHoy.modes?.length > 0) {
      noTorneo.classList.add('hidden');
      
      torneoHoy.modes.forEach(mode => {
        const color = mode.mode === 'Solo' ? 'orange' : mode.mode === 'Dúo' ? 'purple' : 'red';
        
        const card = document.createElement('div');
        card.className = `bg-zinc-900 rounded-3xl overflow-hidden border border-${color}-500/40 card-glow flex flex-col`;
        
        card.innerHTML = `
          <div class="bg-gradient-to-r from-${color}-600 to-black px-6 py-5">
            <div class="uppercase text-sm tracking-widest">${mode.mode.toUpperCase()}</div>
            <div class="title-font text-2xl sm:text-3xl mt-1">${mode.title}</div>
          </div>
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-6">
              <div>
                <span class="text-xs text-zinc-400">HORA</span>
                <div class="text-3xl font-bold">${mode.time}</div>
              </div>
            
            </div>
            <div class="mb-6">
              <div class="text-sm text-zinc-400 mb-1">PREMIO</div>
              <div class="text-xl sm:text-2xl font-bold">${mode.prize}</div>
            </div>
            <div class="text-sm text-zinc-300 mb-6 flex-1">${mode.rules}</div>
            <div class="mt-auto bg-zinc-800 rounded-2xl px-5 py-4 text-center">
              <div class="text-xl font-bold text-${color}-400">Bs ${mode.price}</div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      noTorneo.classList.remove('hidden');
      container.innerHTML = '';
    }
  } catch (err) {
    container.innerHTML = `<div class="text-red-400 text-center p-10">Error cargando torneos: ${err.message}<br>Usa Live Server</div>`;
  }
}

// Iniciar al cargar página
document.addEventListener('DOMContentLoaded', () => {
  // Menú hamburguesa
  document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('hidden');
  });
  
  cargarTorneoHoy();
  
  if (selectModalidad?.value) actualizarCamposJugadores();
});