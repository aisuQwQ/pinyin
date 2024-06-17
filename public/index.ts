/// <reference lib="dom"/>
let tab:Window|null;
let desc=false;

//ボタンで発火するかんすう
async function btn(){
    const input=document.querySelector("input")
    if(input==null) return;
    const text=input.value.trim();
    input.value=''
    if(text==='') return;
    
    const res=await fetch("/send"+"?s="+text)
    const pinyins=await res.json()
    createDom(pinyins, text)
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
    document.querySelector('input')?.innerText=='';
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
    if(desc)
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
    if(desc==false){
        desc=true;
        orderbtn.classList.add('desc');
        orderbtn.classList.remove('asc');
    }else{
        desc=false;
        orderbtn.classList.add('asc');
        orderbtn.classList.remove('desc');
    }
}

window.onload=()=>{
    const button=document.querySelector('#send')
    if(button)
        button.addEventListener('click', btn)
    const textarea=document.querySelector('input');
    if(textarea)
        textarea.addEventListener('keydown', (e)=>{
            if(e.key==="Enter")
                btn()
        })
    const orderbtn=document.getElementById('order');
    if(orderbtn)
        orderbtn.addEventListener('click', ()=>{
            changeorder(orderbtn)
        });
}