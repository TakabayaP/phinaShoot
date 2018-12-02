"use strict";
phina.globalize();
const Conf={
    Debug:true,
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
        
        {
            info:{
                background:"Bg1"
            }
        }
        
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
        this.backgroundColor="black";
        if(Conf.Debug)this.enableDebug();
        this.stage=this.getStage(this.options.stage);
        this.gameLayer=DisplayElement().addChildTo(this);
        this.addBackground(this.gameLayer,this.stage.info.background);
    },
    enableDebug:function(){
        this.options.stage=Conf.DebugSettings.target_stage;
    },
    getStage:stage=>Conf.Stages[stage-1],
    addBackground:function(parent,image){
        let backGrounds=[];
        for(let i=0;i<=2;i++){
            backGrounds.push(new Background(image).addChildTo(parent));
            backGrounds[i].setPosition(0,Conf.PlayAreaHeight-backGrounds[i].height*i);
        }
    }
});
phina.define("Background",{
    superClass:"Sprite",
    init:function(options){
        var options = (options || {}).$safe(Background.defaults);
        this.superInit("Bg1");//options.image);
        this.width=Conf.PlayAreaWidth;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
        }
    },
    update:function(a){
        this.y+=Conf.ScrollSpeed;
        if(this.y>=this.height+Conf.PlayAreaHeight){
            this.y=Conf.PlayAreaHeight-this.height;
        }
    },
});
phina.main(function(){
    let app=GameApp({
        startLabel:!Conf.Debug?"PhinaSplash":"Game",
        assets:Assets,
        width:Conf.ScreenWidth,
        height:Conf.ScreenHeight,
        scenes:Conf.MyScenes,
    });
    app.fps=Conf.Fps;
    if(Conf.Debug)app.enableStats();
    app.run();
});