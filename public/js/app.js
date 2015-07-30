// Lumines App Website Game

// Define paremeters for board
var Board = {
    BOARD_HEIGHT: 360,
    BOARD_WIDTH: 480,
    BLOCK_WIDTH: 30,
    BLOCK_HEIGHT: 30,
    BLOCK_SIZE: 30,
    BLOCK_SIZE_SMALL: 20,
    COL_NUM: 16,
    ROW_NUM: 10,
    BLOCK_NUM: 4,
    MAP_OFFSET: 60
};

var BRICK_OFFSET = [[0,0],[0,Board.BLOCK_SIZE],[Board.BLOCK_SIZE,Board.BLOCK_SIZE], [Board.BLOCK_SIZE,0]];
var BRICK_OFFSET_SMALL = [[0,0],[0,Board.BLOCK_SIZE_SMALL],[Board.BLOCK_SIZE_SMALL,Board.BLOCK_SIZE_SMALL], [Board.BLOCK_SIZE_SMALL,0]];
var xmlhttp = new XMLHttpRequest();

// Timer for countdown
function startTimer(duration, display) {
    // clearInterval(game.tid);
    var timer = duration;
    var tid = setInterval(function () {

        display.text(timer);

        if (--timer < 0) {
            clearInterval(tid);
            game.gameOver("time");
        }

    }, 1000);
    game.timerID = tid;

}

var Game = function()
{
    this.status = true;
    this.renderNextFive = false;
    this.score = 0;
    this.pause = false;
    this.pausetime = 0;
    this.startTime = 0;
}

Game.prototype.pausefunc = function()
{
    brick.pause();
    leftFallingBrick.pause();
    rightFallingBrick.pause();
    bar.pause();
    replayEngine.pause();
    this.pausetime = Date.now();
}

Game.prototype.resume = function()
{
    brick.resume();
    leftFallingBrick.resume();
    rightFallingBrick.resume();
    bar.resume();
    
    var t = Date.now() - this.pausetime;
    this.startTime += t;

    replayEngine.resume(this.startTime);
}

Game.prototype.gameOver = function(type)
{

    console.log("game over");
    stat = replayEngine.getStatistics();

    if (type === "dead")
    {
        $('#message').html("Game Over");
    }
    else if (type === "time")
    {
        $('#message').html("Times up!");
    }
    clearInterval(game.timerID);
    this.status = false;

    console.log(replayEngine.getLog());
    replayEngine.saveKeysToDB();

    var t = Date.now();
    if (replayEngine.replayMode === false) {
        save_to_db(game.score, $('#player_name').val(), replayEngine.toString(), t);        
    }

    $(document).ready(function() {
        $("#content").html(
            ((type === "dead")? "Game Over" : "Times Up!") + "<br />" + 
            "Score: " + game.score
            );
        $("#share_link").val("http://lumines.herokuapp/" + t);
        $("#statistics_text").html(
            "Total Bricks: " + stat[1] + "<br />" +
            (game.score / stat[1]).toFixed(4)  + " bricks per point<br />" +
            "Total Actions: " + (stat[0] + stat[1] + stat[2] + stat[3] + stat[4]) + "<br />" +
            (game.score / (stat[0] + stat[1] + stat[2] + stat[3] + stat[4])).toFixed(4)  + " actions per point" + "<br />" +
            ((stat[0] + stat[1] + stat[2] + stat[3] + stat[4]) / (90 - $("#time").text())).toFixed(4) + " actions per second"
            );

        $("#test").trigger('click');
    });
    //replayEngine.reset();    
    $('#start_button').focus();
    // bar.pause();
    // brick.pause();
}

Game.prototype.restart = function()
{
    $('#start_button').blur();
    clearInterval(game.timerID);

    brick.setRandomFive();
    this.renderNextFive = true;

    brick.returnToStart();
    bar.returnToStart();
    map.clear();
    leftFallingBrick.clear();
    rightFallingBrick.clear();
    this.score = 0;
    this.pause = false;
    game.status = true;
    this.startTime = Date.now();
    replayEngine.start();
}

Game.prototype.updateScore = function(colscore)
{
    game.score  = game.score + colscore;
    $("#score").html(game.score);
}

