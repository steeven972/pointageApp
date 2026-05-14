const timestampElement = document.getElementById('timestamp');
const statusElement = document.getElementById('status');
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;



function updateTimestamp() {    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timestampElement.textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateTimestamp, 1000);
updateTimestamp();

function dayOfWeek() {

    const now = new Date();

    const months = [
        'Janvier',
        'Février',
        'Mars',
        'Avril',
        'Mai',
        'Juin',
        'Juillet',
        'Août',
        'Septembre',
        'Octobre',
        'Novembre',
        'Décembre'
    ];

    const days = [
        'Dimanche',
        'Lundi',
        'Mardi',
        'Mercredi',
        'Jeudi',
        'Vendredi',
        'Samedi'
    ];

    return {
        day: days[now.getDay()],
        date: now.getDate(),
        month: months[now.getMonth()],
        year: now.getFullYear()
    };
}

const dayElement = document.getElementById('days');

const { day, date, month, year } = dayOfWeek();

dayElement.innerHTML = `
    <p>${day}</p>
    <span>${date} ${month} ${year}</span>
`;

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = "/login.html";
}

const payload = JSON.parse(atob(token.split('.')[1]));

if (payload.role !== 'admin') {
    document.getElementById('reserve-button').style.display = 'none';
}else {
    document.getElementById('reserve-button').style.display = 'block';
}
function getPointage(){

}
function goToAdminPanel(){
    if(payload.role != "admin"){
        alert("You're not a admin !!")
        return; 
    }else{
        window.location.href = '/admin.html'
    }
}
const username = document.getElementById("username")
username.innerHTML =
    `<p>Bonjour ${payload.username}<p>
    <span>Bienvenue dans votre espace de pointage</span>`;

    window.addEventListener('DOMContentLoaded', async () => {
            const token = localStorage.getItem('token');

            const res = await fetch('/api/user/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const user = await res.json();

            updateUI(user.status);
        });
username.style.color = "#0c4da2"
   
const pointageButton = document.getElementById('pointage-button')
function updateUI(status) {
    const span = document.getElementById('status-span');
    

    if(status){
        const dotStatus = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="green" class="icon icon-tabler icons-tabler-filled icon-tabler-point">
	                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
	                    <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                        </svg>`;
        span.innerHTML = dotStatus + 'présent'; 
        span.style.color = "green"
        pointageButton.innerHTML = "Terminer ma journée"
    }
    else{
        const dotStatus = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" class="icon icon-tabler icons-tabler-filled icon-tabler-point">
	                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
	                    <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                        </svg>`;
        span.innerHTML = dotStatus + 'absent'; 
        span.style.color = "red";
        pointageButton.innerHTML = "Commencer ma journée"
    }

    
}

pointageButton.addEventListener('click', async (e) => {
    e.preventDefault();

    
    
    const token = localStorage.getItem('token');

    const res = await fetch('/api/pointage/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await res.json();
    const infoStatus = document.getElementById("info-status")
    if (data.success) {
        if(data.newStatus){
            console.log('Pointage effectué: Entrée')
        }else{
            console.log('Pointage effectué: Sortie')
        }
        
        updateUI(data.newStatus);
    } else {
        console.error('Erreur lors du pointage:', data.message);
        alert(data.message);
    }
});




       