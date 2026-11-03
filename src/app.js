import { calculate } from './calculator.js';

function createCalculator(root, activate) {
  const display = root.querySelector('.display');
  const expression = root.querySelector('.expression');
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
  root.querySelector('.keys').addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button) {
      activate(root);
      action(button.dataset.value);
    }
  });

  root.addEventListener('pointerdown', () => activate(root));
  root.addEventListener('focusin', () => activate(root));
  return { action };
}

const stage = document.querySelector('.stage');
const primary = document.querySelector('.primary');
const secondary = primary.cloneNode(true);
secondary.className = 'calculator secondary';
secondary.id = 'second-calculator';
secondary.setAttribute('aria-label', 'Second calculator');
secondary.querySelector('.display').id = 'second-display';
secondary.querySelector('.expression').id = 'second-expression';
secondary.inert = true;
stage.insertBefore(secondary, primary);

const secondToggle = document.querySelector('#second-toggle');
const tankToggle = document.querySelector('#tank-toggle');
const tankView = document.querySelector('#tank-view');
let activeRoot = primary;
let hasSecond = false;
let tankMode = false;

function activate(root) {
  activeRoot = root;
  for (const card of [primary, secondary]) card.classList.toggle('is-active', card === root);
}
const calculators = new Map([
  [primary, createCalculator(primary, activate)],
  [secondary, createCalculator(secondary, activate)]
]);

secondToggle.addEventListener('click', () => {
  hasSecond = !hasSecond;
  stage.classList.toggle('has-second', hasSecond);
  secondToggle.setAttribute('aria-pressed', String(hasSecond));
  secondary.inert = !hasSecond;
  if (!hasSecond && activeRoot === secondary) activate(primary);
});

tankToggle.addEventListener('click', () => {
  tankMode = !tankMode;
  stage.classList.toggle('tank-mode', tankMode);
  tankToggle.setAttribute('aria-pressed', String(tankMode));
  tankToggle.textContent = tankMode ? 'Back to calculator' : 'Tank';
  tankView.hidden = !tankMode;
  secondToggle.disabled = tankMode;
  primary.inert = tankMode;
  secondary.inert = tankMode || !hasSecond;
});

document.addEventListener('keydown', (event) => {
  if (tankMode || event.ctrlKey || event.metaKey || event.altKey || event.key === 'Tab') return;
  if (event.target.closest('.toolbar, input, textarea, select, [contenteditable="true"]')) return;
  const value = ({ Enter: '=', Escape: 'clear', Backspace: 'back', Delete: 'clear' })[event.key] ?? event.key;
  if (/^[0-9.+*/=-]$/.test(value) || ['clear', 'back'].includes(value)) {
    event.preventDefault();
    const root = event.target.closest('.calculator') ?? activeRoot;
    activate(root);
    calculators.get(root).action(value);
  }
});
