window.addEventListener('DOMContentLoaded', async(event) => {
    const bsky = new BlueSky();
    const ui = Object.fromEntries('handle getDID did serviceEndpoint authServerURL'.split(' ').map(n=>[n, Dom.q(`[name="${n}"]`)]));
    ui.getDID.listen('click', async(e)=>{
        const did = await bsky.getDID(ui.handle.value);
        ui.did.value = did;
        ui.did.focus();
        const didDoc = await bsky.getDIDDocument(did);
        ui.serviceEndpoint.value = bsky.getServiceEndpoint(didDoc);
        const pdsMeta = await bsky.getPDSMetadata(ui.serviceEndpoint.value);
        ui.authServerURL.value = bsky.getAuthServerURL(pdsMeta);
        ui.getDID.disabled = true;
    });
    ui.handle.listen('input', async(e)=>{
        ui.getDID.disabled = (0 === e.target.value.trim().length);
    });
    ui.handle.value = 'ytyaru.bsky.social';
    //ui.handle.focus();
    ui.getDID.focus();
    /*
    const HANDLE = 'ytyaru.bsky.social';
    const bsky = new BlueSky();
    const did = await bsky.getDID(HANDLE);
    console.log(`handle: ${HANDLE}`);
    console.log(`DID: ${did}`);
    const didDoc = await bsky.getDIDDocument(did);
    console.log(`didDoc: `,didDoc);
    const serviceEp = await bsky.getServiceEndpoint(didDoc);
    console.log(`serciveEndpoint: ${serviceEp}`);
    const pdsMeta = await bsky.getPDSMetadata();
    console.log(`PDSMetadata: `, pdsMeta);
    ui.authServerURL.value = bsky.getAuthServerURL(pdsMeta);
    const authServerURL = bsky.getAuthServerURL(pdsMeta);
    console.log(`AuthServerURL: ${authServerURL}`);
    */
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

