"use strict";
phina.globalize();
const Assets={
    Debug:false,
    Fps:60,
    ScreenWidth:1500,
    ScreenHeight:960,
    MyScenes:[
        {
            label:"PhinaSplash",
            className:"SplashScene"
        },
        {
            label:"Game",
            className:"GameScene",
        }
    ],
    DebugSettings:{
        log_path:"",
        target_stage:1,
    }
};
phina.define("GameScene",{
    superClass:"DisplayScene",
    init:function(options){
        this.superInit(options);
    }
});
phina.main(function(){
    let app=GameApp({
        startLabel:"PhinaSplash",
        //assets:Assets,
        width:Assets.ScreenWidth,
        height:Assets.ScreenHeight,
        scenes:Assets.MyScenes,
    });
    app.fps=Assets.Fps;
    if(Assets.Debug)app.enableStats();
    app.run();
});