/**
 * Adds a virtual _id getter to a Sequelize model so it returns
 * both `id` and `_id` in JSON responses — keeps frontend compatibility
 * after migrating from MongoDB.
 */
function addIdAlias(Model) {
  const originalToJSON = Model.prototype.toJSON;
  Model.prototype.toJSON = function () {
    const values = originalToJSON ? originalToJSON.call(this) : { ...this.dataValues };
    if (values.id !== undefined && values._id === undefined) {
      values._id = values.id;
    }
    return values;
  };
  return Model;
}

module.exports = addIdAlias;
