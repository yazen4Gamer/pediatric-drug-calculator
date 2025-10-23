export function evaluate(equation, weight) {
  const parsed = equation.replace(/W/g, weight);
  return new Function(`return ${parsed}`)();
}