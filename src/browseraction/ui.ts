export interface UIDef {
  txtArea: HTMLTextAreaElement;
  lazyLoadCheckbox: HTMLInputElement;
  randomCheckbox: HTMLInputElement;
  reverseCheckbox: HTMLInputElement;
  preserveCheckbox: HTMLInputElement;
  ignoreDuplicatesCheckbox: HTMLInputElement;
  openButton: HTMLInputElement;
  extractButton: HTMLInputElement;
  tabCount: HTMLSpanElement;
  tabCountNumber: HTMLSpanElement;
  tabCountTabLabel: HTMLSpanElement;
  tabCountIgnored: HTMLSpanElement;
  tabCountIgnoredNumber: HTMLSpanElement;
}

export function getUIDef(): UIDef {
  return {
    txtArea: document.getElementById('urls') as HTMLTextAreaElement,
    lazyLoadCheckbox: document.getElementById('lazyLoad') as HTMLInputElement,
    randomCheckbox: document.getElementById('random') as HTMLInputElement,
    reverseCheckbox: document.getElementById('reverse') as HTMLInputElement,
    preserveCheckbox: document.getElementById('preserve') as HTMLInputElement,
    ignoreDuplicatesCheckbox: document.getElementById('ignoreDuplicates') as HTMLInputElement,
    openButton: document.getElementById('open') as HTMLInputElement,
    extractButton: document.getElementById('extract') as HTMLInputElement,
    tabCount: document.getElementById('tabcount') as HTMLSpanElement,
    tabCountNumber: document.getElementById('tabcount-number') as HTMLSpanElement,
    tabCountTabLabel: document.getElementById('tabcount-tab-label') as HTMLSpanElement,
    tabCountIgnored: document.getElementById('tabcount-ignored') as HTMLSpanElement,
    tabCountIgnoredNumber: document.getElementById('tabcount-ignored-number') as HTMLSpanElement
  };
}
