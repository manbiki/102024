/* ============================================================== //
 * Code: Copyright © 2024 Manbiki. All rights reserved.
 * Art: Created by bluedeedeedoop (https://bluedeedeedoop.carrd.co/) <3 using characters property of Lucasfilm/Disney
// ============================================================== */

// Tamagotchi class
class Tamagotchi {
  constructor() {
    // starting values
    this.hunger = this.loadState("hunger", 100);
    this.fun = this.loadState("fun", 100);
    this.sleep = this.loadState("sleep", 100);
    this.awake = this.loadState("awake", true);

    // load play mode if set
    this.isRealisticMode = this.loadState("isRealisticMode", false);
    this.setDecayRates();

    // update toggle button to match play mode
    document.getElementById("toggle-mode-btn").textContent = this
      .isRealisticMode
      ? "Switch to Fast Mode"
      : "Switch to Realistic Mode";

    // get last load datetime
    const lastActive = this.loadState("lastActive", Date.now());
    // calculate time passed since last load
    const timePassed = Date.now() - lastActive;
    this.adjustNeedsBasedOnTimePassed(timePassed);

    // get dom elements
    this.avatarElement = document.getElementById("avatar");
    this.hungerElement = document.getElementById("hunger-level");
    this.funElement = document.getElementById("fun-level");
    this.sleepElement = document.getElementById("sleep-level");

    // barriss idle frames
    this.idleFrames = [
      "images/barriss/idle/idle1.png",
      "images/barriss/idle/idle2.png",
      "images/barriss/idle/idle3.png",
      "images/barriss/idle/idle4.png",
    ];
    // barriss sleep frames
    this.sleepFrames = [
      "images/barriss/sleep/sleep1.png",
      "images/barriss/sleep/sleep2.png",
      "images/barriss/sleep/sleep3.png",
      "images/barriss/sleep/sleep4.png",
    ];
    // starting frame
    this.currentFrame = 0;

    // start processes
    this.startTimers();
    this.startAnimation();
    this.updateUI();
  }

  // set decay rates depending on reaslistic or normal mode
  setDecayRates() {
    if (this.isRealisticMode) {
      this.hungerDecayRate = 30000; // 30 secomds
      this.funDecayRate = 20000; // 20 seconds
      this.sleepDecayRate = 60000; // 1 min
    } else {
      this.hungerDecayRate = 3000; // every 3 seconds
      this.funDecayRate = 2000; // every 2 seconds
      this.sleepDecayRate = 5000; // every 5 seconds
    }
  }

  // change game mode / decay rates
  toggleMode() {
    this.isRealisticMode = !this.isRealisticMode;
    this.setDecayRates();
    this.startTimers(); // restart timers with new decay rates
    this.saveState();
    document.getElementById("toggle-mode-btn").textContent = this
      .isRealisticMode
      ? "Switch to Fast Mode"
      : "Switch to Realistic Mode";
  }

  // set/reset times
  startTimers() {
    clearInterval(this.hungerTimer);
    clearInterval(this.funTimer);
    clearInterval(this.sleepTimer);
    this.hungerTimer = setInterval(
      () => this.decreaseHunger(),
      this.hungerDecayRate
    );
    this.funTimer = setInterval(() => this.decreaseFun(), this.funDecayRate);
    this.sleepTimer = setInterval(
      () => this.updateSleep(),
      this.sleepDecayRate
    );
  }

  // start animation cycle
  startAnimation() {
    setInterval(() => {
      if (this.awake) {
        this.currentFrame = (this.currentFrame + 1) % this.idleFrames.length;
        this.avatarElement.src = this.idleFrames[this.currentFrame];
      } else {
        this.currentFrame = (this.currentFrame + 1) % this.sleepFrames.length;
        this.avatarElement.src = this.sleepFrames[this.currentFrame];
      }
    }, 300);
  }

  // decay hunger
  decreaseHunger() {
    if (this.hunger > 0 && this.awake) {
      // decay while awake
      this.hunger -= 1;
      this.saveState();
    } else if (this.hunger > 0 && !this.awake) {
      // decay while asleep
      this.hunger -= 0.5;
      this.saveState();
    }
    this.updateUI();
  }

