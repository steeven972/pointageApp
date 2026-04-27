document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ username, password})
            });

            const data = await response.json();

            if (data.success) {
                alert('User created successfully');
                window.location.href = "/admin.html";
            } else {
                alert('Error creating user: ' + data.message);
            }
        });

document.getElementById('delete-user-form').addEventListener('submit', async (e) =>{
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const response = await fetch('api/admin/delete-user', {
        method: 'POST',
        headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({userId: userId})
    })

    data = await response.json();
    if(data.success){
        alert('user deleted sucessfully');
        window.location.href = "/admin.html";
    }else{
        alert('Error deleting user:' + data.message);
    }
})

function showRegisterForm(){
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('delete-user-form').style.display = 'none';
}
function showDeleteUserForm() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('delete-user-form').style.display = 'block';
}