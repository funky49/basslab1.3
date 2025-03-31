// Variables
const piano = document.getElementById('piano');
const keys = document.querySelectorAll('[data-frequency]');
const durationInput = document.getElementById('note-duration'); // Get the duration input field
const waveformSelect = document.getElementById('waveform'); // Get the waveform dropdown
const filter120HzCheckbox = document.getElementById('filter-120hz');
const filter90HzCheckbox = document.getElementById('filter-90hz');
// Add references to the input fields
const startFrequencyInput = document.getElementById("start-frequency");
const turnaroundFrequencyInput = document.getElementById("turnaround-frequency");
const sweepDurationInput = document.getElementById("sweep-duration");
const sweepDurationValue = document.getElementById("sweep-duration-value");
// Add an event listener to the sweep button
const sweepButton = document.getElementById("sweep-button");
const sweepRepeatsInput = document.getElementById("sweep-repeats");

// Create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Track the currently playing oscillator and gain node
let currentOscillator = null;
let currentGainNode = null;

// Function to play a note
function playNote(frequency) {
    // Get the duration from the input field
    const duration = parseFloat(durationInput.value) || 1; // Default to 1 second if invalid

    // Stop the currently playing note, if any
    stopNote();

    // Create a new oscillator and gain node
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Create a filter node
    const filter = audioContext.createBiquadFilter();

    // Check which filter is selected and set the cutoff frequency
    if (filter120HzCheckbox.checked) {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, audioContext.currentTime);
    } else if (filter90HzCheckbox.checked) {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(90, audioContext.currentTime);
    } else {
        filter.type = 'allpass'; // No filtering if neither is checked
    }

    oscillator.connect(gainNode);
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        // Set the oscillator type based on the selected waveform
    oscillator.type = waveformSelect.value; // Get the selected waveform type';
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Save the current oscillator and gain node
    currentOscillator = oscillator;
    currentGainNode = gainNode;

    oscillator.start();

    // Stop the note after the specified duration
    setTimeout(() => {
        stopNote();
    }, duration * 1000); // Convert seconds to milliseconds
}

// Function to stop the currently playing note with fade-out
function stopNote() {
    if (currentOscillator && currentGainNode) {
        const fadeOutDuration = 0.2; // Duration of the fade-out in seconds
        const currentTime = audioContext.currentTime;

        // Gradually reduce the gain to 0 over the fade-out duration
        currentGainNode.gain.setValueAtTime(currentGainNode.gain.value, currentTime); // Start from the current gain value
        currentGainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

        // Stop the oscillator after the fade-out duration
        setTimeout(() => {
            currentOscillator.stop();
            currentOscillator.disconnect();
            currentGainNode.disconnect();

            // Reset the oscillator and gain node
            currentOscillator = null;
            currentGainNode = null;
        }, fadeOutDuration * 1000); // Convert seconds to milliseconds
    }
}

// Event listeners for key clicks
keys.forEach(key => {
    key.addEventListener('mousedown', () => {
        playNote(parseFloat(key.dataset.frequency)); // Play the note for the duration specified
        key.classList.add('active');

        // Automatically remove the "active" class after the duration
        const duration = parseFloat(durationInput.value) || 1;
        setTimeout(() => {
            key.classList.remove('active');
        }, duration * 1000);
    });

    // Remove the "active" class if the mouse leaves the key
    key.addEventListener('mouseleave', () => {
        key.classList.remove('active');
    });
});

// Event listeners for key presses (keyboard)
document.addEventListener('keydown', (event) => {
    const keyMap = {
        '1': 20,
        'q': 22,
        '2': 24,
        'w': 25.95,
        '3': 27.50,
        'e': 29.13,
        '4': 30.87,
        'r': 32.70,
        '5': 34.65,
        't': 36.71,
        '6': 38.89,
        'y': 41.20,
        '7': 43.65,
        'u': 46.25,
        '8': 49.00,
        'i': 51.91,
        '9': 55.00,
        'o': 58.27,
        '0': 61.74,
        'p': 65.41,
        'z': 69.30,
        'x': 73.42,
        'c': 77.78,
        'v': 80.00,
    };

    if (keyMap[event.key]) {
        playNote(keyMap[event.key]);
        const visualKey = document.querySelector(`[data-frequency="${keyMap[event.key]}"]`);
        if (visualKey) {
            visualKey.classList.add('active');

            // Automatically remove the "active" class after the duration
            const duration = parseFloat(durationInput.value) || 1;
            setTimeout(() => {
                visualKey.classList.remove('active');
            }, duration * 1000);
        }
    }
});

