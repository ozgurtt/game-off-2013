function ClockUI( stage, gameState ){
	var that = this;

	this.minuteRadius = 30;
	this.hourRadius = 0.7 * this.minuteRadius;
	this.clockX = 246;
	this.clockY = 146;

	this.getClockAngles = function( ){
		var currTime = new Date( gameState.currentTime );

		var hourAngle = 720 * ( currTime.getHours() / 24 ) - 90;
		var minuteAngle = 360 * ( currTime.getMinutes() / 60 ) - 90;
		return [ hourAngle, minuteAngle ];
	}

	var minuteLine = new createjs.Shape();
	minuteWidth = this.minuteRadius;
	minuteHeight = 1;
	minuteLine.graphics.beginFill('black').drawRect( 0, 0, minuteWidth, minuteHeight );
	minuteLine.regX = 0;
	minuteLine.regY = minuteHeight / 2;
	minuteLine.x = this.clockX;
	minuteLine.y = this.clockY;

	var hourLine = new createjs.Shape();
	hourWidth = this.hourRadius;
	hourHeight = 1;
	hourLine.graphics.beginFill('black').drawRect( 0, 0, hourWidth, hourHeight );
	hourLine.regX = 0;
	hourLine.regY = hourHeight / 2;
	hourLine.x = this.clockX;
	hourLine.y = this.clockY;

	stage.addChild( minuteLine );
	stage.addChild( hourLine );
	return {
		tick: function(){
			var angles = that.getClockAngles();
			hourLine.rotation = angles[0];
			minuteLine.rotation = angles[1];
		}
	}

}

function HelpUI( stage, gameState ){
	var that = this;
	this.showingHelp = false;
	var helpPages = [
		new createjs.Bitmap("res/screens/HelpCreditsScreen/HelpP1P2.png"),
		new createjs.Bitmap("res/screens/HelpCreditsScreen/HelpP3P4.png"),
		new createjs.Bitmap("res/screens/HelpCreditsScreen/HelpP5P6.png"),
		new createjs.Bitmap("res/screens/HelpCreditsScreen/HelpP7P8.png")
	];
	var position = 0;
	var helpImg = helpPages[0];
	var closeButton = new Button( stage, gameState, 708, 8, 80, 50,null, null, function(){ that.hideHelp(); } );
	var nextButton = new Button( stage, gameState, 645, 543, 80, 50, null,null, function(){ gameState.pubsub.publish("Play", "Open_Cookbook");
		if( helpImg ){
			position++;
			helpImg.visible = false;
			helpImg = helpPages[ position % 4 ];
			helpImg.visible = true;
		} else{
			that.hideHelp();
		}
	 });
	var prevButton = new Button( stage, gameState, 77, 546, 80, 50, null,null, function(){ gameState.pubsub.publish("Play", "Open_Cookbook");
		if( helpImg ){
			position--;
			helpImg.visible = false;
			helpImg = helpPages[ Math.abs(position) % 4 ];
			helpImg.visible = true;
		} else {
			that.hideHelp();
		}
	});

	stage.addChild( this.background );
    stage.addChild( closeButton );

	this.hideHelp = function(){
		helpImg.visible=false;
		stage.removeChild( closeButton );
		stage.removeChild( nextButton );
		stage.removeChild( prevButton );
		for( var i in helpPages ){
			helpPages[i].visible = false;
			stage.removeChild( helpPages[i] );
		}
		that.showingHelp = false;
		gameState.pubsub.publish("Play", "Close_Cookbook");
	}

	// Show core temperature
	this.showHelp = function(){
		if( that.showingHelp ) return;
		gameState.pubsub.publish("Play", "Open_Cookbook");

		for( var i in helpPages ){
			helpPages[i].visible = false;
			stage.addChild( helpPages[i] );
		}

		helpPages[0].visible = true;
		stage.addChild( closeButton );
		stage.addChild( nextButton );
		stage.addChild( prevButton );
		that.showingHelp = true;

	}

	// change temperature, this one's for the UI
    gameState.pubsub.subscribe( "ShowHelp", this.showHelp );
}


