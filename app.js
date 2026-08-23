const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');


// ==============================
// CANVAS
// ==============================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);


// ==============================
// AUDIO
// ==============================

let audioContext;
let analyser;
let source;

const enterOverlay = document.getElementById('enterOverlay');


// ==============================
// START EVERYTHING
// ==============================

enterOverlay.addEventListener('click', async () => {

    // Hide overlay
    enterOverlay.classList.add('hide');


    // Create AudioContext AFTER user click
    audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
    )();


    // Resume AudioContext
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }


    // Create analyser
    analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;


    const dataArray =
        new Uint8Array(analyser.frequencyBinCount);


    // Load MP3
    const response =
        await fetch('./celebration.mp3');

    const arrayBuffer =
        await response.arrayBuffer();


    const audioBuffer =
        await audioContext.decodeAudioData(
            arrayBuffer
        );


    // Create audio source
    source =
        audioContext.createBufferSource();

    source.buffer = audioBuffer;

    source.loop = true;


    // Connect audio
    source.connect(analyser);

    analyser.connect(
        audioContext.destination
    );


    // START MUSIC
    source.start();


    // START VISUALIZER
    draw(dataArray);

}, { once: true });


// ==============================
// VISUALIZER
// ==============================

function draw(dataArray) {

    requestAnimationFrame(() => {
        draw(dataArray);
    });


    analyser.getByteFrequencyData(dataArray);



analyser.getByteFrequencyData(dataArray);


// Background
ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

// Bars
let x = 0;

const barWidth =
    canvas.width / dataArray.length;

for (let i = 0; i < dataArray.length; i++) {

    const height = dataArray[i];

    ctx.fillStyle = `rgb(255, ${height + 50}, 0)`;

    ctx.fillRect(
        x,
        canvas.height - height,
        barWidth,
        height
    );

    x += barWidth + 1;
}
}

function addGuest() {
    const guestList = document.getElementById("guestList");

    // Create wrapper
    const inputGroup = document.createElement("div");
    inputGroup.classList.add("guest-input-group");

    // Create input
    const input = document.createElement("input");
    input.type = "text";
    
    input.name = "GuestName[]";

    // Create remove button
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "✕";

    // Remove guest
    removeBtn.onclick = function () {
        inputGroup.remove();
        updateGuestNumbers();
    };

    // Add input + remove button
    inputGroup.appendChild(input);
    inputGroup.appendChild(removeBtn);

    // Add to guest list
    guestList.appendChild(inputGroup);

    // Update numbering
    updateGuestNumbers();
}


// UPDATE GUEST PLACEHOLDERS

function updateGuestNumbers() {
    const allGuestInputs = document.querySelectorAll("#guestList input");

    allGuestInputs.forEach(function (input, index) {
        input.placeholder = `Guest ${index + 1} Name`;
    });
}



// WAIT FOR HTML TO LOAD

document.addEventListener("DOMContentLoaded", function () {
    console.log("RSVP page loaded.");

    // GET RSVP FORM
    const rsvpForm = document.getElementById("rsvpForm");

    console.log("RSVP FORM:", rsvpForm);

    if (!rsvpForm) {
        console.error("ERROR: #rsvpForm was not found.");
        return;
    }

    // GOOGLE APPS SCRIPT URL
    const scriptURL = "https://script.google.com/macros/s/AKfycbztrq8QvaYH-szyKtWh9gdjqXjKcXd6SmiXk9fBH0-JZFjU8TEoEatdQMVYIi8jsT_3ZA/exec";

    // RSVP SUBMISSION
    rsvpForm.addEventListener("submit", async function (event) {
        // Prevent the browser from refreshing the page.
        event.preventDefault();

        console.log("================================");
        console.log("SUBMIT BUTTON WORKED!");
        console.log("================================");

        // CHECK ATTENDANCE
        const attendance = document.querySelector('input[name="attendance"]:checked');

        if (!attendance) {
            alert("Please select Yes or No.");
            return;
        }

        console.log("Attendance:", attendance.value);

        // GET FORM DATA & GUESTS
        const formData = new FormData(rsvpForm);
        const guestInputs = document.querySelectorAll('input[name="GuestName[]"]');
        const guests = [];

        guestInputs.forEach(function (input) {
            if (input.value.trim() !== "") {
                guests.push(input.value.trim());
            }
        });

        const searchParams = new URLSearchParams();
            
        for (const pair of formData.entries()) {
           
            if (pair[0] !== "GuestName[]") {
                searchParams.append(pair[0], pair[1]);
            }
        }
        // Append our combined guests list
        searchParams.append("guests", guests.join(", "));

        // DISPLAY FORM DATA IN CONSOLE
        console.log("========== FORM DATA ==========");
        for (const [key, value] of searchParams.entries()) {
            console.log(key, value);
        }
        console.log("===============================");

        // SUBMIT BUTTON UI UPDATE
        const submitButton = document.getElementById("submitRSVP");
        submitButton.disabled = true;
        submitButton.innerText = "SUBMITTING...";

        // SEND TO GOOGLE APPS SCRIPT

        try {
            console.log("Sending RSVP to Google Sheets...");

            await fetch(scriptURL, {
                method: "POST",
                mode: "no-cors", 
                body: searchParams 
            });

            console.log("RSVP SUBMITTED SUCCESSFULLY!");
            
            // Show overlay
            showSubmittedOverlay();
            
            // Clear form
            rsvpForm.reset();
            

        } catch (error) {
            console.error("================================");
            console.error("SUBMISSION ERROR:", error);
            console.error("================================");
            alert("Something went wrong while submitting your RSVP. Please check your internet connection.");
        }


        // RESTORE SUBMIT BUTTON
        submitButton.disabled = false;
        submitButton.innerText = "SUBMIT RSVP";
    });
});


// SHOW SUBMITTED OVERLAY
function showSubmittedOverlay() {
    const overlay = document.getElementById("submittedOverlay");
    if (!overlay) {
        console.error("ERROR: #submittedOverlay does not exist.");
        return;
    }
    overlay.classList.add("show");
}



// CLOSE SUBMITTED OVERLAY

function closeSubmittedOverlay() {
    const overlay = document.getElementById("submittedOverlay");
    if (!overlay) {
        return;
    }
    overlay.classList.remove("show");
}

