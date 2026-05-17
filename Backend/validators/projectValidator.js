const Joi=require("joi");

exports.projectSchema=Joi.object({
    name:Joi.string()
    .min(3)
    .max(50)
    .required(),
    
    description:Joi.string()
    .allow("")

});