var Map = function(){

    this.colHeight = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    var iMax = 16;
    var jMax = 10;

    this.grid = new Array(16);
    this.typeGrid = new Array(16);
    this.scoreGrid = new Array(16);

    for (i=0;i<iMax;i++) {
        this.grid[i] = new Array(10);
        this.typeGrid[i] = new Array(10);
        this.scoreGrid[i] = new Array(10);

        for (j=0;j<jMax;j++) {
            this.grid[i][j]=0;
            this.typeGrid[i][j]=0;
            this.scoreGrid[i][j]=0;
        }
    }

    this.fallingBrickNum = 0;

}

Map.prototype.clear = function(){

    var iMax = Board.COL_NUM;
    var jMax = Board.ROW_NUM;

    for (i=0;i<iMax;i++) {
        for (j=0;j<jMax;j++) {
            this.grid[i][j]=0;
            this.typeGrid[i][j]=0;
            this.scoreGrid[i][j]=0;
        }
    }

    this.fallingBrickNum = 0;
    this.colHeight = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
}


//input right bottom coordinate
Map.prototype.checkBrickSameType = function(checkX, checkY){

    if (checkY < 0)
    {
        return false;
    }

    if (checkY === Board.ROW_NUM)
    {
        return false;
    }

    if (checkX === 0)
    {
        return false;
    }


    if( map.grid[checkX][checkY] == map.grid[checkX][checkY+1]
        && map.grid[checkX][checkY] == map.grid[checkX-1][checkY]
        && map.grid[checkX][checkY] == map.grid[checkX-1][checkY+1]
        )
    {
        return true;
    }

    return false;
}


//return 0 or 3 or 4
Map.prototype.checkBrickIsDarkType = function(checkX, checkY){

    if (checkY >= Board.ROW_NUM - 1)
    {
        return 0;
    }

    if (checkX === 0)
    {
        return 0;
    }

    if (checkX >= Board.COL_NUM)
    {
        return 0;
    }

    if (checkY < 0)
    {
        return 0;
    }

    if( map.grid[checkX][checkY] === map.grid[checkX][checkY+1]
        && map.grid[checkX][checkY]  === map.grid[checkX-1][checkY]
        && map.grid[checkX][checkY]  === map.grid[checkX-1][checkY+1]
        && map.grid[checkX][checkY] > 2
        && map.grid[checkX][checkY+1]> 2
        && map.grid[checkX-1][checkY]> 2
        && map.grid[checkX-1][checkY+1]> 2
        )
    {
        return map.grid[checkX][checkY];
    }

    return 0;
}

Map.prototype.clearTypeGrid = function()
{
    var iMax = 16;
    var jMax = 10;

    for (i=0;i<iMax;i++) {

        for (j=0;j<jMax;j++) {
            this.typeGrid[i][j]=0;
        }
    }
}



Map.prototype.updateTypeGrid = function()
{
    for (var i = Board.COL_NUM - 1; i > 0 ;i--)
    {
        for (var j = 0; j < Board.ROW_NUM - 1  ; j++)
        {
            if ( this.checkBrickIsDarkType(i,j) != 0 )
            {
                if(this.checkBrickIsDarkType(i,j-1) != 0 && this.checkBrickIsDarkType(i+1,j) != 0)
                {
                    this.typeGrid[i-1][j+1]=1;
                }
                else if (this.checkBrickIsDarkType(i,j-1) != 0)
                {
                    this.typeGrid[i-1][j+1]=1;
                    this.typeGrid[i][j+1]=4;
                }
                else if (this.checkBrickIsDarkType(i+1,j) != 0)
                {
                    this.typeGrid[i-1][j+1]=1;
                    this.typeGrid[i-1][j]=2;
                }
                else if (this.checkBrickIsDarkType(i+1,j-1) != 0)
                {
                    this.typeGrid[i-1][j+1]=1;
                    this.typeGrid[i][j+1]=4;
                    this.typeGrid[i-1][j]=2;
                }
                else
                {
                    this.typeGrid[i-1][j+1]=1;
                    this.typeGrid[i][j+1]=4;
                    this.typeGrid[i-1][j]=2;
                    this.typeGrid[i][j]=3;
                }
            }
        }
    }

    for (var i = Board.COL_NUM - 1; i > 0 ;i--)
    {
        for (var j = 0; j < Board.ROW_NUM ; j++)
        {
            if (this.grid[i][j] > 2 && this.typeGrid[i][j]===0)
            {
                if (j===0)
                {
                    this.typeGrid[i][j] = 3;
                }
                else if(this.grid[i][j]=== this.grid[i][j-1])
                {
                    this.typeGrid[i][j] = 4;
                }
                else
                {
                    this.typeGrid[i][j] = 3;
                }
            }
        }
    }



}


