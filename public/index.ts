/// <reference lib="dom"/>
let tab:Window|null;
class config{
    static desc=false;
    static autoplay=false;
    static pastedispatch=false;
    static key='config'

    static getLS(){
        const s=window.localStorage.getItem(config.key);
        if(s==null) return;
        const json=JSON.parse(s);
        config.desc=json.desc;
        config.autoplay=json.autoplay;
        config.pastedispatch=json.pastedispatch;
    }
    static setLS(){
        const obj={
            desc:config.desc,
            autoplay:config.autoplay,
            pastedispatch:config.pastedispatch
        }
        const s=JSON.stringify(obj);
        window.localStorage.setItem(config.key, s);
    }
}

import pinyin from 'https://cdn.jsdelivr.net/npm/pinyin@4.0.0-alpha.2/+esm'

//ボタンで発火するかんすう
async function btn(){
    const textarea=document.querySelector("textarea")
    if(textarea==null) return;
    const text=textarea.value.trim();
    textarea.value=''
    if(text==='') return;
    
    for(const t of text.split('\n')){
        const pinyins=pinyin(t);
        const audioBuffer=await createDom(pinyins, t);
        if(audioBuffer!=null&&config.autoplay) audioplay(audioBuffer);
    }
}
document.querySelector('textarea')?.addEventListener('keydown', (e)=>{
    if(!config.pastedispatch)return;
    if(e.ctrlKey&&e.key==='v')
        setTimeout(btn, 1);
})

document.querySelector('#pastedispatch')?.addEventListener('click', (e)=>{
    const target = e.target as HTMLInputElement;
    config.pastedispatch=target.checked;
    config.setLS()
})
document.querySelector('#autoplay')?.addEventListener('click', (e)=>{
    const target = e.target as HTMLInputElement;
    config.autoplay=target.checked;
    config.setLS()
})

//音声再生用のかんすう
const audioContext = new(window.AudioContext || window.webkitAudioContext)();

function audioplay(audioBuffer: AudioBuffer){
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
}

//DOM操作
async function createDom(pinyins: string[], letters: string):Promise<AudioBuffer|null>{
    document.querySelector('textarea')?.innerText=='';
    const sentenceDOM=document.createElement('sentence');
    //ピンインと漢字のセットをつくる
    pinyins.forEach((pinyin, index)=>{
        console.log(letters[index]+pinyin);
        const charaDOM=document.createElement('chara');
        const pinyinDOM=document.createElement('pinyin');
        pinyinDOM.innerText=pinyin;
        charaDOM.appendChild(pinyinDOM);
        const letterDOM=document.createElement('letter');
        letterDOM.innerText=letters[index];
        charaDOM.appendChild(letterDOM);
        sentenceDOM.appendChild(charaDOM);
    })
    //音声つくる
    const speakDOM=document.createElement('speaker');
    const res=await fetch(`/audio?s=${letters}`);
    const rstream=res.body;
    const reader=await rstream?.getReader();
    if(reader==null) return null;
    const readresult=await reader?.read();
    const buffer=readresult.value?.buffer;
    if(buffer==null) return null;
    const audioBuffer=await audioContext.decodeAudioData(buffer)
    speakDOM.addEventListener('click', ()=>{
        audioplay(audioBuffer);
    })

    //行についか
    const rowDOM=document.createElement('row');
    rowDOM.appendChild(sentenceDOM);
    rowDOM.appendChild(speakDOM);
    //翻訳つくる
    createJPDom(letters, rowDOM);

    //コンテナについか
    const containerDOM=document.querySelector('#container');
    if(containerDOM==null) return null;
    if(config.desc)
        containerDOM.appendChild(rowDOM);
    else
        containerDOM.insertBefore(rowDOM, containerDOM.firstChild);

    sentenceDOM.addEventListener('click', ()=>{
        if(tab)tab.close()
        tab=window.open('https://www.deepl.com/en/translator#zh/ja/'+letters, 'pinyin')
    });
    
    return audioBuffer;
}

function changeorder(orderbtn:HTMLElement){
    //toggleだとロード時もうごいちゃうから
    if(config.desc==false){
        config.desc=true;
        orderbtn.classList.add('desc');
        orderbtn.classList.remove('asc');
    }else{
        config.desc=false;
        orderbtn.classList.add('asc');
        orderbtn.classList.remove('desc');
    }
    config.setLS()
}

const inputDOMs=document.querySelectorAll('input[type=checkbox]') as NodeListOf<HTMLInputElement>;
inputDOMs.forEach((input)=>{
    const name=input.id as keyof typeof config;
    const tf=config[name] as boolean;
    input.checked=tf;
})

async function GAStranrate(s: string): Promise<string>{
    const url="https://script.google.com/macros/s/AKfycbwjYwiXFOv3UtBH0e2mGfG3S28yXUJcvElYMq9-tlVr-Bj_lklQnB0UCcRlZ1Wa6jam8w/exec";
    const res=await fetch(url+"?text="+s);
    const jp=await res.text();
    return jp;
}
async function createJPDom(s: string, dom: HTMLElement){
    const jpDOM=document.createElement('jp');
    const jp=await GAStranrate(s);
    jpDOM.innerText=jp;
    dom.appendChild(jpDOM);
}

// 音声再生下準備
document.addEventListener('click', ()=>{
    const audio=new Audio();
    audio.play();
}, {once: true});



window.onload=()=>{
    config.getLS()

    const button=document.querySelector('#send')
    if(button)
        button.addEventListener('click', btn)
    const textarea=document.querySelector('textarea');
    if(textarea)
        textarea.addEventListener('keydown', (e)=>{
            if(e.key==="Enter"){
                btn()
                e.preventDefault()
            }
        })
    const orderbtn=document.getElementById('order');
    if(orderbtn){
        orderbtn.addEventListener('click', ()=>{
            changeorder(orderbtn)
        });
        if(config.desc){
            orderbtn.classList.add('desc');
            orderbtn.classList.remove('asc');
        }
    }
    const autobtn=document.querySelector('#autoplay') as HTMLInputElement;
    if(config.autoplay)
        autobtn.checked=true;
    const pastebtn=document.querySelector('#pastedispatch') as HTMLInputElement;
    if(config.pastedispatch)
        pastebtn.checked=true;
}