function FinalConfirmationUI(stage, gameState){
	var that = this;
	this.showingConfirm = false;

	var finalImg = new createjs.Bitmap("res/screens/KitchenScreen/FinalConfirmation.png");
	var yesButton = new Button( stage, gameState, 355, 338, 388, 50, null, null, function(){that.hideFinalConfirm();} );
	var noButton = new Button( stage, gameState, 355, 395, 388, 50, null, null, function(){that.hideFinalConfirm();} );

	this.hideFinalConfirm = function(){
		stage.removeChild( finalImg );
		stage.removeChild( yesButton );
		stage.removeChild( noButton );
		that.showingConfirm = false;
	};

	// Show core temperature
	this.showFinalConfirm = function(){
		console.log("Showing final confirm");
		if( !that.showingConfirm ){
			that.showingConfirm = true;
			stage.addChild( finalImg );
			stage.addChild( noButton );
			stage.addChild( yesButton );
		}
	};

	// change temperature, this one's for the UI
    gameState.pubsub.subscribe( "ShowFinalConfirm", this.showFinalConfirm );
}

function CookbookUI( stage, gameState ){
	var that = this;
	this.showingCookbook = false;

	var cookbookImg = new createjs.Bitmap("res/screens/KitchenScreen/Cookbook-Open.png");
	var closeButton = new Button( stage, gameState, 710, 10, 100, 50, null, null, function(){that.hideCookbook();} );
	var logEntries = [];
	this.hideCookbook = function(){

		stage.removeChild( closeButton );
		stage.removeChild( cookbookImg );
		for( i in logEntries ){
			stage.removeChild(logEntries[i]);
		}
		that.showingCookbook = false;
		gameState.pubsub.publish("Play", "Close_Cookbook");
	}

	// Show core temperature
	this.showCookbook = function(){
		if( !that.showingCookbook ){
			stage.addChild( cookbookImg );
			stage.addChild( closeButton );

			for( i in gameState.peekRecords ){
				var record = gameState.peekRecords[i];
				var time = new Date( gameState.peekRecords[i].getTime() );

				var logLine = new createjs.Text( "OFF", "12px Arial", "#ffffffff" );

				logLine.x = 423;
				logLine.y = 50 * i+ 165;
				logLine.textBaseline = "alphabetic";
				logLine.text = record.getType() + "   " + ("00"+time.getHours()).slice(-2) + ":" + ("00"+time.getMinutes()).slice(-2) + "        " + record.getContent();

				logEntries.push(logLine);
				stage.addChild(logLine);
			}

			that.showingCookbook = true;
		}
	}

	// change temperature, this one's for the UI
    gameState.pubsub.subscribe( "ShowCookbook", this.showCookbook );

}

