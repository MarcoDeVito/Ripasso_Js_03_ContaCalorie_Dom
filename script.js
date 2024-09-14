const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
let isError = false;

// Load saved data from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
  loadSavedData();
});

function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  const HTMLString = `
  <label for="${entryDropdown.value}-${entryNumber}-name">Voce ${entryNumber} Nome</label>
  <input class="rounded border border-opacity-10" type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Nome" />
  <label for="${entryDropdown.value}-${entryNumber}-calories">Voce ${entryNumber} Calorie</label>
  <input class="rounded border border-opacity-10"
    type="number"
    min="0"
    id="${entryDropdown.value}-${entryNumber}-calories"
    placeholder="Calorie"
  />`;
  
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
  let entry = document.querySelectorAll(".rounded");


  entry.forEach(input => input.addEventListener("focus", () => {
      // console.log("saved");

      saveData();
  }))
  // Save new entry to localStorage
  saveData();

  // Save new entry to localStorage
  saveData();
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const breakfastNumberInputs = document.querySelectorAll('#breakfast input[type=number]');
  const lunchNumberInputs = document.querySelectorAll('#lunch input[type=number]');
  const dinnerNumberInputs = document.querySelectorAll('#dinner input[type=number]');
  const snacksNumberInputs = document.querySelectorAll('#snacks input[type=number]');
  const exerciseNumberInputs = document.querySelectorAll('#exercise input[type=number]');

  const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
  const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
  const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
  const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
  const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
  const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

  if (isError) {
    return;
  }

  const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
  const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
  const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';
  output.innerHTML = `
  <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}</span>
  <hr>
  <p>${budgetCalories} Calorie previste</p>
  <p>${consumedCalories} Calorie consumate</p>
  <p>${exerciseCalories} Calorie bruciate</p>
  `;

  output.classList.remove('hide');

  // Save data to localStorage
  saveData();
}

function getCaloriesFromInputs(list) {
  let calories = 0;

  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Input non valido: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));

  for (const container of inputContainers) {
    container.innerHTML = '';
  }

  budgetNumberInput.value = '';
  output.innerText = '';
  output.classList.add('hide');

  // Clear localStorage
  localStorage.clear();
}

function saveData() {
  const data = {
    budget: budgetNumberInput.value,
    entries: {}
  };

  const inputContainers = Array.from(document.querySelectorAll('.input-container'));
  inputContainers.forEach(container => {
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      data.entries[input.id] = input.value;
    });
  });

  localStorage.setItem('calorieCounterData', JSON.stringify(data));
}

function loadSavedData() {
  const savedData = JSON.parse(localStorage.getItem('calorieCounterData'));
  if (!savedData) return;
  console.log(savedData);
  

  // Set budget input value
  budgetNumberInput.value = savedData.budget || '';

  // Iterate over saved entries and recreate them
  for (const [id, value] of Object.entries(savedData.entries)) {
    const containerId = id.split('-')[0]; 
    const targetInputContainer = document.querySelector(`#${containerId} .input-container`);

    // Check if the input field already exists; if not, create it
    if (!document.getElementById(id)) {
      const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
      const HTMLString = `
      <label for="${containerId}-${entryNumber}-name">Voce ${entryNumber} Nome</label>
      <input class="rounded border border-opacity-10" type="text" id="${containerId}-${entryNumber}-name" placeholder="Nome" />
      <label for="${containerId}-${entryNumber}-calories">Voce ${entryNumber} Calorie</label>
      <input class="rounded border border-opacity-10"
        type="number"
        min="0"
        id="${containerId}-${entryNumber}-calories"
        placeholder="Calorie"
      />`;
      targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
    }

    // Set the input field value
    document.getElementById(id).value = value;
  }
}

addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener("click", clearForm);
