console.log("script is loaded");
const sounds = [
  {
    id: "Allright",
    text: "All Right",
    path: "./assets/sounds/alright-man.mp3",
    charCode: 113,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
  {
    id: "DeepDarkFantasies",
    text: "Deep Dark Fantasies",
    path: "./assets/sounds/deep-dark-fantasies.mp3",
    charCode: 119,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
  {
    id: "Awwww",
    text: "Awwww",
    path: "./assets/sounds/awwww.mp3",
    charCode: 101,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
  {
    id: "Ahahaha",
    text: "Ahahaha",
    path: "./assets/sounds/ahahaha.mp3",
    charCode: 114,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
  {
    id: "AsWeCan",
    text: "As we can",
    path: "./assets/sounds/as-we-can.mp3",
    charCode: 116,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
  {
    id: "Areeeeeee",
    text: "Areeeeeee",
    path: "./assets/sounds/areeeeeee.mp3",
    charCode: 121,
    buffer: null,
    onClickCallback: onListItemClickHandler,
  },
];

function onListItemClickHandler(e) {
  console.log("click");
  playSoundById(e.currentTarget.getAttribute("data-sound-id"));
}

soundsUtil = {};

function createListItemTemplate(info) {
  const listItem = document.createElement("li");
  listItem.setAttribute("data-key", info.charCode);
  listItem.setAttribute("data-sound-id", info.id);
  const kbd = document.createElement("kbd");
  kbd.textContent = String.fromCharCode(info.charCode);
  const span = document.createElement("span");
  span.textContent = info.text;
  listItem.appendChild(kbd);
  listItem.appendChild(span);
  console.log(info);
  if (info.onClickCallback) {
    listItem.addEventListener("click", info.onClickCallback);
  }
  return listItem;
}

function addSoundsUtil(sound) {
  soundsUtil[sound.id] = sound;

  soundsUtil[sound.id].playSound = function () {
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = new AudioContext();
    this.audioSource = this.audioContext.createBufferSource();
    this.audioSource.buffer = this.buffer;
    this.audioSource.connect(this.audioContext.destination);
    // }
    this.audioSource.start(0);

    // this.audioSource.stop();
  };
}

let audioContext, audioSource;

function init() {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new AudioContext();
      window.addEventListener("keypress", keyPressHandler);
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
      const list = document.getElementById("keys-list");

      if (!list) {
        return;
      }

      for (const [, sound] of Object.entries(soundsUtil)) {
        list.appendChild(createListItemTemplate(sound));
      }
    });
  },
  (error) => {
    console.log(error);
  }
);

function keyPressHandler(e) {
  console.log(e.keyCode);
  const element = document.querySelector(`li[data-key="${e.keyCode}"]`);
  if (!element) {
    return;
  }
  const soundId = element.getAttribute("data-sound-id");
  playSoundById(soundId);
}

function playSoundById(id) {
  if (id && soundsUtil?.[id]) soundsUtil[id].playSound();
}

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
