import { API_URL, obtenerToken } from './api.js';

console.log('admin-grafica.js cargado');

async function cargarInventario() {
  try {
    const token = obtenerToken();
    console.log('Llamando a:', `${API_URL}/api/admin/inventario-por-categoria`);

    const resp = await fetch(`${API_URL}/api/admin/inventario-por-categoria`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Respuesta HTTP:', resp.status);

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }

    const data = await resp.json();
    console.log('Datos de inventario recibidos:', data);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No hay datos para mostrar en la gráfica');
      return;
    }

    const labels = data.map(row => row.categoria);
    const valores = data.map(row => Number(row.inventario_total));

    const canvas = document.getElementById('inventarioChart');
    if (!canvas) {
      console.error('No se encontró el canvas con id "inventarioChart"');
      return;
    }

    const ctx = canvas.getContext('2d');

    // Crear la gráfica
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Inventario total',
          data: valores,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });

    console.log('Gráfica creada:', chart);

  } catch (error) {
    console.error('Error cargando inventario:', error);
  }
}

// Ejecutar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', cargarInventario);
