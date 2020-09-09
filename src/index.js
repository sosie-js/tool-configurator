 
//Borrowed from https://blog.praveen.science/right-way-of-delaying-execution-synchronously-in-javascript-without-using-loops-or-timeouts/

function delay(n) {
    n = n || 2000;
    return new Promise(done => setTimeout(() => done(), n));
}
 

function whenAvailable(name, callback, config) {
        
      window.ConfigFinished=false;

    // Store the interval id
    var intervalId = window.setInterval(function() {
        if (window[name]) {
            // Clear the interval id
            window.clearInterval(intervalId);

            // Call back
            callback(window[name],name,config);
            
            window.ConfigFinished=true;
            
        }
    }, 100);
    
} 

async function waitFinished(name,n,func) {
        n = n || 2000;
        var intervalId = window.setInterval(function() {
        window.clearInterval(intervalId);
        console.error('Timeout for '+name+ 'Tool configuration');
            n=0;
    }, n);
    func(name);
    while((!window.ConfigFinished)&&n) {
            await delay(10);
    }
    if(n) console.info(name+ 'Tool configuration success');
}
        
async function awaitFinished(name,n,func) {  
    n = n || 2000;
    let prom= async function(resolve, reject) {
        var intervalId = window.setInterval(function() {
            window.clearInterval(intervalId);
            reject(new Error('Timeout for '+name+ ' Tool configuration'));
        }, n);
        func(name);
        while((!window.ConfigFinished)&&n) {
            await delay(10);
        }
        window.clearInterval(intervalId);
        resolve(name+ 'Tool configuration succeed');
    }
    return new Promise(prom);
}


checkConfigFinished=function(tool) {
    if(window.ConfigFinished) {
        alert('Config read:'+Paragraph.pasteConfig.toSource()+'\n'+Paragraph.sanitize.toSource());
    }else {
        alert('ConfigFinished:'+ window.ConfigFinished);
    }
}



class ToolConfigurator {   
           
        constructor() {
            this.version = '1.0';
        }
    
	/**
	*  config helper to set up uniformized Tools rules between sanitize and pasteConfig 
	*
	*@internal This gave me hadships I paid a lot of karma with it..
	*@note The easiest format imho was given by editorjs-php : we will use 
	*  allowedTags string stored in config.text.allowedTags
	*  for by "p,i,b,u,a[href],strong,em,br,dt,dl,embed,ol,li,ul,div"
	*/
        static helper(Tool,name,config) {
            
            //Now let's converts it to html-janitor's rules format 
            //@see https://editorjs.io/sanitizer#sanitizer-rules-configuration
            
            if(config.text.hasOwnProperty('allowedTags')) {
            
                let allowedTags=config.text.allowedTags.split(',');
                
                const keysPairs=[];
                
                allowedTags.forEach(function(tag) {
                        let key,value=true;
                        if((key=/(\w+)\[(\w+)\]/.exec(tag)) !== null) {
                            tag=(key[1])
                            value=Object.fromEntries(new Map([[key[2],true]]));
                        }
                        keysPairs.push([tag, value]);
                })
                
                const entries = new Map(keysPairs);
                const rules = Object.fromEntries(entries);
                
                /*@note     Object.defineProperty(Tool, 'sanitize',  {
                    get() { 
                        return {
                            text: rules
                        };
                    }
                }); FAILS but not if rules object is hardcoded { br: true, strong: true }*/
                Object.defineProperty(Tool, 'sanitize', {
                    value: {
                            text: rules
                        },
                    writable: false,
                    enumerable: true,
                    configurable: true
                });
                console.info('New sanitize rules for tool '+name,Tool.sanitize);
                
                //Without forgeting to convert it to pasteConfig's tag format
                //little less complicated this time but for A[HREF], mystery!
                const tags=allowedTags.map(tag => {
                    let key=/(\w+)\[(\w+)\]/.exec(tag);
                    if(key !== null) tag=(key[1]);
                    return tag.toUpperCase();  
                });
            
                /*@Note Object.defineProperty(Tool, 'pasteConfig', {
                    get() {
                        return {
                            tags: [ 'P', 'BR', 'STRONG' ]
                        };
                    }
                }); DOES WORK only with hardcoded array but tags: tags FAILS;*/
                Object.defineProperty(Tool, 'pasteConfig',{
                    value: {
                        tags: tags
                    },
                    writable: false,
                    enumerable: true,
                    configurable: true
                });
                
                console.info('New PasteConfig rules for tool '+name,Tool.pasteConfig);/*[ 'P', 'BR', 'STRONG' ]*/ 
           }else {
                console.info('Nothing to configure for Tool '+name,Tool.pasteConfig);
           }
           
        }
     
        static configure(tool) {
            let toolsConfig=getTools();
            let config=toolsConfig[tool.toLowerCase()];
            let helper=ToolConfigurator.helper
            if(config) whenAvailable(tool, helper, config);
        }
        
	static awaitFinished(name,n) {
                let func=this.configure;
		return awaitFinished(name, n, func)
	}
}
        
