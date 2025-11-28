/**
 * CSS class constants and helpers
 */
export const CSS_CLASSES = {
  field: 'reactaform-field',
  label: 'reactaform-label',
  input: 'reactaform-input',
  textInput: 'reactaform-input--text',
  inputNumber: 'reactaform-input--number',
  inputSelect: 'reactaform-select',
  rangeInput: 'reactaform-input--range',
  button: 'reactaform-button',
} as const;

export const combineClasses = (
  ...classes: (string | undefined | null | false | Record<string, boolean>)[]
): string => {
  const result: string[] = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') result.push(cls);
    else if (typeof cls === 'object') {
      Object.entries(cls).forEach(([className, condition]) => {
        if (condition) result.push(className);
      });
    }
  }
  return result.join(' ');
};
