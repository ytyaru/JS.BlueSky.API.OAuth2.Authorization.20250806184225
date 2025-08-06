window.addEventListener('DOMContentLoaded', async(event) => {
    const bsky = new BlueSky();
    const ui = Object.fromEntries('handle getDID did'.split(' ').map(n=>[n, Dom.q(`[name="${n}"]`)]));
    ui.getDID.listen('click', async(e)=>{
        const did = await bsky.getDID(ui.handle.value);
        ui.did.value = did;
        ui.did.focus();
        ui.getDID.disabled = true;
    });
    ui.handle.listen('input', async(e)=>{
        ui.getDID.disabled = (0 === e.target.value.trim().length);
    });
    ui.handle.focus();
    /*
    const HANDLE = 'ytyaru.bsky.social';
    const did = await bsky.getDID(HANDLE);
    console.log(`handle: ${HANDLE}`);
    console.log(`DID: ${did}`);
    */
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

