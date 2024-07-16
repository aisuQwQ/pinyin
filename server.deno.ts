import { serveDirWithTs } from "https://deno.land/x/ts_serve@v1.4.4/mod.ts";
// import { EdgeTTS } from "npm:node-edge-tts@1.2.3"
// const tts1=new EdgeTTS({
//     voice: "zh-CN-XiaoyiNeural",
//     volume: "-50%"
// });

import {tts} from "https://esm.sh/edge-tts@1.0.1"
const options={
    voice: "zh-CN-XiaoyiNeural",
    volume: "-50%"
};

Deno.serve(async(req)=>{
    const pathname=new URL(req.url).pathname;
    console.log(decodeURI(req.url));
    console.log(decodeURI(pathname));

    // if(req.method==='GET' && pathname==='/audio'){
    //     const keys=decodeURI(req.url).split('?')[1];
    //     const s=keys.split('=')[1];
    //     await tts1.ttsPromise(s, `./public/audio/${s}.wav`);
    //     return new Response('ok');
    // }

    if(req.method==='GET' && pathname==='/audio'){
        const keys=decodeURI(req.url).split('?')[1];
        const s=keys.split('=')[1];
        const audioBuffer = await tts(s, options)
        return new Response(audioBuffer);
    }


    return serveDirWithTs(req, {
        fsRoot: "public",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
        });
})