Map.prototype.checkBrickSameColor = function(checkX, checkY){

    if (checkY < 0)
    {
        return false;
    }

    if (checkY >= Board.ROW_NUM - 1)
    {
        return false;
    }

    if (checkX === 0)
    {
        return false;
    }


    if( map.grid[checkX][checkY] % 2 == map.grid[checkX][checkY+1]% 2
        && map.grid[checkX][checkY] % 2 == map.grid[checkX-1][checkY]% 2
        && map.grid[checkX][checkY] % 2 == map.grid[checkX-1][checkY+1]% 2
        && map.grid[checkX][checkY]!= 0
        && map.grid[checkX][checkY+1]!= 0
        && map.grid[checkX-1][checkY]!= 0
        && map.grid[checkX-1][checkY+1]!= 0
        )
    {
        return true;
    }

    return false;
}

Map.prototype.changeBrickAddScoreGrid = function(changeX, changeY){

    var newColor;
    if (map.grid[changeX][changeY] > 2)
    {
        newColor = map.grid[changeX][changeY];
    }
    else
    {
        newColor = map.grid[changeX][changeY] + 2;
    }

    map.grid[changeX][changeY] = newColor;
    map.grid[changeX][changeY+1] = newColor;
    map.grid[changeX-1][changeY] = newColor;
    map.grid[changeX-1][changeY+1] = newColor;

    map.scoreGrid[changeX][changeY+1] = 1;
}

var FallingBrick = function(){

    this.sprite1 = "images/gray_30_30.png";
    this.sprite2 = "images/orange_30_30.png";

    this.display = false;
    this.speed = 1500;
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
        // console.log(this.y);
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
    // console.log(this.y);

    if ( totalHeight + mapHeight >= Board.BOARD_HEIGHT)
    {
        // console.log("falling_brick_collide");
        // this.speed = 0;
        this.collide();
    }
}

FallingBrick.prototype.collide = function() {

    map.fallingBrickNum = map.fallingBrickNum - 1;
    // console.log(map.fallingBrickNum);

    // console.log(map.colHeight[this.col]);
    if(map.colHeight[this.col] >= Board.ROW_NUM -1)
    {
        game.gameOver("dead");
    }

    map.colHeight[this.col] = map.colHeight[this.col] + 2;

    // if (map.colHeight[(Board.COL_NUM/2)-1] >= Board.ROW_NUM
    //     || map.colHeight[(Board.COL_NUM/2)] >= Board.ROW_NUM
    //     )
    // {
    //     game.gameOver("dead");
    // }

    map.grid[this.col][map.colHeight[this.col]-2] = this.color[1]+1;
    map.grid[this.col][map.colHeight[this.col]-1] = this.color[0]+1;
    this.setMap();

    this.display = false;
    this.x = -100;
    this.y = -100;
    // this.speed = 0;

    map.clearTypeGrid();
    map.updateTypeGrid();

    if(map.fallingBrickNum === 0)
    {
        // console.log(map.colHeight)
        brick.returnToStart();
    }

}

FallingBrick.prototype.pause = function(){
    this.speed = 0;
}

FallingBrick.prototype.resume = function(){
    this.speed = 1500;
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
            map.scoreGrid[midx][midy+1] = 1;

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

                map.scoreGrid[midx][midy] = 1;
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

            map.scoreGrid[midx+1][midy+1] = 1;
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

                map.scoreGrid[midx+1][midy] = 1;
            }
        }
    }
    // console.log(map.grid[this.col]);
}

FallingBrick.prototype.clear = function() {
    this.display = false;
    this.speed = 1500;
    this.x = 0;
    this.y = 0;
    this.color = [0,0];
    this.col = -1;
}



var Bar = function(){
    this.x = 0;
    this.y = Board.MAP_OFFSET;
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
    this.speed = 100;
    this.x = 0;
    this.y = Board.MAP_OFFSET;
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
    // this.x = 0;
    // this.y = 0;

}

