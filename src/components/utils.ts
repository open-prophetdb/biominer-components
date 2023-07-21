import FingerprintJS from '@fingerprintjs/fingerprintjs';
export const getIdentity = async () => {
  let visitorId = localStorage.getItem('rapex-visitor-id');

  if (!visitorId) {
    const fpPromise = FingerprintJS.load();
    // Get the visitor identifier when you need it.
    const fp = await fpPromise;
    const result = await fp.get();

    visitorId = result.visitorId;
  }

  return visitorId;
};
