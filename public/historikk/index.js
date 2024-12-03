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
        console.log(data)
    }
    catch (error) {
        console.error('Error:', error);
    }
}

async function showActivities(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) {
        console.error('Element with id "activityList" not found.');
        return;
    }

    activityList.innerHTML = '<tr><th>User</th><th>Time</th><th>Date</th><th>Room</th><th>Subject</th></tr>'; 
    
    activities.forEach((activity, index) => {
        if (activity.statusid == 3) {
            console.log("test1");
            const listItem = document.createElement('tr');
            listItem.id = index;
            console.log("test2" + activity);

            listItem.innerHTML = `<td>${activity.userFirstName} ${activity.userLastName}</td><td>${activity.startTime}</td><td>${activity.date}</td><td>${activity.room}</td><td>${activity.subject}</td>`;
            activityList.appendChild(listItem);
            console.log("test3");}

    });
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