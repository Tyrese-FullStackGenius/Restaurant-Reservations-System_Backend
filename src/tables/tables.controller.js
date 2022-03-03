const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");


/** List handler for table resources
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function list(req, res) {
    const response = await service.list();

    res.json({ data: response });
}

async function create(req, res) {
    const response = await service.create(req.body.data);

    res.status(201).json({ data: response });
}

module.exports = {
    list: asyncErrorBoundary(list),
    create: asyncErrorBoundary(create)
}