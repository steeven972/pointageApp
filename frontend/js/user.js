const params = new URLSearchParams(window.location.search);
const id = params.get('id');


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


fetch('/api/user/' + id, {
    headers: {
        'Authorization': 'Bearer ' + token
    }
})
.then(res => res.json())
.then(user => {

    document.getElementById('userCard').innerHTML = `
        <p>ID : ${user.id}</p>
        <p>Username : ${user.username}</p>
        <p>Status : ${user.status ? 'Présent' : 'Absent'}</p>
        <p>Role : ${user.role}</p>
    `;

    document.getElementById('roleChoice').value = user.role;
    
});

function showRoleOption() {

    const role = document.getElementById('updateRoleBlock').style.display = "block";

}
function confirmRoleUpdate(){
    
    const role = document.getElementById('roleChoice').value;

    

    fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            userId: id,
            role: role
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Rôle mis à jour");
            location.reload();
        } else {
            alert(data.message);
        }
    });
    
}

function showPointage() {

    fetch('/api/admin/get-pointage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({
            userId: id
        })
    })

    .then(res => res.json())
    .then(data => {

        const table = document.getElementById('pointage-contenu');
        table.innerHTML = '';

        data.pointages.forEach(p => {

            const row = `
                <tr>
                    <td>${new Date(p.date_jour).toLocaleDateString('fr-FR')}</td>
                    <td>${p.entree || '-'}</td>
                    <td>${p.sortie || '-'}</td>
                    <td>${p.duree ? p.duree + ' min' : '-'}</td>
                </tr>
            `;

            table.innerHTML += row;

        });

    });

}