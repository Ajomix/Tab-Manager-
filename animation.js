// all function util
const objectIsEmpty = (obj)=>!Object.keys(obj).length
//#0505057d màu test #2a2b3e75
const ReStart = ()=>{
        const idInterval = document.querySelector('.startBtn').getAttribute('data-idInterval');
        return chrome.runtime.sendMessage({ msg:'stop',idInterval },res=>{
            showTime('00','00');
            document.querySelector('.startBtn').innerHTML = 'Start';
        })
}
const showIdinterval = idInterval =>{
    document.querySelector('.startBtn').setAttribute('data-idInterval',idInterval);
}
const showOption = (result,isRunning)=>{

    const { webAllow ,webRelax,timeWork,timeRelax } = result; 
    if(!objectIsEmpty(result)){
        if(timeRelax || timeWork) {
            document.querySelector('#timework').value = timeWork;
            document.querySelector('#timerelax').value = timeRelax;

        } 
        if(webAllow)webAllow.forEach(url=>addInput(document.getElementById('addWebAllow'),url));
        if(webRelax)webRelax.forEach(url=>addInput(document.getElementById('addWebRelax'),url));
            
        if(isRunning){
            document.querySelector('#timework').readOnly = true ; 
            document.querySelector('#timerelax').readOnly = true;
        
            Array.from(document.querySelectorAll('.allinputoption > span > input')).forEach(input=>input.readOnly = true)
        }
    
    }
    
}

const addInputTabInfo = (tab,webBlock)=>{
   
    
    switch (webBlock) {
        case undefined:
            console.log('1')

                let html = '';
                const value = tab.url; 
                const tabid  = tab.id;
                 
                if(tab.mutedInfo.muted) html = `<span><input type="text" class="tabinfor" value=${value} data-tabid = ${tabid} readonly="true"><a class="muteBtn" style="left: 197px; color: red; background-color: white;">Unmute</a><a class="clearBtn">Block</a></span>`;
                else  html =  `<span><input type="text" class="tabinfor" value=${value} data-tabid = ${tabid} readonly="true"><a class="muteBtn">Mute</a> <a class="clearBtn">Block</a></span>`;
                document.querySelector('.inforTab').insertAdjacentHTML('beforeend',html);
            break;
    
        default:
                
                console.log('2')
                console.log(tab)
                webBlock.forEach(blocked=>{
                    let html = `<span><input type="text" class="tabinfor" value=${blocked}  readonly="true"> <a class="clearBtn" style="left: 15px; margin-bottom: 8px; color: white; background-color: red; cursor: pointer;">UnBlock</a></span>`;
                    document.querySelector('.inforTab').insertAdjacentHTML('beforeend',html);
                });
                tab.forEach(t=>{
                    let html = '';
                    if(t.mutedInfo.muted) html = `<span><input type="text" class="tabinfor" value=${t.url} data-tabid = ${t.id} readonly="true"><a class="muteBtn" style="left: 197px; color: red; background-color: white;">Unmute</a><a class="clearBtn">Block</a></span>`;
                    else html = `<span><input type="text" class="tabinfor" value=${t.url} data-tabid = ${t.id} readonly="true"><a class="muteBtn">Mute</a> <a class="clearBtn">Block</a></span>`;
                    document.querySelector('.inforTab').insertAdjacentHTML('beforeend',html);
                })
                 

              
            break;
    }
     

}

const showInfotabs = (tabs,webBlock)=>{
    if(!webBlock) return tabs.forEach(tab=>addInputTabInfo(tab,undefined)); 
    return addInputTabInfo(tabs, webBlock);
}


const handleFilter = (array)=>{
    const arr = [];
    array.forEach( el => {
        if(el!=='' && el.includes('http')){
        
            if(arr.includes(ParseDomain(el))) return 1 ;

            return arr.push(ParseDomain(el)); 

        }else if(!arr.includes(el)) return arr.push(el);
        
    });
    return arr;
}


const addInput =  (el,value)=>{
     
    let span = document.createElement('span');
    span.style = 'display: block;width: 100%; height: auto;';

    let input = document.createElement('input');
    input.style = 'width:8px';
    if(value)input.value = value; 

    let a = document.createElement('a');
    let PLUS = document.createTextNode("+");
    a.className = 'deleteBtn';
    a.appendChild(PLUS);

    span.appendChild(input);
    span.appendChild(a)

    setTimeout(()=>{
        input.style = 'width:180px';
    },120)
    return el.parentElement.appendChild(span);
}


const deleteEl = (el)=>{
    el.remove();
}


