const ctx = document.getElementById('hoursChart');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            'Lundi',
            'Mardi',
            'Mercredi',
            'Jeudi',
            'Vendredi',
            'Samedi',
            'Dimanche'
        ],
        datasets: [{
            label: 'Heures travaillées',
            data: [7, 8, 5, 6, 7, 0, 0],
            borderWidth: 1,
            borderRadius: 10
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});