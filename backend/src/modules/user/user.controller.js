const handleAsync = require('../../utils/handleAsync');
const _ = require('lodash');
const APIFeatures = require('../../utils/apiFeatures');
const userService = require('../user/user.service');

exports.createUserProfile = handleAsync(async (req, res, next) => {
  const userID = req.user.id;

  const newProfile = await userService.createUserProfile({
    userID: userID,
    height: req.body.height,
    weight: req.body.weight,
    age: req.body.age,
    training_experience: req.body.training_experience,
    training_aim: req.body.training_aim,
    user_sex: req.body.user_sex,
    training_duration: req.body.training_duration,
    birthdate: req.body.birthdate,
    social_media_accounts: req.body.social_media_accounts,
    biography: req.body.biography,
    profile_img: req.body.profile_img,
  });

  res.status(201).json({
    status: 'success',
    message: 'User profile created.',
    data: newProfile,
  });
});
