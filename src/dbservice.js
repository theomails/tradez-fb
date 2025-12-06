import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import db from '@/firebase.js';

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
                    console.log('User already exists');
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
        let localUser = this.getAndSyncLocalUser();

    },
    /** Rejoining can update new name even in existing user in room. */
    async getRoomAfterJoining(roomId, userObj){
        console.log('DB SERVICE :: getRoomAfterJoining ' + roomId + ' userObj.userId ' + userObj.userId);
        

    },
    /** RISKIEST OP.. Whole game state is controlled from client side on any players' machine */
    async postCommandToRoom(roomId, commandObj){
        
    },
    listenToRoom(roomId, roomChangeCallback){
        onSnapshot(doc(db, 'rooms', roomId), (snap) => {
            roomChangeCallback(snap.data());
          });
    }
};