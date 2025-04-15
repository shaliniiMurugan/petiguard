const models = {}

const fomsModels = require('./petiguard/index')
// const noDueModels = require('./noDue/index')

models.petiguard = fomsModels
// models.noDue = noDueModels

module.exports = models;