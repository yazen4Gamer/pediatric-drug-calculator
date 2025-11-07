// src/renderer/scripts/calc/utils/math-helper.js
// Utility function to evaluate mathematical equations with a given weight
export function evaluate(equation, weight) {
  const parsed = equation.replace(/W/g, weight);
  return new Function(`return ${parsed}`)();
}