

const params = new URLSearchParams(window.location.search);
// Retrieve individual parameters
const errorMsg = params.get('errorMsg'); 
console.log(errorMsg)



const regForm = document.getElementById('registerForm')
//regForm.addEventListener('submit', adduser)
 async function adduser(event) {
    event.preventDefault();
    
    const user = {
        firstName: regForm.firstName.value,
        lastName: regForm.lastName.value,
        idRole: 2,
        isAdmin: 0,
        email: regForm.email.value,
        password: regForm.password.value
         
    };

    try {
        const response = await fetch('/adduser', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (data.error) {
            document.getElementById('error').innerText = data.error;
            document.getElementById('success').innerText = '';
        } else {
            document.getElementById('error').innerText = '';
            document.getElementById('success').innerText = 'Bruker registrert.';
        }
    } catch (error) {
        document.getElementById('error').innerText = 'En feil oppstod. Vennligst prøv igjen.';
        console.error('Error:', error);
    }
}



