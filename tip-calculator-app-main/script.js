let inputBillValue = 0;
let inputTipRatio = 0;
let numberOfPeople = 0;
let tipPerPerson;
let amountPerPerson;

const totalPerson = document.querySelector('.total-person');
const tipPerson = document.querySelector('.tip-person');
const inputCustomValue = document.querySelector('#custom');
const inputRadioButtons = document.querySelectorAll('input[name="tip"]');
const resetButton = document.querySelector('.reset');

function addGlobalListener(event, selector, cb) {
  document.addEventListener(event, (e) => {
    if (e.target.matches(selector)) cb(e);
  });
}
function getCustomTip(e) {
  inputTipRatio = +e.target.value * 0.01;
}
function getBill(e) {
  inputBillValue = +e.target.value;
}
function getPeople(e) {
  numberOfPeople = +e.target.value;
}
function setOutputCardValue() {
  if (numberOfPeople > 0) {
    tipPerPerson = (inputBillValue * inputTipRatio) / numberOfPeople;
    amountPerPerson = inputBillValue / numberOfPeople + tipPerPerson;
    totalPerson.innerText = `$${amountPerPerson.toFixed(2)}`;
    tipPerson.innerText = `$${tipPerPerson.toFixed(2)}`;
  }
}

addGlobalListener('click', "input[name='tip']", (e) => {
  inputTipRatio = +e.target.value * 0.01;
  inputCustomValue.value = '';
});
addGlobalListener('change', '#custom', getCustomTip);
addGlobalListener('keyup', '#custom', getCustomTip);
addGlobalListener('change', '#bill', getBill);
addGlobalListener('keyup', '#bill', getBill);
addGlobalListener('change', '#people', getPeople);
addGlobalListener('keyup', '#people', getPeople);
inputCustomValue.addEventListener('focus', () => {
  inputTipRatio = 0;
  inputRadioButtons.forEach((button) => {
    button.checked = false;
  });
});
document.addEventListener('keyup', setOutputCardValue);
document.addEventListener('click', setOutputCardValue);
resetButton.addEventListener('click', () => {
  document.querySelectorAll('form').forEach((form) => {
    form.reset();
  });
});
