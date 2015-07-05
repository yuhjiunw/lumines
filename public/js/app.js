// Lumines App Website Game

// Define paremeters for board
var Board = {
    BOARD_HEIGHT: 300,
    BOARD_WIDTH: 480,
    BLOCK_WIDTH: 30,
    BLOCK_HEIGHT: 30,
    BLOCK_SIZE: 30,
    COL_NUM: 16,
    ROW_NUM: 10,
    BLOCK_NUM: 4
};

var BRICK_OFFSET = [[0,0],[0,Board.BLOCK_SIZE],[Board.BLOCK_SIZE,Board.BLOCK_SIZE], [Board.BLOCK_SIZE,0]];

var xmlhttp = new XMLHttpRequest();

// Timer for countdown
function startTimer(duration, display) {
    var timer = duration;
    var tid = setInterval(function () {

        display.text(timer);

        if (--timer < 0) {
            clearInterval(tid);
            game.gameOver("time");
        }

    }, 1000);
}

var Game = function()
{
    this.status = true;
}

Game.prototype.gameOver = function(type)
{
    if (type === "dead")
    {
        $('#message').html("Game Over");
    }
    else if (type === "time")
    {
        $('#message').html("Times up!");
    }

    this.status = false;

    save_to_db(10);

    // bar.pause();
    // brick.pause();
}

Game.prototype.restart = function()
{



}

var Map = function(){

    this.colHeight = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    var iMax = 16;
    var jMax = 10;
    this.grid = new Array(16);

    for (i=0;i<iMax;i++) {
        this.grid[i] = new Array(10);
        for (j=0;j<jMax;j++) {
            this.grid[i][j]=0;
        }
    }

    this.fallingBrickNum = 0;

}

var FallingBrick = function(){

    this.sprite1 = "images/purple.png";
    this.sprite2 = "images/red.png";

    this.display = false;
    this.speed = 500;
    this.x = 0;
    this.y = 0;
    this.color = [0,0];
    this.col = -1;
}

FallingBrick.prototype.update = function(dt) {


    if(this.display === true)
    {


        // console.log(this.y);
        // console.log(this.speed);
        // console.log(this.col);

        if (this.y >= Board.BOARD_HEIGHT- 2 * Board.BLOCK_SIZE) {
            this.y = Board.BOARD_HEIGHT- 2 * Board.BLOCK_SIZE;

            // this.speed = 0;
            // this.y = 200;

        } else {
            this.y = this.y + dt * this.speed;
            // this.y = 0;
            // if(this.y )
            // console.log(this.y);
        }
        this.checkCollisionWithMap();
    }


}

FallingBrick.prototype.render = function() {

    if (this.display === true)
    {
        console.log(this.y);
        if(this.color[0] === 0)
        {
            ctx.drawImage(Resources.get(this.sprite1), this.x, this.y);
        }
        else
        {
            ctx.drawImage(Resources.get(this.sprite2), this.x, this.y);
        }

        if(this.color[1] === 0)
        {
            ctx.drawImage(Resources.get(this.sprite1), this.x, this.y + Board.BLOCK_SIZE);
        }
        else
        {
            ctx.drawImage(Resources.get(this.sprite2), this.x, this.y + Board.BLOCK_SIZE);
        }

    }
}

FallingBrick.prototype.checkCollisionWithMap = function() {

    // console.log("check_falling_brick_collide");

    var totalHeight = this.y + Board.BLOCK_SIZE * 2;
    var mapHeight = map.colHeight[this.col] * Board.BLOCK_SIZE;

    // console.log(totalHeight);
    // console.log(mapHeight);
    if ( totalHeight + mapHeight > Board.BOARD_HEIGHT)
    {
        // console.log("falling_brick_collide");
        // this.speed = 0;
        this.collide();
    }
}

