"use strict";
phina.globalize();
//Constants
//app.currentScene
const Conf = {
    Debug:true,
    Fps:60,
    ScreenWidth:1500,
    ScreenHeight:1000,
    PlayAreaWidth:1000,
    PlayAreaHeight:1000,
    ScrollSpeed:20,
    HeartRadius:5,
    PlayerHp:5,
    PlayerBulletPower:100,
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
            label:"MainMenu",
            className:"MainMenuScene"
        },
        {
            label:"Game",
            className:"GameScene",
        },
        {
            label:"StageSelect",
            className:"StageSelectScene"
        }
    ],
    DebugSettings:{
        log_path:"",
        target_stage:1,
        target_scene:"Game"
    },

};
const Properties = {
    Stages:[
        {
            info:{
                background:"Bg1",
                stageTimeLimit:10,
            },
            enemies:[
                {
                    when:c=>c === 1,
                    class:"Enemy",
                    x:Conf.GameGrid.center(),
                    y:Conf.GameGrid.center(),
                }
            ]
        }
    ],
    Movements:{
        none:{
            move:function () {}
        },
        basic:[[{x:Conf.GameGrid.center()},1000,"easeInSine"],
        [{y:Conf.GameGrid.center()},1000,"easeOutSine"]],
        basicT:{
            tweens:[
                ["to",{x:100},2000,"linear"],
                [""]
            ],
        },
        basicT2:{
            tweens:[["to",{y:100},2000,""]]
        },
    }
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
        "arcadia":"font/arcadia.ttf",
        "square":"font/Square.ttf",
        "misakigothic":"font/misaki_gothic.ttf",
    },
};
//Scenes
phina.define("GameScene",{
    superClass:"DisplayScene",
    init (options) {
        this.options = (options || {}).$safe(GameScene.defaults);
        this.superInit(this.options);
        (Conf.Debug) && this.enableDebug();
        this.stage = this.getStage(this.options.stage);
        this.players = [];
        this.backgroundColor = "black";
        this.count = 0;
        this.addLayers();
        
        this.addUiBackground(this.uiLayer);
        this.addPlayers(this.gameLayer);
        this.addTimeLimit(this.uiLayer,this.stage.info.stageTimeLimit);
        StageLabel("Stage" + options.stage).addChildTo(this.uiLayer);
        (Conf.Debug) && this.debug();
    },
    debug () {
        
        //KeyMap(this.players).addChildTo(this.uiLayer);
        this.console = MyConsole().addChildTo(this.uiLayer);
    },
    enableDebug () {
        this.options.stage = Conf.DebugSettings.target_stage;
    },
    addLayers () {
        this.gameLayer = DisplayElement().addChildTo(this);
        this.addBackground(this.gameLayer,this.stage.info.background);
        this.playerBulletLayer = DisplayElement().addChildTo(this.gameLayer);
        this.enemyLayer = DisplayElement().addChildTo(this.gameLayer);
        this.uiLayer = DisplayElement().addChildTo(this);
    },
    getStage:stage=>Properties.Stages[stage - 1],
    addBackground:(parent,image)=>{
        let backGrounds = [];
        for(let i = 0;i <= 1;i++) {
            backGrounds.push(new Background({image:image}).addChildTo(parent));
            backGrounds[i].
                setPosition(0,Conf.PlayAreaHeight - backGrounds[i].height * i);
        }
    },
    addUiBackground (parent) {
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
    addTimeLimit (parent,time) {
        TimeLimit(time).addChildTo(parent);
    },
    addPlayers (parent) {
        for(let i = 0;i < this.options.playerNumber;i++) {
            this.players[i] = Player({
                no:i,
                players:this.options.playerNumber,
            }).addChildTo(parent).addHeart(parent);
        }
    },
    update (app) {
        this.console.log(app.frame);
        this.spawnCheck(this.count);
        this.count++;
        if(this.count === this.stage.info.stageTimeLimit * Conf.Fps)this.showResult();
    },
    spawnCheck (c) {
        for(let no in this.stage.enemies) {
            if(this.stage.enemies[no].when(c))this.spawn(this.stage.enemies[no]);
        }
    },
    spawn (enemyInfo) {
        window[enemyInfo.class]().addChildTo(this.enemyLayer).setPosition(Conf.GameGrid.center(),Conf.GameGrid.center());;
    },
    showResult () {
        console.log("test1");
        this.app.pushScene(ResultScene({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
        },{
            stage:this.options.stage
        }));
        this.moveScene("MainMenu");
    },
    moveScene (scene) {
        RectangleShape({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.center(),
        }).addChildTo(this)
            .tweener.set({alpha:0})
            .fadeIn(1000)
            .call(()=>this.exit(scene));
    },
    _static:{
        defaults:{
            playerNumber:2,
        }
    }
});
phina.define("MainMenuScene",{
    superClass:"DisplayScene",
    init (options) {
        this.superInit(options);
        this.selectedNum = 0;
        this.selected = false;
        this.menuList = [["Start","StageSelect"],["TEST","null"]];
        this.createBackground("black","#2727A4");
        this.addTitle();
        this.addMenu(this.menuList);
        this.pointer = Pointer(this.labels[this.selectedNum]).addChildTo(this);
        this.setLabelColor();
        this.setAnimation();
    },
    update (app) {
        this.movePointer(app.keyboard);
    },
    createBackground (colour1,colour2) {
        const grad = Canvas.createLinearGradient(0, 0, 0,Conf.ScreenHeight);
        grad.addColorStop(0.5, colour1);
        grad.addColorStop(1, colour2);
        this.backgroundColor = grad;
    },
    addTitle () {
        this.title = Label({
            text:"REBELLION FORCE",
            fill:"yellow",
            fontFamily:"arcadia",
            fontSize:80,
            x:this.gridX.center(),
            y:this.gridY.span(2),
        }).addChildTo(this);
        this.subTitle = Label({
            text:"BETA",
            fill:"white",
            fontSize:60,
            fontFamily:"misakigothic",
            x:this.gridX.center(),
            y:this.gridY.span(4),
        }).addChildTo(this);
    },
    addMenu (menuList) {
        this.labels = [];
        for(let i in menuList) {
            this.labels[i] = Label({
                text:menuList[i][0],
                align:"center",
                fill:"white",
                fontSize:80,
                fontFamily:"square",
                width:500,
                x:this.gridX.center(),
                y:this.gridY.span(7 + i * 3),
            }).addChildTo(this);
        }
    },
    setAnimation () {
        this.title.tweener.clear()
            .call(()=>this.title.alpha = 0,this.subTitle.alpha = 0)
            .fadeIn(3000)
            .call(()=>this.subTitle.tweener.fadeIn(1000));
        
        this.pointer.tweener.fadeOut(250).fadeIn(250).setLoop(true);
    },
    moveScene (scene) {
        RectangleShape({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.center(),
        }).addChildTo(this)
            .tweener.set({alpha:0})
            .fadeIn(1000)
            .call(()=>this.exit(scene));
    },
    setLabelColor () {
        (this.menuList.length).times(i=>{
            if(i === this.selectedNum)this.labels[i].fill = "yellow";
            else this.labels[i].fill = "white";
        });
    },
    movePointer (key) {
        if(key.getKeyDown("up") && this.selectedNum > 0 && !this.selected) {
            this.selectedNum--;
            this.setLabelColor();
            this.pointer.move(this.labels[this.selectedNum]);
        }
        if(key.getKeyDown("down") && this.selectedNum < this.labels.length - 1 && !this.selected) {
            this.selectedNum++;
            this.setLabelColor();
            this.pointer.move(this.labels[this.selectedNum]);
        }
        if(key.getKeyDown("enter")) {
            this.selected = true;
            this.moveScene(this.menuList[this.selectedNum][1]);
        }
    }
});
phina.define("StageSelectScene",{
    superClass:"DisplayScene",
    init (options) {
        this.superInit(options);
        this.backgroundColor = "black";
        this.fadeIn();
        this.addToggleButton();
        this.addMenu();
        this.pointer = Pointer(this.menuItems[this.selectedNum]).addChildTo(this);
        this.setAnimation();
        this.addBackButton("MainMenu");
    },
    update (app) {
        this.movePointer(app.keyboard);
    },
    createBackground (colour1,colour2) {
        const grad = Canvas.createLinearGradient(0, 0, 0,Conf.ScreenHeight);
        grad.addColorStop(0.5, colour1);
        grad.addColorStop(1, colour2);
        this.backgroundColor = grad;
    },
    fadeIn () {
        RectangleShape({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.center(),
        }).addChildTo(this)
            .tweener
            .call(()=>this.createBackground("black","#2727A4"))
            .fadeOut(1000);
    },
    addToggleButton () {
        this.isMultiPlayer = false;
        RectangleShape({
            width:this.gridX.span(10),
            height:this.gridY.span(3),
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.span(10),
        })
            .setInteractive(true)
            .addChildTo(this)
            .onpointstart = ()=>{
                this.isMultiPlayer = this.isMultiPlayer ? false : true;
                this.multiLabel.text = this.isMultiPlayer ? "マルチプレイ" : "シングルプレイ";
            };
        this.multiLabel = Label({
            text:"シングルプレイ",
            fontFamily:"misakigothic",
            fontSize:100,
            fill:"white",
            x:this.gridX.center(),
            y:this.gridY.span(10),
        }).addChildTo(this);
    },
    addMenu () {
        this.selectedNum = 0;
        this.selected = false;
        this.menuItems = [];
        Label({
            text:"ステージを選んでください",
            fontFamily:"misakigothic",
            fontSize:100,
            fill:"white",
            x:this.gridX.center(),
            y:this.gridY.span(1),
        }).addChildTo(this);
        (14).times((i)=>{//Stages.length
            this.menuItems[i] = Label({
                text:"   " + String(i + 1),
                fontSize:80,
                fontFamily:"square",
                x:this.gridX.span(i % 7 + 1) * 2,
                y:this.gridY.span(Math.floor(i / 7 + 2) * 2),
                fill:"white",
            }).addChildTo(this);
        }); 
        this.setLabelColor();
    },
    setAnimation () {
        this.pointer.tweener.fadeOut(250).fadeIn(250).setLoop(true);
    },
    addBackButton (scene) {
        TriangleShape({
            x:this.gridX.span(1),
            y:this.gridY.span(1),
            fill:"blue",
            rotation:270,
            radius:35,
            stroke:"transparent",
        })
            .setInteractive(true)
            .addChildTo(this)
            .onpointstart = ()=>this.moveScene(scene);

    },
    setLabelColor () {
        (this.menuItems.length).times(i=>{
            if(i === this.selectedNum)this.menuItems[i].fill = "yellow";
            else this.menuItems[i].fill = "white";
        });
    },
    movePointer (key) {
        if(key.getKeyDown("left") 
            && this.selectedNum > 0 
            && !this.selected) {
            this.selectedNum --;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
            
        }
        if(key.getKeyDown("right") 
            && this.selectedNum < this.menuItems.length - 1 
            && !this.selected) {
            this.selectedNum ++;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
        if(key.getKeyDown("up") 
            && this.selectedNum - 7 >= 0 
            && !this.selected) {
            this.selectedNum -= 7;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
        if(key.getKeyDown("down") 
            && this.selectedNum + 7 < this.menuItems.length 
            && !this.selected) {
            this.selectedNum += 7;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
        (key.getKeyDown("escape")) && this.exit("MainMenu");
        if(key.getKey("enter")) {
            this.selected = true;
            this.moveScene("Game",{stage:this.selectedNum + 1,isMultiPlayer:this.isMultiPlayer});
        }
    },
    moveScene (scene,options) {
        this.options = options || {};
        RectangleShape({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.center(),
        }).addChildTo(this)
            .tweener.set({alpha:0})
            .fadeIn(1000)
            .call(()=>this.exit(scene,this.options));
    }
});
phina.define("ResultScene",{
    superClass:"DisplayScene",
    init (options,info) {
        this.superInit(options);
        console.log("test");
        this.backgroundColor = "rgba(0, 0, 0, 0.7)";
        this.addLabels(this,info);
    },
    update (app) {
        if(app.keyboard.getKeyDown("enter")) {
            this.exit();
        }
    },
    addLabels (parent,{stage,score,isCleared}) {
        this.title = Label({
            text:"Result",
            fill:"yellow",
            fontFamily:"arcadia",
            fontSize:120,
            x:this.gridX.center(),
            y:this.gridY.span(2),
        }).addChildTo(parent);
        this.stageName = Label({
            text:"Stage:" + String(stage),
            fill:"white",
            fontSize:100,
            fontFamily:"square",
            x:this.gridX.center(),
            y:this.gridY.span(4),
        }).addChildTo(parent);
    }
});
//Components
phina.define("Pointer",{
    superClass:"TriangleShape",
    init (label) {
        this.superInit({
            fill:"blue",
            radius:30,
            x:label.left,
            y:label.y,
            rotation:90,
            origin:(1,0.5),
            stroke:"transparent",
        });
    },
    move (label) {
        this.setPosition(label.left,label.y);
    }
});
phina.define("Background",{
    superClass:"Sprite",
    init (options) {
        this.options = (options || {}).$safe(Background.defaults);
        this.superInit(options.image);
        this.width = Conf.PlayAreaWidth;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
        }
    },
    update () {
        this.y += Conf.ScrollSpeed;
        if(this.y >= this.height + Conf.PlayAreaHeight)this.y = Conf.PlayAreaHeight - this.height;
    },
});
phina.define("Player",{
    superClass:"Sprite",
    init (options) {
        this.options = (options || {}).$safe(Player.defaults);
        this.superInit(this.options.images.player[this.options.no]);
        this.setPosition(
            Conf.GameGrid.center
            (this.options.initialPositions[this.options.players - 1][this.options.no].x),
            Conf.GameGrid.center
            (this.options.initialPositions[this.options.players - 1][this.options.no].y));
        //this.addHeart(this.parent);
    },
    update (app) {
        this.move(app);
        (app.frame % (Conf.Fps / 5) === 0)
            && this.shoot(app.currentScene[this.options.bullet.bulletLayer]);
    },
    move ({keyboard:key}) {
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
    shoot (parent) {
        for(let i = 1;i <= this.options.bullet.bulletNumber / 2;i++) {
            PlayerBullet(this.x - this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
            PlayerBullet(this.x + this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
        }
    },
    addHeart (parent) {
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
                [{x:0,y:3}],
                [{x:-3,y:-3},{x:3,y:-3}],
                //gridCenter
            ]
        }
    }
});
phina.define("Enemy",{
    superClass:"Sprite",
    init () {
        this.options = ({}).$safe(Enemy.defaults);
        this.superInit("Enemy1");
        this.hp = 1000;
        Tweener().fromJSON(Properties.Movements.basicT).attachTo(this);
        Tweener().fromJSON(Properties.Movements.basicT2).attachTo(this)
    },
    setGauge () {
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
    update (app) {
        (app.currentScene.playerBulletLayer) && app.currentScene.playerBulletLayer.children.some((bullet)=>
            (this.hitTestElement(bullet)) && this.hitBullet(bullet));
        //Properties.Movements[this.options.movPattern].move(this);
    },
    damage (power) {
        this.hp -= power;
        if(this.hp <= 0) {
            this.remove();
        }
    },
    hitBullet (bullet) {
        bullet.remove();
        this.damage(Conf.PlayerBulletPower);
    },
    _static:{
        defaults:{
            movPattern:"basic",
        }
    }
});
phina.define("Heart",{
    superClass:"CircleShape",
    init (player) {
        this.superInit();
        this.player = player;
        this.radius = Conf.HeartRadius;
        this.fill = "#850101";
        this.strokeWidth = 0;
    },
    update () {
        this.setPosition(this.player.x,this.player.y);
    }
});
phina.define("PlayerBullet",{
    superClass:"Sprite",
    init (x,y,options) {
        this.options = (options || {}).$safe(PlayerBullet.defaults);
        this.superInit(this.options.image);
        this.width = this.options.width;
        this.speed = this.options.speed;
        this.setPosition(x,y);
    },
    update () {
        this.y -= this.speed;
        (this.left > Conf.PlayAreaWidth 
            || this.right < 0 
            || this.top > Conf.PlayAreaHeight 
            || this.bottom < 0) 
            && this.remove();
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
    init (stageName) {
        this.superInit(stageName);
        this.setPosition(Conf.GameGrid.center(),Conf.GameGrid.center());
        this.fontSize = 200;
        this.fontFamily = "Square";
        this.fill = "white";
        this.alpha = 0;
        this.tweener.
            clear().
            fadeIn(Conf.LabelAnimationTime * 250).
            wait(Conf.LabelAnimationTime * 750).
            to({left:(Conf.ScreenWidth + Conf.PlayAreaWidth) / 2 - 50,
                y:0 + 70,fontSize:100},
            Conf.LabelAnimationTime * 2000,"easeOutCubic");
    }
});
phina.define("KeyMap",{
    superClass:"DisplayElement",
    init (players) {
        this.keys;
    }
});
phina.define("MyConsole",{
    superClass:"Label",
    init:function () {
        this.superInit({
            fill:"white",
            fontFamily:"square",
            fontSize:15,
            origin:{
                x:0,
                y:0,
            }
        });
        this.logs = [];
        this.maxLog = 15;
        this.setPosition(Conf.PlayAreaWidth,Conf.PlayAreaHeight - 17 * this.maxLog);
        this.setOrigin(0,0);
        this.reload();
    },
    log (text) {
        (this.logs.length > this.maxLog) && this.logs.shift();
        this.logs.push(text);
        this.reload();
    },
    reload () {
        this.text = "";
        for(let s in this.logs)this.text += this.logs[this.logs.length - s - 1] + "\n";
    }
});
phina.define("TimeLimit", {
    superClass: "Label",
    init: function (time) {
        console.log(time);
        this.superInit({
            text:String(time),
            originX:0,
            originY:0,
            fontSize:25,
            fontFamily:"square",
            fill:"white"
        });
        this.setPosition(Conf.PlayAreaWidth - this.fontSize * 3, 0);
        
    },
    update: function (app) {
        if (app.frame % Conf.Fps === 0 && Number(this.text) > 0)
            this.text = Number(this.text - 1);
    },
});
phina.define("Life", {
    superClass: "Label",
    init: function () {
        /*
        this.no = no || 0;
        this.superInit("Player HP:" + Player_Hp);
        this.setOrigin(0, 0);
        this.fontSize = 50;
        this.fontFamily = "Square";
        this.setPosition(Play_Area_Width, 75 + 10 + this.no * 50);
        this.fill = "white";
        */
    },
    update: function () {
        this.text = "Player" + (this.no + 1) + " HP:" + heart[this.no].hp;
    }
});
//Main
phina.main(function () {
    let app = GameApp({
        startLabel:!Conf.Debug ? "PhinaSplash" : Conf.DebugSettings.target_scene,
        assets:Assets,
        width:Conf.ScreenWidth,
        height:Conf.ScreenHeight,
        scenes:Conf.MyScenes,
    });
    app.fps = Conf.Fps;
    (Conf.Debug) && app.enableStats();
    app.run();
});