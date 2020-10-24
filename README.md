![](https://badgen.net/badge/SoS正/0.8.0/f2a) ![](https://badgen.net/badge/editor.js/v2.1.8/blue) ![](https://badgen.net/badge/plugin/v1.0.0/orange) 

# Tool Plugin to configure Tools of editor.js

## Feature(s)

Provides an uniformized way to configure a Tool (in our case Paragraph) 

In our case we will use it to setup sanitize and pasteConfig rules based on allowedTags declared like this in the
config of Tool Paragraph

```js
       /**
        * NEW!: This tool has a common configuration for sanitizing and pasteConfig
        */
        paragraph: {
          class: Paragraph,
           text: {
                type: "string",
                allowedTags: "p,i,b,u,a[href],strong,em,br,dd,dt,dl,embed,div"
            }
        },
```

which is a string of alowed tags separed by a comma, like in [EditorJS-php](https://github.com/editor-js/editorjs-php/blob/master/tests/samples/test-config.json).
 
## Integration

1) You will have to add the Paragpraph plugin bundle loaded even if it is already include editorjs as core tool.

```html
<script src="https://cdn.jsdelivr.net/npm/@editorjs/paragraph@latest"></script><!-- Paragraph -->

```

The reason of this is the class is cached and I did not succeed in overloading (the cached?) Paragraph class without rebuilding editorjs
like [@gohabereg](https://github.com/gohabereg) suggested with a typescript patch in [the issue I opened](https://github.com/codex-team/editor.js/issues/1280).


2) Update SoS正 / editor.js core, 

For example, in SoS正, we have since version 0.4.0, the new_SoSIE function for async stuff
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

copy a  styled html text with bold "strong" or other inline tags within a paragraph.
 Beware to select over the text to grasp the "p" container in your selection and paste in [SoSie](http://sosie.sos-productions.com/)
