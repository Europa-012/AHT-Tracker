document.getElementById('timeInput').addEventListener('input', function(e) {
  let value = this.value;
  if (isNaN(value)) this.value = ''; // accept only numbers
  value = value.replace(/\D/g, ''); // remove non-digit characters
  if (value) {
    // format string (consisting of only digits) into H:MM:SS
    let formattedTime;
    if (value.length <= 2) {
      formattedTime = `${value}`;
    } else if (value.length <= 4) {
      let m = value.slice(0, -2);
      let s = value.slice(-2);
      formattedTime = `${m}:${s}`;
    } else {
      let h = value.slice(-6, -4);
      let m = value.slice(-4, -2);
      let s = value.slice(-2);
      formattedTime = `${h}:${m}:${s}`;
    }
    this.value = formattedTime; // return the formatted string
  }
});
document.getElementById('timeInput').addEventListener('keydown', e => {
  // Pressing 'bksp' or 'del' clears the whole text input
  const key = e.key;
  if (key === "Backspace" || key === "Delete") e.target.value = '';
});

// when user Clicks 'Add Time' or presses 'Enter' in 'timeInput',
// then, add the entered time into the list
document.getElementById('addTimeButton').addEventListener('click', addTime);
document.getElementById('timeInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addTime();
});

function addTime() {
  let timeInput = document.getElementById('timeInput');
  let timeValue = timeInput.value;
  if (timeValue) {
    let timeList = document.getElementById('timeList');
    let newTime = document.createElement('li');
    newTime.textContent = timeValue;

    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', function() {
      timeList.removeChild(newTime);
      updateAverageTime();
    });

    newTime.appendChild(removeButton);
    timeList.appendChild(newTime);
    timeInput.value = '';
    updateAverageTime();
  }
}

function updateAverageTime() {
  let timeList = document.getElementById('timeList').getElementsByTagName('li');
  let totalSeconds = 0;
  for (let time of timeList) {
    let parts = time.textContent.split(':').reverse();
    let seconds = 0;
    if (parts.length === 3) {
      seconds += parseInt(parts[2], 10) * 3600;
    }
    if (parts.length >= 2) {
      seconds += parseInt(parts[1], 10) * 60;
    }
    seconds += parseInt(parts[0], 10);
    totalSeconds += seconds;
  }
  let averageSeconds = totalSeconds / timeList.length;
  let h = Math.floor(averageSeconds / 3600);
  let m = Math.floor((averageSeconds % 3600) / 60);
  let s = Math.floor(averageSeconds % 60);
  document.getElementById('averageTime').textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}