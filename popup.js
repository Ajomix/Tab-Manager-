
//variable checking -------------------------------

let isRunning = false;//time is not running
// request time from background.js--------------------------------------
 
chrome.runtime.sendMessage({msg:'i need a clock'},(response)=>{

    //Show data to client , webBlock , webRelax , webAllow , and ID interval to close process 
    chrome.storage.sync.get(['webAllow' , 'webRelax' ,'webBlock','timeWork','timeRelax'], (result) =>{
        
        chrome.tabs.query({},tabs=>showInfotabs(tabs,result.webBlock))
        showOption(result,isRunning);
    });
 
    if(response.error){
         //show error to client
        return  ;
        
    }
    // Get response isRunning = true 
    isRunning = response.isRunning;
    //Logical from Start btn but it so dirty code =))
    if(isRunning) return document.querySelector('.startBtn').innerHTML = 'Stop';

});
// receipt time from background.js-------------------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    //check if pomodoro time is done 
    if(request.msg ==='timeout'){
        sendResponse()
   }
   //show time 
     
    if(request.msg === 'timeNow'){
        showTime(request.minuteNow, request.secondNow);
        showIdinterval(request.idInterval);
        sendResponse('deliver');
    }
  
})

// ----------All button in popup.html ------------------------


//button agree setup option
document.querySelector('.agreeBtn').addEventListener('click',()=>{
    
    const webAllow = handleFilter(getInput('#webAllow > span >input'));
    const webRelax = handleFilter(getInput('#webRelax > span >input'));
    const timeWork = getTimeInput('#timework');
    const timeRelax = getTimeInput('#timerelax');
    let msg = '';
    if(timeWork === timeRelax || !timeRelax || !timeWork){
        msg = {
            msg : 'options',
            webAllow,
            webRelax
        } 
        alert('time working and time relax require different,and require type is number')
    }else msg = {
        msg : 'options',
        webAllow,
        webRelax,
        timeWork,
        timeRelax
    }
    
    
    chrome.runtime.sendMessage( msg ,(response)=>{
        console.log('send Option success')
    });

})
// timeStart button
document.querySelector('.startBtn').addEventListener('click',(event)=>{
    const d = new Date();
    let now = {
        hour : d.getHours(),
        minute : d.getMinutes(),
        seconds : d.getSeconds()
    };
    
    if(isRunning === false){
        if(!webRelax || !webAllow ){
            return alert('provide all information!')
        }
        isRunning = true ;
        chrome.tabs.query({},(tabs) =>{
            const msg  ={
                msg:'now',
                now,
                tabs
            }
                // send message to background.js 
                return chrome.runtime.sendMessage(msg,function(response){
                    //check if respone (isRunning) in background.js is running
                    
                      //Logical from Start btn but it so dirty code =))
                    if(isRunning) return document.querySelector('.startBtn').innerHTML = 'Stop';

                });
            
            
        });
    }
      
})





 