function OvenUI( stage, gameState ){
	var that = this;
	var OVEN_CLOSED = 0;
	var OVEN_PEEK = 1;
	var OVEN_OPEN = 2;

	this.ovenDoor = OVEN_CLOSED;

	// Important Model, dummy placeholder
	var ovenModel = { secondTick:function(){} };

	var ovenLight = new createjs.Shape();
	ovenLight.graphics.beginFill( "black" ).drawCircle( 181, 126, 2 );

	var confirmation = new FinalConfirmationUI(stage, gameState );
	// Oven light control
	this.changeOvenLight = function( state ){
		if( state == "On" ){
			ovenLight.visible = false;
		} else {
			ovenLight.visible = true;
		}
	}
	this.doneSkipTime = true;
	var turkeyStates = [
		new createjs.Bitmap( "res/screens/KitchenScreen/TurkeyState1Small.svg" ),
		new createjs.Bitmap( "res/screens/KitchenScreen/TurkeyState2Small.svg" ),
		new createjs.Bitmap( "res/screens/KitchenScreen/TurkeyState3Small.svg" ),
		new createjs.Bitmap( "res/screens/KitchenScreen/TurkeyState4Small.svg" ),
		new createjs.Bitmap( "res/screens/KitchenScreen/TurkeyState5Small.svg" )
	];

	// place turkeys in oven
	for (i in turkeyStates){
		turkeyStates[i].alpha = 0;
		turkeyStates[i].scaleX = turkeyStates[i].scaleY =1;
		turkeyStates[i].x = 75;
		turkeyStates[i].y = 258;
	}

	var temperatureText = new createjs.Text( "OFF", "40px Arial", "#ff7700" );
	temperatureText.x = 50;
	temperatureText.y = 147;
	temperatureText.textBaseline = "alphabetic";

	var lightPressedImg = new createjs.Bitmap( "res/screens/KitchenScreen/LightButtonDepressed.png" );
	lightPressedImg.alpha = 0;

	var doorClosedLightOff = new createjs.Bitmap( "res/screens/KitchenScreen/DoorClosedLightOff.png" );
	doorClosedLightOff.alpha = 1;

	var doorClosedLightOn = new createjs.Bitmap( "res/screens/KitchenScreen/DoorClosedLightOn.png" );
	doorClosedLightOn.alpha = 0;

	var doorPeekLightOff = new createjs.Bitmap( "res/screens/KitchenScreen/DoorPeekLightOff.png" );
	doorPeekLightOff.alpha = 0;

	var doorPeekLightOn = new createjs.Bitmap( "res/screens/KitchenScreen/DoorPeekLightOn.png" );
	doorPeekLightOn.alpha = 0;

	var doorOpen = new createjs.Bitmap( "res/screens/KitchenScreen/DoorOpen.png" );
	doorOpen.alpha = 0;

	var redState = new createjs.Bitmap( "res/screens/KitchenScreen/OvenTurnRedState.png" );
	redState.alpha = 0;

	var panFront = new createjs.Bitmap( "res/screens/KitchenScreen/PanFront.png" );
	panFront.alpha = 0;

	this.changeTemperature = function( direction ){

		if( gameState.turkeyBought ){
			if( temperatureText.text == "OFF" && direction == "Up" ) temperatureText.text = "125";
			if( !( temperatureText.text == "OFF" && direction == "Down" ) ){

				var temp = ( direction == "Up" ? parseInt(temperatureText.text)+25 : parseInt(temperatureText.text)-25);

				 // Check lower bound for OFF
				 temp = temp < 150 ? temp = "OFF" : temp;

				 // Check upper bound
				 // if over 1100 F, burn house down
				 if( temp > 1100 ){
				 	console.log("You have died in a fire");
				 	return;
				 }

				 temperatureText.text = temp;
			}

			 // Tell our model to set the actual temperature
			 ovenModel.changeTemp( UtilityFunctions.F2C( temperatureText.text == "OFF" ? 125 : parseInt( temperatureText.text ) ) );
		}
		else{
			gameState.pubsub.publish("ShowDialog",{seq:"EmptyOven", autoAdvance: true});
		}
	}

	this.ovenLightToggle = function(){

		// Only work if the user bought an oven light
		if( gameState.boughtOvenLight ){
			lightPressedImg.alpha = lightPressedImg.alpha == 0 ? 1 : 0;
			if( that.ovenDoor == OVEN_CLOSED){
				doorClosedLightOn.alpha = lightPressedImg.alpha == 0 ? 0 : 1;
				doorClosedLightOff.alpha = lightPressedImg.alpha == 0 ? 1 : 0;
				doorOpen.alpha = 0;
			}
			else if( that.ovenDoor == OVEN_PEEK ){
				doorPeekLightOn.alpha = lightPressedImg.alpha == 0 ? 0 : 1;
				doorPeekLightOff.alpha = lightPressedImg.alpha == 0 ? 1 : 0;
				doorOpen.alpha = 0;
			}
		}
	}

	this.startTurkeyModel = function(){
		console.log("weight is" + gameState.turkeyWeight)
		ovenModel = new OvenModel( gameState.turkeyWeight, gameState );
	}

	var handleBar = new createjs.Shape();
 	handleBar.graphics.beginFill("#ffffff").drawRect(20, 190, 300, 20);
 	handleBar.alpha = 0.5;
 	handleBar.addEventListener( "mouseover", function(){ document.body.style.cursor='pointer'; } );
 	handleBar.addEventListener( "mouseout", function(){ document.body.style.cursor='default'; } );
 	handleBar.addEventListener( "pressup", handlePress );

	// Look for a drag event
	function handlePress(event) {
		if( event.stageY > 300 && that.ovenDoor != OVEN_OPEN ){
			that.ovenDoor = OVEN_OPEN;
			doorPeekLightOn.alpha = doorClosedLightOn.alpha = 0;
			doorPeekLightOff.alpha = doorClosedLightOff.alpha = 0;
			doorOpen.alpha = 1;
			handleBar.graphics.clear();
			handleBar.graphics.beginFill("#ffffff").drawRect(5, 450, 400, 60);
			handleBar.alpha = 0.5;

			if( gameState.turkeyBought ){
				var state = ovenModel.getTurkeyState();
				gameState.pubsub.publish( "ShowDialog", {seq:"custom", autoAdvance:false, customText:"Hmm... Looks " + turkeyState["skin"]["cond"][2] + "." } );
				gameState.pubsub.publish( "AddRecord", {type:"Open ", text:"The turkey looked " + turkeyState["skin"]["cond"][2]} );
			}

			gameState.pubsub.publish( "Play", "Oven_Door_Full_Open" );
		}else if (that.ovenDoor == OVEN_OPEN ){
			that.ovenDoor = OVEN_PEEK;
			gameState.pubsub.publish( "Play", "Oven_Door_Full_Close" );
			handleBar.graphics.clear();
		 	handleBar.graphics.beginFill("#ffffff").drawRect(20, 190, 300, 20);
 			handleBar.alpha = 0.5;
			ovenPeek();
		}
	}

	handleBar.addEventListener( "click", ovenPeek );

	function ovenPeek(){
		if( that.ovenDoor == OVEN_CLOSED && that.ovenDoor != OVEN_OPEN ){
			gameState.pubsub.publish( "Play", "Oven_Door_Peek_Open" );
			doorPeekLightOn.alpha = lightPressedImg.alpha;
			doorPeekLightOff.alpha = !lightPressedImg.alpha;
			doorClosedLightOn.alpha = 0;
			doorClosedLightOff.alpha = 0;
			doorOpen.alpha = 0;
			that.ovenDoor = OVEN_PEEK;

			handleBar.y = 48;
			if( gameState.turkeyBought ){
				var state = ovenModel.getTurkeyState();
				gameState.pubsub.publish( "ShowDialog", {seq:"custom", autoAdvance:false, customText:"Looks " + turkeyState["skin"]["cond"][2] } );
				gameState.pubsub.publish( "AddRecord", {type:"Peek ", text:"The turkey looked " + turkeyState["skin"]["cond"][2]} );
    			that.ovenOpened++;
			}
		}
		else if (that.ovenDoor == OVEN_PEEK){
			doorClosedLightOn.alpha = lightPressedImg.alpha;
			doorClosedLightOff.alpha = !lightPressedImg.alpha;
			doorPeekLightOn.alpha = 0;
			doorPeekLightOff.alpha = 0;
			that.ovenDoor = OVEN_CLOSED;
			gameState.pubsub.publish( "Play", "Oven_Door_Peek_Close" );
			doorOpen.alpha = 0;
			handleBar.y = 0;
		}
	}

	// Show core temperature
	this.showTempDialog = function(){
		if( that.ovenDoor != OVEN_OPEN ){
			gameState.pubsub.publish("ShowDialog", {seq:"OpenDoor", autoAdvance:true});
		}
		else{
			state = ovenModel.getTurkeyState();
			gameState.pubsub.publish( "ShowDialog", {seq:"custom", autoAdvance:false, customText:"The core temperature of the turkey reads " + UtilityFunctions.C2F(state.core.temp).toFixed(2) + " F" } );
			gameState.pubsub.publish( "AddRecord", {type:"Probe", text:"Core temperature measured: " + UtilityFunctions.C2F(state.core.temp).toFixed(2) + " F"} );
			that.ovenOpened++;
		}
	}

	new CookbookUI( stage, gameState );

	// change temperature, this one's for the UI
    gameState.pubsub.subscribe( "ChangeTemperature", this.changeTemperature );
    gameState.pubsub.subscribe( "ShowTempDialog", this.showTempDialog );
    gameState.pubsub.subscribe( "OvenLightToggle", this.ovenLightToggle );
	gameState.pubsub.subscribe( "OvenLight", this.changeOvenLight );
	gameState.pubsub.subscribe( "StartTurkeyModel", this.startTurkeyModel );
	gameState.pubsub.subscribe("DoneSkipTime", function(){ that.doneSkipTime = true; });

    this.secondTick = function(diff){
    		// check if oven door is open
    		if( that.ovenDoor == OVEN_OPEN ){
    			// incur -25 + penalty 5 degrees a second for opening the oven.
    		}

    		ovenModel.secondTick();
    		gameState.currentTime += diff;
	}

	gameState.pubsub.subscribe( "SkipTime", function(){
		console.log("Skipping time");
		for(var i = 0; i < 1200; i++){
			that.secondTick( 1000 );
		}
		gameState.pubsub.publish("DoneSkipTime","");
	});

    return {
    	tick: function(){
    		// IMPORTANT: SECOND TIMER
    		var diff = Date.now() - gameState.oldTime;
    		var dialoguediff = Date.now() - gameState.oldDialogueTime;
			if( diff > 1000 ){
    			that.secondTick( diff );

	    		if( gameState.turkeyBought ){

					// what's the state of the turkey
					turkeyState = ovenModel.getTurkeyState();
					turkeyStates[0].alpha = 1;
					if( turkeyState["skin"]["cond"][0] == "Undercooked" )
						turkeyStates[1].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"][0] == "Cooked" )
						turkeyStates[2].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"][0] == "Dry" )
						turkeyStates[3].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"][0] == "Burnt" )
						turkeyStates[4].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"][0] == "House Fire" )
						turkeyStates[4].alpha = 1;
				}
				gameState.oldTime = Date.now();
			}
			if( gameState.turkeyBought && dialoguediff > 5*60*1000 ){
					gameState.pubsub.publish( "ShowDialog", {seq:"Spouse gets surprise movie tickets", autoAdvance:true, random:true} );
					gameState.oldDialogueTime = Date.now();
			}
    	},
    	render: function(){

		    stage.addChild( ovenLight );
		    stage.addChild( temperatureText );

		    stage.addChild( this.text );
		    stage.addChild( lightPressedImg);
			// Turkey goes here
				// did the player actually buy a turkey? if so, determine its cooked state
				if( gameState.turkeyBought ){

					// what's the state of the turkey
					turkeyState = ovenModel.getTurkeyState();
					turkeyStates[0].alpha = 1;
					if( turkeyState["skin"]["cond"] == "Undercooked" )
						turkeyStates[1].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"] == "Cooked" )
						turkeyStates[2].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"] == "Dry" )
						turkeyStates[3].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"] == "Burnt" )
						turkeyStates[4].alpha = turkeyState["skin"]["cond"][1];
					if( turkeyState["skin"]["cond"] == "House Fire" )
						turkeyStates[4].alpha = 1;

					panFront.alpha = 1;
					stage.addChild(turkeyStates[0]);
					for(i in turkeyStates){
						stage.addChild(turkeyStates[i]);
					}
					stage.addChild(panFront);
				}
			// Pan front goes here
			stage.addChild( panFront );

			//finalize button
			stage.addChild( new Button( stage, gameState, 45, 250, 250, 175, null, null, function(){
				gameState.pubsub.publish("ShowFinalConfirm","");
			} ) );

			stage.addChild( doorPeekLightOn);
		    stage.addChild( doorPeekLightOff);

		    stage.addChild( doorClosedLightOn);
		    stage.addChild( doorClosedLightOff);

		    stage.addChild( doorOpen);
		    stage.addChild( new Button( stage, gameState, 45, 163, 41, 17, "ChangeTemperature", "Up" ) );
		    stage.addChild( new Button( stage, gameState, 95, 163, 41, 17, "ChangeTemperature", "Down" ) );
		    stage.addChild( new Button( stage, gameState, 145, 163, 41, 17, "OvenLightToggle", "" ) );
		    if( gameState.hard == false )
		    	stage.addChild( new Button( stage, gameState, 205, 105, 80, 80, null, null, function(){
		    		if( that.doneSkipTime ){
		    			gameState.pubsub.publish("SkipTime","");
		    			that.doneSkipTime = false;
		    		}
		    	}) );
			stage.addChild( handleBar);

    		return this;
    	}
	}
}

