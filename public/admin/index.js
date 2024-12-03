fetchActivities();
console.log("test");
const params = new URLSearchParams(window.location.search);
// Retrieve individual parameters
const errorMsg = params.get('errorMsg'); 
console.log(errorMsg);

async function fetchActivities() {
    try {
        let response = await fetch('/getactivities/');
        let data = await response.json();

        for (let i = 0; i < data.length; i++) {
            console.log(data[i]);
        }
        showActivities(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Fetch and inject the navbar HTML into the page
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


async function showActivities(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) {        console.error('Element with id "activityList" not found.');
        return;
    }

    activityList.innerHTML = '<tr><th>User</th><th>StartTime</th><th>Subject</th><th>Room</th><th>Date</th></tr>'; 
    
    activities.forEach((activity) => {
        if (activity.statusid == 2) {

            const listItem = document.createElement('tr');
            console.log(activity);
            listItem.innerHTML = `<td>${activity.userFirstName} ${activity.userLastName}</td><td>${activity.startTime}</td><td>${activity.subject}</td><td>${activity.room}</td><td>${activity.date}</td>`
            + `<td><button class="accept" id="${activity.id}" type="submit">accept</button></td><td><button id="${activity.id}" class="decline" type="submit">decline</button></td>`;
            activityList.appendChild(listItem);
            console.log(activity.id);

        }
    });
}

document.addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('accept')) {
        acceptActivity(event.target);
    }
    if (event.target && event.target.classList.contains('decline')) {
        declineActivity(event.target);
    }
});


async function declineActivity(target) {
    event.preventDefault();

    console.log("decline activity with id:", target.id);
    
    // Find and remove the corresponding table row
    const row = target.closest('tr');
    if (row) {
        row.remove();
    }
    const id = {
        id: target.id
    } 
    try {
        const response = await fetch('/declineActivity', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(id)
        });
        const data = await response.json();

        if (data.error) {
            console.log("Error declining activity:", data.error);
        } else {
            console.log("Activity declined successfully");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function acceptActivity(target) {
    event.preventDefault();
    const row = target.closest('tr');
    if (row) {
        row.remove();
    }
    console.log("accept activity with id:", target.id);
    const id = {
        id: target.id
    }
    try {
        const response = await fetch('/acceptActivity', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(id)
        });
        const data = await response.json();

        if (data.error) {
            console.log("Error accepting activity:", data.error);
        } else {
            console.log("Activity accepted successfully");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