const showTime = (minute, seconds)=>{
    if(minute.toString().split('').length === 1) {
        minute =  '0'+ minute.toString();
    }
    if(seconds.toString().split('').length === 1) {
        seconds =  '0'+ seconds.toString();
    }

    document.getElementById('minute').innerHTML = minute; 
    document.getElementById('seconds').innerHTML = seconds; 
}

const getTimeInput = (element)=>{
    const value = document.querySelector(element).value;
    if(value && parseInt(value) !== NaN)  return parseInt(value);
        
}
const getInput = (element)=>{
 
    //get input URL , website to return data 
    const arr = [];
    Array.from(document.querySelectorAll(element)).forEach(el=>{
        if( el.value.trim().length === 0) return 1 ;
        return arr.push(el.value.trim())

    });
    return arr
}


//solve domain to block or show to client 
const ParseDomain = (domain)=>{
    
    if(domain.trim()==='') return 1 ; 
   
    return new URL(domain).hostname;
}


//block function 
const block = (valueInput,tabID,type)=>{
    switch (type) {
        case 'audio':
            chrome.tabs.update(parseInt(tabID), {muted: true});
            break;
        
        default: // case 'site'

            //Save url to sync storage
            if(valueInput.includes('chrome://newtab/')) return 1 ;
            chrome.storage.sync.get(['webBlock'], (result) =>{
                try {
                    if(result.webBlock.includes(valueInput)) return 1;
                }catch(error){}  

                if(!result.webBlock){
                    // get Domain before push in an array 
                    valueInput = ParseDomain(valueInput);
                    const webBlock = [valueInput];
                    chrome.storage.sync.set({webBlock},()=>chrome.tabs.remove(parseInt(tabID)));
                    
                }else {

                    const { webBlock } = result; 
                    valueInput = ParseDomain(valueInput);
                    webBlock.push(valueInput);
                    chrome.storage.sync.set({webBlock},()=>chrome.tabs.remove(parseInt(tabID)));

                }

            });    

            break;
    }
}


//Unblock function
const unblock = (valueInput,tabID,type)=>{
    switch (type) {
        case 'audio':

            chrome.tabs.update(parseInt(tabID), {muted: false});

            break;
        
        default:

            chrome.storage.sync.get(['webBlock'], (result) =>{
                const { webBlock } = result;
                if(!webBlock) return 1 ;
                if(webBlock.length === 1) return chrome.storage.sync.set({webBlock:[]},()=>console.log('success!'));
                const index = webBlock.indexOf(valueInput);
                webBlock.splice(index,1);
                //update data 
                chrome.storage.sync.set({webBlock},()=>console.log('success!'));
            });    

            break;
    }
}


//mute audio
const mute = (element)=>{

    const parent = element.parentElement;
    const valueInput = parent.children[0].value; 
    const tabID = parent.children[0].dataset.tabid;

    if(!element.getAttribute('style')){// is Muting
        element.style = `left: 197px;color: red;background-color:white;`;
        element.innerHTML = 'Unmute';
        block(valueInput,tabID,'audio');
    }else{
        element.removeAttribute("style"); 
        element.innerHTML = 'Mute';
        unblock(valueInput,tabID,'audio');
    }
    
    //muteAudio(valueInput,tabID);
   
}

//block web site 
const blocked = (element)=>{
    const parent = element.parentElement;
    const valueInput = parent.children[0].value; 
    const tabID = parent.children[0].dataset.tabid;

    if(!element.getAttribute('style')){// is Muting
        element.style = `   left: 15px;
                            margin-bottom: 8px;
                            color: white;
                            background-color: red;
                            cursor: pointer;`;

        element.innerHTML = 'UnBlock';
        block(valueInput,tabID,'site');
    }else{
        element.removeAttribute("style"); 
        element.innerHTML = 'Block';
        unblock(valueInput,tabID,'site');
    }
    
}
document.addEventListener('click',(event)=>{
    

    //Button Add Input element 
    if(event.target.className==='addButton'){
        addInput(event.target);
    }

    //btn delete input on Options Element
    if(event.target.className==='deleteBtn'&&isRunning===false)
    {
        event.target.parentElement.children[0].style['width'] = '0px';
        setTimeout(()=>{
            deleteEl(event.target.parentElement)
        },300)

    }
    //btn block , mute 
    if(event.target.className ==='clearBtn')blocked(event.target);
    if(event.target.className ==='muteBtn') mute(event.target)
    if(event.target.className === 'startBtn') ReStart();
})
 