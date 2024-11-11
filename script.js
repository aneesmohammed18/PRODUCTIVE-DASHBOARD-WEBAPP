// Firebase configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCLKniVQ2cWzXxTF5FI0euzxv727xhw30M",
    authDomain: "productive-dashboard--by-anees.firebaseapp.com",
    projectId: "productive-dashboard--by-anees",
    storageBucket: "productive-dashboard--by-anees.firebasestorage.app",
    messagingSenderId: "968087320460",
    appId: "1:968087320460:web:730a45be08d770db3588a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Use the imported GoogleAuthProvider


const quoteApiUrl = "https://cors-anywhere.herokuapp.com/http://api.quotable.io/random";  // API for fetching quotes

// DOM Elements
let userNameElement, userEmailElement, userPictureElement;
const locationElement = document.getElementById("location");
const weatherDescription = document.getElementById("weatherdescription");
const weatherIcon = document.getElementById("weathericon");
const newsListElement = document.getElementById("newslist");
const quoteElement = document.getElementById("quote");
const quoterElement = document.getElementById("quoter");



// Authentication Functions

// Google Login
function login(event) {
    event.preventDefault(); // Prevent form submission
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            updateUserInfo(user);
            fetchWeather();
            fetchNews();
            fetchQuote();
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Login error:", error);
            alert("Login failed: " + error.message);
        });
}

// Logout
function logout() {
    signOut(auth)
        .then(() => {
            userNameElement.textContent = "Not logged in";
            userEmailElement.textContent = "";
            userPictureElement.src = "default-profile.png"; // Reset to default image
            locationElement.textContent = "";
            weatherDescription.textContent = "";
            weatherIcon.src = "";
            newsListElement.innerHTML = "";
            quoteElement.textContent = "";
            quoterElement.textContent = "";



            alert("You have been logged out.");
            window.location.href = "index.html";

        })
        .catch((error) => {
            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);
        });
}

// Update User Info
function updateUserInfo(user) {
    if (userNameElement) {
        userNameElement.textContent = user.displayName || "User";
    } else {
        console.error("Username element not found");
    }

    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    } else {
        console.error("Email element not found");
    }

    if (userPictureElement) {
        userPictureElement.src = user.photoURL || "default-profile.png";
    } else {
        console.error("User picture element not found");
    }

    // Fetch weather after updating user info
    fetchWeather("hyderabad");
}

// Fetch Weather Data
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=fa79ab29764e2029a368525637fe7ae8`);
        const data = await response.json();
        if (data && data.weather) { // Ensure there's weather data
            locationElement.textContent = data.name;
            weatherDescription.textContent = data.weather[0].description;
            weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        } else {
            locationElement.textContent = "Location unavailable";
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        locationElement.textContent = "Failed to load weather";
    }
}

// Fetch News Data
async function fetchNews() {
    try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=8a6f1b47ed0a47f2850b0f0b901dc33d`);
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
            newsListElement.innerHTML = "";  // Clear previous news
            data.articles.slice(0, 5).forEach(article => {  
                const li = document.createElement("li");
                li.textContent = article.title;
                newsListElement.appendChild(li);
            });
        } else {
            newsListElement.innerHTML = "<li>No news available at the moment-API EXHAUSTED!.</li>";
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        newsList.innerHTML = "<li>Failed to load news.</li>";
    }
}
fetchNews();
// Fetch Quote of the Day
async function fetchQuote() {
    try {
        const quoteApiUrl = "https://cors-anywhere.herokuapp.com/http://api.quotable.io/random"; // Updated URL
        const response = await fetch(quoteApiUrl, {
            method: 'GET',
            headers: {
                'Origin': window.location.origin, // Add the Origin header
            }
        });

       
        console.log('Response Status:', response.status);
        console.log('Response Content-Type:', response.headers.get('Content-Type'));

       
        const responseText = await response.text();

       
        try {
            const data = JSON.parse(responseText); // Try parsing the response as JSON
            // Check if the quote is short enough
            if (data.content.length <= 50) { 
                quoteElement.textContent = `"${data.content}"`;
                quoterElement.textContent = `~${data.author}`;
            } else {
                fetchQuote(); 
            }
        } catch (jsonError) {
            console.error('Failed to parse JSON:', jsonError);
            quoteElement.textContent = "Failed to load quote";
            quoterElement.textContent = "";
        }

    } catch (error) {
        console.error("Error fetching quote:", error);
        quoteElement.textContent = "Failed to load quote";
        quoterElement.textContent = "";
    }
}


function addTask() {
    const taskinput = document.getElementById("taskinput");
    let task = taskinput.value;
    if (task === "") {
        alert("please enter the task");
        } else {
        const taskelement = document.createElement("li");
        const taskText = document.createElement("span");
        taskText.textContent = task;



        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("click", function () {
            taskText.style.textDecoration = checkbox.checked ? "line-through" : "none";
            savetasks();
        });


        const cross = document.createElement("img");
        cross.src = "assets/cross.png";
        cross.alt = "Delete task";
        cross.addEventListener("click", function () {
            taskelement.remove();
            savetasks();
        });


        taskelement.appendChild(checkbox);
        taskelement.appendChild(taskText);
        taskelement.appendChild(cross);


        const tasklist = document.getElementById("tasklist");
        tasklist.appendChild(taskelement);
        taskinput.value = "";
        savetasks();

    }

   
}

function savetasks() {
    const tasklist = document.getElementById("tasklist");
     localStorage.setItem("tasks", tasklist.innerHTML);
}



function loadtasks() {
    const tasklist = document.getElementById("tasklist");
    tasklist.innerHTML = localStorage.getItem("tasks");

    
    const taskItems = tasklist.querySelectorAll("li");

    taskItems.forEach(taskItem => {
       
        const checkbox = taskItem.querySelector("input[type='checkbox']");
        const taskText = taskItem.querySelector("span");

        checkbox.addEventListener("click", function () {
            taskText.style.textDecoration = checkbox.checked ? "line-through" : "none";
        });

     
        const cross = taskItem.querySelector("img");
        cross.addEventListener("click", function () {
            taskItem.remove();
            savetasks(); 
         });
     });

};







// Event Listeners
 document.addEventListener("DOMContentLoaded", () => {
    // Initialize DOM Elements
    userNameElement = document.getElementById("username");
    userEmailElement = document.getElementById("email");
    userPictureElement = document.getElementById("userpicture");

    // For login page
    if (document.getElementById("loginButton")) {
        document.getElementById("loginButton").addEventListener("click", login);
    }

    // For dashboard page
    if (document.getElementById("logoutButton")) {
        document.getElementById("logoutButton").addEventListener("click", logout);
    }

    if (document.getElementById("addTaskButton")) {
        document.getElementById("addTaskButton").addEventListener("click", addTask);
        
    }
    loadtasks();
});
document.addEventListener("DOMContentLoaded", () => {
    
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateUserInfo(user);
            fetchQuote();
        } else {
            console.log("No user logged in");
        }
    });
});

///theme toggle
let theme = document.getElementById("theme");
let isDarkMode = false;
const body = document.body;
let logo = document.getElementById("logo")
theme.addEventListener("click", function () {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        body.classList.add("dark-mode");
        logo.src = 'assets/logowhite.png';
        theme.src = 'assets/sun.png';


    } else {
        body.classList.remove("dark-mode");
        logo.src = 'assets/logo.png';
        theme.src = 'assets/moon.png';


    }

})
