let audioContext;

function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function updateButtonState() {
    if (isPlaying) {
        playButton.disabled = true;
        pauseButton.disabled = false;
    } else if (isPaused) {
        playButton.disabled = false;
        pauseButton.disabled = true;
    } else {
        playButton.disabled = buffer ? false : true;
        pauseButton.disabled = true;
    }
}

window.onload = function () {

    document.querySelectorAll('input').forEach(input => {
        input.value = '';
    });

    document.getElementById('pauseButton').disabled = true;
    document.getElementById('playButton').disabled = true;

    const rangeInput = document.getElementById("fftSizeRange");
    const spanValue = document.getElementById("fftSizeValue");
    rangeInput.value = 5;
    spanValue.textContent = calculateFFTSize(rangeInput.value);
    rangeInput.addEventListener("input", function () {
        spanValue.textContent = calculateFFTSize(this.value);
    });
};

function calculateFFTSize(value) {
    const fftSizes_numerado = {
        0: 64,
        1: 128,
        2: 256,
        3: 512,
        4: 1024,
        5: 2048,
        6: 4096,
        7: 8192,
        8: 16384,
        9: 32768,
        10: 65536
    };
    return fftSizes_numerado[value];
}

const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const loadUrlButton = document.getElementById('loadUrlButton');
const loadServerFileButton = document.getElementById('loadServerFileButton');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const fftSizeRange = document.getElementById('fftSizeRange');
const fftSizeValue = document.getElementById('fftSizeValue');
const currentTimeSpan = document.getElementById('currentTime');
const totalDurationSpan = document.getElementById('totalDuration');

const fftSizes = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];

let source;
let analyser;
let isPlaying = false;
let buffer;
let startTime = 0;
let pausedAt = 0;
let isPaused = false;
let isDrawing = false;

canvas.width = window.innerWidth - 16;
canvas.height = 256;

fileInput.addEventListener('change', function (event) {
    loadAudioFromFile(event.target.files[0]);
});

loadUrlButton.addEventListener('click', function () {
    const url = urlInput.value;
    if (url) {
        loadAudioFromUrl(url);
    }
});

loadServerFileButton.addEventListener('click', function () {
    const serverFilePath = '/assets/music/Piano-Concerto-no.-21-in-C-major-K.-467-II.-Andante.mp3';
    loadAudioFromUrl(serverFilePath);
});

playButton.addEventListener('click', function () {
    if (isPaused) {
        resumeAudio();
    } else if (!isPlaying) {
        playAudio();
    }
});

pauseButton.addEventListener('click', function () {
    if (isPlaying) {
        pauseAudio();
    }
});

fftSizeRange.addEventListener('input', function () {
    if (analyser) {
        analyser.fftSize = fftSizes[fftSizeRange.value];
        fftSizeValue.textContent = fftSizes[fftSizeRange.value];
    }
});

function loadAudioFromFile(file) {
    showSpinner();
    if (source) {
        source.stop();
        source.disconnect();
    }

    pausedAt = 0;
    isDrawing = false;
    isPlaying = false;
    updateButtonState();
    currentTimeSpan.textContent = "0:00";

    initializeAudioContext();
    const reader = new FileReader();

    reader.onload = function () {
        audioContext.decodeAudioData(reader.result, function (decodedBuffer) {
            buffer = decodedBuffer;

            analyser = audioContext.createAnalyser();
            analyser.fftSize = fftSizes[fftSizeRange.value];

            updateButtonState();

            updateDuration(buffer.duration);

            isDrawing = true;
            draw();
            console.log("draw");
            hideSpinner();
        });
    };

    reader.readAsArrayBuffer(file);
}

function loadAudioFromUrl(url) {
    showSpinner();
    console.log("loadAudioFromFile : " + url)
    if (source) {
        source.stop();
        source.disconnect();
    }

    pausedAt = 0;
    isDrawing = false;
    isPlaying = false;
    updateButtonState();
    currentTimeSpan.textContent = "0:00";

    initializeAudioContext();
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            audioContext.decodeAudioData(data, function (decodedBuffer) {
                buffer = decodedBuffer;

                analyser = audioContext.createAnalyser();
                analyser.fftSize = fftSizes[fftSizeRange.value];

                pausedAt = 0;
                isPaused = false;
                isDrawing = false;
                updateButtonState();

                updateDuration(buffer.duration);
                isDrawing = true;
                draw();
                console.log("draw2");
                hideSpinner();
            });
        })
        .catch(error => {
            console.error('Error al cargar el audio desde la URL:', error);
        });
}

function playAudio() {
    if (source) {
        source.stop();
    }

    source = audioContext.createBufferSource();
    source.buffer = buffer;

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    startTime = audioContext.currentTime - pausedAt;
    source.start(0, pausedAt);
    audioContext.resume();

    isPlaying = true;
    isPaused = false;
    updateButtonState();

    source.onended = function () {
        /*
        isPlaying = false;
        updateButtonState();
        pausedAt = 0;
        */
        if (audioContext.currentTime - startTime >= buffer.duration) {
            isPlaying = false;
            pausedAt = 0;
            updateButtonState();
        }
    };

    updateCurrentTime();
}

function resumeAudio() {
    audioContext.resume().then(() => {
        isPlaying = true;
        isPaused = false;

        updateButtonState();

        updateCurrentTime();
    });
}

function pauseAudio() {
    audioContext.suspend().then(() => {
        pausedAt = audioContext.currentTime - startTime;
        isPlaying = false;
        isPaused = true;

        updateButtonState();
    });
}

function updateCurrentTime() {
    console.log("updateCurrentTime: isplayiing --> " + isPlaying)
    if (isPlaying) {
        const elapsedTime = audioContext.currentTime - startTime;
        currentTimeSpan.textContent = formatTime(elapsedTime);

        if (elapsedTime >= buffer.duration) {
            isPlaying = false;
            pausedAt = 0;
            updateButtonState();
        } else {
            requestAnimationFrame(updateCurrentTime);
        }
    }
}

function updateDuration(duration) {
    totalDurationSpan.textContent = formatTime(duration);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function draw() {
    if (!isDrawing || !analyser) return;

    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);

    canvasContext.fillStyle = 'black';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        const red = (barHeight + 100) % 255;
        const green = (barHeight * 2) % 255;
        const blue = 255;

        canvasContext.fillStyle = `rgb(${red},${green},${blue})`;
        canvasContext.fillRect(x, canvas.height - barHeight / 1.5, barWidth + 1, barHeight / 1.5);

        x += barWidth + 1;
    }
}

//FULL SCREEN CANVAS
canvas.addEventListener('dblclick', toggleFullScreen);

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) { // Firefox
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) { // IE/Edge
            canvas.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }
}

//LOADING SPINNER
function showSpinner() {
    document.getElementById('loadingSpinner').classList.remove('d-none');
}

function hideSpinner() {
    document.getElementById('loadingSpinner').classList.add('d-none');
}
