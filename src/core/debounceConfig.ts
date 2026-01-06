export type DebounceConfig = false | {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
};

export const DEBOUNCE_CONFIG: Record<string, DebounceConfig> = {
  // No debounce
  checkbox: false,
  switch: false,
  radio: false,
  dropdown: false,
  "multi-selection": false,
  color: false,
  rating: false,
  file: false,
  image: false,
  separator: false,

  // Standard text inputs
  string: { wait: 200 },
  text: { wait: 200 },
  multiline: { wait: 200 },
  email: { wait: 200 },
  password: { wait: 200 },
  phone: { wait: 200 },
  url: { wait: 200 },
  int: { wait: 200 },
  float: { wait: 200 },
  unit: { wait: 100 },

  // Date / time
  date: { wait: 150 },
  time: { wait: 150 },

  // Continuous
  slider: { wait: 100, leading: true, trailing: true },
  stepper: { wait: 100, leading: true, trailing: true },
};
