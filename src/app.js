import { calculate } from './calculator.js';

const display = document.querySelector('#display');
const expression = document.querySelector('#expression');
let entry = '0';
let stored = null;
let operator = null;
let fresh = false;
let failed = false;

function render() { display.textContent = entry; }
function clear() {
  entry = '0'; stored = null; operator = null; fresh = false; failed = false;
  expression.textContent = 'Ready when you are'; render();
}
function input(value) {
  if (failed) clear();
  if (fresh) {
    entry = '0'; fresh = false;
    if (!operator) expression.textContent = 'Ready when you are';
  }
  if (value === '.') {
    if (!entry.includes('.')) entry += '.';
  } else if (entry.replace(/[-.]/g, '').length < 12) {
    entry = entry === '0' ? value : entry + value;
  }
  render();
}
function choose(next) {
  if (failed) return;
  if (operator && !fresh) equals();
  if (failed) return;
  stored = Number(entry); operator = next; fresh = true;
  expression.textContent = entry + ' ' + ({ '*': '×', '/': '÷' }[next] ?? next);
}
function equals() {
  if (!operator || fresh || failed) return;
  try {
    const right = Number(entry);
    const result = calculate(stored, operator, right);
    expression.textContent = stored + ' ' + ({ '*': '×', '/': '÷' }[operator] ?? operator) + ' ' + entry + ' =';
    entry = String(result); operator = null; stored = null; fresh = true; render();
  } catch (error) {
    entry = error.message; failed = true; render();
  }
}
function action(value) {
  if (/^[0-9.]$/.test(value)) input(value);
  else if (['+', '-', '*', '/'].includes(value)) choose(value);
  else if (value === '=') equals();
  else if (value === 'clear') clear();
  else if (value === 'sign' && !failed) {
    entry = String(-Number(entry)); render();
  } else if (value === 'back' && !failed && !fresh) {
    entry = entry.length > 1 ? entry.slice(0, -1) : '0';
    if (entry === '-') entry = '0';
    render();
  }
}
document.querySelector('.keys').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) action(button.dataset.value);
});
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;
  const value = ({ Enter: '=', Escape: 'clear', Backspace: 'back', Delete: 'clear' })[event.key] ?? event.key;
  if (/^[0-9.+*/=-]$/.test(value) || ['clear', 'back'].includes(value)) {
    event.preventDefault(); action(value);
  }
});