FallingBrick.prototype.collide = function() {

    map.fallingBrickNum = map.fallingBrickNum - 1;
    // console.log(map.fallingBrickNum);

    map.colHeight[this.col] = map.colHeight[this.col] + 2;


    if (map.colHeight[(Board.COL_NUM/2)-1] >= Board.ROW_NUM
        || map.colHeight[(Board.COL_NUM/2)] >= Board.ROW_NUM
        )
    {
        game.gameOver("dead");
    }

    map.grid[this.col][map.colHeight[this.col]-2] = this.color[1]+1;
    map.grid[this.col][map.colHeight[this.col]-1] = this.color[0]+1;

    this.setMap();
    this.display = false;
    this.x = -100;
    this.y = -100;
    // this.speed = 0;

    if(map.fallingBrickNum === 0)
    {
        // console.log(map.colHeight)
        brick.returnToStart();
    }

}

FallingBrick.prototype.setMap = function(){

    var midx = this.col;
    var midy = map.colHeight[this.col]-2;

    var botColor = map.grid[this.col][map.colHeight[this.col]-2];
    var topColor = map.grid[this.col][map.colHeight[this.col]-1];
    var colHeight = map.colHeight[this.col];


    if (midx > 0)
    {
        if( map.grid[midx-1][midy] != 0
            && map.grid[midx-1][midy+1] != 0
            && map.grid[midx-1][midy+1] % 2 == map.grid[midx][midy+1] % 2
            && map.grid[midx][midy+1] % 2 == map.grid[midx][midy] % 2
            && map.grid[midx][midy] % 2 == map.grid[midx-1][midy] % 2
            )
        {
            var newColor;
            if (map.grid[midx][midy] % 2 === 0)
            {
                newColor = 4;
            }
            else
            {
                newColor = 3;
            }

            map.grid[midx-1][midy+1] = newColor;
            map.grid[midx][midy] = newColor;
            map.grid[midx-1][midy] = newColor;
            map.grid[midx][midy+1] = newColor;
        }

        if (midy>0)
        {
            if(map.grid[midx-1][midy] != 0
            && map.grid[midx-1][midy-1] != 0
            && map.grid[midx-1][midy-1] % 2 == map.grid[midx][midy-1] % 2
            && map.grid[midx][midy-1] % 2 == map.grid[midx][midy] % 2
            && map.grid[midx][midy] % 2 == map.grid[midx-1][midy] % 2
            )
            {
                var newColor;
                if (map.grid[midx][midy] % 2 === 0)
                {
                    newColor = 4;
                }
                else
                {
                    newColor = 3;
                }

                map.grid[midx-1][midy-1] = newColor;
                map.grid[midx][midy] = newColor;
                map.grid[midx-1][midy] = newColor;
                map.grid[midx][midy-1] = newColor;
            }
        }
    }


    if(midx < 15)
    {
        if( map.grid[midx+1][midy] != 0
            && map.grid[midx+1][midy+1] != 0
            && map.grid[midx+1][midy+1] % 2 == map.grid[midx][midy+1] % 2
            && map.grid[midx][midy+1] % 2 == map.grid[midx][midy] % 2
            && map.grid[midx][midy] % 2 == map.grid[midx+1][midy] % 2
            )
        {
            var newColor;
            if (map.grid[midx][midy] % 2 === 0)
            {
                newColor = 4;
            }
            else
            {
                newColor = 3;
            }
            map.grid[midx+1][midy+1] = newColor;
            map.grid[midx][midy] = newColor;
            map.grid[midx+1][midy] = newColor;
            map.grid[midx][midy+1] = newColor;
        }

        if (midy>0)
        {
            if( map.grid[midx+1][midy] != 0
            && map.grid[midx+1][midy-1] != 0
            && map.grid[midx+1][midy-1] % 2 == map.grid[midx][midy-1] % 2
            && map.grid[midx][midy-1] % 2 == map.grid[midx][midy] % 2
            && map.grid[midx][midy] % 2 == map.grid[midx+1][midy] % 2
            )
            {
                var newColor;
                if (map.grid[midx][midy] % 2 === 0)
                {
                    newColor = 4;
                }
                else
                {
                    newColor = 3;
                }
                map.grid[midx+1][midy-1] = newColor;
                map.grid[midx][midy] = newColor;
                map.grid[midx+1][midy] = newColor;
                map.grid[midx][midy-1] = newColor;
            }
        }
    }
    // console.log(map.grid[this.col]);
}



