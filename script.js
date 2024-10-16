// script.js

let globalStatistics = {};
let globalConflicts = {};
let mainEvents = {};
let technologies = {};
let aiDevelopment = {};

document.addEventListener('DOMContentLoaded', () => {
    // Cargar los datos desde los archivos JSON al iniciar
    Promise.all([
        fetch('statistics/global_statistics.json').then(response => {
            if (!response.ok) {
                throw new Error(`global_statistics.json HTTP error! status: ${response.status}`);
            }
            return response.json();
        }),
        fetch('statistics/global_conflicts.json').then(response => {
            if (!response.ok) {
                throw new Error(`global_conflicts.json HTTP error! status: ${response.status}`);
            }
            return response.json();
        }),
        fetch('statistics/main_events.json').then(response => {
            if (!response.ok) {
                throw new Error(`main_events.json HTTP error! status: ${response.status}`);
            }
            return response.json();
        }),
        fetch('statistics/technologies.json').then(response => {
            if (!response.ok) {
                throw new Error(`technologies.json HTTP error! status: ${response.status}`);
            }
            return response.json();
        }),
        fetch('statistics/ai.json').then(response => {
            if (!response.ok) {
                throw new Error(`ai.json HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
    ])
    .then(([stats, conflicts, events, techs, aiData]) => {
        globalStatistics = stats;
        globalConflicts = conflicts;
        mainEvents = events;
        technologies = techs;
        aiDevelopment = aiData;
        initializeSimulation();
    })
    .catch(error => {
        console.error('Error al cargar los archivos JSON:', error);
        displayError(`No se pudieron cargar los datos de simulación. Error: ${error.message}`);
    });
});

function initializeSimulation() {
    const yearInput = document.getElementById('year-input');
    const yearSlider = document.getElementById('year-slider');
    const yearBtns = document.querySelectorAll('.year-btn');
    const simulateBtn = document.getElementById('simulate-btn');

    const simulationOverlay = document.querySelector('.simulating');

    function updateSimulation() {
        simulationOverlay.classList.remove('hidden');
        setTimeout(() => {
            simulateFuture();
            simulationOverlay.classList.add('hidden');
        }, 500);
    }

    yearInput.addEventListener('change', () => {
        validateYear();
        updateSimulation();
    });
    yearSlider.addEventListener('change', () => {
        validateYear();
        updateSimulation();
    });

    yearInput.addEventListener('input', () => {
        yearSlider.value = yearInput.value;
    });

    yearSlider.addEventListener('input', () => {
        yearInput.value = yearSlider.value;
    });

    yearBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const years = parseInt(btn.dataset.years);
            let newYear = parseInt(yearInput.value) + years;
            newYear = Math.max(2020, Math.min(2100, newYear));
            yearInput.value = newYear;
            yearSlider.value = newYear;
            updateSimulation();
        });
    });

    if (simulateBtn) {
        simulateBtn.addEventListener('click', updateSimulation);
    }

    validateYear();
    simulateFuture(); // Simulación inicial
}

function validateYear() {
    const yearInput = document.getElementById('year-input');
    const yearSlider = document.getElementById('year-slider');
    let year = parseInt(yearInput.value);
    if (isNaN(year) || year < 2020) {
        year = 2020;
    } else if (year > 2100) {
        year = 2100;
    }
    yearInput.value = year;
    yearSlider.value = year;
}

function getAIInfo(year) {
    const availableYears = Object.keys(aiDevelopment).map(Number).sort((a, b) => a - b);
    let closestYear = availableYears[0];
    for (let y of availableYears) {
        if (y <= year) {
            closestYear = y;
        } else {
            break;
        }
    }
    return aiDevelopment[closestYear] || {
        ai_type: 'N/A',
        ai_level: 'N/A',
        description: 'N/A'
    };
}

function simulateFuture() {
    const year = parseInt(document.getElementById('year-input').value);
    document.getElementById('result-year').textContent = year;

    // Array para almacenar los nombres de los archivos JSON que faltan datos para el año seleccionado
    let missingFiles = [];

    // Verificar si cada JSON tiene datos para el año seleccionado
    if (!globalStatistics.hasOwnProperty(year)) {
        missingFiles.push('global_statistics.json');
    }
    if (!globalConflicts.hasOwnProperty(year)) {
        missingFiles.push('global_conflicts.json');
    }
    if (!mainEvents.hasOwnProperty(year)) {
        missingFiles.push('main_events.json');
    }
    if (!technologies.hasOwnProperty(year)) {
        missingFiles.push('technologies.json');
    }
    // 'ai.json' se maneja de forma diferente, ya que se busca el año más cercano anterior
    // Por lo tanto, no se considera un archivo faltante si no hay datos exactos

    if (missingFiles.length > 0) {
        // Crear un mensaje de error detallado
        let errorMessage = `Falta información para el año ${year} en los siguientes archivos JSON:\n`;
        missingFiles.forEach(file => {
            errorMessage += `- ${file}\n`;
        });
        displayError(errorMessage);
        console.error(errorMessage);
        return; // Salir de la función para evitar intentar acceder a datos inexistentes
    } else {
        // Limpiar cualquier mensaje de error previo si todos los datos están disponibles
        clearError();
    }

    try {
        // Obtener datos correspondientes al año
        const stats = globalStatistics[year];
        const conflicts = globalConflicts[year];
        const event = mainEvents[year];
        const tech = technologies[year];

        // Actualizar Estadísticas Globales
        document.getElementById('population').textContent = formatNumber(stats.population);
        document.getElementById('births').textContent = formatNumber(stats.births);
        document.getElementById('deaths').textContent = formatNumber(stats.deaths);
        document.getElementById('population-growth').textContent = stats.population_growth + '%';
        document.getElementById('median-age').textContent = stats.median_age;
        document.getElementById('max-age').textContent = stats.max_age + ' años';
        document.getElementById('average-longevity').textContent = stats.average_longevity + ' años';
        document.getElementById('active-humans').textContent = formatNumber(stats.active_humans);
        document.getElementById('active-robots').textContent = formatNumber(stats.active_robots);

        // Actualizar Conflictos Globales
        document.getElementById('active-wars').textContent = conflicts.active_wars;
        document.getElementById('number-countries').textContent = conflicts.number_countries;

        // Mostrar países en conflicto
        const conflictCountries = document.getElementById('conflict-countries');
        conflictCountries.innerHTML = conflicts.countries_in_conflict
            ? conflicts.countries_in_conflict.join(', ')
            : 'Ninguno';

        // Mostrar nuevos países
        const newCountry = document.getElementById('new-country');
        newCountry.textContent = conflicts.new_country || 'Ninguno';

        // Mostrar países desaparecidos
        const disappearedCountry = document.getElementById('disappeared-country');
        disappearedCountry.textContent = conflicts.disappeared_countries
            ? conflicts.disappeared_countries.join(', ')
            : 'Ninguno';

        // Actualizar Evento Principal
        document.getElementById('major-event').textContent = event.major_event;

        // Actualizar Tecnologías en Desarrollo
        const techList = document.getElementById('tech-list');
        techList.innerHTML = '';
        tech.technologies.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            techList.appendChild(li);
        });

        // Actualizar Estadísticas Ambientales
        document.getElementById('temperature').textContent = stats.temperature.toFixed(2);
        document.getElementById('sea-level').textContent = stats.sea_level.toFixed(2);

        // Actualizar Desarrollo de IA
        const aiInfo = getAIInfo(year);
        document.getElementById('ai-type').textContent = aiInfo.ai_type;
        document.getElementById('ai-level').textContent = aiInfo.ai_level ? aiInfo.ai_level : 'N/A';
        document.getElementById('ai-description').textContent = aiInfo.description;

    } catch (error) {
        console.error('Error en la simulación:', error);
        displayError(`Error en la simulación: ${error.message}`);
    }
}

function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

function displayError(message) {
    const errorDiv = document.getElementById('error-message');
    // Reemplaza los saltos de línea por etiquetas <br> para mantener el formato en HTML
    errorDiv.innerHTML = message.replace(/\n/g, '<br>');
    errorDiv.style.display = 'block'; // Muestra el div de error
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = '';
    errorDiv.style.display = 'none'; // Oculta el div de error
}
