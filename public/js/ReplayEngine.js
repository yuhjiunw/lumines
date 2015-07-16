
var keymap = {"up":1, "down":2, "left": 3, "right": 4, "space":5, "pause":6, 
							"1":"up", "2":"down", "3":"left", "4":"right", "5":"space", "6":"pause"};

var ReplayEngine = function() {
	this.keys = [];
	this.timeoffset = 0;
	this.replayMode = false;
}

ReplayEngine.prototype.record = function(key, color, t) {
	this.keys.push({"key":key, "color": color, "time":(t - this.timeoffset)});
}

ReplayEngine.prototype.saveKeysToDB = function() {

	console.log("saveKeysToDB");
	// use it if we want to save replay in another db. Now it is saved in the same place as score.
}

ReplayEngine.prototype.toString = function() {
	var ret = "";
	for (var index = 0 ; index < this.keys.length ; ++index) {
		ret += keymap[this.keys[index]["key"]];
		ret += this.keys[index]["color"][0];
		ret += this.keys[index]["color"][1];
		ret += this.keys[index]["color"][2];
		ret += this.keys[index]["color"][3];
		ret += this.keys[index]["time"];
		ret += ",";
	}
	return ret;
}

ReplayEngine.prototype.loadKeysFromDB = function() {

}

ReplayEngine.prototype.unzip = function(str) {
	var items = str.split(",");
	this.keys = [];
	for (var index = 0 ; index < items.length ; ++index) {
		this.keys.push(
			{	
				"key":keymap[items[index][0]], 
				"color":[
					items[index][1]-[], 
					items[index][2]-[], 
					items[index][3]-[], 
					items[index][4]-[]
				],
				"time":(items[index].slice(5, items[index].length)-[])
			}
		);
	}
	console.log("unzip result: ");
	console.log(this.keys);
}

ReplayEngine.prototype.start = function() {
	replayMode = false;
	this.timeoffset = Date.now();
}

ReplayEngine.prototype.reset = function() {
	console.log("init replayEngine");
	this.keys = [];
	this.replayMode = false;
}

ReplayEngine.prototype.getLog = function() {
	return this.keys;
}

ReplayEngine.prototype.getNextKeys = function(dt){
	if (this.keys === null || this.keys.length == 0 || dt >= 180000) {
		return -1;
	} else {		
		var index;
		var next = [];
		for (index = 0 ; index < this.keys.length ; index++) {
			if (dt > this.keys[0]["time"] ) {
				next.push(this.keys[index]);
				break;
			}
		}
		this.keys = this.keys.slice(next.length, this.keys.length);
		return (next.length > 0)? next : -1;
	}
}

ReplayEngine.prototype.getNextColor = function() {
	return this.keys[0]["color"];
}

ReplayEngine.prototype.pause = function() {
	this.keys.push({"key":"pause"});
}

ReplayEngine.prototype.resume = function(startTime) {
	this.keys.push({"key":"resume"});
	this.timeoffset = startTime;
}

// $(document).ready(function() {
// 	$("#replay_button").click(function() {

// 	});
// });

var get_replay_data = function(id, callback) {
    console.log("get replay data");
    $.get(location.protocol + "//" + window.location.host + "/get_replay/" + id, function(responseText) {
        callback(responseText);
    });
}

