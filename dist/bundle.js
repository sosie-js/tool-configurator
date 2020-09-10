function delay(o){return o=o||2e3,new Promise(n=>setTimeout(()=>n(),o))}function whenAvailable(o,n,e){window.ConfigFinished=!1;var i=window.setInterval((function(){window[o]&&(window.clearInterval(i),console.info("Started"),n(window[o],o,e),window.ConfigFinished=!0,console.info("Finished"))}),10)}async function waitFinished(o,n,e,i){n=n||2e3;var t=window.setInterval((function(){window.clearInterval(t),console.error("Timeout for "+o+"Tool configuration"),n=0}),n);for(console.log("wait start with "+e+"("+o+") n "+n),i[e](o),console.log("wait end"+window.ConfigFinished+" "+n);!window.ConfigFinished&&n;)await delay(10);window.clearInterval(t),n&&console.info(o+"Tool configuration success")}async function awaitFinished(o,n,e,i){n=n||2e3;return new Promise((async function(t,a){var r=window.setInterval((function(){window.clearInterval(r),n=0,a(new Error("Timeout for "+o+" Tool configuration"))}),n);for(console.log("await start with "+e+"("+o+") n "+n),i[e](o),console.log("await end"+window.ConfigFinished+" "+n);!window.ConfigFinished&&n;)await delay(10);window.clearInterval(r),t(o+"Tool configuration succeed")}))}checkConfigFinished=function(o){window.ConfigFinished?alert("Config read:"+Paragraph.pasteConfig.toSource()+"\n"+Paragraph.sanitize.toSource()):alert("Config finished:"+window.ConfigFinished)};class ToolConfigurator{constructor(o){this.config=o}getToolConfig(o){return this.config.tools[o.toLowerCase()]}helper(o,n,e){if(e.hasOwnProperty("text")&&e.text.hasOwnProperty("allowedTags")){let i=e.text.allowedTags.split(",");const t=[];i.forEach((function(o){let n,e=!0;null!==(n=/(\w+)\[(\w+)\]/.exec(o))&&(o=n[1],e=Object.fromEntries(new Map([[n[2],!0]]))),t.push([o,e])}));const a=new Map(t),r=Object.fromEntries(a);Object.defineProperty(o,"sanitize",{value:{text:r},writable:!1,enumerable:!0,configurable:!0}),console.info("New sanitize rules for tool "+n,o.sanitize);const s=i.map(o=>{let n=/(\w+)\[(\w+)\]/.exec(o);return null!==n&&(o=n[1]),o.toUpperCase()});Object.defineProperty(o,"pasteConfig",{value:{tags:s},writable:!1,enumerable:!0,configurable:!0}),console.info("New PasteConfig rules for tool "+n,o.pasteConfig)}else console.warn("Nothing to configure for Tool "+n,o.pasteConfig)}configure(o){let n=this.getToolConfig(o),e=this.helper;console.log("configure "+o),n&&whenAvailable(o,e,n)}awaitFinished(o,n){return awaitFinished(o,n,"configure",this)}waitFinished(o,n){return waitFinished(o,n,"configure",this)}}