Bar.prototype.resume = function() {

    this.speed = 100;
    // this.x = 0;
    // this.y = 0;

}

// Bar.prototype.clear = function() {

//     this.speed = 0;
//     this.x = 0;
//     this.y = 0;
// }



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



    var colscore = 0;
    for(var i = 0; i< map.colHeight[currentCol]; i++)
    {
        colscore = colscore + map.scoreGrid[currentCol][i];
        map.scoreGrid[currentCol][i] = 0;
    }

    game.updateScore(colscore);
    map.colHeight[currentCol] = fillIndex;
    bar.updateGrid(currentCol);
    map.clearTypeGrid();
    map.updateTypeGrid();
}

Bar.prototype.updateGrid = function (currentCol){

    if (currentCol === 1)
    {
        for(var i = 0; i< map.colHeight[currentCol-1]; i++)
        {
            if (map.grid[currentCol-1][i] > 2)
            {
                map.grid[currentCol-1][i] = map.grid[currentCol-1][i] - 2;
            }
        }
    }
    else if ( currentCol >= 2)
    {
        for(var i = 0; i< map.colHeight[currentCol-1]; i++)
        {
            if (map.grid[currentCol-1][i] > 2)
            {
                if( map.checkBrickSameColor(currentCol-1,i) || map.checkBrickSameColor(currentCol-1,i-1))
                {
                    // if( map.grid[currentCol-1][i] < 3)
                    // {
                    //     map.grid[currentCol-1][i] = map.grid[currentCol-1][i] + 2;
                    // }

                    // if( map.grid[currentCol-1][i+1] < 3)
                    // {
                    //     map.grid[currentCol-1][i+1] = map.grid[currentCol-1][i+1] + 2;
                    // }

                    // if( map.grid[currentCol-2][i+1] < 3)
                    // {
                    //     map.grid[currentCol-2][i+1] = map.grid[currentCol-2][i+1] + 2;
                    // }

                    // if( map.grid[currentCol-2][i] < 3)
                    // {
                    //     map.grid[currentCol-2][i] = map.grid[currentCol-2][i] + 2;
                    // }

                    // i++;
                }
                else
                {
                    map.grid[currentCol-1][i] = map.grid[currentCol-1][i] - 2;
                }
            }
        }
    }

    if (currentCol >= 1)
    {
        for(var i = 0; i< map.colHeight[currentCol] - 1; i++)
        {
            if ( map.checkBrickSameColor(currentCol,i))
            {
                map.changeBrickAddScoreGrid(currentCol,i)
            }
        }
    }


}


var Brick = function(){

    // Brick Index
    //  0 3
    //  1 2
    //

    this.color = [0,0,0,0];
    this.nextFive = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    // this.setRandomFive();


    this.sprite1 = "images/gray_30_30.png";
    this.sprite2 = "images/orange_30_30.png";
    this.sprite1_small = "images/gray_20_20.png";
    this.sprite2_small = "images/orange_20_20.png";
    this.speed = 0;
    // this.returnToStart();
    // this.x = (Board.COL_NUM/2) * Board.BLOCK_SIZE - Board.BLOCK_SIZE;
    // this.y = 0;
    // console.log(this.x);
    // console.log(this.y);
}

Brick.prototype.setRandomFive = function() {

    for(var i = 0; i < 5; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            if(Math.random() > 0.5)
            {
                this.nextFive[i][j] = 1;
            }
            else
            {
                this.nextFive[i][j] = 0;
            }
        }
    }
    console.log("setRandomFive");
    console.log(this.nextFive[0]);
    console.log(this.nextFive[1]);
    console.log(this.nextFive[2]);
    console.log(this.nextFive[3]);
    console.log(this.nextFive[4]);

}


Brick.prototype.renderNextFiveBrick = function() {

    this.renderNext(this.nextFive[0],20,10);
    this.renderNext(this.nextFive[1],20,70);
    this.renderNext(this.nextFive[2],20,130);
    this.renderNext(this.nextFive[3],20,190);
    this.renderNext(this.nextFive[4],20,250);

}

