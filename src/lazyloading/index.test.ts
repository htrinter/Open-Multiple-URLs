import { init } from '../lazyloading';

const url = 'https://example.de';

test('redirect on focus', async () => {
  const mockLocation = {
    ...window.location,
    replace: jest.fn(),
    hash: '#' + url,
  };
  delete window.location;
  window.location = mockLocation;

  init();

  expect(document.title).toBe('[example.de]');
  expect(window.location.replace).toHaveBeenCalledTimes(0);

  window.dispatchEvent(new Event('focus'));

  expect(window.location.replace).toHaveBeenLastCalledWith(url);
});
