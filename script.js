console.log("script is loaded");
const sounds = [
  {
    id: "Allright",
    path: "./assets/sounds/alright-man.mp3",
    buffer: null,
  },
];

soundsUtil = {};

function addSoundsUtil(sound) {
  soundsUtil[sound.id] = {
    buffer: sound.buffer,
    playSound: function () {
      if (!this.audioContext || !this.audioSource) {
        this.audioContext = new AudioContext();
        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = this.buffer;
        this.audioSource.connect(this.audioContext.destination);
      }
      this.audioSource.start();
    },
  };
}

let audioContext, audioSource;

function init() {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new AudioContext();
      resolve(audioContext);
    } catch (e) {
      reject("Web Audio API is not supported in this browser");
    }
  });
}

init().then(
  (context) => {
    audioContext = context;
    audioSource = context.createBufferSource();
    loadAndProcessSounds(addSoundsUtil).then(() => {
      soundsUtil["Allright"].playSound();
    });
  },
  (error) => {
    console.log(error);
  }
);

function loadAndProcessSounds(soundProccessSuccessCallback) {
  return new Promise((resolve, reject) => {
    let soundsDeferreds = [];
    sounds.forEach((sound) => {
      soundsDeferreds.push(
        loadAndProcessSound(sound, audioContext, soundProccessSuccessCallback)
      );
    });

    Promise.allSettled(soundsDeferreds).then(() => resolve());
  });
}

function loadAndProcessSound(sound, audioContext, syncSuccessCallback) {
  return new Promise((resolve, reject) => {
    loadFile(sound.path).then(
      (response) => {
        audioContext.decodeAudioData(
          response,
          (buffer) => {
            sound.buffer = buffer;
            syncSuccessCallback?.(sound);
            resolve(sound);
          },
          (error) => {
            reject(error);
          }
        );
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function loadFile(path) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";

    request.onload = () => {
      resolve(request.response);
    };

    request.onerror = () => {
      reject("ERR");
    };
    request.send();
  });
}