Brick.prototype.renderNext = function(colorArray, x, y) {

    for(var i = 0; i < BRICK_OFFSET_SMALL.length; i++)
    {

        var currentX = x + BRICK_OFFSET_SMALL[i][0];
        var currentY = y + BRICK_OFFSET_SMALL[i][1];
        // console.log(currentX);
        // console.log(currentY);

        if(colorArray[i] === 0)
        {
            ctx2.drawImage(Resources.get(this.sprite1_small), currentX, currentY);
        }
        else
        {
            ctx2.drawImage(Resources.get(this.sprite2_small), currentX, currentY);
        }
    }
    // ctx.drawImage(Resources.get(this.sprite1), currentX, currentY);

}


Brick.prototype.setRandomBrick = function() {

    if (replayEngine.replayMode === true) {
        this.color = replayEngine.getNextColor();
    } else {
        this.color = this.nextFive[0];
    }
    
    this.nextFive.shift();

    var newbrick = [0,0,0,0];
    for(var i = 0; i < Board.BLOCK_NUM; i++)
    {
        if(Math.random() > 0.5)
        {
            newbrick[i] = 1;
        }
        else
        {
            newbrick[i] = 0;
        }
    }

    this.nextFive.push(newbrick);

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
    this.speed = 15;
    this.setRandomBrick();
    this.x = (Board.COL_NUM/2) * Board.BLOCK_SIZE - Board.BLOCK_SIZE;
    this.y = -30;
    this.col = 7;
    this.display = true;

}

Brick.prototype.pause = function() {

    this.speed = 0;
    // this.display = false;

}

Brick.prototype.resume = function() {

    this.speed =15;
    // this.display = false;

}

Brick.prototype.render = function() {
    // ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //TODO

    if (this.display === true)
    {

        var renderY = Math.ceil(this.y / Board.BLOCK_SIZE) * Board.BLOCK_SIZE;

        for(var i = 0; i < BRICK_OFFSET.length; i++)
        {


            var currentX = this.x + BRICK_OFFSET[i][0];
            var currentY = renderY + BRICK_OFFSET[i][1];



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

Brick.prototype.beforeCollide = function() {



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

    if (this.display === true && game.pause === false && replayEngine.replayMode === false) {
        replayEngine.record(key, brick.color, Date.now());
    }

    if (this.display === true)
    {
        if (key == 'up') {
            if(game.pause === false)
            {
                var tempColor = this.color.slice(1,4);
                tempColor.push(this.color[0]);
                this.color = tempColor;
            }

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
        } else if (key == 'space') {
            if(game.pause === false)
            {
                var tempColor = this.color.slice(0,3);
                tempColor.unshift(this.color[3]);
                this.color = tempColor;
            }
        } else if (key == 'pause') {
            if (game.pause === false) {
                game.pausefunc();                
            }
        } else if (key === 'resume') {
            if (game.pause === true) {
                game.resume();
            }
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
var replayEngine = new ReplayEngine();

$(document).ready(function() {
  $('#start_button').click(function() {

    game.restart();

    $('#start_button').html("Restart");
    $('#pause_button').html("Pause");
    $('#time').html("90");

    jQuery(function ($) {
    var fiveMinutes = 89,
        display = $('#time');
    startTimer(fiveMinutes, display);
    });

    // brick.returnToStart();
    // bar.returnToStart();

  });
});

$(document).ready(function() {
  $('#pause_button').click(function() {

    if(game.status)
    {
        if (game.pause)
        {
            $('#pause_button').html("Pause");
            game.resume();
            game.pause = false;
            jQuery(function ($) {
                display = $('#time');
            startTimer(game.pausetime-1, display);
            });

        }
        else
        {
            $('#pause_button').html("Resume");
            game.pausefunc();
            game.pause = true;
            game.pausetime = $('#time').text();
            clearInterval(game.timerID);
            console.log(game.pausetime);
        }
    }
    else
    {


    }


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




//facebook

function fbShare(url, title, descr, image, winWidth, winHeight) {
        var winTop = (screen.height / 2) - (winHeight / 2);
        var winLeft = (screen.width / 2) - (winWidth / 2);
        window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width='+winWidth+',height='+winHeight);
    }
// Database

var save_to_db = function(score, name, replay, time) {
    console.log("save_to_db: " + score + "  " + name);
    console.log(window.location.host + "/save");
    xmlhttp.open("POST", location.protocol + "//" + window.location.host + "/save", true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("score=" + score + "&name=" + name + "&replay=" + replay + "&t=" + time);
}

// fancybox

