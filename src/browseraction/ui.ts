export interface UIDef {
  txtArea: HTMLTextAreaElement;
  lazyLoadCheckbox: HTMLInputElement;
  randomCheckbox: HTMLInputElement;
  preserveCheckbox: HTMLInputElement;
  openButton: HTMLInputElement;
  extractButton: HTMLInputElement;
}

export function getUIDef(): UIDef {
  return {
    txtArea: document.getElementById('urls') as HTMLTextAreaElement,
    lazyLoadCheckbox: document.getElementById('lazyLoad') as HTMLInputElement,
    randomCheckbox: document.getElementById('random') as HTMLInputElement,
    preserveCheckbox: document.getElementById('preserve') as HTMLInputElement,
    openButton: document.getElementById('open') as HTMLInputElement,
    extractButton: document.getElementById('extract') as HTMLInputElement,
  };
}
