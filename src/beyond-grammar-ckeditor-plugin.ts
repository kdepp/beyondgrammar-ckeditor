///<reference path="types.d.ts"/>

import {IGrammarChecker, IGrammarCheckerConstructor} from "./interfaces/IGrammarChecker";
import {loadScript} from "./utils/load.script";
import {
    CKEditorBGOptions,
    ICKEditorServiceSettings,
    IHighlightOverlayWrapperConstructor
} from "./interfaces/interfaces";

export const DEFAULT_SERVICE_CONFIG : ICKEditorServiceSettings = {
    sourcePath : '//cdn.prowritingaid.com/beyondgrammar/2.0.2893/dist/hayt/bundle.js',
    serviceUrl : '//rtg.prowritingaid.com'
}

export function createBeyondGrammarPlugin( options : CKEditorBGOptions ){
    options = prepareOptions( options );
    
    /**
     * merge options: default with passed over config
     * @param bgOptions options passed to root function
     */
    function prepareOptions( bgOptions : CKEditorBGOptions ) {
        return {
            service : {
                ...DEFAULT_SERVICE_CONFIG,
                ...bgOptions.service
            },
            grammar : {
                ...bgOptions.grammar
            }
        };
    }
    
    let GrammarChecker : IGrammarCheckerConstructor;
    let HighlightOverlayWrapper : IHighlightOverlayWrapperConstructor;
    
    let isSourceLoaded : boolean = false;
    // loading beyond grammar core
    let onLoad = loadScript( options.service.sourcePath ).then(()=>{
        let namespace = window['BeyondGrammar'] as { GrammarChecker : IGrammarCheckerConstructor, HighlightOverlayWrapper : IHighlightOverlayWrapperConstructor };

        if( namespace ) {

            GrammarChecker = namespace.GrammarChecker;
            HighlightOverlayWrapper = namespace.HighlightOverlayWrapper;
        }
        
        return new Promise((res)=>{
            setTimeout(()=>{
                isSourceLoaded = true;
                res();
            }, 1000);    
        });
    });
    
    function initPlugin( editor : CKEDITOR.editor ) {
        //nothing for awhile
    }
    
    function onReadyInstance( editor : CKEDITOR.editor ) {
        console.log('onReadyInstance')
        // tryLinkToEditor();
    }
    
    function onModeChanged( editor : CKEDITOR.editor) {
        console.log("onModeChanged");
        tryLinkToEditor(editor);
    }
    
    let plugin : IGrammarChecker;
    
    function tryLinkToEditor(editor : CKEDITOR.editor) {
        if( plugin ) {
            try{
                plugin.clearMarks();
                plugin.deactivate();
            }catch (e) {
                console.error(e);
            }
            plugin = null;
        }
        
        let editable = editor._?.editable?.$;
        if( editable && editor.mode == "wysiwyg" ){
            plugin = new GrammarChecker( 
                editable, options.service, options.grammar,
                new HighlightOverlayWrapper(editable)
            );
            plugin
                .init()
                .then(()=>{
                    plugin.activate();
                });
        }
    }
    
    let callModeChangedWhenInstanceIsReady : boolean = false;
    return {
        init( editor: CKEDITOR.editor ){
            initPlugin(editor);
            
            editor.once("instanceReady", ()=>{
                if( isSourceLoaded ) {
                    onReadyInstance( editor );
                } else {
                    onLoad.then(()=>{
                        onReadyInstance( editor );
                        if( callModeChangedWhenInstanceIsReady ) {
                            onModeChanged( editor );
                        }
                    });
                }
            });

            editor.on('mode', (evt)=>{
                if( isSourceLoaded ) {
                    console.log(evt);
                    onModeChanged( editor );
                } else {
                    callModeChangedWhenInstanceIsReady = true;
                }
            });
        }
    }
}


