const check = {
    isWorking:false,  //Meaning : Time to working is Running
    isRunning : false,//Meaning : Time count is running 
    isPopup:false     //Meaning : Popup of user is Open => set it to true
}
const utilChrome = {
    solveUrl:(tabs,allowedWeb)=>{
        const arr = []; 
        const arrTabID = [];

        //array of items duplicated
        tabs.forEach(tab=>{  
            if(!arrTabID.includes(tab.id)) arrTabID.push(tab.id);
            
            allowedWeb.forEach(webAllow =>{
                 
                if(!tab.url.includes(webAllow) && !arr.includes(tab.id)) return arr.push(tab.id);
                
            })
        })
         
       
        //close tab is all tab i just wanna close , alltabID is all tab collected 
        return {
            closeTab:arr, 
            allTabID:arrTabID
        }
    },
    open:(tabUrl)=>{
        
        //if(!tabUrl) return -1 ; 

        if(Array.isArray(tabUrl)){
            
            tabUrl.forEach(url =>{
                if(!url.includes('https')) return chrome.tabs.create({url : `https://${url}`});
                return chrome.tabs.create({url});

            });

        }else{
            if(!tabUrl.includes('https')) return chrome.tabs.create({url : `https://${tabUrl}`});
            return chrome.tabs.create({url:tabUrl});
        }
      
    },
    close:(tabUrl)=>{//tabUrl is tabID
        if(tabUrl.length === undefined) return -1; 
        if(!tabUrl) return -1;
        return chrome.tabs.remove(tabUrl,()=>{
            if(chrome.runtime.lastError) return 1;
            console.log('Close Successful!')
        });
    },
    send:(msg,checktosend,cb)=>{
        if(checktosend){
            return chrome.runtime.sendMessage(msg,(response)=>{
                
                if(chrome.runtime.lastError){
                    return cb(chrome.runtime.lastError)
                }
                
            });         
        }
        return -1
     
    },
    set:(obj)=>{
        chrome.storage.sync.set(obj, ()=>{
            // Notify that we saved.
             
            console.log('saved !');
        });
    },
    get:(arr,cb)=>{
        chrome.storage.sync.get(arr, (result) =>{
             
            cb(result)
        });
    },
    objectIsEmpty:(obj)=>!Object.keys(obj).length
}

class Process {
    constructor(now,tabs,webAllow, webRelax,timeWork, timeRelax){
        
        this.webAllow = webAllow;
        
        this.webRelax = webRelax;
        this.tabs = tabs ; 
        this.now = now ;
        this.HOUR = 24;
        this.MINUTE = 60;
        this.SECOND = 60;
        this.POMODORO = timeWork;
        this.RELAX = timeRelax;   

    }
    get options(){
        return {
            webAllow:this.webAllow,
            
            webRelax:this.webRelax 
        }
    }
 
    timeRelax(){
        chrome.tabs.query({},tabs=>{
            
            const { closeTab , allTabID } = utilChrome.solveUrl(tabs,this.webAllow);

            check.isWorking = false ;//unblock site 

            utilChrome.open(this.webRelax);
            utilChrome.close(allTabID);

        });    
    }
    timeComeback(){
        chrome.tabs.query({},tabs=>{
            
           
            const { closeTab , allTabID } = utilChrome.solveUrl(tabs,this.webAllow);
            
            check.isWorking = true ; // block site 

            if(closeTab.length === allTabID.length){
                utilChrome.open(this.webAllow);
                return  utilChrome.close(closeTab);
            } 

            return utilChrome.close(closeTab);
        });    
    }
    pomodoro(){
         
        const updateTime = (secondPlus,timeEnd)=>{
            let secondNow = 0;
            let minuteNow = 0;
            let fistTimeEnd = timeEnd;
            if(timeEnd === this.POMODORO){
                console.log('working and time end fist is ' + timeEnd )
                timeEnd = this.RELAX;
                this.timeComeback();
            }else if (timeEnd === this.RELAX){
                console.log('relax and time end fist is ' + timeEnd )
                timeEnd = this.POMODORO;
                this.timeRelax();
            }
            let idInterval = setInterval(() => {

                if(secondNow == this.SECOND){
                    secondNow = 0; 
                    minuteNow += 1; 
                } 
                if(minuteNow == fistTimeEnd){

                    utilChrome.send({msg:'timeout',isRunning:check.isRunning},true,()=>{
                        console.log('timeout')
                    })
                    check.isRunning = false;
                    clearInterval(idInterval);
                    return updateTime(1,timeEnd);
                    
                 }     
                //Send time to popup.js 
                  
                utilChrome.send({msg:'timeNow',minuteNow,secondNow,idInterval},check.isPopup ,(error)=>{
                    // if have error , => popup is closed => popup = false
                     
                    if(error){  
                        check.isPopup = false
                    }
                })
                 
                check.isRunning = true ; 
                return secondNow = secondNow + secondPlus; 
            }, 1000);
            
            return idInterval;
        };
        updateTime(1,this.POMODORO);
         
    }
    
    start(){
        
        this.pomodoro();
        
    }
}
let process;
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
     
    if(request.msg === 'options' && check.isRunning===false){
        const { webAllow ,webRelax,timeWork,timeRelax } = request; 
        console.log(request)
        if(utilChrome.objectIsEmpty(request)) return sendResponse('You need to provide enough all tab to work');
         
        utilChrome.set({
            webAllow, 
            webRelax,
            timeWork, 
            timeRelax
        })

        sendResponse({webAllow,webRelax});
    }else if(request.msg === 'now'){
        utilChrome.get(['webAllow' , 'webRelax','timeWork','timeRelax'] , (data)=>{
            if(utilChrome.objectIsEmpty(data))return false 
            const {now,tabs} = request; 
            const { webAllow ,webRelax,timeWork,timeRelax } = data; 

            if(!webAllow || !webRelax || !timeRelax || !timeWork) {
                return sendResponse('You need to provide enough all tab to work');
            }
             
            if(check.isRunning===false){
                
                process = new Process(now,tabs,webAllow,webRelax,timeWork,timeRelax);
               
                process.start();

               
                return sendResponse('Ok i am counting down , working Now !!!');
            }
            
           
        })
        
    }else if(request.msg === 'i need a clock'){
    
        check.isPopup = true;
        if(check.isRunning == false){
            
            return  sendResponse({
                error:'you need to click on timestart button to start!'
                
            })

        }
        
        return sendResponse({ 
                error:undefined , 
                isRunning:check.isRunning 
               
        });

       
    }else if(request.msg === 'stop'){
        console.log(request.idInterval)
        clearInterval(request.idInterval);
        check.isRunning = false;
        check.isWorking = false;
        return sendResponse()
    }
 
    return sendResponse('iamhere')//if no have message listener 
});

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab)=>{ 
    if(check.isWorking){

        return utilChrome.get(['webAllow'] , result=>{
            if(result.webAllow === undefined) return false;
            const { webAllow } = result; 
            const hostname = new URL(tab.url).hostname;
            
            

            if(tab.url==='chrome://extensions/') return false ;
            if(!webAllow.includes(hostname)) return utilChrome.close([tabID]);
            return console.log('block function chrome is running');
        })

    }
    else if(changeInfo.status!== 'loading' || changeInfo.status!== 'complete')
        return utilChrome.get(['webBlock'],(result)=>{

            if(utilChrome.objectIsEmpty(result))return false 

                const { webBlock } = result;
                const hostname = new URL(tab.url).hostname;
                if(webBlock.includes(hostname))  {
                        utilChrome.close([tabID])
                }

            
    })
})