var Bar = function(){
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.sprite = "images/slidebar.png"
}


Bar.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Bar.prototype.update = function(dt) {

    this.checkCollisionWithBrick();

    if (this.x > Board.BOARD_WIDTH) {
        this.x = -Board.BLOCK_WIDTH;
        this.nextTarget = Board.BLOCK_SIZE/2;
    } else {
        this.x = this.x + dt * this.speed;
    }
}

Bar.prototype.returnToStart = function() {

    // console.log(Board.BLOCK_SIZE);
    this.speed = 75;
    this.x = 0;
    this.y = 0;
    this.nextTarget = Board.BLOCK_SIZE/2;

}

Bar.prototype.updateNextTarget = function() {

    this.nextTarget = this.nextTarget + Board.BLOCK_SIZE;

    if(this.nextTarget > Board.BOARD_WIDTH + Board.BLOCK_SIZE/2)
    {
        this.nextTarget = Board.BLOCK_SIZE/2;
    }

}

Bar.prototype.pause = function() {

    this.speed = 0;
    this.x = 0;
    this.y = 0;

}

Bar.prototype.checkCollisionWithBrick = function() {
    // console.log(this.x);
    if(this.x > this.nextTarget)
    {
        this.clearBrick();
        this.updateNextTarget();
    }

}

Bar.prototype.clearBrick = function() {

    // console.log(this.nextTarget);
    var currentCol = (this.nextTarget - 15) / Board.BLOCK_SIZE;

    // console.log(map.grid[currentCol]);

    var fillIndex = 0;
    for (var i = 0; i< map.colHeight[currentCol]; i++)
    {
        if (map.grid[currentCol][i] <= 2)
        {
            map.grid[currentCol][fillIndex] = map.grid[currentCol][i];
            fillIndex++;
        }
    }

    for(var i = fillIndex; i< Board.ROW_NUM ;i++)
    {
        map.grid[currentCol][i] = 0;
    }

    map.colHeight[currentCol] = fillIndex;

}


var Brick = function(){

    // Brick Index
    //  0 3
    //  1 2
    //

    this.color = [0,0,1,0];
    this.sprite1 = "images/purple.png";
    this.sprite2 = "images/red.png";
    this.speed = 0;
    // this.returnToStart();
    // this.x = (Board.COL_NUM/2) * Board.BLOCK_SIZE - Board.BLOCK_SIZE;
    // this.y = 0;
    // console.log(this.x);
    // console.log(this.y);
}


Brick.prototype.setRandomBrick = function() {

    for(var i = 0; i < Board.BLOCK_NUM; i++)
    {
        if(Math.random() > 0.5)
        {
            this.color[i] = 1;
        }
        else
        {
            this.color[i] = 0;
        }
    }
}


Brick.prototype.update = function(dt) {

    if(this.display===true)
    {
        this.checkCollisionWithMap();

        // if (this.y > Board.BOARD_HEIGHT-Board.BLOCK_SIZE) {
        //     this.y = Board.BOARD_HEIGHT-Board.BLOCK_SIZE;
        //     this.speed = 0;
        //     // this.y = 200;
        // } else {
            this.y = this.y + dt * this.speed;
            // this.y = 0;
        // }
    }

}

Brick.prototype.returnToStart = function() {

    // console.log(Board.BLOCK_SIZE);
    this.speed = 50;
    this.setRandomBrick();
    this.x = (Board.COL_NUM/2) * Board.BLOCK_SIZE - Board.BLOCK_SIZE;
    this.y = -45;
    this.col = 7;
    this.display = true;

}

Brick.prototype.pause = function() {

    this.speed = 0;
    this.display = false;

}

