const { Exercise } = require('src/exercises/exercise.model.js');
const { User } = require('src/users/user.model.js')
const fileManager = require('src/_helpers/fileManager');
const _ = require('lodash');
const fs = require('fs');

module.exports = () => {

    const EXERCISE_VALIDATIONS = {MAX_EXERCISE_NAME_LENGTH: 50, MAX_EXERCISE_DESCRIPTION_LENGTH: 100, MAX_VARIANT_NAME_LENGTH: 50, MIN_INTENSITY_COEFFICIENT_NUMBER: 0, MAX_INTENSITY_COEFFICIENT_NUMBER: 99999};


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
                message: "Exercise content can not be empty"
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
        if(isExerciseValidToSubmit(exercise)) {
            // Save Exercise in the database
            exercise.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the Exercise."
                });
            });
        } else {
            res.status(500).send({
                message: "Exercise contains invalid field values."
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
                    message: err.message || "Some error occurred while retrieving exercises."
                });
            });
    };

    /**
     * Retrieve and return all exercises for a given user from the database.
     * If the user is a coach, this function returns all default exercises plus all exercises the coach has created.
     * If the user is an athlete, this function returns all default exericses plus all the exercises created by his coaches. 
     * */
    async function findAllExerciseForUser(req, res) {

        User.find({ _id: req.params._id }).then(users => {
            if (!users) {
                return res.status(404).send({
                    message: "User not found with id " + req.params._id
                });
            }

            switch (users[0].userType) {
                case 'coach': {
                    Exercise.find({ $or: [{ creator: null }, { creator: users[0]._id }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving exercises."
                            });
                        });
                    break;
                }

                case 'athlete': {
                    let coachesIds = _.map(users[0].coaches, function (coach) { return coach._id; });
                    Exercise.find({ $or: [{ creator: null }, { creator: coachesIds }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving exercises."
                            });
                        });
                    break;
                }

                case 'both': {
                    let coachesIds = _.map(users[0].coaches, function (coach) { return coach._id; });
                    Exercise.find({ $or: [{ creator: null }, { creator: users[0]._id }, { creator: coachesIds }] })
                        .then(exercises => {
                            res.send(_.sortBy(exercises, ['name', 'variant.name']));
                        }).catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving exercises."
                            });
                        });
                    break;
                }
            }

        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.params._id
                });
            }
            return res.status(500).send({
                message: "Error retrieving user with id " + req.params._id
            });
        });
    };

    // Find a single exercise with a id
    async function findOneExercise(req, res) {
        Exercise.find({ _id: req.params._id })
            .then(exercise => {
                if (!exercise) {
                    return res.status(404).send({
                        message: "Exercise not found with id " + req.params._id
                    });
                }
                res.send(exercise[0]);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "Exercise not found with id " + req.params._id
                    });
                }
                return res.status(500).send({
                    message: "Error retrieving exercise with id " + req.params._id
                });
            });
    };

    // Update a exercise identified by the id in the request
    async function updateExercise(req, res) {

        // Validate Request
        if (!req.body) {
            return res.status(400).send({
                message: "Exercise content can not be empty"
            });
        }

        // Check if exercise is a valid exercise
        if(isExerciseValidToSubmit(new Exercise({
            name: req.body.name,
            variant: req.body.variant,
            description: req.body.description,
            creator: (req.body.creator != "") ? req.body.creator : null,
            images: req.body.images,  
            disciplines: req.body.disciplines,
            groups: req.body.groups
        }))) {

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
                        message: "Error saving exercise images"
                    });
                })
            } else {
                findOneAndUpdateExercise(req, res);
            }
        } else {
            res.status(500).send({
                message: "Exercise contains invalid field values."
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
                        message: "Exercise not found with id " + req.params._id
                    });
                }
                res.send(exercise);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "Exercise not found with id " + req.params._id
                    });
                }
                return res.status(500).send({
                    message: "Error updating exercise with id " + req.params._id
                });
            });
    }


    // Delete a exercise with the specified id in the request
    async function deleteExercise(req, res) {
        Exercise.findOneAndRemove({ _id: req.params._id })
            .then(exercise => {
                if (!exercise) {
                    return res.status(404).send({
                        message: "Exercise not found with id " + req.params._id
                    });
                }

                // delete image folder
                let fileDir = fileManager.imagesBaseDir + "/" + req.params._id;
                if (fs.existsSync(fileDir)) {
                    fs.rmdirSync(fileDir, { recursive: true });
                } 

                res.send({ message: "Exercise deleted successfully!" });
            }).catch(err => {
                if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                    return res.status(404).send({
                        message: "Exercise not found with id " + req.params._id
                    });
                }
                return res.status(500).send({
                    message: "Could not delete exercise with id " + req.params._id
                });
            });
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
                        reject(err | "Error when saving images");
                })
            }));
            
        }
        else return null;
    }

    // Validation util
    function isExerciseValidToSubmit(exercise) {
    
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
        
        return true;
      }

}