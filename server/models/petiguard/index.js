const userModel = require('./user')
const officialModel = require('./official')
const formModel = require('./petitionForm')
const fomsModel = {}


fomsModel.user = userModel
fomsModel.official = officialModel
fomsModel.petitionForm = formModel


// userModel.hasMany(bonafideModel, { foreignKey: 'sender_id', as: 'sentBonafideForm' });
// userModel.hasMany(bonafideModel, { foreignKey: 'authority_id', as: 'bonafideFormForAuthorization' });
// bonafideModel.belongsTo(userModel, { foreignKey: 'sender_id', as: 'sender' });
// bonafideModel.belongsTo(userModel, { foreignKey: 'authority_id', as: 'authority' });

module.exports = fomsModel;