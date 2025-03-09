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
      // else if (key === "Enter") {
      //   console.log('enter angels high');
      //   // if (this.node.id === 'newTimeInput') addTime();
      //   // else if (this.node.id === 'editInputBox') console.log(this.node.id);
      //   // else console.log('Error: Unknown node ID');
      // } // WTF IS THIS????
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
    editButton.className = 'time-list-button';
    editButton.addEventListener('click', this.edit.bind(this));
    normalDiv.appendChild(editButton);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'time-list-button';
    removeButton.addEventListener('click', this.remove.bind(this));
    normalDiv.appendChild(removeButton);

    return normalDiv;
  }

  edit() {
    preventNewTime(true);
    const editDiv = document.createElement('div');

    const inputBox = document.createElement('input');
    inputBox.setAttribute('type', 'text');
    // inputBox.id = 'editInputBox'; // Add an id to identify this input
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
    editTimeInputBox.select();

    // Add event listeners for confirmation and cancellation
    confirmButton.addEventListener('click', this.confirmEdit.bind(this));
    cancelButton.addEventListener('click', this.cancelAction.bind(this));
    editTimeInputBox.addEventListener('keydown', e => {
      const key = e.key
      if (key === "Enter") { this.confirmEdit() }
      else if (key === "Escape") { this.cancelAction() }
    });
    
    // editTimeInputBox.focus();
    // // cancel when losing focus
    // editTimeInputBox.addEventListener('focusout', console.log(`omg it's happening`));
  }

  remove() {
    preventNewTime(true);
    const removeDiv = document.createElement('div');

    const textLabel = document.createElement('span');
    textLabel.textContent = 'Remove?';

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel'
    
    // Create a new div to hold the edit interface
    removeDiv.appendChild(textLabel);
    removeDiv.appendChild(confirmButton);
    removeDiv.appendChild(cancelButton);

    // Replace the original text node with the edit interface
    this.parentNode.innerHTML = '';
    this.parentNode.appendChild(removeDiv);

    // Add event listeners for confirmation and cancellation
    confirmButton.addEventListener('click', this.confirmRemove.bind(this));
    cancelButton.addEventListener('click', this.cancelAction.bind(this));

    // Enabling keyboard shortcuts
    confirmButton.focus();
    confirmButton.addEventListener('keydown', e => {
      const key = e.key
      if (key === "Enter" || key === "Space") { this.confirmRemove() }
      else if (key === "Escape") { this.cancelAction() }
    });
  }

  confirmEdit() {
    this.parentNode.innerHTML = '';
    this.value = this.editTimeInputBox.value;
    this.textNode.textContent = this.value;
    this.parentNode.appendChild(this.normalDiv);
    updateAverageTime();
    preventNewTime(false)
  }

  confirmRemove() {
    const parentLi = this.parentNode;
    if (parentLi && parentLi.tagName.toLowerCase() === 'li') {
      parentLi.remove();
      updateAverageTime();
      preventNewTime(false);
    }
  }

  cancelAction() {
    // Go back to initial normalDiv interface
    this.parentNode.innerHTML = '';
    this.parentNode.appendChild(this.normalDiv);
    preventNewTime(false);
  }
}

// newTimeInputBox and timeListUl are both GLOBAL variables
const newTimeInputBox = new TimeInputBox(document.getElementById('newTimeInput'));
// newTimeInputBox.focus(); // DON'T FORGET TO ENABLE FOR DEPLOYMENT
const newTimeButton = document.getElementById('addTimeButton');
const timeListUl = document.getElementById('timeList');

// when user Clicks 'Add Time' or presses 'Enter' in 'newTimeInput',
// then, add the entered time into the list. It calls addTime()
newTimeButton.addEventListener('click', addTime);
newTimeInputBox.addEventListener('keypress', e => { if (e.key === 'Enter') addTime(); });

// creates a new entry in the timeList through the HTML
function addTime() {
  const timeValue = newTimeInputBox.value;
  if (timeValue) {
    const newTimeLi = document.createElement('li');
    newTimeLi.className = 'time-list-item';
    const newTimeEntry = new TimeEntry(timeValue, newTimeLi);
    
    newTimeLi.appendChild(newTimeEntry);
    timeListUl.insertBefore(newTimeLi, timeListUl.children[0]);
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
    // TODO: value overflow 60+ mins? 60+ seconds?
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

function preventNewTime(disableNewTime) {
  if (disableNewTime) {
    newTimeInputBox.disabled = true;
    newTimeButton.disabled = true;
  } else {
    newTimeInputBox.disabled = false;
    newTimeButton.disabled = false;
    newTimeInputBox.focus();
  }
}

// TEST CODE BLOCK
window.onload = () => {
  // newTimeInputBox.value = "10:00";
  // addTime();
  // newTimeInputBox.value = "05:00";
  // addTime();
  let x = 50
  for (i = 0; i < x; i++) {
    newTimeInputBox.value = formatTime(String(Math.floor(Math.random() * 2000) + 1));
    addTime();
  }
}