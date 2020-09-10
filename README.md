![](https://badgen.net/badge/SoS正/Beta/f2a) ![](https://badgen.net/badge/editor.js/v2.0/blue) ![](https://badgen.net/badge/plugin/v1.0/orange) 

# Tool Plugin to configure Tools of editor.js

## Feature(s)

Provides an uniformized way to configure a Tool (in our case Paragraph) 

The goal for us is to remove to setup sanitize and pasteConfig using allowedTag string to avoid style
tags being washed. 

It use allowedTags atrtribute which is a string of alowed tags separed by a comma, string
stored along text within the config file of the Tool like in EditorJS-php.
 
## Integration

Update SoS正 / editor.js core, sosie.js, just before new EditorJS.

For example,
```js

 /**
     * configure the Editor Tools before the Editor being initialized
     * @note Hack because for now we cannot have async constructors
     * @param {EditorConfig|string|undefined} [configuration] - user configuration
     * @param {boolean] custom , if not specified use demo by default.
     * @return promise<EditorJS>
     */
    async function new_SoSIE(configuration,custom) {
    
       /**
        * Saving button
        */
        const saveButton = document.getElementById('saveButton');
    
        let ct=new ToolConfigurator(configuration);
        
        //This will avoid to hardcode sanitize rules in Paragraph tool.
        //and use our rules defined in paragraph.text.allowedTags
        //to avoid washing style tags deliberately by default (p tag is mandatory!)
        await ct.awaitFinished('Paragraph',500);
        
        //checkConfigFinished('Paragraph');
        var editor=new SoSIE(configuration,custom);
         
        /**
        * Saving example
        */
        saveButton.addEventListener('click', function () {
            editor.save().then((savedData) => {
                cPreview.show(savedData, document.getElementById("output"));
            });
        });
         
        return editor;
    }
```

I have inserted a line
```js
await ToolConfigurator.awaitFinished(toolName,timeout)
```
where toolName is 'Paragraph' and timeout is the watchdog time in ms - I choosed 500ms.


## Building the plugin

To produce the dist/bundle.js for production use the command: 

```shell
yarn build
```

## Want to give a try?

copy a  styled html text with bold (<strong>) oe other inline tags within a paragraph.
 Beware to select over the text to grasp the <p> container in your selection.
and paste in [SoSie](http://sosie.sos-productions.com/)
