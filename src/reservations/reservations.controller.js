const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;

  const reservations = await service.list(date, mobile_number);

  const response = reservations.filter((reservation) => reservation.status !== "finished");

  res.json({ data: response });
}

/**
 * Create reservation handler 
 */
async function create(req, res) {
  req.body.data.status = "booked"

  const response = await service.create(req.body.data);

  res.status(201).json({ data: response[0] });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create)
};
