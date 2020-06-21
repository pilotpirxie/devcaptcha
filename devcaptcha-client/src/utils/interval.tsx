/**
 * Wait time before resolve
 * @param time
 */
export default function wait(time : number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}