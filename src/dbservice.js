import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import db from '@/firebase.js';

export default {
    getNewRandomPart(){
        return parseInt(Math.random() * 10000, 10);
    },
    async lockRoomForAction(roomId, mode){
        const locked = mode==='unlock'?false:true;
        await setDoc(doc(db, "rooms", roomId), { locked }, { merge: true });
    },
    createOrUpdateLocalUser(userName){
        console.log('DB SERVICE :: createOrUpdateLocalUser ' + userName);
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
        console.log('DB SERVICE :: getAndSyncLocalUser');
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
    getRoom(roomId){
        console.log('DB SERVICE :: getRoom roomId:' + roomId);

    },
    listenToRoom(roomId, roomChangeCallback){
        onSnapshot(doc(db, 'rooms', roomId), (snap) => {
            roomChangeCallback(snap.data());
          });
    }
};