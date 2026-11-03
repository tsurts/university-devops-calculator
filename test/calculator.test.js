import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate } from '../src/calculator.js';

test('adds two numbers', () => assert.equal(calculate(2, '+', 3), 5));
test('subtracts and supports negative results', () => assert.equal(calculate(3, '-', 8), -5));
test('multiplies', () => assert.equal(calculate(7, '*', 6), 42));
test('divides', () => assert.equal(calculate(9, '/', 4), 2.25));
test('handles floating point decimals', () => assert.equal(calculate(0.1, '+', 0.2), 0.3));
test('rejects division by zero', () => assert.throws(() => calculate(5, '/', 0), /zero/));
test('rejects unsupported operators', () => assert.throws(() => calculate(2, '%', 3), /operation/));
test('rejects invalid inputs', () => {
  for (const value of [NaN, Infinity, '2', null]) {
    assert.throws(() => calculate(value, '+', 1), /valid numbers/);
    assert.throws(() => calculate(1, '+', value), /valid numbers/);
  }
});
test('rejects overflow', () => assert.throws(() => calculate(Number.MAX_VALUE, '*', 2), /too large/));
