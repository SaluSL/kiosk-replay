export const log = {
  info: (message: string) => {
    console.log(message);
  },
  error: (message: string) => {
    console.error(message);
  },
  warn: (message: string) => {
    console.warn(message);
  },
  debug: (message: unknown) => {
    console.debug(message);
  },
  trace: (message: string) => {
    console.trace(message);
  },
};
