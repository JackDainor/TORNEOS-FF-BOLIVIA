let datosInscripcion = {};

// Precio según modalidad
const precios = {
    /*Solo: 3,*/
    Dúo: 10
    /*Escuadra: 20 */
};

document.addEventListener('DOMContentLoaded', () => {
    cargarTorneoHoy();
    
    // Menú hamburguesa
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = menuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Actualizar precio dinámico al cambiar modalidad
    const selectModalidad = document.getElementById('modalidad');
    const precioMostrar = document.getElementById('precio-mostrar');
    
    if (selectModalidad && precioMostrar) {
        selectModalidad.addEventListener('change', () => {
            const mod = selectModalidad.value;
            precioMostrar.textContent = mod ? `Bs ${precios[mod]}` : 'Bs 0';
        });
    }
});

async function cargarTorneoHoy() {
    try {
        const res = await fetch('tournaments.json');
        const data = await res.json();
        
        const hoy = new Date().toISOString().split('T')[0];
        const torneoHoy = data.tournaments.find(t => t.date === hoy);
        
        const container = document.getElementById('torneos-container');
        const noTorneo = document.getElementById('no-torneo');
        
        container.innerHTML = '';
        
        if (torneoHoy && torneoHoy.modes?.length > 0) {
            noTorneo.classList.add('hidden');
            
            torneoHoy.modes.forEach(mode => {
                const color = mode.mode === 'Solo' ? 'red' : mode.mode === 'Dúo' ? 'purple' : 'orange';
                
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
              <div class="text-sm text-zinc-400 mb-1">PREMIOS</div>
              <div class="text-xl sm:text-2xl font-bold">${mode.prize}</div>
            </div>
            <div class="text-sm text-zinc-300 mb-6 flex-1">${mode.rules}</div>
            <div class="mt-auto bg-zinc-800 rounded-2xl px-5 py-4 text-center">
              <div class="text-xl font-bold text-${color}-400">Bs ${mode.price}</div>
              <div class="text-xs text-zinc-400">Inscripción</div>
            </div>
          </div>
        `;
                container.appendChild(card);
            });
        } else {
            noTorneo.classList.remove('hidden');
        }
    } catch (e) {
        console.error(e);
        document.getElementById('torneos-container').innerHTML = `
      <div class="col-span-full p-12 text-center text-orange-400">
        Error al cargar torneos. Verifica tournaments.json
      </div>
    `;
    }
}

document.getElementById('form-inscripcion')?.addEventListener('submit', e => {
    e.preventDefault();
    
    datosInscripcion = {
        nombre: document.getElementById('nombre').value.trim(),
        modalidad: document.getElementById('modalidad').value,
        ffName: document.getElementById('ff-name').value.trim(),
        ffId: document.getElementById('ff-id').value.trim() || 'Sin ID'
    };
    
    document.getElementById('form-inscripcion').classList.add('hidden');
    document.getElementById('pago-step').classList.remove('hidden');
});

function volverFormulario() {
    document.getElementById('form-inscripcion').classList.remove('hidden');
    document.getElementById('pago-step').classList.add('hidden');
}

function enviarConfirmacion() {
    if (!datosInscripcion.modalidad) return;
    
    const msg =
        `¡Pago realizado! ✅
Modalidad: ${datosInscripcion.modalidad}
Nombre Free Fire: ${datosInscripcion.ffName}
ID: ${datosInscripcion.ffId}
Nombre real: ${datosInscripcion.nombre}`;
    
    const url = `https://wa.me/59175761732?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    
    document.getElementById('success-modal').classList.remove('hidden');
}