window.addEventListener('DOMContentLoaded', async(event) => {
    const HANDLE = 'ytyaru.bsky.social';
    const bsky = new BlueSky();
    const did = await bsky.getDID(HANDLE);
    console.log(`handle: ${HANDLE}`);
    console.log(`DID: ${did}`);
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

