"use strict";
phina.globalize();
//Constants
const Conf={
    Debug:true,
    Fps:60,
    ScreenWidth:1500,
    ScreenHeight:960,
    PlayAreaWidth:1000,
    PlayAreaHeight:1000,
    ScrollSpeed:15,
    GameGrid:Grid({
        width:1000,
        columns:17,
    }),
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
        Bg1:"img/back2.png",
        P1:"img/player1.png",
        P2:"img/player2.png",
    },
};
//Scenes
phina.define("GameScene",{
    superClass:"DisplayScene",
    init:function(options){
        this.superInit(options);
        this.options=options;
        this.backgroundColor="black";
        if(Conf.Debug)this.enableDebug();
        this.stage=this.getStage(this.options.stage);
        this.gameLayer=DisplayElement().addChildTo(this);
        this.uiLayer = DisplayElement().addChildTo(this);
        this.addBackground(this.gameLayer,this.stage.info.background);
        this.addUiBackground(this.uiLayer);
        Player().addChildTo(this);
    },
    enableDebug:function(){
        this.options.stage=Conf.DebugSettings.target_stage;
    },
    getStage:stage=>Conf.Stages[stage-1],
    addBackground:(parent,image)=>{
        let backGrounds=[];
        for(let i=0;i<=1;i++){
            backGrounds.push(new Background({image:image}).addChildTo(parent));
            backGrounds[i].setPosition(0,Conf.PlayAreaHeight-backGrounds[i].height*i);
        }
    },
    addUiBackground:function(parent){
        let grad = Canvas.createLinearGradient(0, 300, 0,-200);
        grad.addColorStop(0,"black");
        grad.addColorStop(1,"#2727A4");
        this.uiBack=RectangleShape({
            x:Conf.PlayAreaHeight-8,
            y:-10,
            width:Conf.ScreenWidth-Conf.PlayAreaWidth,
            height:Conf.ScreenHeight+10,
            fill:grad,
            strokeWidth:0,
        }).setOrigin(0,0).addChildTo(parent);
    },
    addPlayer:function(){
    }
});
//Other Components
phina.define("Background",{
    superClass:"Sprite",
    init:function(options){
        this.options=(options||{}).$safe(Background.defaults);
        this.superInit(options.image);
        this.width=Conf.PlayAreaWidth;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
        }
    },
    update:function(){
        this.y+=Conf.ScrollSpeed;
        if(this.y>=this.height+Conf.PlayAreaHeight){
            this.y=Conf.PlayAreaHeight-this.height;
        }
    },
});
phina.define("Player",{
    superClass:"Sprite",
    init:function(options){
        this.options=(options||{}).$safe(Player.defaults);
        this.superInit(this.options.images.player[this.options.no]);
        this.setPosition(
            Conf.GameGrid.center(this.options.initialPositions[this.options.players-1][this.options.no][0]),
            Conf.GameGrid.center(this.options.initialPositions[this.options.players-1][this.options.no][1]));
    },
    update:function(app){
        this.move(app);
    },
    move:function(app){
        let key=app.keyboard,keys=this.options.keys,speed=this.options.speed,n=this.options.no;
        if(key.getKey(keys.right[n])){
            if(this.right+speed<Conf.PlayAreaWidth)this.x+=speed;
            else this.right=Conf.PlayAreaWidth;
        }       
        if(key.getKey(keys.left[n])){
            if(this.left-speed>0)this.x-=speed;
            else this.left=0;
        }
        if(key.getKey(keys.up[n])){
            if(this.up-speed>0)this.x-=speed;
            else this.up=0;
        }
        if(key.getKey(keys.down)){
            if(this.down+speed<Conf.PlayAreaHeight)this.y+=speed;
            else this.down=Conf.PlayAreaHeight;
        }
    },
    _static:{
        defaults:{
            no:0,
            players:1,
            speed:13,
            keys:{
                slow:["shift","shift"],
                right:["right","d"],
                left:["left","a"],
                up:["up","w"],
                down:["down","s"],
            },
            images:{
                player:["P1","P2"]
            },
            initialPositions:[
                [[0,3]],
                [[-3,-3],[3,-3]],
                //gridCenter
            ]
        }
    }
});
//Main
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