document.addEventListener('keyup', (event) => {
    const keyMap = {
        '1': 20,
        'q': 22,
        '2': 24,
        'w': 25.95,
        '3': 27.50,
        'e': 29.13,
        '4': 30.87,
        'r': 32.70,
        '5': 34.65,
        't': 36.71,
        '6': 38.89,
        'y': 41.20,
        '7': 43.65,
        'u': 46.25,
        '8': 49.00,
        'i': 51.91,
        '9': 55.00,
        'o': 58.27,
        '0': 61.74,
        'p': 65.41,
        'z': 69.30,
        'x': 73.42,
        'c': 77.78,
        'v': 80.00,
    };
    if (keyMap[event.key]) {
        stopNote();
        const visualKey = document.querySelector(`[data-frequency="${keyMap[event.key]}"]`);
        if (visualKey) {
            visualKey.classList.remove('active');
        }
    }
});

// Function to play a frequency drop from 90Hz to 20Hz
function playFrequencySweep(startFrequency, endFrequency, duration) {
    stopNote(); // Stop any currently playing sound

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = waveformSelect.value; // Use the selected waveform
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Set the starting frequency
    oscillator.frequency.setValueAtTime(startFrequency, audioContext.currentTime);

    // Sweep to the end frequency over the specified duration
    oscillator.frequency.linearRampToValueAtTime(endFrequency, audioContext.currentTime + duration);

    currentOscillator = oscillator;
    currentGainNode = gainNode;

    oscillator.start();

    // Stop the oscillator after the sweep duration
    setTimeout(() => {
        stopNote();
    }, duration * 1000); // Convert seconds to milliseconds
}

function playRepeatedSweep(startFreq, endFreq, duration, repeats) {
    let currentRepeat = 0;

    function playSingleSweep() {
        if (currentRepeat >= repeats) return; // Stop if all sweeps are completed

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = waveformSelect.value; // Use the selected waveform
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);

        // Sweep from startFreq to endFreq and back
        oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(endFreq, audioContext.currentTime + duration / 2);
        oscillator.frequency.linearRampToValueAtTime(startFreq, audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);

        oscillator.onended = () => {
            currentRepeat++;
            playSingleSweep(); // Play the next sweep
        };
    }

    playSingleSweep(); // Start the first sweep
}

// Update the displayed duration value when the slider changes
sweepDurationInput.addEventListener("input", () => {
    sweepDurationValue.textContent = sweepDurationInput.value;
});

document.addEventListener('DOMContentLoaded', () => {
    // Add an event listener to the drop9020-button
    const dropButton = document.getElementById('drop9020-button');
    const riseButton = document.getElementById('rise9020-button');

    if (dropButton) {
        dropButton.addEventListener('click', () => {
            playFrequencySweep(90, 20, 5); // Sweep from 90Hz to 20Hz over 5 seconds
        });
    } else {
        console.error('Button with ID "drop9020-button" not found.');
    }

    if (riseButton) {
        riseButton.addEventListener('click', () => {
            playFrequencySweep(20, 90, 5); // Sweep from 20Hz to 90Hz over 5 seconds
        });
    } else {
        console.error('Button with ID "rise9020-button" not found.');
    }
});

sweepButton.addEventListener("click", () => {
    const duration = parseFloat(sweepDurationInput.value);
    const startFreq = parseFloat(startFrequencyInput.value);
    const turnaroundFreq = parseFloat(turnaroundFrequencyInput.value);
    const repeats = parseInt(sweepRepeatsInput.value, 10);

    // Validate the input frequencies and number of sweeps
    if (isNaN(startFreq) || isNaN(turnaroundFreq) || startFreq <= 0 || turnaroundFreq <= 0) {
        alert("Please enter valid frequencies for the start and turnaround notes.");
        return;
    }

    if (isNaN(repeats) || repeats < 1 || repeats > 10) {
        alert("Please enter a valid number of sweeps (1 to 10).");
        return;
    }

    playRepeatedSweep(startFreq, turnaroundFreq, duration, repeats);
});

function playSweep(startFreq, endFreq, duration) {
    stopNote(); // Stop any currently playing sound

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = waveformSelect.value; // Use the selected waveform
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);

    // Sweep from startFreq to endFreq and back
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(endFreq, audioContext.currentTime + duration / 2);
    oscillator.frequency.linearRampToValueAtTime(startFreq, audioContext.currentTime + duration);

    currentOscillator = oscillator;
    currentGainNode = gainNode;

    oscillator.start();

    // Stop the oscillator after the sweep duration
    setTimeout(() => {
        stopNote();
    }, duration * 1000); // Convert seconds to milliseconds
}