// Initialize the Google API client
function handleClientLoad() {
    gapi.load("client:auth2", initClient);
}


// Initialize the API client with OAuth credentials
function initClient() {
    gapi.client.init({
        clientId: '487267607352-hrk6ijqi5rfpsppucas549uadesrk6v7.apps.googleusercontent.com', // Your client ID
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: "https://www.googleapis.com/auth/calendar.readonly"
    }).then(() => {
        console.log("Google API client initialized.");
        
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            if (authInstance.isSignedIn.get()) {
                listUpcomingEvents();  // Fetch events if signed in
            } else {
                console.log("User not signed in, prompting sign-in...");
            }
        } else {
            console.error("gapi.auth2 instance not found.");
        }
    }).catch((error) => {
        console.error("Error initializing Google API client", error);
    });
}


// Sign In function
// function signIn() {
//     gapi.auth2.getAuthInstance().signIn().then(() => {
//         console.log("User signed in.");
//         listUpcomingEvents();  // Fetch and display events once signed in
//     }).catch((error) => {
//         console.error("Error signing in", error);
//     });
// }
function signIn() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
        listUpcomingEvents();  // If already signed in, fetch events
    } else {
        authInstance.signIn().then(() => {
            console.log("User signed in.");
            listUpcomingEvents();  // Fetch events after sign-in
        }).catch((error) => {
            console.error("Error signing in", error);
        });
    }
}

// Sign Out function
// function signOut() {
//     gapi.auth2.getAuthInstance().signOut().then(() => {
//         console.log("User signed out.");
//         document.getElementById("events-list").innerHTML = '';  // Clear events after sign-out
//     }).catch((error) => {
//         console.error("Error signing out", error);
//     });
// }
function signOut() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
        authInstance.signOut().then(() => {
            console.log("User signed out.");
            document.getElementById("events-list").innerHTML = '';  // Clear events after sign-out
        }).catch((error) => {
            console.error("Error signing out", error);
        });
    } else {
        console.error("No auth instance found.");
    }
}

// Fetch and list the upcoming events from the user's Google Calendar
// function listUpcomingEvents() {
//     const authInstance = gapi.auth2.getAuthInstance();
//     if (!authInstance.isSignedIn.get()) {
//         console.log("User is not signed in.");
//         signIn();  // Prompt the user to sign in
//         return;
//     }
    
//     gapi.client.calendar.events.list({
//         'calendarId': 'primary',
//         'timeMin': (new Date()).toISOString(),
//         'showDeleted': false,
//         'singleEvents': true,
//         'maxResults': 10,
//         'orderBy': 'startTime'
//     }).then(function(response) {
//         const events = response.result.items;
//         const eventsList = document.getElementById("events-list");
//         eventsList.innerHTML = ''; // Clear previous events

//         if (events.length > 0) {
//             events.forEach(function(event) {
//                 const when = event.start.dateTime || event.start.date; // Handle all-day events
//                 const eventItem = document.createElement("li");
//                 eventItem.classList.add("p-4", "bg-gray-100", "rounded-lg", "shadow-md");
//                 eventItem.innerHTML = `
//                     <strong class="text-lg">${event.summary}</strong><br>
//                     <span class="text-gray-600">${when}</span>
//                 `;
//                 eventsList.appendChild(eventItem);
//             });
//         } else {
//             eventsList.innerHTML = "<li>No upcoming events found.</li>";
//         }
//     }).catch(function(error) {
//         console.error("Error fetching events", error);
//     });
// }
function listUpcomingEvents() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
        console.log("User is not signed in.");
        signIn();  // Prompt user to sign in
        return;
    }

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function(response) {
        const events = response.result.items;
        const eventsList = document.getElementById("events-list");
        eventsList.innerHTML = ''; // Clear previous events

        if (events.length > 0) {
            events.forEach(function(event) {
                const when = event.start.dateTime || event.start.date; // Handle all-day events
                const eventItem = document.createElement("li");
                eventItem.classList.add("p-4", "bg-gray-100", "rounded-lg", "shadow-md");
                eventItem.innerHTML = `
                    <strong class="text-lg">${event.summary}</strong><br>
                    <span class="text-gray-600">${when}</span>
                `;
                eventsList.appendChild(eventItem);
            });
        } else {
            eventsList.innerHTML = "<li>No upcoming events found.</li>";
        }
    }).catch(function(error) {
        console.error("Error fetching events", error);
    });
}


window.onload = function() {
    handleClientLoad();
};