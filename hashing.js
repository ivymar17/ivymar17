"use strict";
var crypto = require("crypto");

// The Power of a Smile
// by Tupac Shakur
var poem = [
	"The power of a gun can kill",
	"and the power of fire can burn",
	"the power of wind can chill",
	"and the power of a mind can learn",
	"the power of anger can rage",
	"inside until it tears u apart",
	"but the power of a smile",
	"especially yours can heal a frozen heart",
];

var Blockchain = {
	blocks: [],
};

// Genesis block
Blockchain.blocks.push({
	index: 0,
	prevHash: "000000",
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

// TODO: insert each line into blockchain
for (let line of poem){   
    var index = Blockchain.blocks.length - 1;
    var prevHash = Blockchain.blocks[index].hash;
    index += 1; 
    var data = line;
    createBlock(index, prevHash, data);  
};

// Calls Verification function and verifies length of the block
var f = 0;
if (Blockchain.blocks.length === (poem.length + 1)) {
	for (let block of Blockchain.blocks){
		verifyBlock(block);
	};
	if (f === 0){
		console.log(`Blockchain is valid: ${verifyChain(Blockchain)}`);
	};	
} else {
	console.log('Invalid Blockchain length');
};
// **********************************

//Poem's blocks
function createBlock(index, prevHash, data) {
	let timestamp = Date.now();
	let hash = index + prevHash + data + timestamp;
	hash = blockHash(hash);
	Blockchain.blocks.push({
		index: index,
		prevHash: prevHash,
		hash: hash,
		data: data,
		timestamp: timestamp,
	}); 
};

// Hashing
function blockHash(bl) {
	return crypto.createHash("sha256").update(bl).digest("hex");
};

// Verification
function verifyChain(Blockchain){
	for (let chain of Blockchain.blocks){
		if (chain.index <= 1){
			var Phash = chain.hash;
		} else {	
			if (Phash = chain.prevHash){
				Phash = chain.hash
				return true;
			} else { 
				console.log("Fatal Error: Invalid Blockchain");
				return false;
			};	
		};	
	};	
};	

function verifyBlock(eachBlock) {
	if (eachBlock.index === 0){
		if (eachBlock.hash !== '000000'){
			f = 1;
			console.log("Invalid Blockchain Genesis\' hash. Genesis must be '000000'");
		};	
	} else {
		if (eachBlock.data.length <= 0 || eachBlock.prevHash.length <= 0 || eachBlock.index < 0 || 
			eachBlock.hash !== blockHash(eachBlock.index+eachBlock.prevHash+eachBlock.data+eachBlock.timestamp)){
			
			f = 1;	
			console.log('Invalid Block: '+ eachBlock.index);
		};		
	};
};
