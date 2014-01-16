function game(size, location){
	
	var offset = 10;
	var distance = 20;
	var boardLayer = null;
	var board = [];
	var boardColor = 'grey';
	var gameLocation = '';
	init(size, location);

	function init(size, location){
		gameLocation = location;
		var width = 0;
		var height = 0;		
		if (size == 'small'){
			width = height = 10;
		}
		else if (size == 'big'){
			width = height = 30;
		}
		else {//medium
			width = height = 20;
		}

		for (var x = 0; x < width; x++) {
			board[x] = [];
			for (var y = 0; y < height; y++) {
				board[x][y] = null;
			};
		};

		boardLayer = createBoardLayer(width, height);

	}

	function createBoardLayer(){
		
		var radius = 2;
		var color = boardColor;

		var layer = new Kinetic.Layer();


		for (var xx = 0; xx < board.length; xx++){
			for (var yy = 0; yy < board[xx].length; yy++){
				if (board[xx][yy] != null){
					color = board[xx][yy].color;
					radius = 3;
				}				
				else {
					radius = 2;
					color = boardColor;
				}
				var circle = new Kinetic.Circle({
			        x: offset + xx*distance,
			        y: offset + yy*distance,
			        radius: radius,
			        fill: color
	      		});

		  	    // add the shape to the layer
		        layer.add(circle);
		        var coordinate = {};
		        coordinate.x = xx; coordinate.y = yy;
		        board[xx][yy] = new BoardCell(circle, null, coordinate);
			}
		}
	    

	    var rect = new Kinetic.Rect({
		        x: 0,
		        y: 0,
		        width: offset + distance * board.length,
		        height: offset + distance * board[0].length,
		        fill: 'white',
		        opacity: 0.1	        
		    });
		layer.add(rect);
	    return layer;
	}

	this.getBoard = function (){		
		return boardLayer;
	};

	this.setPointMouseDown = function (x, y, player){
		var i = Math.round(Math.abs((x-offset)/distance));
		var j = Math.round(Math.abs((y-offset)/distance));
		var cell = board[i][j];

		if (cell.player == null){//valid cell
			player.i = i;
			player.j = j;		
			cell.dot.setFill(player.color);
			boardLayer.draw();
		}


		
	};

	this.setPointMouseUp = function (x, y, player){
		var i = Math.round(Math.abs((x-offset)/distance));
		var j = Math.round(Math.abs((y-offset)/distance));
		var coordinates = {};
		coordinates.x = i;
		coordinates.y = j;
		if (player.i == null || player.j == null)
		{
			return;
		}
		if (i == player.i && j == player.j){
			cell = board[i][j]; 
			dot = board[i][j].dot;
			dot.setRadius(3);
			dot.setStroke('black');
			dot.setStrokeWidth(1);			
			cell.player = player;
			post(gameLocation+'/players/' + player.id + '/moves',JSON.stringify(coordinates), function(data){
				if (data.length > 0){
					data.push(data[0]);
					for (var index = 0; index < data.length - 1; index++){
						startPoint = board[data[index].x][data[index].y];
						endPoint = board[data[index+1].x][data[index+1].y];
						var line = new Kinetic.Line({
							points: [startPoint.getRealCoordinate(), endPoint.getRealCoordinate()],
							strokeWidth: 1,
							stroke: player.color
						});
						boardLayer.add(line);
						boardLayer.draw();
					}
				}
				console.log(data);
			});
		}
		else{//undo
			dot = board[player.i][player.j].dot;
			dot.setFill(boardColor);
		}
		player.i = null; player.j = null;
		boardLayer.draw();
				
	};
	
}
