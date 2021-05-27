

const _ = require('lodash');
const role = require('./role');
const { OPTION_VISIBILITY } = require('./enum');
const { Residence } = require('./db');

module.exports = () => {

    return {
        filterUserByPrivacySettings,
    };

    /**
     * For each user in userList, replace the user infos with empty values depeding on user settings (only if the requesting user is not an admin). If the requesting user is the current processed user, the filter is not applied
     * @param {*} userList 
     * @param {*} requestingUser 
     */
    function filterUserByPrivacySettings(userList, requestingUser) {
        if(requestingUser.role != role.Admin ) {
            for(let i=0; i<userList.length; i++) {

                if(requestingUser.userId != userList[i]._id) {
                    // Public Info
                    if(userList[i].settings.showPublicInfo == OPTION_VISIBILITY.NONE) {
                        userList[i].contacts.socials.facebook = "";
                        userList[i].contacts.socials.instagram = "";
                        userList[i].contacts.socials.twitter = "";
                        userList[i].contacts.socials.linkedin = "";
                        userList[i].contacts.socials.other = "";
                        userList[i].personalRecords = [];
                        userList[i].disciplines = [];
                    }
        
                    // Private Info
                    if(userList[i].settings.showPrivateInfo == OPTION_VISIBILITY.NONE) {
                        userList[i].residence = new Residence();
                        userList[i].placeOfBirth = new Residence();
                        userList[i].gyms = [];
                        userList[i].contacts.email = "";
                        userList[i].contacts.telephone = "";
                        userList[i].dateOfBirth = new Date();
                        userList[i].sex = "";
                        userList[i].bodyWeight = 1;
                        userList[i].yearsOfExperience = 1;
                    }
                }

            }
        }
    }

}