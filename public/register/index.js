fetchData() 



async function showRooms(rooms) {
    
    const roomOption = document.getElementById('room');
    roomOption.innerHTML = '<option>Velg rom</option>'
    console.log(rooms, 'rooms')
    rooms.forEach((room) => {
        roomOption.innerHTML += `<option value=${room.id}>${room.name}</option>`;
    });
    
}


async function fetchData() {

    fetchSubjects()
    fetchRooms()
    
}
async function fetchRooms() {

    try {
        let response = await fetch('/getrooms/');
        let data = await response.json();

        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
        }
        showRooms(data);


    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchSubjects() {

    try {
        let response = await fetch('/getsubjects/');
        let data = await response.json();

        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
        }
        showSubjects(data);


    } catch (error) {
        console.error('Error:', error);
    }
}

async function showSubjects(subjects) {
        
    const subjectOption = document.getElementById('subject');
    subjectOption.innerHTML = '<option>Velg fag</option>'
    subjects.forEach((subject) => {
        
        subjectOption.innerHTML += `<option value=${subject.id}>${subject.name}</option>`


    });
}


const regSubForm = document.getElementById('registerActivityForm')
//regForm.addEventListener('submit', adduser)
async function addactivity(event) {
    event.preventDefault();

    const activity = {
        time: regForm.time.value,
        room: regForm.room.value,
        subject: regForm.subject.value,
        
    };

    try {
        const response = await fetch('/addactivity', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(activity)
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
async function fetchNavbar() {
    try {
        let response = await fetch('/navbar');
        let navbarHtml = await response.text();
        document.getElementById('navbar').innerHTML = navbarHtml;
    } catch (error) {
        console.error('Error fetching navbar:', error);
    }
}

fetchNavbar();