

const _ = require('lodash');
const MAX_NOTIFICATION_LIST_LENGTH = 100;

module.exports = (io, clientSocketList) => {

    return {
        consumeAndCleanNotifications,
        sendUpdatedUserToItsSocket,
        sendUpdatedUserToClientSocket
    };

    /**
    * This function is used whenever a notifications has to become consumed. 
    * This function set the notification to consumed and pop the notifications list in the user in order to mantain only MAX_NOTIFICATION_LIST_LENGTH consumed notifications
    */
    function consumeAndCleanNotifications(user, consumedNotId) {
        // Set the notification to consumed, if the notification exists
        let notificationToConsumeIndex = _.findIndex(user.notifications, function (n) { return n._id == consumedNotId; });
        if (notificationToConsumeIndex != -1) {
            user.notifications[notificationToConsumeIndex].bConsumed = true;

            // Split the notifications list in two arrays: one with consumed notifications, one with unconsumed notifications.
            let notConsumedNotifications = _.filter(user.notifications, function (n) { return !n.bConsumed });
            let consumedNotifications = _.filter(user.notifications, function (n) { return n.bConsumed });

            // Removes oldest consumed notifications in order to save only the MAX_NOTIFICATION_LIST_LENGTH recent ones
            if (consumedNotifications.lenght > MAX_NOTIFICATION_LIST_LENGTH) {
                let outBuffer = consumedNotifications.lenght - MAX_NOTIFICATION_LIST_LENGTH;
                _.orderBy(consumedNotifications, ['bConsumed', 'creationDate'], ['asc', 'desc']);

                for (let i = 0; i < outBuffer; i++) {
                    consumedNotifications.pop();
                }

                user.notifications = _.orderBy(notConsumedNotifications.concat(consumedNotifications), ['bConsumed', 'creationDate'], ['asc', 'desc']);
            }

            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Send user informations to destination client (if the client is online)
     * @param {*} user 
     */
    function sendUpdatedUserToItsSocket(user) {
        let userSocket = _.find(clientSocketList, function (socket) { return socket.userId == user._id });
        if (userSocket != undefined && userSocket.socketId) {
            io.to(userSocket.socketId).emit('userUpdated', user);
        }
    }

    /**
     * Used when a client needs to update an user in an userList (if the client is online)
     * @param {*} user 
     */
    function sendUpdatedUserToClientSocket(user, destClientUserId) {
        let userSocket = _.find(clientSocketList, function (socket) { return socket.userId == destClientUserId });
        if (userSocket != undefined && userSocket.socketId) {
            io.to(userSocket.socketId).emit('userListUserUpdated', user);
        }
    }
}