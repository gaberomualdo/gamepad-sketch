Object.prototype.clone = function () {
  return JSON.parse(JSON.stringify(this));
};
const assertContraints = (value, lower, upper) => {
  value = Math.min(value, upper);
  value = Math.max(value, lower);
  return value;
};
const activateBtn = (clsname) => {
  document.querySelector(`.${clsname}`).classList.add('active');
  setTimeout(() => {
    document.querySelector(`.${clsname}`).classList.remove('active');
  }, 200);
};
const getGamepads = () => {
  const ret = [];
  const gp = navigator.getGamepads();
  for (let i = 0; i < 4; i++) {
    if (gp[i]) {
      ret.push(gp[i]);
    }
  }
  return ret;
};
const initializeModal = (modal, contents, dataKey) => {
  const colsElm = modal.querySelector('.cols');
  colsElm.innerHTML = '';
  getGamepads().forEach((_, i) => {
    let colHTML = '<div class="col">';
    let active = playerData[i][dataKey];
    Object.keys(contents).forEach((k) => {
      colHTML += `<div class='${k == active ? 'active hovered' : ''}' style='--theme: ${contents[k]}'>${k}</div>`;
    });
    colHTML += '</div>';
    colsElm.innerHTML += colHTML;
  });
};

const downloadCanvas = () => {
  let dt = canvas.toDataURL('image/png');
  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
  dt = dt.replace(
    /^data:application\/octet-stream/,
    'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=drawing.png'
  );
  let elm = document.createElement('a');
  elm.setAttribute('download', 'drawing.png');
  elm.href = dt;
  elm.click();
};
