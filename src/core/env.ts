// General runtime environment flags used across the core package
export const IS_TEST_ENV =
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "test";
