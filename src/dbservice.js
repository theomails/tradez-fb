import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import db from '@/firebase.js';
import data from './data.js';
import money from './money.js';

export default {
    getNewRandomPart(){
        return parseInt(Math.random() * 10000, 10);
    },
    createOrUpdateLocalUser(userName){
        console.log('DB SERVICE :: createLocalUser ' + userName);
        let userObjStr = localStorage.getItem("na-net-user");
        let userObj = userObjStr ? JSON.parse(userObjStr) : null;

        let userId = userObj?.userId ? userObj.userId : (this.getNewRandomPart() + "-" + Date.now());
        userObj = { userId, userName };
        //Sync
        localStorage.setItem("na-net-user", JSON.stringify(userObj));
        //DB - Fire and forget
        setDoc(doc(db, 'users', userId), userObj);
        return userObj;
    },
    /** Returns immediately, but fires-off a DB sync, doesn't wait */
    getAndSyncLocalUser(){
        console.log('DB SERVICE :: getLocalUser');
        //Sync
        let userObjStr = localStorage.getItem("na-net-user");
        let userObj = userObjStr?JSON.parse(userObjStr):null;

        if(userObj){
            //Either find existing user, or create user.
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
        console.log('DB SERVICE :: createRoom ');
        let roomId = this.getNewRandomPart() + "-" + Date.now();
        let localUser = this.getAndSyncLocalUser();
        let roomName = `${localUser.userName}'s Room`;

        let roomObj = { roomId, 
            roomName, 
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
                `${roomName} is ready!`
            ]
        };
        
        //Store and wait
        await setDoc(doc(db, 'rooms', roomId), roomObj);
        return roomObj;
    },
    /** Rejoining can update new name even in existing user in room. */
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
    /** RISKIEST OP.. Whole game state is controlled from client side on any players' machine */
    async updateGameInRoom(roomId, gameState){
        console.log('DB SERVICE :: updateGameInRoom roomId ' + roomId );
        
        //Assign necessary
        let partRoomObj = {};
        partRoomObj.gameState = gameState;
        
        //Save by merge, wait
        await setDoc(doc(db, 'rooms', roomId), partRoomObj, { merge: true });
    },
    async updateNotificationsInRoom(roomId, notifications){
        console.log('DB SERVICE :: updateNotificationsInRoom roomId ' + roomId );
        
        //Assign necessary
        let partRoomObj = {};
        partRoomObj.notifications = notifications;
        
        //Save by merge, wait
        await setDoc(doc(db, 'rooms', roomId), partRoomObj, { merge: true });
    },
    listenToRoom(roomId, roomChangeCallback){
        onSnapshot(doc(db, 'rooms', roomId), (snap) => {
            roomChangeCallback(snap.data());
          });
    }
};