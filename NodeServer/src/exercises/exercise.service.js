const { Exercise } = require('src/exercises/exercise.model.js');
const { User } = require('src/users/user.model.js')
const fileManager = require('src/_helpers/fileManager');
const _ = require('lodash');
const fs = require('fs');
const { Training } = require('../trainings/training.model');
const { ObjectID } = require('mongodb');

module.exports = () => {

    const EXERCISE_VALIDATIONS = {MAX_EXERCISE_NAME_LENGTH: 50, MAX_EXERCISE_DESCRIPTION_LENGTH: 100, MAX_VARIANT_NAME_LENGTH: 50, MIN_INTENSITY_COEFFICIENT_NUMBER: 0, MAX_INTENSITY_COEFFICIENT_NUMBER: 99999, MAX_PICTURES_NUMBER: 3, MAX_PICTURE_SIZE: 2, PICTURES_ACCEPTED_FORMATS: ['image/jpg', 'image/jpeg', 'image/png']};


    return {
        createExercise,
        findAllExercise,
        findAllExerciseForUser,
        findOneExercise,
        updateExercise,
        deleteExercise
    };


    // Create and Save a new Exercise
    async function createExercise(req, res) {
        // Validate request
        if (!req.body) {
            return res.status(400).send({
                message: "EXERCISE_CONTENT_EMPTY"
            });
        }

        // Create a Exercise
        const exercise = new Exercise({
            name: req.body.name,
            variant: req.body.variant,
            description: req.body.description,
            creator: (req.body.creator != "") ? req.body.creator : null,
            images: [],  // todo: push images path after saving them in local storage
            disciplines: req.body.disciplines,
            groups: req.body.groups
        });

        // Check if exercise is a valid exercise
        if(isExerciseValidToSubmit(exercise, false)) {
            // Save Exercise in the database
            exercise.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "EXERCISE_CREATE_GENERIC_ERROR"
                });
            });
        } else {
            res.status(500).send({
                message: "EXERCISE_CONTENT_INVALID"
            });
        }
        
    };

    // Retrieve and return all exercises from the database.
    async function findAllExercise(req, res) {
        Exercise.find()
            .then(exercises => {
                res.send(_.sortBy(exercises, ['name', 'variant.name']));
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "EXERCISES_GET_FAIL"
                });
            });
    };

    /**
     * Retrieve and return all exercises for a given user from the database.
     * If the user is a coach, this function returns all default exercises plus all exercises the coach has created.
     * If the user is an athlete, this function returns all default exericses plus all the exercises created by his coaches. 
     * */
    async function findAllExerciseForUser(req, res) {

        User.findById(req.params._id).then(user => {
            if (!user) {
                return res.status(404).send({
                    message: "USER_NOT_FOUND_ID", id: req.params._id
                });
            }

            switch (user.userType) {
                case 'coach': {
                    Exercise.find({ $or: [{ creator: null }, { creator: user._id }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "EXERCISES_GET_FAIL"
                            });
                        });
                    break;
                }

                case 'athlete': {
                    let coachesIds = _.map(user.coaches, function (coach) { return coach._id; });
                    Exercise.find({ $or: [{ creator: null }, { creator: coachesIds }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "EXERCISES_GET_FAIL"
                            });
                        });
                    break;
                }

                case 'both': {
                    let coachesIds = _.map(user.coaches, function (coach) { return coach._id; });
                    Exercise.find({ $or: [{ creator: null }, { creator: user._id }, { creator: coachesIds }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "EXERCISES_GET_FAIL"
                            });
                        });
                    break;
                }
            }

        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "USER_NOT_FOUND_ID", id: req.params._id
                });
            }
            return res.status(500).send({
                message: "EXERCISE_ERROR_FOUND_ID", id: req.params._id
            });
        });
    };

    // Find a single exercise with a id
    async function findOneExercise(req, res) {
        Exercise.findById(req.params._id)
            .then(exercise => {
                if (!exercise) {
                    return res.status(404).send({
                        message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                    });
                }
                res.send(exercise);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                    });
                }
                return res.status(500).send({
                    message: "EXERCISE_ERROR_FOUND_ID", id: req.params._id
                });
            });
    };

    // Update a exercise identified by the id in the request
    async function updateExercise(req, res) {

        // Validate Request
        if (!req.body) {
            return res.status(400).send({
                message: "EXERCISE_CONTENT_EMPTY"
            });
        }

        // Check if exercise is a valid exercise
        if(isExerciseValidToSubmit({
            name: req.body.name,
            variant: req.body.variant,
            description: req.body.description,
            creator: (req.body.creator != "") ? req.body.creator : null,
            images: req.body.images,  
            disciplines: req.body.disciplines,
            groups: req.body.groups
        }, req.body.bNewImages)) {

            // if exercise images have been updated, then save them replacing the existing ones
            if (req.body.bNewImages) {
                let fileDir = fileManager.imagesBaseDir + "/" + req.params._id;
                if (!fs.existsSync(fileManager.imagesBaseDir))
                    fs.mkdirSync(fileManager.imagesBaseDir);
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir);
                } 

                let saveImagesResult = await saveImages(req.body.images, fileDir);
                Promise.all(saveImagesResult).then((data) => {
                    req.body.images = data;

                    fileManager.clearImagesDirectory(fileDir, data);
                    findOneAndUpdateExercise(req, res);
                }).catch((err) => {
                    return res.status(500).send({
                        message: "EXERCISE_IMAGE_ERROR"
                    });
                })
            } else {
                findOneAndUpdateExercise(req, res);
            }
        } else {
            res.status(500).send({
                message: "EXERCISE_CONTENT_INVALID"
            });
        }
        
    };

    function findOneAndUpdateExercise(req, res) {
        // Find exercise and update it with the request body
        Exercise.findOneAndUpdate({ _id: req.params._id }, {
            name: req.body.name,
            variant: req.body.variant,
            description: req.body.description,
            creator: (req.body.creator != "") ? req.body.creator : null,
            images: req.body.images,  
            disciplines: req.body.disciplines,
            groups: req.body.groups
        }, { new: true })
            .then(exercise => {
                if (!exercise) {
                    return res.status(404).send({
                        message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                    });
                }
                res.send(exercise);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                    });
                }
                return res.status(500).send({
                    message: "EXERCISE_ERROR_UPDATE_ID", id: req.params._id
                });
            });
    }


    // Delete a exercise with the specified id in the request
    async function deleteExercise(req, res) {
        let bExists = await Training.exists({"weeks.sessions.exercises.exercise": ObjectID(req.params._id)});
        if(!bExists) {
            Exercise.findOneAndRemove({ _id: req.params._id })
                .then(exercise => {
                    if (!exercise) {
                        return res.status(404).send({
                            message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                        });
                    }

                    // delete image folder
                    let fileDir = fileManager.imagesBaseDir + "/" + req.params._id;
                    if (fs.existsSync(fileDir)) {
                        fs.rmdirSync(fileDir, { recursive: true });
                    } 

                    res.send({ message: "EXERCISE_DELETE_SUCCESS" });
                }).catch(err => {
                    if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                        return res.status(404).send({
                            message: "EXERCISE_NOT_FOUND_ID", id: req.params._id
                        });
                    }
                    return res.status(500).send({
                        message: "EXERCISE_DELETE_FAIL_ID", id: req.params._id
                    });
                });
        } else{
            return res.status(500).send({
                message: "EXERCISE_DELETE_FAIL_TRAININGS"
            });
        }

    };

    /* UTILS */
    async function saveImages(imgList, fileDir) {
        if(imgList && fileDir) {
            return (imgList.map(img => {
                return new Promise((resolve, reject) => {
                    if (img.src) {
                        if(img.bNew) {  // if it's a new image, than upload it and retrieve its path
                            let filePath = fileDir + "/" + ((new Date()).getMilliseconds()) + ".jpeg";
                            let src = img.src.replace(/(data:image)(.)*(;base64,)/, "");
                            fs.writeFileSync(filePath, src, 'base64');
                            resolve(filePath.replace("./", "/"));
                        } else {        // else, it is an old yet uploaded image, so retrieve only its path
                            resolve(img.src);
                        }
                    } else
                        reject(err | "EXERCISE_IMAGE_ERROR");
                })
            }));
            
        }
        else return null;
    }

    // Validation util
    function isExerciseValidToSubmit(exercise, bNewImages) {
    
        // exercise name must be defined and its length must be less than its limit
        if(!exercise.name || exercise.name.length > EXERCISE_VALIDATIONS.MAX_EXERCISE_NAME_LENGTH)
          return false;
    
        // exercise variant name length must be less than its limit
        if(exercise.variant.name && exercise.variant.name.length > EXERCISE_VALIDATIONS.MAX_VARIANT_NAME_LENGTH)
          return false;
        
        // exercise variant intensity coefficient must be defined and in its range limit
        if(exercise.variant.intensityCoefficient == null || exercise.variant.intensityCoefficient < EXERCISE_VALIDATIONS.MIN_INTENSITY_COEFFICIENT_NUMBER || exercise.variant.intensityCoefficient > EXERCISE_VALIDATIONS.MAX_INTENSITY_COEFFICIENT_NUMBER)
          return false;
        
        // exercise description length must be less than its limit
        if(exercise.description.length > EXERCISE_VALIDATIONS.MAX_EXERCISE_DESCRIPTION_LENGTH)
          return false;

        // exercise images must be less than 3, max 2MB and .jpeg, .jpg or .png
        if(bNewImages != null && bNewImages) {
            if(exercise.images.length > EXERCISE_VALIDATIONS.MAX_PICTURES_NUMBER)
                return false;

            for(let img of exercise.images) {
                if(img.bNew) {
                    if((Number((((Buffer.byteLength(img.src, 'base64'))/1024)/1024).toFixed(4)) >= EXERCISE_VALIDATIONS.MAX_PICTURE_SIZE))
                    return false;
                
                    let ret = false;
                    for(e of EXERCISE_VALIDATIONS.PICTURES_ACCEPTED_FORMATS) {
                        if(img.src.includes(e)) {
                            ret = true;
                            break;
                        }
                    }
                    if(!ret) return false;
                }
                
            }
        }
        
        return true;
      }

}