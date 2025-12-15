import { callFnWithAuth } from "./backendservice";
import dbservice from "./dbservice";

export default {
    async createRoomGetId(){
        console.log('Backend Helper :: createRoom ');
        let localUser = dbservice.getAndSyncLocalUser();
        const roomCreateResp = await callFnWithAuth('createRoomByOwner', { userId: localUser.userId });
        return roomCreateResp.roomId;
    },
    /** Rejoining can update new name even in existing user in room. */
    async initiateJoinRoom(roomId, userObj){
        console.log('Backend Helper :: initiateJoinRoom ' + roomId + ' userObj.userId ' + userObj.userId);
        await callFnWithAuth('addUserToRoom', { roomId, userId:userObj.userId });
    },
    async postCommandToRoom(userId, roomId, eventName, eventArgs){
        console.log('Backend Helper :: postCommandToRoom userId: ' + userId + ' roomId:' + roomId + ' command: ' + eventName, eventArgs);
        await callFnWithAuth('processGameCommand', { userId, roomId, eventName, eventArgs });
    },    
}