Brick.prototype.render = function() {
    // ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //TODO

    if (this.display === true)
    {
        for(var i = 0; i < BRICK_OFFSET.length; i++)
        {

            var currentX = this.x + BRICK_OFFSET[i][0];
            var currentY = this.y + BRICK_OFFSET[i][1];
            // console.log(currentX);
            // console.log(currentY);

            if(this.color[i] === 0)
            {
                ctx.drawImage(Resources.get(this.sprite1), currentX, currentY);
            }
            else
            {
                ctx.drawImage(Resources.get(this.sprite2), currentX, currentY);
            }
        }
    }
}

Brick.prototype.checkCollisionWithMap = function() {

    var totalHeight = this.y + Board.BLOCK_SIZE * 2;
    var mapHeightLeft = map.colHeight[this.col] * Board.BLOCK_SIZE;
    var mapHeightRight = map.colHeight[this.col+1] * Board.BLOCK_SIZE;
    if ( totalHeight + mapHeightLeft > Board.BOARD_HEIGHT || totalHeight + mapHeightRight > Board.BOARD_HEIGHT )
    {
        // console.log("collide");
        this.collide();
    }
}

Brick.prototype.collide = function() {

    // console.log("collide");
    this.display = false;

    leftFallingBrick.x = brick.x;
    leftFallingBrick.y = brick.y;
    rightFallingBrick.x = brick.x + Board.BLOCK_SIZE;
    rightFallingBrick.y = brick.y;


    leftFallingBrick.color = [this.color[0],this.color[1]];
    rightFallingBrick.color = [this.color[3],this.color[2]];

    leftFallingBrick.col = this.col;
    rightFallingBrick.col = this.col + 1;

    leftFallingBrick.display = true;
    rightFallingBrick.display = true;
    map.fallingBrickNum = 2;

}



Brick.prototype.handleInput = function(key) {

    if (this.display === true)
    {
        if (key == 'up') {
            var tempColor = this.color.slice(1,4);
            tempColor.push(this.color[0]);
            this.color = tempColor;

        } else if (key == 'left') {
            // Ensure brick will still be on the board and cant go left if there is brick on its left
            if (map.colHeight[this.col-1] * Board.BLOCK_SIZE + this.y < Board.BOARD_HEIGHT - 2 * Board.BLOCK_SIZE && (this.x - Board.BLOCK_WIDTH >= 0))
            {
                    this.x = this.x - Board.BLOCK_WIDTH;
                    this.col = this.col - 1;
            }

        } else if (key == 'right') {
            // Ensure brick will still be on the board and cant go right if there is brick on its right
            if (map.colHeight[this.col+2] * Board.BLOCK_SIZE + this.y < Board.BOARD_HEIGHT - 2 * Board.BLOCK_SIZE &&(this.x + 2*Board.BLOCK_WIDTH < Board.BOARD_WIDTH)) {
                this.x = this.x + Board.BLOCK_WIDTH;
                this.col = this.col + 1;
            }
        } else if (key == 'down') {
            this.collide();
        }
        else if (key == 'space') {
            var tempColor = this.color.slice(0,3);
            tempColor.unshift(this.color[3]);
            this.color = tempColor;
        }
    }
}

////////////////////////////////////
// Main Function
////////////////////////////////////

var game = new Game();
var map = new Map();
var brick = new Brick();
var leftFallingBrick = new FallingBrick();
var rightFallingBrick = new FallingBrick();
var bar = new Bar();


$(document).ready(function() {
  $('button').click(function() {
    $('#text1').html("click");
    jQuery(function ($) {
    var fiveMinutes = 10,
        display = $('#time');
    startTimer(fiveMinutes, display);
    });

    brick.returnToStart();
    bar.returnToStart();

  });
});



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };

    brick.handleInput(allowedKeys[e.keyCode]);
});

// Database

var save_to_db = function(score) {
    console.log("save_to_db");
    xmlhttp.open("POST", "http://localhost:3000/save", true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("score=" + score);
}
