// Inplement Crypto1 as a PRNG

var PRNG = function() {
	this.FA = 0x9E98;
	this.FB = 0xB48E;
	this.FC = 0xEC57E80A;

	this.state1 = 0x00000000;
	this.state2 = 0x00000000;
}

PRNG.prototype.init = function(seed1, seed2) {
	this.state1 = seed1;
	this.state2 = seed2;
	for (var i = 0 ; i < 48 ; ++i) {
		this.next();
	}
};


// 0, 5, 9, 11, 12, 14, 15, 17, 19, 24, 25, 27, 29, 35, 39, 41, 42, 43 
// 9, 11, 13, 15
// 17, 19, 21, 23
// 25, 27, 29, 31
// 33, 35, 37, 39
// 41, 43, 45, 47
PRNG.prototype.next = function() {
	var feedback = (getBit(this.state1, 23)) ^ (getBit(this.state1, 18)) ^ (getBit(this.state1, 14)) ^
	(getBit(this.state1, 13)) ^ (getBit(this.state1, 11)) ^ (getBit(this.state1, 9)) ^
	(getBit(this.state1, 8)) ^ (getBit(this.state1, 6)) ^ (getBit(this.state1, 4)) ^
	(getBit(this.state2, 23)) ^ (getBit(this.state2, 22)) ^ (getBit(this.state2, 20)) ^
	(getBit(this.state2, 18)) ^ (getBit(this.state2, 12)) ^ (getBit(this.state2, 8)) ^
	(getBit(this.state2, 6)) ^ (getBit(this.state2, 5)) ^ (getBit(this.state2, 4));

	var a1 = (this.FB >> this.f4(getBit(this.state1, 14), getBit(this.state1, 12), getBit(this.state1, 10), getBit(this.state, 32))) & 0x1;
	var b2 = (this.FA >> this.f4(getBit(this.state1, 6), getBit(this.state1, 4), getBit(this.state1, 2), getBit(this.state, 24))) & 0x1;
	var b3 = (this.FB >> this.f4(getBit(this.state2, 22), getBit(this.state2, 20), getBit(this.state2, 18), getBit(this.state, 16))) & 0x1;
	var a4 = (this.FB >> this.f4(getBit(this.state2, 14), getBit(this.state2, 12), getBit(this.state2, 10), getBit(this.state, 8))) & 0x1;
	var b5 = (this.FA >> this.f4(getBit(this.state2, 6), getBit(this.state2, 4), getBit(this.state2, 2), getBit(this.state, 0))) & 0x1;
	var ret = (this.FC >> this.f5(a1, b2, b3, a4, b5)) & 0x1;

	this.state1 = (this.state1 << 1) | ((this.state2 >> 31) & 0x1);
	this.state2 = (this.state2 << 1) | feedback;

	return ret;
};

var getBit = function(a, n) {
	return (a >> n) & 0x1
};

PRNG.prototype.f4 = function(a, b, c, d) {
	return (a << 3) | (b << 2) | (c << 1) | d;
};

PRNG.prototype.f5 = function(a, b, c, d, e) {
	return (a << 4) | (b << 4) | (c << 2) | (d << 1) | e;
};

function decimalToHexString(number)
{
    if (number < 0)
    {
    	number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}