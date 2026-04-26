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
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[now.getDay()];
}
const dayElement = document.getElementById('days');
dayElement.textContent = dayOfWeek();

function updateStatus(status){
    const now = new Date();
    const hours = now.getHours();
    const statusSpan = statusElement.querySelector('#status-span');
    if(statusSpan){
        if (hours >= OPEN_HOUR && hours < CLOSE_HOUR && statusElement.innerHTML != 'Présent') {
            
            statusSpan.textContent = 'Présent';
            statusSpan.style.color = 'green';
        } else {
            statusSpan.textContent = 'Absent';
            statusSpan.style.color = 'red';
        }
    
    }else{
        const span = document.createElement('span');
        span.id = 'status-span';
        statusElement.appendChild(span);
        updateStatus();
    }
}

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = "/login.html";
}

// 🔥 décoder le token (sans backend)
const payload = JSON.parse(atob(token.split('.')[1]));

document.getElementById('username').textContent =
    "Bienvenue " + payload.username;

setInterval(updateStatus, 10000);
updateStatus(payload.status);
