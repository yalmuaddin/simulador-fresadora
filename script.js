document.addEventListener('DOMContentLoaded', function() {
    // Constantes para cálculos
    const COSTE_DISCO = 100; // € por disco
    const PIEZAS_POR_DISCO = 25; // piezas por disco
    const COSTE_FRESA = 100; // € por juego de 6 fresas
    const HORAS_POR_FRESA = 100; // horas de fresado por juego
    const TIEMPO_POR_PIEZA = 40 / 60; // horas por pieza (40 minutos)
    const COSTE_MANTENIMIENTO_ANUAL = 800; // €
    const COSTE_LUZ_POR_HORA = 0.15; // € por hora de fresado
    const ERROR_FABRICACION = 0.05; // 5%

    // Elementos del DOM
    const calcularBtn = document.getElementById('calcular-btn');
    const resultadosSection = document.getElementById('resultados');
    let comparacionChart = null;

    // Evento para el botón de cálculo
    calcularBtn.addEventListener('click', function() {
        // Obtener valores del formulario
        const inversionTotal = parseFloat(document.getElementById('inversion').value);
        const coeficiente = parseFloat(document.getElementById('financiacion').value);
        const gastoMensualExterno = parseFloat(document.getElementById('gasto-externo').value);
        const piezasMensuales = parseInt(document.getElementById('piezas-mes').value);

        // Calcular inversión financiada
        const inversionFinanciada = inversionTotal * coeficiente;

        // Calcular costes internos
        const costes = calcularCostesInternos(piezasMensuales);

        // Calcular ahorro mensual
        const ahorroMensual = gastoMensualExterno - costes.costeTotalInterno;

        // Mostrar resultados
        mostrarResultados(costes, ahorroMensual, inversionFinanciada, gastoMensualExterno);

        // Mostrar sección de resultados
        resultadosSection.classList.remove('hidden');
    });

    // Función para calcular costes internos
    function calcularCostesInternos(piezasMensuales) {
        // Materiales
        const discosNecesarios = (piezasMensuales * (1 + ERROR_FABRICACION)) / PIEZAS_POR_DISCO;
        const costeMateriales = discosNecesarios * COSTE_DISCO;
        
        // Herramientas (fresas)
        const horasFresadoMes = piezasMensuales * TIEMPO_POR_PIEZA;
        const fresasNecesarias = horasFresadoMes / HORAS_POR_FRESA;
        const costeFresas = fresasNecesarias * COSTE_FRESA;
        
        // Luz
        const costeLuz = horasFresadoMes * COSTE_LUZ_POR_HORA;
        
        // Mantenimiento (parte mensual)
        const costeMantenimiento = COSTE_MANTENIMIENTO_ANUAL / 12;
        
        // Coste total interno
        const costeTotalInterno = costeMateriales + costeFresas + costeLuz + costeMantenimiento;
        
        // Coste por pieza
        const costePorPieza = costeTotalInterno / piezasMensuales;
        
        return {
            costeTotalInterno: costeTotalInterno,
            costePorPieza: costePorPieza,
            costeMateriales: costeMateriales,
            costeFresas: costeFresas,
            costeLuz: costeLuz,
            costeMantenimiento: costeMantenimiento,
            piezasConError: piezasMensuales * ERROR_FABRICACION
        };
    }

    // Función para mostrar resultados
    function mostrarResultados(costes, ahorroMensual, inversionFinanciada, gastoMensualExterno) {
        // Ahorro mensual
        const ahorroElement = document.getElementById('ahorro-mensual');
        ahorroElement.textContent = `${ahorroMensual >= 0 ? '+' : ''}${ahorroMensual.toFixed(2)} €/mes`;
        ahorroElement.className = ahorroMensual >= 0 ? 'result-value positive' : 'result-value negative';

        // Detalle de costes
        document.getElementById('coste-materiales').textContent = `${costes.costeMateriales.toFixed(2)} €`;
        document.getElementById('coste-fresas').textContent = `${costes.costeFresas.toFixed(2)} €`;
        document.getElementById('coste-luz').textContent = `${costes.costeLuz.toFixed(2)} €`;
        document.getElementById('coste-mantenimiento').textContent = `${costes.costeMantenimiento.toFixed(2)} €`;

        // Resumen
        document.getElementById('coste-total').textContent = `${costes.costeTotalInterno.toFixed(2)} €`;
        document.getElementById('coste-pieza').textContent = `${costes.costePorPieza.toFixed(2)} €`;
        document.getElementById('piezas-error').textContent = `${costes.piezasConError.toFixed(1)} piezas`;

        // ROI
        if (ahorroMensual > 0) {
            const mesesRoi = inversionFinanciada / ahorroMensual;
            document.getElementById('roi-section').classList.remove('hidden');
            document.getElementById('roi-text').textContent = 
                `Con un ahorro mensual de ${ahorroMensual.toFixed(2)} €, recuperará su inversión en aproximadamente ${mesesRoi.toFixed(1)} meses (${(mesesRoi/12).toFixed(1)} años).`;
        } else {
            document.getElementById('roi-section').classList.add('hidden');
        }

        // Gráfico comparativo
        crearGraficoComparativo(gastoMensualExterno, costes.costeTotalInterno);
    }

    // Función para crear el gráfico comparativo
    function crearGraficoComparativo(costeExterno, costeInterno) {
        const ctx = document.getElementById('comparacion-chart').getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (comparacionChart) {
            comparacionChart.destroy();
        }

        comparacionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Externalizado', 'Producción interna'],
                datasets: [{
                    label: 'Coste mensual (€)',
                    data: [costeExterno, costeInterno],
                    backgroundColor: [
                        '#FF6B6B',
                        '#0A6C48'
                    ],
                    borderColor: [
                        '#FF5252',
                        '#085c3d'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Coste mensual (€)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Comparación de Costes Mensuales',
                        font: {
                            size: 16
                        }
                    }
                }
            }
        });
    }
});