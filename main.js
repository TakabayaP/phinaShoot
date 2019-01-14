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
        target_scene:"StageSelect"
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
        "arcadia":"font/arcadia.ttf",
        "square":"font/Square.ttf",
        "misakigothic":"font/misaki_gothic.ttf",
    },
};
//Scenes
phina.define("GameScene",{
    superClass:"DisplayScene",
    init(options) {
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
        if(Conf.Debug)this.debug();
    },
    debug() {
        Enemy().
            addChildTo(this.gameLayer).
            setPosition(Conf.GameGrid.center(),Conf.GameGrid.center());
        StageLabel("test").addChildTo(this.uiLayer);
        //KeyMap(this.players).addChildTo(this.uiLayer);
        this.console = MyConsole().addChildTo(this.uiLayer);
    },
    enableDebug() {
        this.options.stage = Conf.DebugSettings.target_stage;
    },
    getStage:stage=>Conf.Stages[stage - 1],
    addBackground:(parent,image)=>{
        let backGrounds = [];
        for(let i = 0;i <= 1;i++) {
            backGrounds.push(new Background({image:image}).addChildTo(parent));
            backGrounds[i].
                setPosition(0,Conf.PlayAreaHeight - backGrounds[i].height * i);
        }
    },
    addUiBackground(parent) {
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
    addPlayers(parent) {
        for(let i = 0;i < this.options.playerNumber;i++) {
            this.players[i] = Player({
                no:i,
                players:this.options.playerNumber,
            }).addChildTo(parent).addHeart(parent);
        }
    },
    update(app) {
        this.console.log(app.frame);
    },
    _static:{
        defaults:{
            playerNumber:2,
        }
    }
});
phina.define("MainMenuScene",{
    superClass:"DisplayScene",
    init(options) {
        this.superInit(options);
        this.selectedNum = 0;
        this.selected = false;
        this.menuList = [["Start","Game"],["TEST","null"]];
        this.createBackground("black","#2727A4");
        this.addTitle();
        this.addMenu(this.menuList);
        this.pointer = Pointer(this.labels[this.selectedNum]).addChildTo(this);
        this.setLabelColor();
        this.setAnimation();
    },
    update(app) {
        this.movePointer(app.keyboard);
    },
    createBackground(colour1,colour2) {
        const grad = Canvas.createLinearGradient(0, 0, 0,Conf.ScreenHeight);
        grad.addColorStop(0.5, colour1);
        grad.addColorStop(1, colour2);
        this.backgroundColor = grad;
    },
    addTitle() {
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
    addMenu(menuList) {
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
    setAnimation() {
        this.title.tweener.clear()
            .call(()=>this.title.alpha = 0,this.subTitle.alpha = 0)
            .fadeIn(3000)
            .call(()=>this.subTitle.tweener.fadeIn(1000));
        
        this.pointer.tweener.fadeOut(250).fadeIn(250).setLoop(true);
    },
    moveScene(scene) {
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
    setLabelColor() {
        (this.menuList.length).times(i=>{
            if(i == this.selectedNum)this.labels[i].fill = "yellow";
            else this.labels[i].fill = "white";
        });
    },
    movePointer(key) {
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
    init:function(options) {
        this.superInit(options);
        this.createBackground("black","#2727A4");
        this.fadeIn();
        this.addToggleButton();
        this.addMenu();
        this.pointer = Pointer(this.menuItems[this.selectedNum]).addChildTo(this);
        this.setAnimation();
        this.addBackButton("MainMenu");
    },
    update(app) {
        this.movePointer(app.keyboard);
    },
    /*
    update:function(app) {
        key = app.keyboard;
       if(key.getKeyDown("enter")) {
            if(this.selectnum >= StageNumber)this.app.pushScene(AlertScene(this.options,"このステージはまだ開放されていません"));
            else {
                this.selected = true;
                var self = this;
                self.selectedNum = self.selectNum;
                var fillrect = RectangleShape({
                    width:Screen_Width * 2,
                    height:Screen_Height * 2,
                    fill:"black",
                    x:self.gridX.center(),
                    y:self.gridY.center(),}).addChildTo(self);
                fillrect.alpha = 0;
                fillrect.tweener.fadeIn(1000).call(function() {
                    self.exit("Stage",{stage:self.selectedNum + 1,multi:self.multi});
                });
            }
        }
        if(key.getKeyDown("escape"))this.exit("MainMenu");
        (StageNumber).times(function(i) {
            if(i == this.selectNum)this.labels[i].fill = "yellow";
            else{this.labels[i].fill = "white";}
        },this);
    },*/
    createBackground(colour1,colour2) {
        const grad = Canvas.createLinearGradient(0, 0, 0,Conf.ScreenHeight);
        grad.addColorStop(0.5, colour1);
        grad.addColorStop(1, colour2);
        this.backgroundColor = grad;
    },
    fadeIn() {
        RectangleShape({
            width:Conf.ScreenWidth,
            height:Conf.ScreenHeight,
            fill:"black",
            x:this.gridX.center(),
            y:this.gridY.center(),
        }).addChildTo(this)
            .tweener
            .fadeOut(1000);
    },
    addToggleButton() {
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
    addMenu() {
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
        (14).times((i)=>{//Conf.Stages.length
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
    setAnimation() {
        this.pointer.tweener.fadeOut(250).fadeIn(250).setLoop(true);
    },
    addBackButton(scene) {
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
            .onpointstart = ()=>this.exit(scene);

    },
    setLabelColor() {
        (this.menuItems.length).times(i=>{
            if(i == this.selectedNum)this.menuItems[i].fill = "yellow";
            else this.menuItems[i].fill = "white";
        });
    },
    movePointer(key) {
        
        if(key.getKeyDown("left") && this.selectedNum > 0 && !this.selected) {
            this.selectedNum --;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
            
        }
        if(key.getKeyDown("right") && this.selectedNum < this.menuItems.length - 1 && !this.selected) {
            this.selectedNum ++;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
        if(key.getKeyDown("up") && this.selectedNum - 7 >= 0 && !this.selected) {
            this.selectedNum -= 7;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
        if(key.getKeyDown("down") && this.selectedNum + 7 < this.menuItems.length && !this.selected) {
            this.selectedNum += 7;
            this.setLabelColor();
            this.pointer.move(this.menuItems[this.selectedNum]);
        }
    }
});
//Components
phina.define("Pointer",{
    superClass:"TriangleShape",
    init(label) {
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
    move(label) {
        this.setPosition(label.left,label.y);
    }
});
phina.define("Background",{
    superClass:"Sprite",
    init(options) {
        this.options = (options || {}).$safe(Background.defaults);
        this.superInit(options.image);
        this.width = Conf.PlayAreaWidth;
        this.setOrigin(0,1);
    },
    _static:{
        defaults:{
        }
    },
    update() {
        this.y += Conf.ScrollSpeed;
        if(this.y >= this.height + Conf.PlayAreaHeight) {
            this.y = Conf.PlayAreaHeight - this.height;
        }
    },
});
phina.define("Player",{
    superClass:"Sprite",
    init(options) {
        this.options = (options || {}).$safe(Player.defaults);
        this.superInit(this.options.images.player[this.options.no]);
        this.setPosition(
            Conf.GameGrid.center(this.options.initialPositions[this.options.players - 1][this.options.no][0]),
            Conf.GameGrid.center(this.options.initialPositions[this.options.players - 1][this.options.no][1]));
        //this.addHeart(this.parent);
    },
    update(app) {
        this.move(app);
        if(app.frame % (Conf.Fps / 5) === 0)this.shoot(app.currentScene[this.options.bullet.bulletLayer]);
    },
    move({keyboard:key}) {
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
    shoot(parent) {
        for(let i = 1;i <= this.options.bullet.bulletNumber / 2;i++) {
            PlayerBullet(this.x - this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
            PlayerBullet(this.x + this.options.bullet.bulletInterval * i,this.y).addChildTo(parent);
        }
    },
    addHeart(parent) {
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
    init() {
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
    init(player) {
        this.superInit();
        this.player = player;
        this.radius = Conf.heartRadius;
        this.fill = "#850101";
        this.strokeWidth = 0;
    },
    update() {
        this.setPosition(this.player.x,this.player.y);
    }
});
phina.define("PlayerBullet",{
    superClass:"Sprite",
    init(x,y,options) {
        this.options = (options || {}).$safe(PlayerBullet.defaults);
        this.superInit(this.options.image);
        this.width = this.options.width;
        this.speed = this.options.speed;
        this.setPosition(x,y);
    },
    update() {
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
    init(stageName) {
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
            to({left:(Conf.ScreenWidth + Conf.PlayAreaWidth) / 2 - 50,y:0 + 70,fontSize:100},Conf.LabelAnimationTime * 2000,"easeOutCubic");
    }
});
phina.define("KeyMap",{
    superClass:"DisplayElement",
    init(players) {
        this.keys;
    }
});
phina.define("MyConsole",{
    superClass:"Label",
    init:function() {
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
    log(text) {
        if(this.logs.length > this.maxLog)this.logs.shift();
        this.logs.push(text);
        this.reload();
    },
    reload() {
        this.text = "";
        for(let s in this.logs)this.text += this.logs[this.logs.length - s - 1] + "\n";
    }
});
//Main
phina.main(function() {
    let app = GameApp({
        startLabel:!Conf.Debug ? "PhinaSplash" : Conf.DebugSettings.target_scene,
        assets:Assets,
        width:Conf.ScreenWidth,
        height:Conf.ScreenHeight,
        scenes:Conf.MyScenes,
    });
    app.fps = Conf.Fps;
    if(Conf.Debug)app.enableStats();
    app.run();
});