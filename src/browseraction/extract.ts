export {};

/**
 * Extract URLs from text
 * @param text Text
 */
export function extractURLs(text: string): string {
  let urls = '';
  let urlmatcharr;
  const urlregex =
    /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/gi;

  while ((urlmatcharr = urlregex.exec(text)) !== null) {
    const match = urlmatcharr[0];
    urls += match + '\n';
  }

  return urls;
}
