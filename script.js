document.addEventListener('DOMContentLoaded', function() {
    // Constantes para cálculos
    const COSTE_DISCO = 100; // € por disco
    const PIEZAS_POR_DISCO = 25;
    const COSTE_FRESA = 360; // € por juego de 6 fresas
    const HORAS_POR_FRESA = 80;
    const TIEMPO_POR_PIEZA = 0.4; // horas
    const COSTE_MANTENIMIENTO_ANUAL = 800;
    const COSTE_LUZ_POR_HORA = 0.15;
    const ERROR_FABRICACION = 0.05;

    // Tasas de financiación mensuales según tu tabla
    const TASAS_FINANCIACION = {
        24: 0.0446,  // 4.46% mensual
        36: 0.0318,  // 3.18% mensual
        48: 0.0246,  // 2.46% mensual
        60: 0.0204,  // 2.04% mensual
        72: 0.0177,  // 1.77% mensual
        84: 0.0124   // 1.24% mensual
    };

    // Elementos del DOM
    const calcularBtn = document.getElementById('calcular-btn');
    const resultadosSection = document.getElementById('resultados');
    let comparacionChart = null;

    // Función para calcular la cuota mensual (sistema francés)
    function calcularCuotaMensual(inversion, plazoMeses, tasaMensual) {
        const factor = (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                      (Math.pow(1 + tasaMensual, plazoMeses) - 1);
        return inversion * factor;
    }

    // Función para calcular costes internos
    function calcularCostesInternos(piezasMensuales) {
        const piezasConError = piezasMensuales * ERROR_FABRICACION;
        const piezasTotales = piezasMensuales + piezasConError;
        
        // Materiales (redondeando hacia arriba los discos)
        const discosNecesarios = Math.ceil(piezasTotales / PIEZAS_POR_DISCO);
        const costeMateriales = discosNecesarios * COSTE_DISCO;
        
        // Herramientas (fresas)
        const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
        const fresasNecesarias = horasFresado / HORAS_POR_FRESA;
        const costeFresas = fresasNecesarias * COSTE_FRESA;
        
        // Otros costes
        const costeLuz = horasFresado * COSTE_LUZ_POR_HORA;
        const costeMantenimiento = COSTE_MANTENIMIENTO_ANUAL / 12;
        
        // Coste total
        const costeTotal = costeMateriales + costeFresas + costeLuz + costeMantenimiento;
        
        return {
            costeTotalInterno: costeTotal,
            costePorPieza: costeTotal / piezasMensuales,
            costeMateriales: costeMateriales,
            costeFresas: costeFresas,
            costeLuz: costeLuz,
            costeMantenimiento: costeMantenimiento,
            piezasConError: piezasConError
        };
    }

    // Función principal de cálculo
    calcularBtn.addEventListener('click', function() {
        const inversion = parseFloat(document.getElementById('inversion').value);
        const plazoMeses = parseInt(document.getElementById('financiacion').value);
        const gastoExterno = parseFloat(document.getElementById('gasto-externo').value);
        const piezasMensuales = parseInt(document.getElementById('piezas-mes').value);
        
        // Obtener tasa mensual del plazo seleccionado
        const tasaMensual = TASAS_FINANCIACION[plazoMeses];
        
        // Calcular todos los componentes
        const costes = calcularCostesInternos(piezasMensuales);
        const cuotaMensual = calcularCuotaMensual(inversion, plazoMeses, tasaMensual);
        
        // Calcular ahorro real (considerando la cuota)
        const ahorroReal = gastoExterno - (costes.costeTotalInterno + cuotaMensual);
        
        // Mostrar resultados
        document.getElementById('cuota-mensual').textContent = cuotaMensual.toFixed(2) + ' €/mes';
        document.getElementById('ahorro-mensual').textContent = ahorroReal.toFixed(2) + ' €/mes';
        document.getElementById('ahorro-mensual').className = ahorroReal >= 0 ? 'result-value positive' : 'result-value negative';
        
        // Actualizar otros campos
        document.getElementById('coste-materiales').textContent = costes.costeMateriales.toFixed(2) + ' €';
        document.getElementById('coste-fresas').textContent = costes.costeFresas.toFixed(2) + ' €';
        document.getElementById('coste-luz').textContent = costes.costeLuz.toFixed(2) + ' €';
        document.getElementById('coste-mantenimiento').textContent = costes.costeMantenimiento.toFixed(2) + ' €';
        document.getElementById('coste-total').textContent = costes.costeTotalInterno.toFixed(2) + ' €';
        document.getElementById('coste-pieza').textContent = costes.costePorPieza.toFixed(2) + ' €';
        document.getElementById('piezas-error').textContent = costes.piezasConError.toFixed(0) + ' piezas';
        
        // Calcular y mostrar ROI
        if (ahorroReal > 0) {
            const totalIntereses = (cuotaMensual * plazoMeses) - inversion;
            const mesesROI = (inversion + totalIntereses) / ahorroReal;
            document.getElementById('roi-text').textContent = 
                `Con un ahorro real de ${ahorroReal.toFixed(2)} €/mes, recuperará la inversión en ${mesesROI.toFixed(1)} meses (${(mesesROI/12).toFixed(1)} años).`;
            document.getElementById('roi-section').classList.remove('hidden');
        } else {
            document.getElementById('roi-text').textContent = 
                "La inversión no se recuperará con los datos actuales (ahorro mensual negativo).";
            document.getElementById('roi-section').classList.remove('hidden');
        }
        
        // Mostrar sección de resultados
        resultadosSection.classList.remove('hidden');
        
        // Actualizar gráfico comparativo (incluyendo la cuota)
        crearGraficoComparativo(gastoExterno, costes.costeTotalInterno + cuotaMensual);
    });

    // Función para crear el gráfico comparativo
    function crearGraficoComparativo(costeExterno, costeInternoTotal) {
        const ctx = document.getElementById('comparacion-chart').getContext('2d');
        
        if (window.comparacionChart) {
            window.comparacionChart.destroy();
        }

        window.comparacionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Externalizado', 'Producción interna'],
                datasets: [{
                    label: 'Coste mensual (€)',
                    data: [costeExterno, costeInternoTotal],
                    backgroundColor: ['#FF6B6B', '#0A6C48'],
                    borderColor: ['#FF5252', '#085c3d'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparación de Costes Mensuales Totales',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Coste mensual (€)' }
                    }
                }
            }
        });
    }
});