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


/**
 * validates then stores a reservation if it exists by its id
 * returns next()
 */
async function validateReservation(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(Number(reservation_id));

  if (!reservation) {
    return next({
      status: 404,
      message: `reservation id ${reservation_id} does not exist`
    });
  }

  res.locals.reservation = reservation;

  return next();
}


/**
 * Read handler for a specified reservation
 */
async function read(req, res) {
  res.status(200).json({ data: res.locals.reservation })
}


/**
 * Update handler for a reservations status
 */
async function updateStatus(req, res) {
  await service.updateStatus(res.locals.reservation.reservation_id, req.body.data.status);

  res.status(200).json({ data: { status: req.body.data.status } });
}


/**
 * Update/Edit handler for a full reservation
 */
async function update(req, res) {
  const response = await service.update(res.locals.reservation.reservation_id, req.body.data);

  res.status(200).json({ data: response });
}




module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  read: [asyncErrorBoundary(validateReservation), asyncErrorBoundary(read)],
  update: [asyncErrorBoundary(validateReservation), asyncErrorBoundary(update)],
  updateStatus: [asyncErrorBoundary(validateReservation), asyncErrorBoundary(updateStatus)]
};
