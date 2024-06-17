/// <reference lib="dom"/>
let tab:Window|null;
class config{
    static desc:boolean;
    static key='config'

    static getLS(){
        const s=window.localStorage.getItem(config.key);
        if(s==null){
            config.desc=false;
            return;
        }
        const json=JSON.parse(s);
        config.desc=json.desc;
    }
    static setLS(){
        const obj={
            desc:config.desc
        }
        const s=JSON.stringify(obj);
        window.localStorage.setItem(config.key, s);
    }
}

//ボタンで発火するかんすう
async function btn(){
    const textarea=document.querySelector("textarea")
    if(textarea==null) return;
    const text=textarea.value.trim();
    textarea.value=''
    if(text==='') return;
    
    for(const t of text.split('\n')){
        const res=await fetch("/send"+"?s="+t)
        const pinyins=await res.json()
        await createDom(pinyins, t)
    }
}



//音声再生用のかんすう
const audioContext = new(window.AudioContext || window.webkitAudioContext)();

function audioplay(audioBuffer: AudioBuffer){
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
}

//DOM操作
async function createDom(pinyins: string[], letters: string){
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
    if(reader==null) return;
    const readresult=await reader?.read();
    const buffer=readresult.value?.buffer;
    if(buffer==null) return;
    const audioBuffer=await audioContext.decodeAudioData(buffer)
    speakDOM.addEventListener('click', ()=>{
        audioplay(audioBuffer);
    })
    //行についか
    const rowDOM=document.createElement('row');
    rowDOM.appendChild(sentenceDOM);
    rowDOM.appendChild(speakDOM);

    //コンテナについか
    const containerDOM=document.querySelector('#container');
    if(containerDOM==null) return;
    if(config.desc)
        containerDOM.appendChild(rowDOM);
    else
        containerDOM.insertBefore(rowDOM, containerDOM.firstChild);

    sentenceDOM.addEventListener('click', ()=>{
        if(tab)tab.close()
        tab=window.open('https://www.deepl.com/en/translator#zh/ja/'+letters, 'pinyin')
    });

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
}