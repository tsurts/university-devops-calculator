export function calculate(left, operator, right) {
  if (!Number.isFinite(left) || !Number.isFinite(right)) {
    throw new Error('Enter valid numbers');
  }
  let result;
  switch (operator) {
    case '+': result = left + right; break;
    case '-': result = left - right; break;
    case '*': result = left * right; break;
    case '/':
      if (right === 0) throw new Error('Cannot divide by zero');
      result = left / right;
      break;
    default: throw new Error('Choose an operation');
  }
  if (!Number.isFinite(result)) throw new Error('Result is too large');
  return Number(result.toPrecision(12));
}
