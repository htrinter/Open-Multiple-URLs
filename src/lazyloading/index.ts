export function init(): void {
  document.title =
    '[' +
    window.location.hash
      .substr(1)
      .replace('http://', '')
      .replace('https://', '') +
    ']';

  // load site on focus
  window.addEventListener(
    'focus',
    () => {
      window.location.assign(window.location.hash.substr(1));
    },
    false
  );
}
init();
