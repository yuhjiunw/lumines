/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

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

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var div = document.getElementById("game-arena"),
        win = global.window,
        canvas = document.createElement('canvas'),
        nextBrickCanvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        ctx2 = nextBrickCanvas.getContext('2d'),
        lastTime;

    var blue_image_path = ""

    canvas.width = 480;
    canvas.height = 360;

    nextBrickCanvas.width = 80;
    nextBrickCanvas.height = 360;

    div.appendChild(canvas);
    div.appendChild(nextBrickCanvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        if(game.status === true)
        {
            if (replayEngine.replayMode === true) {
                var t = Date.now() - game.startTime;
                var key = replayEngine.getNextKeys(t);
                if (key != -1) {
                    for (var i = 0 ; i < key.length ; ++i) {
                        brick.handleInput(key[i]["key"]);
                    }
                }
            }

            update(dt);
            render();
        }

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        brick.update(dt);
        leftFallingBrick.update(dt);
        rightFallingBrick.update(dt);
        bar.update(dt);
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png',
                'images/blue_30_30.png'
            ],
            numRows = Board.ROW_NUM+2,
            numCols = Board.COL_NUM,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
         ctx2.drawImage(Resources.get('images/nextbrickBG.png'), 0, 0);
         if (game.renderNextFive)
         {
            brick.renderNextFiveBrick();
         }



        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */

                if (row === 10 || row === 11)
                {
                    ctx.drawImage(Resources.get('images/blue_30_30.png'), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }

                else if (map.grid[col][row] === 0)
                {
                    ctx.drawImage(Resources.get(rowImages[row]), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }
                else if (map.grid[col][row] === 1)
                {
                    ctx.drawImage(Resources.get('images/gray_30_30.png'), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }
                else if (map.grid[col][row] === 2)
                {
                    ctx.drawImage(Resources.get('images/orange_30_30.png'), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }
                else if (map.grid[col][row] === 3)
                {

                    var renderImage;
                    if (map.typeGrid[col][row]===1)
                    {
                        renderImage = "images/dark_gray_30_30_top_left.png";
                    }
                    else if (map.typeGrid[col][row]===2)
                    {
                        renderImage = "images/dark_gray_30_30_left_bottom.png";
                    }
                    else if (map.typeGrid[col][row]===3)
                    {
                        renderImage = "images/dark_gray_30_30_right_bottom.png";
                    }
                    else if (map.typeGrid[col][row]===4)
                    {
                        renderImage = "images/dark_gray_30_30_top_right.png";
                    }
                    else
                    {
                        renderImage = "images/dark_gray_30_30.png";
                    }

                    ctx.drawImage(Resources.get(renderImage), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }
                else if (map.grid[col][row] === 4)
                {
                    var renderImage;
                    if (map.typeGrid[col][row]===1)
                    {
                        renderImage = "images/dark_orange_30_30_top_left.png";
                    }
                    else if (map.typeGrid[col][row]===2)
                    {
                        renderImage = "images/dark_orange_30_30_left_bottom.png";
                    }
                    else if (map.typeGrid[col][row]===3)
                    {
                        renderImage = "images/dark_orange_30_30_bottom_right.png";
                    }
                    else if (map.typeGrid[col][row]===4)
                    {
                        renderImage = "images/dark_orange_30_30_right_top.png";
                    }
                    else
                    {
                        renderImage = "images/dark_orange_30_30.png";
                    }

                    ctx.drawImage(Resources.get(renderImage), col * Board.BLOCK_SIZE, Board.BOARD_HEIGHT - Board.BLOCK_SIZE - row * Board.BLOCK_SIZE);
                }

            }
        }


        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        bar.render();
        ctx.drawImage(Resources.get('images/rowbar.png'), 0,60);
        brick.render();
        leftFallingBrick.render();
        rightFallingBrick.render();

    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/blue_30_30.png',
        'images/gray_30_30.png',
        'images/orange_30_30.png',
        'images/gray_20_20.png',
        'images/orange_20_20.png',
        'images/blue_30_30.png',
        'images/slidebar.png',
        'images/dark_orange_30_30.png',
        'images/dark_gray_30_30.png',
        'images/nextbrickBG.png',
        'images/white.png',
        'images/rowbar.png',
        'images/dark_gray_30_30_left_bottom.png',
        'images/dark_gray_30_30_right_bottom.png',
        'images/dark_gray_30_30_top_left.png',
        'images/dark_gray_30_30_top_right.png',
        'images/dark_orange_30_30_left_bottom.png',
        'images/dark_orange_30_30_bottom_right.png',
        'images/dark_orange_30_30_top_left.png',
        'images/dark_orange_30_30_right_top.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.ctx2 = ctx2;
})(this);
