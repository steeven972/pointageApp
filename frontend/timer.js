const timestampElement = document.getElementById('timestamp');
const statusElement = document.getElementById('status');
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = "/login.html";
});
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

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = "/login.html";
}

// 🔥 décoder le token (sans backend)
const payload = JSON.parse(atob(token.split('.')[1]));

if(payload.role === 'admin') {
    document.getElementById('admin-section').style.display = 'block';
}else{
    document.getElementById('admin-section').style.display = 'none';
}

document.getElementById('username').textContent =
    "Bienvenue " + payload.username;

    window.addEventListener('DOMContentLoaded', async () => {
            const token = localStorage.getItem('token');

            const res = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const user = await res.json();

            updateStatusUI(user.status);
        });

        /*setInterval(async () => {
            const token = localStorage.getItem('token');

            const res = await fetch('/api/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const user = await res.json();
            updateStatusUI(user.status);
        }, 10000); // Mettre à jour toutes les 10 secondes*/
        
        function updateStatusUI(status) {
            const span = document.getElementById('status-span');
          
            span.textContent = status === true ? 'présent' : 'absent';
            span.style.color = status === true ? 'green' : 'red';
        }
        document.getElementById('pointage-button').addEventListener('click', async (e) => {
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

            if (data.success) {
                alert(data.newStatus === true ? 'Pointage effectué: Entrée' : 'Pointage effectué: Sortie');
                updateStatusUI(data.newStatus);
            } else {
                console.error('Erreur lors du pointage:', data.message);
                alert(data.message);
            }
        });
       