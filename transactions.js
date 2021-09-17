"use strict";
var crypto = require("crypto");
var path = require("path");
var fs = require("fs");
var openpgp = require("openpgp");

const KEYS_DIR = path.join(__dirname,"keys");
const PRIV_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"priv.pgp.key"),"utf8");
const PUB_KEY_TEXT = fs.readFileSync(path.join(KEYS_DIR,"pub.pgp.key"),"utf8");

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
	hash: "000000",
	data: "",
	timestamp: Date.now(),
});

addPoem()
.then(checkPoem)
.catch(console.log);
//********/

async function addPoem() {
	var transactions = [];
	// TODO: add poem lines as authorized transactions
    for (let line of poem){  
		transactions.push(await createTransaction(line));
	}
	var bl = createBlock(transactions);
	Blockchain.blocks.push(bl);
	return Blockchain;
};

async function checkPoem(chain) {
	console.log(await verifyChain(chain));
}

function createTransaction(data){
    var hash = transactionHash(data);
	return authorizeTransaction(data, hash);
};

async function authorizeTransaction(data, hash){
	var pubKey = PUB_KEY_TEXT;
    var signature = await createSignature(data, PRIV_KEY_TEXT);
    if (signature == null) return false;
	var tx = {
		data: data, 
		hash: hash, 
		pubKey: pubKey, 
		signature: signature,
	};
    return tx;
};

async function createSignature(text,privKey) {
	var privKeyObj = openpgp.key.readArmored(privKey).keys[0];
	var options = {
		data: text,
		privateKeys: [privKeyObj],
	};
	return (await openpgp.sign(options)).data;
}

// Create Block
function createBlock(data) {
	var bl = {
		index: Blockchain.blocks.length,
		prevHash: Blockchain.blocks[Blockchain.blocks.length-1].hash,
		data,
		timestamp: Date.now(),
	};
	bl.hash = blockHash(bl);
	return bl;
};

// Hashing
function transactionHash(data) {
	return crypto.createHash("sha256").update(`${data}`).digest("hex");
};
function blockHash(bl) {
	return crypto.createHash("sha256").update(`${bl.index};${bl.prevHash};${JSON.stringify(bl.data)};${bl.timestamp}`).digest("hex");
};

// Verification
async function verifyChain(chain){
    var Phash;
    for (let bl of chain.blocks) {
		if (Phash && bl.prevHash !== Phash) return false;
        if (!(await verifyBlock(bl))) return false; 
        Phash = bl.hash;	
	}	
    return true;
};	

async function verifyBlock(eachBlock) {
    if (eachBlock.data == null) return false;
	if (eachBlock.index === 0){
	    if (eachBlock.hash !== '000000') return false;
    } else {
        if (!eachBlock.prevHash) return false;  
		if (!(typeof eachBlock.index === "number" && Number.isInteger(eachBlock.index) && eachBlock.index > 0)) {
            return false;
        }
        if (eachBlock.hash !== blockHash(eachBlock)) return false;
        if (!Array.isArray(eachBlock.data)) return false;
		if (!(await verifyTransaction(eachBlock.data))) return false;
	}
    return true;
};

async function verifyTransaction(data) {
	for (let txn of data){
		//all transactions of the block
		console.log(txn);
		if (txn.hash !== transactionHash(txn.data)) return false;
		if (txn.pubKey == null || txn.signature == null) return false;
		if (!await verifySignature(txn.signature, txn.pubKey)) return false;
	}	
	return true;
};

async function verifySignature(signature,pubKey) {
	try {
		let pubKeyObj = openpgp.key.readArmored(pubKey).keys[0];
		let options = {
			message: openpgp.cleartext.readArmored(signature),
			publicKeys: pubKeyObj,
		};
		return (await openpgp.verify(options)).signatures[0].valid;
	} 
    catch (err) {}   
	return false;
};