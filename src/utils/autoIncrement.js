const autoIncrement = async function (model, field, startValue = 1) {
    const count = await model.countDocuments();
    return count === 0 ? startValue : (await model.findOne().sort(`-${field}`).exec())[field] + 1;
};

module.exports = autoIncrement;