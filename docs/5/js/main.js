window.addEventListener('DOMContentLoaded', async(event) => {
    const bsky = new BlueSky();
    const ui = Object.fromEntries('handle getDID did serviceEndpoint authServerURL authorizationEndpoint tokenEndpoint parEndpoint dpopNonce authServerRequestURI'.split(' ').map(n=>[n, Dom.q(`[name="${n}"]`)]));
    async function getMeta() {
//        const res = await fetch(`json/client-metadata-localhost.json`); // CORS error
//        const res = await fetch(`json/client-metadata-localhost8000.json`); // 後のbsky.requestPAR()でerror response
//        const res = await fetch(`json/client-metadata-localhost-http.json`); // error response
//        const res = await fetch(`json/client-metadata-localhost8000-http.json`); // ?
//        const res = await fetch(`json/client-metadata-127-0-0-1-8000-http.json`); // error response (invalid_client_metadata)
        const res = await fetch(`json/client-metadata-githubpages.json`); // ?
        return await res.json();
    }
    ui.getDID.listen('click', async(e)=>{
        const did = await bsky.getDID(ui.handle.value);
        ui.did.value = did;
        ui.did.focus();
        const didDoc = await bsky.getDIDDocument(did);
        ui.serviceEndpoint.value = bsky.getServiceEndpoint(didDoc);
        ui.serviceEndpoint.focus();
        const pdsMeta = await bsky.getPDSMetadata(ui.serviceEndpoint.value);
        ui.authServerURL.value = bsky.getAuthServerURL(pdsMeta);
        ui.authServerURL.focus();
        const authServerDiscovery = await bsky.getAuthServerDiscovery(ui.authServerURL.value);
        ui.authorizationEndpoint.value = bsky.getAuthorizationEndPoint(authServerDiscovery);
        ui.tokenEndpoint.value = bsky.getTokenEndPoint(authServerDiscovery);
        ui.parEndpoint.value = bsky.getPAREndPoint(authServerDiscovery);
        ui.parEndpoint.focus();
        const meta = await getMeta();
        console.log(meta.client_id, meta.redirect_uris[0], meta);
        const {dpopNonce, PAR, authServerRequestURI} = await bsky.requestPAR(ui.handle.value, ui.parEndpoint.value, meta.client_id, meta.redirect_uris[0]);
        console.log(dpopNonce, authServerRequestURI, PAR);
        ui.dpopNonce.value = dpopNonce;
        ui.authServerRequestURI.value = authServerRequestURI;
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