  // decay fun
  decreaseFun() {
    if (this.fun > 0 && this.awake) {
      // decay while awake
      this.fun -= 1;
      this.saveState();
    } else if (this.fun > 0 && !this.awake) {
      // decay while asleep
      this.fun -= 0.5;
      this.saveState();
    }
    this.updateUI();
  }

  // update sleep / tiredness
  updateSleep() {
    if (this.sleep > 0 && this.awake) {
      this.sleep -= 1;
      this.saveState();
    } else if (this.sleep <= 0 && this.awake) {
      this.goToSleep();
    } else if (!this.awake) {
      this.sleep += 1;
      if (this.sleep >= 100) {
        this.wakeUp();
      }
      this.saveState();
    }
    this.updateUI();
  }

  // go to sleep
  goToSleep() {
    this.awake = false;
    this.currentFrame = 0;
    this.saveState();
  }

  // wake up
  wakeUp() {
    this.awake = true;
    this.sleep = Math.floor(Math.random() * 41) + 60; // Random between 60 and 100
    this.currentFrame = 0;
    this.saveState();
    this.updateUI();
  }

  // calculate needs decay based on how much time has passed on page load
  adjustNeedsBasedOnTimePassed(timePassed) {
    const hungerDecay = timePassed / this.hungerDecayRate;
    const funDecay = timePassed / this.funDecayRate;
    const sleepDecay = timePassed / this.sleepDecayRate;

    this.hunger = Math.max(this.hunger - Math.floor(hungerDecay), 0);
    this.fun = Math.max(this.fun - Math.floor(funDecay), 0);
    this.sleep = Math.max(this.sleep - Math.floor(sleepDecay), 0);
  }

  // feed
  feed() {
    if (this.awake) {
      this.hunger = Math.min(this.hunger + 30, 100);
      this.saveState();
      this.updateUI();
    }
  }

  // play
  play() {
    if (this.awake) {
      this.fun = Math.min(this.fun + 30, 100);
      this.saveState();
      this.updateUI();
    }
  }

  // update ui elements to match status
  updateUI() {
    // get status the elements
    this.hungerElement.textContent = this.hunger;
    this.funElement.textContent = this.fun;
    this.sleepElement.textContent = this.sleep;

    // progress bars
    document.getElementById("hunger-progress").value = this.hunger;
    document.getElementById("fun-progress").value = this.fun;
    document.getElementById("sleep-progress").value = this.sleep;

    // // brightness to indicate status is low
    // if (this.hunger < 30 || this.fun < 30 || this.sleep < 30) {
    //   this.avatarElement.style.filter = "brightness(0.6)";
    // } else {
    //   this.avatarElement.style.filter = "brightness(1)";
    // }
  }

  // save the values of each status to local storage for persistance
  saveState() {
    localStorage.setItem("hunger", JSON.stringify(this.hunger));
    localStorage.setItem("fun", JSON.stringify(this.fun));
    localStorage.setItem("sleep", JSON.stringify(this.sleep));
    localStorage.setItem("awake", JSON.stringify(this.awake));
    localStorage.setItem(
      "isRealisticMode",
      JSON.stringify(this.isRealisticMode)
    );
    localStorage.setItem("lastActive", Date.now());
  }

  // load the last state from localstorage if exists
  loadState(key, defaultValue) {
    const savedValue = localStorage.getItem(key);
    return savedValue !== null ? JSON.parse(savedValue) : defaultValue;
  }

  // reset game values and values in local storage
  resetGame() {
    localStorage.clear();
    location.reload();
  }
}

// new tamagotchi object
const tamagotchi = new Tamagotchi();

// set event listeners on dom buttons
document
  .getElementById("feed-btn")
  .addEventListener("click", () => tamagotchi.feed());
document
  .getElementById("play-btn")
  .addEventListener("click", () => tamagotchi.play());
document
  .getElementById("toggle-mode-btn")
  .addEventListener("click", () => tamagotchi.toggleMode());
document
  .getElementById("reset-btn")
  .addEventListener("click", () => tamagotchi.resetGame());
