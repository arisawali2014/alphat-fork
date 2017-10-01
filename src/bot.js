const LineConnect = require('./connect');
let LINE = require('./main.js');
console.info("\n\
=========================================\n\
BotName: LINE Alphat JS\n\
Version: FORKED VERSION\n\
Thanks to @Alfathdirk @TCR_TEAM\n\
=========================================\n\
\nNOTE : This bot is made by @Alfathdirk @TCR_TEAM and has been forked by @GoogleX and @Arisawali2014 !\n\
***Copyright belongs to the author***");

/*
| This config is for auth/login with token
| 
| Change it to your authToken & your certificate
*/
const auth = {
 	authToken: 'EloYJSklOXWliORpKycc.F1/lFPvHtupEL7bw5g5uNa.FS9WFNXjdFwOEqGrsJzDtTl75B5w6iJU5SKKF+XKTQE=',
 	certificate: '5b55e5c83535d8a0d8a4896c89c9bcc49e443acd5cc1e89d85406764117370b5'
}

//let client =  new LineConnect();
let client =  new LineConnect(auth);

client.startx().then(async (res) => {
	let ops;
	while(true) {
		try {
			ops = await client.fetchOps(res.operation.revision, 5);
		} catch(error) {
			console.log('error',error)
		}
		for (let op in ops) {
			if(ops[op].revision.toString() != -1){
				res.operation.revision = ops[op].revision;
				LINE.poll(ops[op])
			}
		}
	}
});
