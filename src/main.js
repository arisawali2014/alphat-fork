const LineAPI = require('./api');
const { Message, OpType, Location } = require('../curve-thrift/line_types');
let exec = require('child_process').exec;

const myBot = [/*'uc3d0b63cc7985fd34c7ba93e357332e5',*/'u5ee3f8b1c2783990512a02c14d312c89','u02a0665c44d3fa83e0864ef91ea76f8d','u5a20e49a9918a96267ae41c0e13cd1c3'];
var vx = {};var midnornama = "";var pesane = "";//DO NOT CHANGE THIS
var banList = ['u02a0665c44d3fa83e0864ef91ea76f8d','u5ee3f8b1c2783990512a02c14d312c89'];//Banned list
var waitMsg = "no"; //DO NOT CHANGE THIS
var msgText = "Bro.... ini tes, jangan dibales !";
var bcText = "Masukan teks untuk broadcast";

function isAdminOrBot(param) {
    return myBot.includes(param);
}

function isBanned(banList, param) {
    return banList.includes(param);
}

class LINE extends LineAPI {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 0,
            kick: 1,
			salam: 1,
			mute: 0
        }
		this.keyhelp = "\n\
====================\n\
# Keyword List\n\n\
=> !ban *ADMIN*\n\
=> !banlist\n\
=> !botleft *ADMIN*\n\
=> !gURL\n\
=> !halo\n\
=> !kepo\n\
=> !key\n\
=> !kickall *ADMIN*\n\
=> !kickme\n\
=> !msg\n\
=> !mute *ADMIN*\n\
=> !myid\n\
=> !speed\n\
=> !tagall\n\
=> !unmute *ADMIN*\n\
\n\n# Gunakan bot dengan bijak ^_^";
    }

    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            const txt = (operation.message.text !== '' && operation.message.text != null ) ? operation.message.text : '' ;
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === myBot[0]) ? operation.message.from : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            if(waitMsg == "yes" && operation.message.from == vx[0] && this.stateStatus.mute != 1){
				this.textMessage(txt,message,message.text)
			}else if(this.stateStatus.mute != 1){this.textMessage(txt,message);
			}else if(txt == "!unmute" && isAdminOrBot(operation.message.from) && this.stateStatus.mute == 1){
			    this.stateStatus.mute = 0;
			    this._sendMessage(message,"ヽ(^。^)ノ")
		    }else{console.info("muted");}
        }

        if(operation.type == 13 && this.stateStatus.cancel == 1) {
            this.cancelAll(operation.param1);
        }
		
		if(operation.type == 43 || operation.type == 24 || operation.type == 15 || operation.type == 21){//console.info(operation);}
		
		if(operation.type == 16 && this.stateStatus.salam == 1){//join group
			let halo = new Message();
			halo.to = operation.param1;
			halo.text = "Halo, Salam Kenal ^_^ !";
			this._client.sendMessage(0, halo);
		}
		
		if(operation.type == 17 && this.stateStatus.salam == 1 && isAdminOrBot(operation.param2)) {//ada yang join
		    let halobos = new Message();
			halobos.to = operation.param1;
			halobos.toType = 2;
			halobos.text = "Halo bos !, selamat datang di group ini bos !";
			this._client.sendMessage(0, halobos);
		}else if(operation.type == 17 && this.stateStatus.salam == 1){//ada yang join
			let seq = new Message();
			seq.to = operation.param1;
			//halo.siapa = operation.param2;
			this.textMessage("0101",seq,operation.param2);
			//this._client.sendMessage(0, halo);
		}
		
		if(operation.type == 15 && isAdminOrBot(operation.param2)) {//ada yang leave
		    let babay = new Message();
			babay.to = operation.param1;
			babay.toType = 2;
			babay.text = "Ada apa bos ? kok leave ?";
			this._invite(operation.param1,[operation.param2]);
			this._client.sendMessage(0, babay);
		}else if(operation.type == 15 && !isAdminOrBot(operation.param2)){
			let seq = new Message();
			seq.to = operation.param1;
			this.textMessage("0102",seq,operation.param2);
		}

        if(operation.type == 19) { //ada kick
            // op1 = group nya
            // op2 = yang 'nge' kick
            // op3 = yang 'di' kick
			let kasihtau = new Message();
			kasihtau.to = operation.param1;
			kasihtau.toType = 2;
			kasihtau.contentType = 0;
            if(isAdminOrBot(operation.param3)) {
                this._invite(operation.param1,[operation.param3]);
				kasihtau.text = "Jangan kick botku !";
				this._client.sendMessage(0, kasihtau);
				var kickhim = 'yes';
            }
            if(!isAdminOrBot(operation.param3)){
                this._invite(operation.param1,[operation.param3]);
				kasihtau.text = "Jangan main kick !";
				this._client.sendMessage(0, kasihtau);
            } 
			if(kickhim=='yes'){
				if(!isAdminOrBot(operation.param2)){
				    this._kickMember(operation.param1,[operation.param2]);
				}var kickhim = 'no';
			}

        }

        if(operation.type == 55){ //ada reader

            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        if(operation.type == 13) { // diinvite
            if(isAdminOrBot(operation.param2)) {
                return this._acceptGroupInvitation(operation.param1);
            } else {
                return this._cancel(operation.param1,myBot);
            }
        }
        this.getOprationType(operation);
    }

    async cancelAll(gid) {
        let { listPendingInvite } = await this.searchGroup(gid);
        if(listPendingInvite.length > 0){
            this._cancel(gid,listPendingInvite);
        }
    }

    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }
	
	async matchPeople(param, nama) {
	    for (var i = 0; i < param.length; i++) {
            let orangnya = await this._client.getContacts([param[i]]);
		    if(orangnya[0].displayName == nama){
			    return orangnya;
				break;
		    }
        }
	}
	
	async searchRoom(rid) {
        let thisroom = await this._getRoom(rid);
        let listMemberr = thisroom.contacts.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMemberr
        }
    }

    setState(seq) {
        if(isAdminOrBot(seq.from)){
            let [ actions , status ] = seq.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
            this._sendMessage(seq,`Status: \n${JSON.stringify(this.stateStatus)}`);
        } else {
            this._sendMessage(seq,`You Are Not Admin`);
        }
    }

    mention(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        for (var i = 0; i < listMember.length; i++) {
            mentionStrings.push('@'+listMember[i].displayName+'\n');
            mid.push(listMember[i].mid);
        }
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }
	
	async tagAlls(seq,param1,param2){
		let { listMember } = await this.searchGroup(seq.to);
			seq.text = "";
			let mentionMemberx = [];
            for (var i = param1; i < param2; i++) {
				if(seq.text == null || typeof seq.text === "undefined" || !seq.text){
					let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
				    seq.text += "@"+namanya+" ";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember1 = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z;
                        let mentionz = `{"S":"0","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember1);
				    //const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
				    //seq.contentMetadata = tag.cmddata;
				    //this._client.sendMessage(0, seq);
				}else{
				    let namanya = listMember[i].dn;
				    let midnya = listMember[i].mid;
					let kata = seq.text.split("");
					let panjang = kata.length;
				    seq.text += "@"+namanya+" ";
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					mentionMemberx.push(mentionMember);
				}
			}
			const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMemberx}]}` }}
			seq.contentMetadata = tag.cmddata;
			this._client.sendMessage(0, seq);
	}
	
	mension(listMember) {
        let mentionStrings = [''];
        let mid = [''];
        mentionStrings.push('@'+listMember.displayName+'\n');
        mid.push(listMember.mid);
        let strings = mentionStrings.join('');
        let member = strings.split('@').slice(1);
        
        let tmp = 0;
        let memberStart = [];
        let mentionMember = member.map((v,k) => {
            let z = tmp += v.length + 1;
            let end = z - 1;
            memberStart.push(end);
            let mentionz = `{"S":"${(isNaN(memberStart[k - 1] + 1) ? 0 : memberStart[k - 1] + 1 ) }","E":"${end}","M":"${mid[k + 1]}"}`;
            return mentionz;
        })
        return {
            names: mentionStrings.slice(1),
            cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }
        }
    }

    async recheck(cs,group) {
        let users;
        for (var i = 0; i < cs.length; i++) {
            if(cs[i].group == group) {
                users = cs[i].users;
            }
        }
        
        let contactMember = await this._getContacts(users);
        return contactMember.map((z) => {
                return { displayName: z.displayName, mid: z.mid };
            });
    }
	
	async leftGroupByName(payload) {
        let groupID = await this._getGroupsJoined();
	    for(var i = 0; i < groupID.length; i++){
		    let groups = await this._getGroups(groupID);
            for(var ix = 0; ix < groups.length; ix++){
                if(groups[ix].name == payload){
                    this._client.leaveGroup(0,groups[ix].id);
				    break;
                }
            }
	    }
    }

    removeReaderByGroup(groupID) {
        const groupIndex = this.checkReader.findIndex(v => {
            if(v.group == groupID) {
                return v
            }
        })

        if(groupIndex != -1) {
            this.checkReader.splice(groupIndex,1);
        }
    }

    async textMessage(textMessages, seq, param) {
        //const [ cmd, payload ] = textMessages.split(' ');
        const txt = textMessages.toLowerCase();
        const messageID = seq.id;
		const cot = textMessages.split('@');
		const com = textMessages.split(':');
		const cox = textMessages.split(' ');
		//console.info(vx.from);
		if(vx[1] == "!set" && seq.from == vx[0] && waitMsg == "yes"){
			//waitMsg = "no";
			//let vvx = vx[1];let vvxx = vx[0];//vx[0] = "";vx[1] = "";
			if(vx[2] == "arg1" && txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";
				this._sendMessage(seq,"Perintah dibatalkan !");
			}else if(vx[2] == "arg1" && txt == "admin"){
				waitMsg = "yes";vx[2] = "arg2";vx[3] = "admin";
			}else if(vx[2] == "arg2" && vx[3] == "admin"){
				let vvx = vx[1];let vvxx = vx[0];let vvxxx = vx[2];let vvxxxx = vx[3];waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"Set "+vvxxxx+" ke "+txt);
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"Perintah dibatalkan !\n#No Command Found !");
			}
			//this._sendMessage(seq,"# "+vvx+" to "+param);
		}
		if(txt == "!set" && isAdminOrBot(seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Mau set apa bos ?");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "!set" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "!kepo" && seq.from == vx[0] && waitMsg == "yes"){
			//vx[3] = txt;
			//console.info(vx[3]);//waitMsg = "no";
			//let vvx = vx[1];let vvxx = vx[0];//vx[0] = "";vx[1] = "";
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"# CANCELLED");
			}else if(vx[2] == "arg1" && !cox[1]){
				    let orangnya = await this._getContacts([txt]);
				    seq.text = 
"#Nama: "+orangnya[0].displayName+"\n\
#ID: \n"+orangnya[0].mid+"\n\
#Profile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
#Status: \n"+orangnya[0].statusMessage+"\n\
\n\n\n \n\
====================\n\
              #Kepo \n\
====================";
vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				    this._sendMessage(seq,seq.text);
			}
			//this._sendMessage(seq,"# "+vvx+" to "+param);
		}
		if(txt == "!kepo" && !isBanned(banList, seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;vx[2] = "arg1";
			    this._sendMessage(seq,"Kepo sama siapa bang ?");
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == '!kepo' && isBanned(banList, seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "!msg" && seq.from == vx[0] && waitMsg == "yes"){
			//vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(vx[2] == "arg1" && vx[3] == "mid"){
				midnornama = txt;
				this._sendMessage(seq,"OK !, btw pesan-nya apa ?");
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "mid"){
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Terkirim bang !";
				pesane = txt;
				seq.to = midnornama;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,pesane);
				this._client.sendMessage(0, bang);
			}else if(vx[2] == "arg1" && vx[3] == "nama"){
				let midnornama = seq.contentMetadata.MENTION;//.MENTIONEES.M
				let bang = new Message();
			    bang.to = seq.to;
				bang.text = "OK bos !, btw pesan-nya apa ?";
				this._client.sendMessage(0, bang);
				vx[2] = "arg2";
			}else if(vx[2] == "arg2" && vx[3] == "nama"){
				let pesane = seq.text;
				let bang = new Message();
				bang.to = seq.to;
				bang.text = "Terkirim bos !";
				seq.to = midnornama;
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,pesane);
				this._client.sendMessage(0, bang);
			}
		}
		/*if(txt == "!msg" && isAdminOrBot(seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    vx[0] = seq.from;vx[1] = txt;vx[3] = "nama";
			    if(this._sendMessage(seq,"Mau kirim pesan ke siapa bos ?")){
				console.info("a");
				vx[2] = "arg1";waitMsg = "yes";}
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else */if(txt == "!msg" && !isBanned(banList, seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;vx[3] = "mid";
			    this._sendMessage(seq,"Mau kirim pesan ke siapa bang ?");
				this._sendMessage(seq,"Kirim midnya ya bang ! #jangan pake nama");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == '!msg' && isBanned(banList, seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "!ban" && seq.from == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(txt == "me"){
				if(isBanned(banList,seq.from)){
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"Ente sudah masuk daftar banlist...");
				}else{
				    this._sendMessage(seq,"Sudah bosku !");
			        banList.push(seq.from);
				    waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				}
			}else{
				if(cot[1]){
					let ment = seq.contentMetadata.MENTION;
			        let xment = JSON.parse(ment);let pment = xment.MENTIONEES[0].M;
					if(isBanned(banList,pment)){
						waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					    this._sendMessage(seq,cot[1]+" sudah masuk daftar banlist...");
				    }else{
					    this._sendMessage(seq,"Sudah bosku !");
			            banList.push(pment);
					    waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					}
				}else{
					this._sendMessage(seq,"Tag orangnya bos !");
				}
			}
		}
		if(txt == "!ban" && isAdminOrBot(seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;
			    this._sendMessage(seq,"Ban siapa ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "!ban" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(vx[1] == "!unban" && seq.from == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else{
				if(isBanned(banList, txt)){
					let ment = banList.indexOf(txt);
					if (ment > -1) {
                        banList.splice(ment, 1);
                    }
					waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
					this._sendMessage(seq,"Sudah bosku !");
				}else{
					this._sendMessage(seq,"Dia gk masuk daftar banned bos !");
				}
			}
		}
		if(txt == "!unban" && isAdminOrBot(seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
			    waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;
				seq.text = "";
				for(var i = 0; i < banList.length; i++){
					let orangnya = await this._getContacts([banList[i]]);
				    seq.text += "\n-["+orangnya[0].mid+"]["+orangnya[0].displayName+"]";
				}
				this._sendMessage(seq,seq.text);
			    this._sendMessage(seq,"unban siapa ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "!unban" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "!banlist"){
			seq.text = "";
			for(var i = 0; i < banList.length; i++){
			    let orangnya = await this._getContacts([banList[i]]);
				seq.text += "\n["+orangnya[0].mid+"]["+orangnya[0].displayName+"]";
			}
			this._sendMessage(seq,seq.text);
		}
		
		if(txt == "!left" && isAdminOrBot(seq.from)){
			this._client.leaveGroup(0,seq.to);
		}
		
		if(vx[1] == "!botleft" && seq.from == vx[0] && waitMsg == "yes"){
			if(txt == "cancel"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}else if(txt == "group" && vx[2] == "arg1"){
				vx[3] = txt;
				this._sendMessage(seq,"OK, Apa nama groupnya bos ?");
				vx[2] = "arg2";
			}else if(vx[3] == "group" && vx[2] == "arg2"){
				vx[0] = "";vx[1] = "";waitMsg = "no";vx[2] = "";vx[3] = "";
				this.leftGroupByName(textMessages);
			}
		}
		if(txt == "!botleft" && isAdminOrBot(seq.from)){
			if(vx[2] == null || typeof vx[2] === "undefined" || !vx[2]){
				waitMsg = "yes";
			    vx[0] = seq.from;vx[1] = txt;
			    this._sendMessage(seq,"Left dari ?");
				vx[2] = "arg1";
			}else{
				waitMsg = "no";vx[0] = "";vx[1] = "";vx[2] = "";vx[3] = "";
				this._sendMessage(seq,"#CANCELLED");
			}
		}else if(txt == "!botleft" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}
		/*if(cot[1]){
			console.info("a");
			let xx = seq.contentMetadata.MENTION;
			let xy = JSON.parse(xx);
			let xyz = xy.MENTIONEES[0].M;
			console.info(xyz);
		}*/
		
		/*if(seq.from == vx[0] && waitMsg == "yes"){
			console.info("a");waitMsg = "no";
			let vvx = vx[1];vx[0] = "";vx[1] = "";
			this._sendMessage(seq,"# "+vvx+" to "+param);
		}*/
		
		/*if(txt == "profile"){
			let orangnya = await this._client.getContacts([seq.from]);
		    console.info(orangnya);
		}*/
		
		if(txt == "1123"){
			//let orangnya = await this._client.getAllContactIds();
			//console.info(orangnya);
		}
		
		if(txt == "!mute" && isAdminOrBot(seq.from)){
			this.stateStatus.mute = 1;
			this._sendMessage(seq,"(*´﹃｀*)")
		}
		
		if(com[0] == "msg" && isAdminOrBot(seq.from)){//prosesnya tergantung jumlah teman anda
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Mau kirim pesan ke siapa bos ?");
			}else{
				let friendList = await this._client.getAllContactIds();
				//console.info(friendList);
				let orangnya = await this.matchPeople(friendList, com[1]);
				if(!orangnya){this._sendMessage(seq,"Saya gak kenal sama dia bos ...");}else{
					seq.to = orangnya[0].mid;
					this._sendMessage(seq,msgText);
				}
			}
		}else if(com[0] == "msg" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}

       /* if(txt == 'cancel' && this.stateStatus.cancel == 1) {
            this.cancelAll(seq.to);
        }*/

        if(txt == '!halo' || txt == '!sya') {
            this._sendMessage(seq, 'halo disini tasya :)');
        }
		
		/*if(cox[0] == "set" && isAdminOrBot(seq.from)){
			if(cox[1] == null || typeof cox[1] === "undefined" || !cox[1]){
				this._sendMessage(seq,"Mau set apa bos ?");
				vx[0] = "";vx[1] = "";waitMsg = "no";
			}else{
				vx[0] = seq.from;
                vx[1] = textMessages;
				waitMsg = "yes";
				//this.apaSelanjutnya(vx, );
				//console.info("yes\n"+vx.from+"\n"+vx.text);
				//let apa = await this.apaSelanjutnya(vx);
				//this._sendMessage(seq,"Set "+cox[1]+" to "+apa);
			}
		}else if(cox[0] == "set" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}*/
		
		if(com[0] == "kick" && isAdminOrBot(seq.from) && seq.toType == 2){
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Mau kick siapa bos ?");
			}else{this._kickMember(seq.to,[com[1]]);}
		}else if(com[0] == "kick" && !isAdminOrBot(seq.from) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}
		
		if(txt == "!kickme" && seq.toType == 2 && !isBanned(banList, seq.from)){
			this._sendMessage(seq,"Ok bang !");
			this._kickMember(seq.to,[seq.from]);
		}else if(txt == '!kickme' && isBanned(banList, seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		if(com[0] == "invite" && isAdminOrBot(seq.from) && seq.toType == 2){
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Mau invite siapa bos ?");
			}else{this._invite(seq.to,[com[1]]);}
		}else if(com[0] == "invite" && !isAdminOrBot(seq.from) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}
		
		if(com[0] == "kepo" && isAdminOrBot(seq.from)){
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Kepo sama siapa ?");
			}else{
				let orangnya = await this._getContacts([com[1]]);
				seq.text = 
"#Nama: "+orangnya[0].displayName+"\n\
#ID: "+orangnya[0].mid+"\n\
#Profile Picture: \nhttp://dl.profile.line.naver.jp"+orangnya[0].picturePath+"\n\
#Status: \n"+orangnya[0].statusMessage+"\n\
\n\n\n \n\
====================\n\
              #Kepo \n\
====================";
				this._sendMessage(seq,seq.text);
			}
		}else if(com[0] == "kepo" && !isAdminOrBot(seq.from)){this._sendMessage(seq,"Not permitted !");}

        if(txt == '!speed' && !isBanned(banList, seq.from)) {
            const curTime = Math.floor(Date.now() / 1000);
            //this._sendMessage(seq,'processing....');
            const rtime = Math.floor(Date.now() / 1000) - curTime;
            this._sendMessage(seq, `${rtime} second`);
        }else if(txt == '!speed' && isBanned(banList, seq.from)){this._sendMessage(seq,"Not permitted !");}

        /*if(txt === 'kernel') {
            exec('uname -a;ptime;id;whoami',(err, sto) => {
                this._sendMessage(seq, sto);
            })
        }*/

        if(txt === '!kickall' && this.stateStatus.kick == 1 && isAdminOrBot(seq.from) && seq.toType == 2) {
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(!isAdminOrBot(listMember[i].mid)){
                    this._kickMember(seq.to,[listMember[i].mid])
                }
            }
        }else if(txt === '!kickall' && !isAdminOrBot(seq.from) && seq.toType == 2){this._sendMessage(seq,"Not permitted !");}
		
		if(com[0] == "tag" && isAdminOrBot(seq.from) && seq.toType == 2){
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Mau tag siapa ?");
			}else{
				let { listMember } = await this.searchGroup(seq.to);
                for (var i = 0; i < listMember.length; i++) {
                    if(listMember[i].dn==com[1]){
						//let tmp = 0;
                        let namanya = listMember[i].dn;
						//console.info("Nama->"+namanya);
						let midnya = listMember[i].mid;
						//console.info("Mid->"+midnya);
						//let z = tmp += namanya.length + 1;
						const rec = { 
							displayName: namanya,
							mid: midnya
						}
						const mentions = await this.mension(rec);
						seq.contentMetadata = mentions.cmddata;
						//console.info(mentions.cmddata);
					    seq.text = '@'+namanya;
					    this._client.sendMessage(0, seq);
					    //console.info("Tag");
                    }
                }
			}
		}else if(com[0] == "tag" && isAdminOrBot(seq.from) && seq.toType == 1){
			if(com[1] == null || typeof com[1] === "undefined" || !com[1]){
				this._sendMessage(seq,"Mau tag siapa ?");
			}else{
				let { listMemberr } = await this.searchRoom(seq.to);
                for (var i = 0; i < listMemberr.length; i++) {
                    if(listMemberr[i].dn==com[1]){
						//let tmp = 0;
                        let namanya = listMemberr[i].dn;
						//console.info("Nama->"+namanya);
						let midnya = listMemberr[i].mid;
						//console.info("Mid->"+midnya);
						//let z = tmp += namanya.length + 1;
						const rec = { 
							displayName: namanya,
							mid: midnya
						}
						const mentions = await this.mension(rec);
						seq.contentMetadata = mentions.cmddata;
						//console.info(mentions.cmddata);
					    seq.text = '@'+namanya;
					    this._client.sendMessage(0, seq);
					    //console.info("Tag");
                    }
                }
			}
		}
		//here
		if(txt == '!key') {
			let botOwner = await this._client.getContacts([myBot[0]]);
            let { mid, displayName } = await this._client.getProfile();
			let key2 = "\n\
====================\n\
| BotName   : "+displayName+"\n\
| BotID     : \n["+mid+"]\n\
| BotStatus : Working\n\
| BotOwner  : "+botOwner[0].displayName+"\n\
====================\n";
			seq.text = key2 += this.keyhelp;
			this._client.sendMessage(0, seq);
		}
		
		if(txt == '0101') {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Halo @'+namanya+', Selamat datang bro ! Salam Kenal ^_^';
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }
		
		if(txt == "!tagall" && seq.toType == 2 && !isBanned(banList, seq.from)){
			let { listMember } = await this.searchGroup(seq.to);
			if(listMember.length < 5){
				await this.tagAlls(seq,0,5);
			}else if(listMember.length < 10){
				await this.tagAlls(seq,0,4);
				await this.tagAlls(seq,4,10);
			}else if(listMember.length < 20){
				await this.tagAlls(seq,0,4);
				await this.tagAlls(seq,4,9);
				await this.tagAlls(seq,9,14);
				await this.tagAlls(seq,14,20);
			}else if(listMember.length < 30){
				await this.tagAlls(seq,0,4);
				await this.tagAlls(seq,4,9);
				await this.tagAlls(seq,9,14);
				await this.tagAlls(seq,14,19);
				await this.tagAlls(seq,19,24);
				await this.tagAlls(seq,24,30);
			}else if(listMember.length < 40){
				await this.tagAlls(seq,0,4);
				await this.tagAlls(seq,4,9);
				await this.tagAlls(seq,9,14);
				await this.tagAlls(seq,14,19);
				await this.tagAlls(seq,19,24);
				await this.tagAlls(seq,24,29);
				await this.tagAlls(seq,29,34);
				await this.tagAlls(seq,34,40);
			}else if(listMember.length < 50){
				await this.tagAlls(seq,0,4);
				await this.tagAlls(seq,4,9);
				await this.tagAlls(seq,9,14);
				await this.tagAlls(seq,14,19);
				await this.tagAlls(seq,19,24);
				await this.tagAlls(seq,24,29);
				await this.tagAlls(seq,29,34);
				await this.tagAlls(seq,34,39);
				await this.tagAlls(seq,39,44);
				await this.tagAlls(seq,44,50);
			}else{
				await this.tagAlls(seq,0,listMember.length);
			}
		}else if(txt == '!tagall' && isBanned(banList, seq.from)){this._sendMessage(seq,"Not permitted !");}
		
		
		if(txt == '0102') {//Jangan dicoba (gk ada efek)
            let { listMember } = await this.searchGroup(seq.to);
            for (var i = 0; i < listMember.length; i++) {
                if(listMember[i].mid==param){
					let namanya = listMember[i].dn;
					seq.text = 'Goodbye ! @'+namanya;
					let midnya = listMember[i].mid;
					let kata = seq.text.split("@").slice(0,1);
					let kata2 = kata[0].split("");
					let panjang = kata2.length;
                    let member = [namanya];
        
                    let tmp = 0;
                    let mentionMember = member.map((v,k) => {
                        let z = tmp += v.length + 1;
                        let end = z + panjang;
                        let mentionz = `{"S":"${panjang}","E":"${end}","M":"${midnya}"}`;
                        return mentionz;
                    })
					const tag = {cmddata: { MENTION: `{"MENTIONEES":[${mentionMember}]}` }}
					seq.contentMetadata = tag.cmddata;
					this._client.sendMessage(0, seq);
					//console.info("Salam");
                }
            }
        }
		
		/*if(txt == "banner"){
			let banner = new Message();
			banner.from = seq.from;
			banner.to = seq.to;
			banner.toType = 2;
			banner.id = seq.id;
			banner.text = null;
			banner.location = null;
			banner.hasContent = false;
			seq.text = null;
			seq.contentType = 17;
			//banner.contentPreview = null;
			const tags = {cmddata: { SPEC_REV: '1',
				NOTIFICATION_DISABLED: 'true',
                BOT_richId: '2626133',
				DOWNLOAD_URL: 'https://s3-forums-photos.tribot.org/monthly_2016_04/1424257eb83d76a6.jpg.8a8eb21716a36dbf9f0cc1b681fd6ca8.jpg',
			    PUBLIC: 'true',
                ALT_TEXT: 'Gambar cewe bugil !',
				BOT_richTemplateType: '1',
				MARKUP_JSON: '{"canvas":{"width":1040,"height":1040,"initialScene":"initialScene"},"images":{"img":{"x":0,"y":0,"w":1040,"h":1040}},"scenes":{"initialScene":{"draws":[{"image":"img","type":"image","src":"img","x":0,"y":0,"w":1040,"h":1040}],"listeners":[{"type":"touch","action":"A","params":[0.0,0.0,1040.0,1040.0]}]}},"actions":{"A":{"type":"web","text":"","params":{"linkUri":"https://s3-forums-photos.tribot.org/monthly_2016_04/1424257eb83d76a6.jpg.8a8eb21716a36dbf9f0cc1b681fd6ca8.jpg"}}}}' }}
			seq.contentMetadata = {
				SPEC_REV: '1',
				NOTIFICATION_DISABLED: 'true',
                BOT_richId: '2626133',
				DOWNLOAD_URL: 'https://s3-forums-photos.tribot.org/monthly_2016_04/1424257eb83d76a6.jpg.8a8eb21716a36dbf9f0cc1b681fd6ca8.jpg',
			    PUBLIC: 'true',
                ALT_TEXT: 'Gambar cewe bugil !',
				BOT_richTemplateType: '1',
				MARKUP_JSON: '{"canvas":{"width":1040,"height":1040,"initialScene":"initialScene"},"images":{"img":{"x":0,"y":0,"w":1040,"h":1040}},"scenes":{"initialScene":{"draws":[{"image":"img","type":"image","src":"img","x":0,"y":0,"w":1040,"h":1040}],"listeners":[{"type":"touch","action":"A","params":[0.0,0.0,1040.0,1040.0]}]}},"actions":{"A":{"type":"web","text":"","params":{"linkUri":"https://s3-forums-photos.tribot.org/monthly_2016_04/1424257eb83d76a6.jpg.8a8eb21716a36dbf9f0cc1b681fd6ca8.jpg"}}}}'
			}
			seq.contentMetadata = tags.cmddata;
			this._client.sendMessage(0, seq);
		}*/

        /*if(txt == 'setpoint') {
            this._sendMessage(seq, `Setpoint for check reader.`);
            this.removeReaderByGroup(seq.to);
        }*/

        /*if(txt == 'clear') {
            this.checkReader = []
            this._sendMessage(seq, `Remove all check reader on memory`);
        }  */

        /*if(txt == 'recheck'){
            let rec = await this.recheck(this.checkReader,seq.to);
            const mentions = await this.mention(rec);
            seq.contentMetadata = mentions.cmddata;
            await this._sendMessage(seq,mentions.names.join(''));
            
        }*/

        /*if(txt == 'setpoint for check reader .') {
            this.searchReader(seq);
        }*/

        /*if(txt == 'clearall') {
            this.checkReader = [];
        }*/

        const action = ['cancel on','cancel off','kick on','kick off']
        if(action.includes(txt)) {
            this.setState(seq)
        }
	
        if(txt == '!myid' /*|| txt == 'mid' || txt == 'id'*/) {
            this._sendMessage(seq,"ID Kamu: "+seq.from);
        }

       /* if(txt == 'speedtest' && isAdminOrBot(seq.from)) {
            exec('speedtest-cli --server 6581',(err, res) => {
                    this._sendMessage(seq,res)
            })
        }*/

        const joinByUrl = ['!gurl'];
        if(joinByUrl.includes(txt)) {
            this._sendMessage(seq,`Updating group ...`);
            let updateGroup = await this._getGroup(seq.to);
            updateGroup.preventJoinByTicket = true;
            if(txt == 'ourl') {
                updateGroup.preventJoinByTicket = false;
                const groupUrl = await this._reissueGroupTicket(seq.to)
                this._sendMessage(seq,`Line group = line://ti/g/${groupUrl}`);
            }
            await this._updateGroup(updateGroup);
        }

        /*if(cmd == 'join') {
            const [ ticketId ] = payload.split('g/').splice(-1);
            let { id } = await this._findGroupByTicket(ticketId);
            await this._acceptGroupInvitationByTicket(id,ticketId);
        }*/

        /*if(cmd === 'ip') {
            exec(`curl ipinfo.io/${payload}`,(err, res) => {
                const result = JSON.parse(res);
                if(typeof result.error == 'undefined') {
                    const { org, country, loc, city, region } = result;
                    try {
                        const [latitude, longitude ] = loc.split(',');
                        let location = new Location();
                        Object.assign(location,{ 
                            title: `Location:`,
                            address: `${org} ${city} [ ${region} ]\n${payload}`,
                            latitude: latitude,
                            longitude: longitude,
                            phone: null 
                        })
                        const Obj = { 
                            text: 'Location',
                            location : location,
                            contentType: 0,
                        }
                        Object.assign(seq,Obj)
                        this._sendMessage(seq,'Location');
                    } catch (err) {
                        this._sendMessage(seq,'Not Found');
                    }
                } else {
                    this._sendMessage(seq,'Location Not Found , Maybe di dalem goa');
                }
            })
        }*/
    }

}

module.exports = new LINE();