function WindowUI( stage, gameState ){

	var dayNight = new createjs.Bitmap("res/screens/Window/Test4-217.svg");
	var mood = new createjs.Bitmap("res/screens/Window/Test4TransparencyFull.svg");

	mood.y=30;
	dayNight.y=30;

	var secondCounter = 0;
	mood.x = dayNight.x = -(new Date( gameState.currentTime ).getHours()*682.625);

	var ground = new createjs.Bitmap( "res/screens/Window/Ground.png" );
	var houses = new createjs.Bitmap( "res/screens/Window/Housefar.png" );
	var streetLight = new createjs.Bitmap( "res/screens/Window/StreetlightGlow.png" );
	streetLight.alpha = 0;

	var treeAnimations = { rustle:[0,17,"rustle"], still:[0,0,"still"] };
	var data = {
    	images: ["res/screens/Window/Tree_Animation.png"],
     	frames: { width:386, height:287 },
     	animations: treeAnimations
 	};
	var spriteSheet = new createjs.SpriteSheet(data);
 	var animation = new createjs.Sprite(spriteSheet, "treeAnimations");
 	animation.x = 415;
 	animation.y = 30;
	
	// Fast forward, move sky
	gameState.pubsub.subscribe( "SkipTime", function(){
		var newpos =  -(new Date( gameState.currentTime ).getHours()*682.625);
		 dayNight.x = mood.x =newpos < -15583 ? 0 : newpos;
	});

    stage.addChild( dayNight );
    stage.addChild( ground );
    stage.addChild( houses );
    stage.addChild( streetLight );
    stage.addChild( animation );
    stage.addChild( mood );
return {

	tick: function(){

		// move the sky
		secondCounter++;
		if( secondCounter > 60 ){
			dayNight.x-=11.38;
			mood.x -= 11.38;
			secondCounter = 0;
		}

		if( dayNight.x < -15583 )
			dayNight.x = 0;

		// turn on lights
		if( dayNight.x < 0 && dayNight.x > -4545 ){
			// turn on random window lights
			streetLight.alpha = 1;
		}
		else if( dayNight.x < -11687 ){
			streetLight.alpha = 1;
		}
		else
			streetLight.alpha = 0;
	}
}
}

