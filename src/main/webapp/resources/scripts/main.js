 

function onProfile(){
	globals.centralPanel.showProfile();
	globals.statusPanel.hideActiveGameStatus();
	announce('info', 'Your game profile will be here');
}

function onNewGame(){
	announce('info', 'Your game');
	var gameSettings = {size: "Medium", players: 2};
	
	globals.server.newGame(gameSettings, function (data, textStatus, request){
		gameSettings.location = request.getResponseHeader('location');
		gameSettings.id = request.getResponseHeader('location').split('/').pop();
		gameSettings.color = 'red';
		globals.activeGame = new Game(gameSettings);
		showActiveGame();
	});
	
}


function joinGame(gameId){
	
	gameObj = globals.games[gameId];
	if (!globals.activeGame){
		globals.activeGame = new Game({
			size: gameObj.size, 
			id: gameObj.id,
			color: 'green'
		});
		globals.server.getPlayers(gameId, function(data){
			for (var i=0;i<data.length;i++){
				globals.activeGame.addPlayer(data[i]);
			}
			showActiveGame();
		});
		announce('info', 'Welcome');
	}
	else{
		announce('info', 'you are in active game!');
	}
	
	
}

function showActiveGame(){
	globals.statusPanel.showActiveGameStatus(globals.activeGame);
	globals.centralPanel.showBoard();	
	globals.menuPanel.onGameStart();
}


function onShowGames(){
	announce('info', 'Games to play');
	$.getJSON('games/',function(data){
		globals.games = {};
		for (var i = 0; i< data.length; i++){
			globals.games[data[i].id] = data[i]; 
		}
		globals.centralPanel.showGames(data);
		globals.statusPanel.hideActiveGameStatus();
	});
	
}

function onPauseResume(){
	announce('info','Unimplemented yet');
	$("#pause-resume span").text(function(i, text){
        return text === "Pause" ? "Resume" : "Pause";
	});
}

function disconnectGame(){
	announce('info', 'Disconnecting from game...');
	globals.activeGame.disconnect();
}

setTimeout(init, 1000);

function init(){
	globals.centralPanel = new CentralPanel("central-panel");
	globals.statusPanel = new GameStatusPanel('status-panel');
	globals.menuPanel = new MenuPanel();
	globals.server = new ServerProxy();
	FB.getLoginStatus(function(response) {
		if (response.status === 'connected') {
			var uid = response.authResponse.userID;
			//var accessToken = response.authResponse.accessToken;
			$.getJSON('players/'+uid+'/activeGames?fullState=true', function(data){
				if (data.length > 0){			
					var settings = {size: data[0].size, id: data[0].id, state: data[0].state.state};
					globals.activeGame = new Game(settings, data[0].state);
					showActiveGame();
					announce('info', 'Welcome back');
				}
			});
	    } 
		else {
		    announce('error', "something went wrong :(");
		}
	});    
}

function announce(level, text){
	var classes = $('#announcement-bar').attr('class');
	var bar = $('#announcement-bar');
	bar.removeClass(classes);
	if (level == "info"){		
		bar.addClass('info-announcement');			
	}
	if (level == "error"){
		bar.addClass('error-announcement');
	}
	bar.html(text);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
