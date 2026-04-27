const token = localStorage.getItem('token');



fetch('/api/admin/users', {
    headers: {
        'Authorization': 'Bearer ' + token
        
    }
})
.then(res => res.json())
.then(users => {
    const table = document.getElementById('usersTable');

    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.status ? 'Présent' : 'Absent'}</td>
                <td>${user.last_pointage || 'N/A'}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="view(${user.id})">Voir</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
    });
});

function view(id) {
    window.location.href = `/user.html?id=${id}`;
    
}