function MarketItem( gameState, name, x, y, cost, mouseOutImg, mouseOverImg, mouseOutKitchenImg, mouseOverKitchenImg, funnyDescription, weight ){
	var that = this;
		this.name = name;
		this.bought = false;

		var mouseOverKitchen = new createjs.Bitmap( mouseOverKitchenImg );
		var mouseOutKitchen = new createjs.Bitmap( mouseOutKitchenImg );

		var mouseOver = new createjs.Bitmap( mouseOverImg );
		var mouseOut = new createjs.Bitmap( mouseOutImg );

		mouseOver.x = mouseOut.x = x;
		mouseOver.y = mouseOut.y = y;
	 	mouseOut.addEventListener( "mouseover", function(){
	 		document.body.style.cursor='pointer';
	 		mouseOver.visible = true;
	 		mouseOut.visible = false;
	 		gameState.pubsub.publish("ShowPrice", cost );
	 		gameState.pubsub.publish("ShowDesc", {title:that.name, desc:funnyDescription, weight:weight} );
	 	});
 		mouseOut.addEventListener( "mouseout", function(){
 			document.body.style.cursor='default';
 			mouseOver.visible = false;
 			mouseOut.visible = true;
 			gameState.pubsub.publish("ClearClipboard", {});
 		} );
 		mouseOver.addEventListener( "mouseover", function(){
 			document.body.style.cursor='pointer';
 			mouseOver.visible = true;
 			mouseOut.visible = false;
 			gameState.pubsub.publish("ShowPrice", cost );
 			gameState.pubsub.publish("ShowDesc", {title:that.name, desc:funnyDescription, weight:weight} );
 		});
 		mouseOver.addEventListener( "mouseout", function(){
 			document.body.style.cursor='default';
 			mouseOver.visible = false;
 			mouseOut.visible = true;
 			gameState.pubsub.publish("ClearClipboard", {});
 		} );


	 	mouseOutKitchen.addEventListener( "mouseover", function(){
	 		document.body.style.cursor='pointer';
	 		mouseOverKitchen.visible = true;
	 		mouseOutKitchen.visible = false;
	 	});
 		mouseOutKitchen.addEventListener( "mouseout", function(){
 			document.body.style.cursor='default';
 			mouseOverKitchen.visible = false;
 			mouseOverKitchen.visible = true;
 		} );
 		mouseOverKitchen.addEventListener( "mouseover", function(){
 			document.body.style.cursor='pointer';
 			mouseOverKitchen.visible = true;
 			mouseOutKitchen.visible = false;
 		});
 		mouseOverKitchen.addEventListener( "mouseout", function(){
 			document.body.style.cursor='default';
 			mouseOverKitchen.visible = false;
 			mouseOutKitchen.visible = true;
 		} );

 		// We've bought the item, now we click it in the Kitchen
 		mouseOverKitchen.addEventListener("click",function(){
 			if ( that.name.indexOf("Temperature") != -1 ){
 				gameState.pubsub.publish( "ShowTempDialog", "" );
 			}

 			if ( that.name.indexOf("Cookbook") != -1 ){
 				console.log("click, show cookbook");
 				gameState.pubsub.publish("ShowCookbook","");
 				gameState.pubsub.publish("Play", "Open_Cookbook");
 			}
 		});

 		mouseOver.addEventListener( "click", function(){
 			if(!that.bought && cost <= gameState.wallet ){

	 			if( that.name.indexOf("Turkey") != -1 && gameState.turkeyBought != true){
	 				gameState.turkeyBought = true;
	 				gameState.turkeyWeight = weight;
				    gameState.marketItems[ that.name ].delete();
				    that.bought = true;
				    gameState.pubsub.publish("Play", {name:"Buy", volume:0.7} );
				    gameState.pubsub.publish("WalletAmount", gameState.wallet - Math.abs(cost))
				    gameState.pubsub.publish("StartTurkeyModel","");
	 			}
	 			// can we buy this? Only possible if you already bought a turkey
	 			else if( that.name.indexOf("Turkey") == -1 && gameState.turkeyBought == true ){

	 				// if we bought an oven light, enable it!
	 				if( that.name.indexOf("Light") != -1 ) gameState.boughtOvenLight = true;

		 			gameState.purchasedItems.push( objReturn );
		 			gameState.marketItems[ that.name ].delete();
		 			that.bought = true;
		 			gameState.pubsub.publish("Play", {name:"Buy", volume:0.7});
		 			gameState.pubsub.publish("WalletAmount", gameState.wallet - Math.abs(cost));
		 		}
		 		// One turkey only
		 		else if( that.name.indexOf("Turkey") != -1 && gameState.turkeyBought == true ){
		 			gameState.pubsub.publish( "ShowDialog", {seq:"CannotBuyTurkey", autoAdvance:true} );
		 			gameState.pubsub.publish( "Play", "Error" );
		 		}
		 		// Buy turkey first
		 		else{
		 			gameState.pubsub.publish( "ShowDialog", {seq:"BuyTurkeyFirst", autoAdvance:true} );
		 			gameState.pubsub.publish( "Play", "Error" );
		 		}
 			}
 			else{
 				gameState.pubsub.publish( "ShowDialog", {seq:"NoMoney", autoAdvance:true} );
	 			gameState.pubsub.publish( "Play", "Error" );
	 		}
 		});
 		mouseOver.visible = false;

 	var objReturn = {
		tick: function(){},
		getName: function(){return that.name;},
		delete: function( stage ){
			that.visible = false;
			gameState.pubsub.publish("RemoveItems", [mouseOut, mouseOver]);
		},
		draw: function( stage, newx, newy ){
			if( newx && newy ){
				mouseOut.x = mouseOver.x = newx;
				mouseOut.y = mouseOver.y = newy;
			}
			console.log("NewScreen for item "+that.name +" is " +gameState.newScreen );
			if( gameState.newScreen == "KitchenScreen" ){
				mouseOutKitchen.visible = true;
				stage.addChild( mouseOutKitchen );
				mouseOverKitchen.visible = false;
	    		stage.addChild( mouseOverKitchen );
	    		return;
			}

			if( !that.bought ){
				stage.addChild( mouseOut );
	    		stage.addChild( mouseOver );
	    	}
		}
	}
	return objReturn;
}



