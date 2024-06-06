/// <reference lib="dom"/>

async function btn(){
    const input=document.querySelector("input")
    if(input==null) return;
    const text=input.value;
    input.value=''
    
    const res=await fetch("/send"+"?s="+text)
    const pinyins=await res.json()
    createDom(pinyins, text)
}

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
    //行についか
    const rowDOM=document.createElement('row');
    rowDOM.appendChild(sentenceDOM);
    const res=await fetch(`/audio?s=${letters}`);
    if(res.ok){
        const audioDOM = document.createElement('audio');
        audioDOM.controls=true;
        audioDOM.src=`./audio/${letters}.wav`;
        rowDOM.appendChild(audioDOM);
    }

    //コンテナについか
    const containerDOM=document.querySelector('#container');
    if(containerDOM!=null)
        containerDOM.insertBefore(rowDOM, containerDOM.firstChild)

    sentenceDOM.addEventListener('click', ()=>{
        window.open('https://www.deepl.com/en/translator#zh/ja/'+letters, 'pinyin')
    });
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
}