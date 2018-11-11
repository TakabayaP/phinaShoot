"use strict";
phina.globalize();
const Conf={
    Debug:false,
    Fps:60,
    ScreenWidth:1500,
    ScreenHeight:960,
    PlayAreaWidth:1000,
    PlayAreaHeight:1000,
    ScrollSpeed:15,
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
    },
    Stages:[


    ]
};
const Assets={
    image:{
        Bg1:"img/back2.png"
    },
};
phina.define("GameScene",{
    superClass:"DisplayScene",
    init:function(options){
        this.superInit(options);
        this.options=options;
        if(Conf.Debug)this.options.stage=Conf.DebugSettings.target_stage;
        this.stageMap=Conf.Stages[this.options.stage];
        console.log(new Background());
    }
});
phina.define("Background",{
    superClass:"Sprite",
    init:function(options){
        this.superInit("Bg1");//options.image);
        //this.width=options.width;
        //this.height=options.height;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
            width:Conf.PlayAreaWidth,
            height:this._height*(Conf.PlayAreaWidth/this._width),
        }
    }
});
phina.main(function(){
    let app=GameApp({
        startLabel:"PhinaSplash",
        assets:Assets,
        width:Conf.ScreenWidth,
        height:Conf.ScreenHeight,
        scenes:Conf.MyScenes,
    });
    app.fps=Conf.Fps;
    if(Conf.Debug)app.enableStats();
    app.run();
});