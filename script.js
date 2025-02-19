class TimeInputBox {
  constructor(inputBoxNode, inputBoxValue = '') {

    this.value = inputBoxValue;
    this.node = inputBoxNode;

    // edits the text value to show proper colons, called on textbox edit
    this.node.addEventListener('input', function(e) {
      this.value = formatTime(this.value);
    });
    // Pressing 'bksp' or 'del' clears the whole text input
    this.node.addEventListener('keydown', e => {
      let key = e.key;
      if (key === "Backspace" || key === "Delete") e.target.value = '';
    });

    return this.node; // return the input box with the 2 behaviors as a node
  }
}

// create a TimeEntry Object Constructor
class TimeEntry {
  constructor(value, parentNode) {  
    this.value = value; // this should already be formatted (H:MM:SS)
    this.parentNode = parentNode; // this would be the <li> that the 'normalDiv <div> is under
    
    // normalDiv should display the time entry, and an edit and remove options
    const normalDiv = document.createElement('div');
    this.normalDiv = normalDiv;
    
    const textNode = document.createElement('span');
    textNode.textContent = this.value;
    this.textNode = textNode;
    normalDiv.appendChild(textNode);

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', this.edit.bind(this));
    normalDiv.appendChild(editButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', this.remove.bind(this));
    normalDiv.appendChild(removeButton);

    return normalDiv;
  }

  edit() {
    const editDiv = document.createElement('div');

    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    // inputBox.id = 'inputBox'; // Add an id to identify this input
    inputBox.addEventListener('input', function(e) {
      this.value = formatTime(this.value);
    });

    const editTimeInputBox = new TimeInputBox(inputBox, this.value);
    editTimeInputBox.value = this.value;
    this.editTimeInputBox = editTimeInputBox;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel'

    // Create a new div to hold the edit interface
    editDiv.appendChild(editTimeInputBox);
    editDiv.appendChild(confirmButton);
    editDiv.appendChild(cancelButton);  

    // Replace the original text node with the edit interface
    this.parentNode.innerHTML = '';
    this.parentNode.appendChild(editDiv);

    // Add event listeners for confirmation and cancellation
    confirmButton.addEventListener('click', this.confirmAction.bind(this));
    cancelButton.addEventListener('click', this.cancelAction.bind(this));
  }

  remove() {
    const parentLi = this.parentNode;
    if (parentLi && parentLi.tagName.toLowerCase() === 'li') {
      parentLi.remove();
      updateAverageTime();
    }
  }

  confirmAction() {
    this.parentNode.innerHTML = '';
    this.value = this.editTimeInputBox.value;
    this.textNode.textContent = this.value;
    this.parentNode.appendChild(this.normalDiv);
    updateAverageTime();

    // TODO: migrate confirmAction() to do both remove and edit actions
    // TODO: pressing Enter key should also confirm the edit action
  }

  cancelAction() {
    // Go back to initial normalDiv interface
    this.parentNode.innerHTML = '';
    this.parentNode.appendChild(this.normalDiv);
  }
}

// newTimeInputBox and timeListUl are both GLOBAL variables
const newTimeInputBox = new TimeInputBox(document.getElementById('timeInput'));
const timeListUl = document.getElementById('timeList');

// when user Clicks 'Add Time' or presses 'Enter' in 'timeInput',
// then, add the entered time into the list. It calls addTime()
document.getElementById('addTimeButton').addEventListener('click', addTime);
newTimeInputBox.addEventListener('keypress', function(e) { if (e.key === 'Enter') addTime(); });

// creates a new entry in the timeList through the HTML
function addTime() {
  const timeValue = newTimeInputBox.value;
  if (timeValue) {
    const newTimeLi = document.createElement('li');
    const newTimeEntry = new TimeEntry(timeValue, newTimeLi);
    
    newTimeLi.appendChild(newTimeEntry);
    timeListUl.appendChild(newTimeLi);
    newTimeInputBox.value = '';
    updateAverageTime();
  }
}

// updates the time under 'Current AHT' label into the average of the day
function updateAverageTime() {
  let timeList = document.getElementById('timeList').getElementsByTagName('li');
  let totalSeconds = 0;
  let averageTime = document.getElementById('averageTime');
  if (timeList.length == 0) return averageTime.textContent = '00:00:00';
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
  averageTime.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// input: string, return: formattedTime (H:MM:SS)
function formatTime(value) {
  value = value.replace(/\D/g, ''); // remove non-digit characters
  if (isNaN(value)) value = ''; // if NaN, turn into empty string
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
    return formattedTime; // return the formatted string
  }
}

// TEST CODE BLOCK
window.onload = () => {
  newTimeInputBox.value = "10:00";
  addTime();
  newTimeInputBox.value = "05:00";
  addTime();
}