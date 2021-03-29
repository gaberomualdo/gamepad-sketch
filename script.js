const FPS = 100;
const VELOCITY_MULTIPLIER = 3.8;

const roundVelocity = (x) => {
  if (Math.abs(x) < 0.57) {
    return 0;
  }
  return x;
};

const colors = {
  'wet asphalt': 'rgb(52, 73, 94)',
  amethyst: 'rgb(155, 89, 182)',
  'peter river': 'rgb(52, 152, 219)',
  turquoise: 'rgb(26, 188, 156)',
  emerald: 'rgb(46, 204, 113)',
  'green sea': 'rgb(22, 160, 133)',
  nephritis: 'rgb(39, 174, 96)',
  alizarin: 'rgb(231, 76, 60)',
  pumpkin: 'rgb(211, 84, 0)',
  orange: 'rgb(243, 156, 18)',
  'sun flower': 'rgb(241, 196, 15)',
  concrete: 'rgb(149, 165, 166)',
  silver: 'rgb(189, 195, 199)',
};
const thicknesses = {
  1: 'rgb(52, 73, 94)',
  2: 'rgb(52, 73, 94)',
  3: 'rgb(52, 73, 94)',
  4: 'rgb(52, 73, 94)',
  5: 'rgb(52, 73, 94)',
  10: 'rgb(52, 73, 94)',
  20: 'rgb(52, 73, 94)',
  30: 'rgb(52, 73, 94)',
  40: 'rgb(52, 73, 94)',
  50: 'rgb(52, 73, 94)',
  100: 'rgb(52, 73, 94)',
};

let defaultPlayerObject = {
  position: [0, 0],
  velocity: [0, 0],
  color: 'wet asphalt',
  thickness: 5,
  forcePerpendicular: false,
  buttonPressStates: {},
};
let playerData = [null, null, null, null];

const canvas = document.querySelector('.canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

// app loop
setInterval(() => {
  const gamepads = getGamepads();
  if (gamepads.length === 0) {
    document.querySelector('.desc').classList.add('displayed');
  } else {
    document.querySelector('.desc').classList.remove('displayed');
  }
  gamepads.forEach((gamepad, i) => {
    if (!playerData[i]) {
      // initialize player
      playerData[i] = defaultPlayerObject.clone();
    }
    const { position, velocity, buttonPressStates } = playerData[i];
    playerData[i].position[0] = assertContraints(position[0] + velocity[0], 0, window.innerWidth);
    playerData[i].position[1] = assertContraints(position[1] + velocity[1], 0, window.innerHeight);

    playerData[i].velocity = [roundVelocity(gamepad.axes[0] * VELOCITY_MULTIPLIER), roundVelocity(gamepad.axes[1] * VELOCITY_MULTIPLIER)];

    if (playerData[i].forcePerpendicular) {
      if (Math.abs(playerData[i].velocity[1]) > Math.abs(playerData[i].velocity[0])) {
        playerData[i].velocity[0] = 0;
      } else {
        playerData[i].velocity[1] = 0;
      }
    }

    const cursorElm = document.querySelector(`.cursor:nth-child(${i + 1})`);
    cursorElm.style.left = playerData[i].position[0] + 'px';
    cursorElm.style.top = playerData[i].position[1] + 'px';

    // draw
    if (gamepad.buttons[6].pressed) {
      ctx.fillStyle = colors[playerData[i].color];
      ctx.beginPath();
      ctx.arc(playerData[i].position[0], playerData[i].position[1], playerData[i].thickness, 0, 2 * Math.PI);
      ctx.fill();
    }
    // clear
    if (gamepad.buttons[4].pressed && gamepad.buttons[5].pressed && !(buttonPressStates[4] && buttonPressStates[5])) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      activateBtn('clear-canvas');
    }
    // perpendicular
    if (gamepad.buttons[7].pressed && !buttonPressStates[7]) {
      playerData[i].forcePerpendicular = !playerData[i].forcePerpendicular;
      document.querySelector('.force-perpendicular strong').innerText = `${playerData[i].forcePerpendicular ? 'Unf' : 'F'}orce Perpendicular`;
      activateBtn('force-perpendicular');
    }
    if (gamepad.buttons[9].pressed && !buttonPressStates[9]) {
      downloadCanvas();
    }

    // modals
    const colorModal = document.querySelector('.modal.change-color');
    const thicknessModal = document.querySelector('.modal.change-thickness');
    const colorsOpen = colorModal.classList.contains('active');
    const thicknessOpen = thicknessModal.classList.contains('active');
    if ([thicknessOpen, colorsOpen].filter((e) => e === true).length === 0) {
      if (gamepad.buttons[2].pressed && !buttonPressStates[2]) {
        initializeModal(colorModal, colors, 'color');
        colorModal.classList.add('active');
      }
      if (gamepad.buttons[3].pressed && !buttonPressStates[3]) {
        initializeModal(thicknessModal, thicknesses, 'thickness');
        thicknessModal.classList.add('active');
      }
    } else {
      let activeModal;
      [colorModal, thicknessModal].forEach((modal) => {
        if (modal.classList.contains('active')) {
          activeModal = modal;
        }
      });

      if (gamepad.buttons[1].pressed && !buttonPressStates[1]) {
        activeModal.classList.remove('active');
      }

      if ((gamepad.axes[1] > 0.5 && !buttonPressStates[18]) || (gamepad.buttons[13].pressed && !buttonPressStates[13])) {
        // move down
        const hovered = activeModal.querySelector(`.cols > *:nth-child(${i + 1}) > .hovered`);
        const newHovered = hovered.nextElementSibling;
        if (newHovered) {
          hovered.classList.remove('hovered');
          newHovered.classList.add('hovered');
        }
      } else if ((gamepad.axes[1] < -0.5 && !buttonPressStates[18]) || (gamepad.buttons[12].pressed && !buttonPressStates[12])) {
        // move up
        const hovered = activeModal.querySelector(`.cols > *:nth-child(${i + 1}) > .hovered`);
        const newHovered = hovered.previousElementSibling;
        if (newHovered) {
          hovered.classList.remove('hovered');
          newHovered.classList.add('hovered');
        }
      }
      if (gamepad.buttons[0].pressed && !buttonPressStates[0]) {
        const newVal = activeModal.querySelector(`.cols > *:nth-child(${i + 1}) > .hovered`).innerHTML;
        if (thicknessOpen) {
          playerData[i].thickness = parseInt(newVal);
          initializeModal(thicknessModal, thicknesses, 'thickness');
        } else {
          playerData[i].color = newVal;
          initializeModal(colorModal, colors, 'color');
        }
      }
    }

    playerData[i].buttonPressStates = gamepad.buttons.map((e) => e.pressed).concat(gamepad.axes.map((e) => Math.abs(e) > 0.5));
  });
}, 1000 / FPS);
