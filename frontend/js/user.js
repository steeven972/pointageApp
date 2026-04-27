const params = new URLSearchParams(window.location.search);
const id = params.get('id');

const token = localStorage.getItem('token');

fetch('/api/user/' + id, {
    headers:{
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
});