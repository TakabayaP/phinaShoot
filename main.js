"use strict";
phina.globalize();
//Constants
const Conf = {
    Debug:true,
    Fps:60,
    ScreenWidth:1500,
    ScreenHeight:1000,
    PlayAreaWidth:1000,
    PlayAreaHeight:1000,
    ScrollSpeed:15,
    heartRadius:5,
    GameGrid:Grid({
        width:1000,
        columns:17,
    }),
    LabelAnimationTime:1,
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
const Assets = {
    image:{
        Bg1:"img/backgray.png",
        P1:"img/player1.png",
        P2:"img/player2.png",
        Enemy1:"img/enemies/enemy1.png",
        PlayerBullet1:"img/bullets/own_bullet_big.png"
    },
    font:{
        //"arcadia":"font/arcadia.ttf",
        "square":"font/Square.ttf",
        //"misakigothic":"font/misaki_gothic.ttf",
    },
};
//Scenes
phina.define("GameScene",{
    superClass:"DisplayScene",
    init:function(options) {
        this.options = (options || {}).$safe(GameScene.defaults);
        this.superInit(this.options);
        this.players = [];
        this.backgroundColor = "black";
        if(Conf.Debug)this.enableDebug();
        this.stage = this.getStage(this.options.stage);
        this.gameLayer = DisplayElement().addChildTo(this);
        this.addBackground(this.gameLayer,this.stage.info.background);
        this.uiLayer = DisplayElement().addChildTo(this);
        this.playerBulletLayer = DisplayElement().addChildTo(this.gameLayer);
        this.addUiBackground(this.uiLayer);
        this.addPlayers(this.gameLayer);
        this.debug();
    },
    debug:function() {
        Enemy().addChildTo(this.gameLayer).setPosition(Conf.GameGrid.center(),Conf.GameGrid.center());
        StageLabel("test").addChildTo(this.uiLayer);
    },
    enableDebug:function() {
        this.options.stage = Conf.DebugSettings.target_stage;
    },
    getStage:stage=>Conf.Stages[stage - 1],
    addBackground:(parent,image)=>{
        let backGrounds = [];
        for(let i = 0;i <= 1;i++) {
            backGrounds.push(new Background({image:image}).addChildTo(parent));
            backGrounds[i].setPosition(0,Conf.PlayAreaHeight - backGrounds[i].height * i);
        }
    },
    addUiBackground:function(parent) {
        let grad = Canvas.createLinearGradient(0, 300, 0,-200);
        grad.addColorStop(0,"black");
        grad.addColorStop(1,"#2727A4");
        this.uiBack = RectangleShape({
            x:Conf.PlayAreaHeight - 8,
            y:-10,
            width:Conf.ScreenWidth - Conf.PlayAreaWidth,
            height:Conf.ScreenHeight + 10,
            fill:grad,
            strokeWidth:0,
        }).setOrigin(0,0).addChildTo(parent);
    },
    addPlayers:function(parent) {
        for(let i = 0;i < this.options.playerNumber;i++) {
            Player({
                no:i,
                players:this.options.playerNumber,
            }).addChildTo(parent).addHeart(parent);
        }

    },
    _static:{
        defaults:{
            playerNumber:2,
        }
    }
});
//Components
phina.define("Background",{
    superClass:"Sprite",
    init:function(options) {
        this.options = (options || {}).$safe(Background.defaults);
        this.superInit(options.image);
        this.width = Conf.PlayAreaWidth;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
        }
    },
    update:function() {
        this.y += Conf.ScrollSpeed;
        if(this.y >= this.height + Conf.PlayAreaHeight) {
            this.y = Conf.PlayAreaHeight - this.height;
        }
    },
});
phina.define("Player",{
    superClass:"Sprite",
    init:function(options) {
        this.options = (options || {}).$safe(Player.defaults);
        this.superInit(this.options.images.player[this.options.no]);
        this.setPosition(
            Conf.GameGrid.center(this.options.initialPositions[this.options.players - 1][this.options.no][0]),
            Conf.GameGrid.center(this.options.initialPositions[this.options.players - 1][this.options.no][1]));
        //this.addHeart(this.parent);
    },
    update:function(app) {
        this.move(app);
        if(app.frame % (Conf.Fps / 5) === 0)this.shoot(app.currentScene[this.options.bullet.bulletLayer]);
    },
    move:function({keyboard:key}) {
        const{keys,speed,no:n} = this.options;
        if(key.getKey(keys.right[n])) {
            if(this.right + speed < Conf.PlayAreaWidth)this.x += speed;
            else this.right = Conf.PlayAreaWidth;
        }       
        if(key.getKey(keys.left[n])) {
            if(this.left - speed > 0)this.x -= speed;
            else this.left = 0;
        }
        if(key.getKey(keys.up[n])) {
            if(this.top - speed > 0)this.y -= speed;
            else this.top = 0;
        }
        if(key.getKey(keys.down[n])) {
            if(this.bottom + speed < Conf.PlayAreaHeight)this.y += speed;
            else this.bottom = Conf.PlayAreaHeight;
        }
    },
    shoot:function(parent) {
        for(let i = 1;i <= this.options.bullet.bulletNumber / 2;i++) {
            PlayerBullet(this.x - this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
            PlayerBullet(this.x + this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
        }
    },
    addHeart:function(parent) {
        this.heart = Heart(this).addChildTo(parent);
    },
    _static:{
        defaults:{
            no:0,
            players:1,
            speed:13,
            bullet:{
                bulletInterval:10,
                bulletNumber:4,
                bulletLayer:"playerBulletLayer",
            },
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
phina.define("Enemy",{
    superClass:"Sprite",
    init:function() {
        this.superInit("Enemy1");
    },
    setGauge() {
        this.hpGauge = Gauge({
            x: this.x, 
            y: this.top,
            width: this.gaugeSetting.width,
            height: 10,
            cornerRadius: 0,
            maxValue: this.hp,
            value: this.hp,
            fill: "transparent",
            gaugeColor: this.gaugeSetting.color,//#850101
            stroke: "black",
            strokeWidth: 0,
        });
    },
    _static:{
        defaults:{

        }
    }
});
phina.define("Heart",{
    superClass:"CircleShape",
    init:function(player) {
        this.superInit();
        this.player = player;
        this.radius = Conf.heartRadius;
        this.fill = "#850101";
        this.strokeWidth = 0;
    },
    update:function() {
        this.setPosition(this.player.x,this.player.y);
    }
});
phina.define("PlayerBullet",{
    superClass:"Sprite",
    init:function(x,y,options) {
        this.options = (options || {}).$safe(PlayerBullet.defaults);
        this.superInit(this.options.image);
        this.width = this.options.width;
        this.speed = this.options.speed;
        this.setPosition(x,y);
    },
    update:function() {
        this.y -= this.speed;
        (this.left > Conf.PlayAreaWidth || this.right < 0 || this.top > Conf.PlayAreaHeight || this.bottom < 0) && this.remove();
    },
    _static:{
        defaults:{
            image:"PlayerBullet1",
            speed:35,
            width:10,
        }
    }
});
//UIs
phina.define("StageLabel", {
    superClass: "Label",
    init: function (stageName) {
        this.superInit(stageName);
        this.setPosition(Conf.GameGrid.center(),Conf.GameGrid.center());
        this.fontSize = 200;
        this.fontFamily = "Square";
        this.fill = "white";
        this.strokeWidth = 1111111;
        this.alpha = 0;
        //log.log("breaking into " + text);
        this.tweener.
            clear().
            fadeIn(Conf.LabelAnimationTime * 250).
            wait(Conf.LabelAnimationTime * 750).
            to({left:(Conf.ScreenWidth + Conf.PlayAreaWidth) / 2 - 50,y:0 + 70,fontSize:100},Conf.LabelAnimationTime * 2000,"easeOutCubic");
        //fadeOut(Conf.LabelAnimationTime * 250);

    }
});
//Main
phina.main(function() {
    let app = GameApp({
        startLabel:!Conf.Debug ? "PhinaSplash" : "Game",
        assets:Assets,
        width:Conf.ScreenWidth,
        height:Conf.ScreenHeight,
        scenes:Conf.MyScenes,
    });
    app.fps = Conf.Fps;
    if(Conf.Debug)app.enableStats();
    app.run();
});