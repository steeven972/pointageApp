function disconnection(){
    localStorage.removeItem('token');
    window.location.href = "/login.html";
}

const passwordForm = document.getElementById('passwordForm');

if(passwordForm){
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    const res = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    if(data.success){
        alert('Password updated succeffully.')
        disconnection();
    }else{
        alert(data.message);
        window.location.href = "/updateMDP.html";
    }
    
});
}
