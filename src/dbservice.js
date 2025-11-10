import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import db from '@/firebase.js';
import data from './data.js';

export default {
    getNewRandomPart(){
        return parseInt(Math.random() * 10000, 10);
    },
    createLocalUser(userName){
        console.log('DB SERVICE :: createLocalUser ' + userName);
        let userObjStr = localStorage.getItem("na-tz-user");
        let userObj = userObjStr ? JSON.parse(userObjStr) : null;

        let userId = userObj?.userId ? userObj.userId : (this.getNewRandomPart() + "-" + Date.now());
        userObj = { userId, userName };
        //Sync
        localStorage.setItem("na-tz-user", JSON.stringify(userObj));
        //DB - Fire and forget
        setDoc(doc(db, 'users', userId), userObj);
    },
    getLocalUser(){
        console.log('DB SERVICE :: getLocalUser');
        //Sync
        let userObjStr = localStorage.getItem("na-tz-user");
        let userObj = userObjStr?JSON.parse(userObjStr):null;

        if(userObj){
            //DB - Fire and forget
            getDoc(doc(db, 'users', userObj.userId)).then((docSnap)=>{
                if (docSnap.exists()) {
                    console.log(docSnap.data())
                } else {
                    console.log('User does not exist in DB! Saving it')
                    //DB - Fire and forget
                    setDoc(doc(db, 'users', userObj.userId), userObj);
                }
            });
        }
        return userObj;
    },
    async createRoom(){
        console.log('DB SERVICE :: creatRoom ');
        let roomId = this.getNewRandomPart() + "-" + Date.now();
        let localUser = this.getLocalUser();

        let roomObj = { roomId, 
            roomName: `${localUser.userName}'s Room`, 
            owner: localUser, 
            users:[localUser],
            gameState: {
                status: 'NOT_READY',
                availableChanceCards: data.getChanceOptions(),
                selectedChanceCard: null,
                players: [
                ],
                selectedPlayer: {},
                currentRolledDice: null,
                selectedTile: data.getAllTiles()[0],
                playerToTileMap: {},
                tileToOwnerMap: {},
                tileToBoothMap: {},
                bankMoneyBag: money.getDefaultBankMoneyBag(),
                uncleMoneyBag: {}
            },
            notifications: [
                `${localUser.userName}'s room is ready!`
            ]
        };
        
        //Store and wait
        await setDoc(doc(db, 'rooms', roomId), roomObj);
        return roomObj;
    },
    async getRoomAfterJoining(roomId, userObj){
        console.log('DB SERVICE :: getRoomAfterJoining ' + roomId + ' userObj.userId ' + userObj.userId);
        
        let docSnap = await getDoc(doc(db, 'rooms', roomId));
        let roomObj = docSnap.data();
        if(roomObj.roomId == roomId){
            let matchingUser = roomObj.users.find( user => { return user.userId == userObj.userId } );
            if(matchingUser){
                console.log('User already in room');
                matchingUser.userName =userObj.userName;
            }else{
                console.log('Pushing current user in room users, as not found');
                roomObj.users.push(userObj);
            }
            
            //Copy necessary
            let partRoomObj = {};
            partRoomObj.users = roomObj.users;
            console.log('Users payload');
            console.log(partRoomObj);

            //Save by merge, wait
            await setDoc(doc(db, 'rooms', roomObj.roomId), partRoomObj, { merge: true });
            docSnap = await getDoc(doc(db, 'rooms', roomObj.roomId));
            roomObj = docSnap.data();
            console.log('Final room');
            console.log(roomObj);
            return roomObj;
        }else{
            return null;
        }
    },
    async updateGameInRoom(roomObj, gameState){
        console.log('DB SERVICE :: updateGameInRoom roomObj.roomId ' + roomObj.roomId );
        
        //Assign necessary
        let partRoomObj = {};
        partRoomObj.gameState = gameState;
        
        //Save by merge, wait
        await setDoc(doc(db, 'rooms', roomObj.roomId), partRoomObj, { merge: true });
        let docSnap = await getDoc(doc(db, 'rooms', roomObj.roomId));
        roomObj = docSnap.data();
        return roomObj;
    },
    async updateNotificationsInRoom(roomObj, notifications){
        console.log('DB SERVICE :: updateNotificationsInRoom roomObj.roomId ' + roomObj.roomId );
        
        //Assign necessary
        let partRoomObj = {};
        partRoomObj.notifications = notifications;
        
        //Save by merge, wait
        await setDoc(doc(db, 'rooms', roomObj.roomId), partRoomObj, { merge: true });
        let docSnap = await getDoc(doc(db, 'rooms', roomObj.roomId));
        roomObj = docSnap.data();
        return roomObj;
    },
    listenToRoomGameState(roomObj, roomChangeCallback){
        console.log(roomChangeCallback);
        onSnapshot(doc(db, 'rooms', roomObj.roomId), (snap) => {
            roomChangeCallback(snap.data().gameState);
          })
    }
};