function ImgButton( stage, gameState, x, y, mouseOutImg, mouseOverImg, eventCmd, arg, sound, altfunc ){
		var mouseOver = new createjs.Bitmap( mouseOverImg );
		var mouseOut = new createjs.Bitmap( mouseOutImg );
		mouseOver.x = mouseOut.x = x;
		mouseOver.y = mouseOut.y = y;
	 	mouseOut.addEventListener( "mouseover", function(){ document.body.style.cursor='pointer'; mouseOver.visible = true; mouseOut.visible = false;  } );
 		mouseOut.addEventListener( "mouseout", function(){ document.body.style.cursor='default'; mouseOver.visible = false; mouseOut.visible = true; } );
 		mouseOver.addEventListener( "mouseover", function(){ document.body.style.cursor='pointer'; mouseOver.visible = true; mouseOut.visible = false;  } );
 		mouseOver.addEventListener( "mouseout", function(){ document.body.style.cursor='default'; mouseOver.visible = false; mouseOut.visible = true; } );
 		mouseOver.addEventListener( "click", function(){
 			if( sound ){
 				gameState.pubsub.publish("Play", sound );
 			}
 			if( !altfunc){
 				gameState.pubsub.publish( eventCmd, arg );
 				return;
 			}
 			altfunc();
 		} );
 		mouseOver.visible = false;
    	stage.addChild( mouseOut );
    	stage.addChild( mouseOver );

	return {
		tick: function(){}
	}
}

function Button( stage, gameState, x_orig, y_orig, x_dest, y_dest, eventCmd, arg, altfunc ){
	var that = this;
	console.log("button clicked with "+ arg);

	var button = new createjs.Shape();
 	button.graphics.beginFill("#ffffff").drawRect(x_orig, y_orig, x_dest, y_dest);
 	button.alpha = 0.5;
 	button.addEventListener( "click", function(){
 		gameState.pubsub.publish( "Play", "Click" );
		if( !altfunc ){
			gameState.pubsub.publish( eventCmd, arg );
			return;
		}
		altfunc();
 		gameState.pubsub.publish( eventCmd, arg );
	 } );
 	button.addEventListener( "mouseover", function(){ document.body.style.cursor='pointer'; } );
 	button.addEventListener( "mouseout", function(){ document.body.style.cursor='default'; } );
	return button;
}
