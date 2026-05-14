document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    
    if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = "/pointage.html";
    } else {
        alert(data.message);
    }
});                                                                                                                                                                                                                                                                         