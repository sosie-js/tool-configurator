 

/**
    * Tool configurator
    *
    * @Note this has to be triggered before editor - Editor.js instance creation 
    * @author sos-productions.com
    * @version 1.0
    * @history
    *    1.0 (10.09.2020) - Initial version f
    **/


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
            console.info('Started');
            callback(window[name],name,config);
            window.ConfigFinished=true;
            console.info('Finished');
        }
    }, 10);
    
} 

async function waitFinished(name,n,func,context) {
        n = n || 2000;
        var intervalId = window.setInterval(function() {
        window.clearInterval(intervalId);
        console.error('Timeout for '+name+ 'Tool configuration');
            n=0;
    }, n);
    console.log('wait start with '+func+'('+name+') n '+n);
    context[func](name);
    console.log('wait end'+window.ConfigFinished+' '+n);
    while((!window.ConfigFinished)&&n) {
            await delay(10);
    }
    window.clearInterval(intervalId);
    if(n) console.info(name+ 'Tool configuration success');
}
        
async function awaitFinished(name,n,func,context) {  
    n = n || 2000;
    let prom= async function(resolve, reject) {
        var intervalId = window.setInterval(function() {
            window.clearInterval(intervalId);
            n=0;
            reject(new Error('Timeout for '+name+ ' Tool configuration'));
        }, n);
        console.log('await start with '+func+'('+name+') n '+n);
        context[func](name);
        console.log('await end'+window.ConfigFinished+' '+n);
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
        alert('Config finished:'+ window.ConfigFinished);
    }
}



class ToolConfigurator {   
           
        constructor(config) {
            this.config = config;
        }
    
        getToolConfig(tool) {
            return this.config.tools[tool.toLowerCase()];
        }
    
	/**
	*  config helper to set up uniformized Tools rules between sanitize and pasteConfig 
	*
	*@internal This gave me hadships I paid a lot of karma with it..
	*@note The easiest format imho was given by editorjs-php : we will use 
	*  allowedTags string stored in config.text.allowedTags
	*  for by "p,i,b,u,a[href],strong,em,br,dt,dl,embed,ol,li,ul,div"
	*/
        helper(Tool,name,config) {
            
            //Now let's converts it to html-janitor's rules format 
            //@see https://editorjs.io/sanitizer#sanitizer-rules-configuration
            
            if(config.hasOwnProperty('text')&&config.text.hasOwnProperty('allowedTags')) {
            
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
                console.warn('Nothing to configure for Tool '+name,Tool.pasteConfig);
           }
           
        }
     
        configure(tool) {
            let config=this.getToolConfig(tool);
            let helper=this.helper;
            console.log('configure '+tool);
            if(config) whenAvailable(tool, helper, config);
        }
        
	awaitFinished(name,n) {
		return awaitFinished(name, n, 'configure', this)
	}
	
	waitFinished(name,n) {
		return waitFinished(name, n, 'configure', this)
	}
}
        
