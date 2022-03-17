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

/**
 * validate that the request body from frontend has a data object
 */
async function validateData(req, res, next) {
  if (!req.body.data) {
    return next({
      status: 400,
      message: "Body must include a request body data object",
    });
  }

  next();
}

/**
 * validate that the incoming request body has required/correct data
 */
async function validateBody(req, res, next) {
  if (!req.body.data.table_name || req.body.data.table_name === "") {
    return next({
      status: 400,
      message: "'table_name' field cannot be empty",
    });
  }

  if (req.body.data.table_name.length < 2) {
    return next({
      status: 400,
      message: "'table_name' field must be at least 2 characters",
    });
  }

  if (!req.body.data.capacity || req.body.data.capacity === "") {
    return next({
      status: 400,
      message: "'capacity' field cannot be empty",
    });
  }

  if (typeof req.body.data.capacity !== "number") {
    return next({
      status: 400,
      message: "'capacity' field must be a number",
    });
  }

  if (req.body.data.capacity < 1) {
    return next({
      status: 400,
      message: "'capacity' field must be at least 1",
    });
  }

  next();
}

async function create(req, res) {
  if (req.body.data.reservation_id) {
    req.body.data.status = "occupied";
    await service.updateReservationStatus(
      req.body.data.reservation_id,
      "seated"
    );
  } else {
    req.body.data.status = "free";
  }

  const response = await service.create(req.body.data);

  res.status(201).json({ data: response });
}

/**
 * validates then stores a table if it exists by its id
 * returns next()
 */
async function validateTable(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);

  if (!table) {
    return next({
      status: 404,
      message: `table id ${table_id} does not exist`,
    });
  }

  res.locals.table = table;

  next();
}

async function validateSeat(req, res, next) {
  if (res.locals.table.status === "occupied") {
    return next({
      status: 400,
      message: "the table you selected is currently 'occupied'",
    });
  }

  if (res.locals.reservation.status === "seated") {
    return next({
      status: 400,
      message: "the reservation you selected is already 'seated'",
    });
  }

  if (res.locals.table.capacity < res.locals.reservation.people) {
    return next({
      status: 400,
      message: `the table you selected does not have enough capacity to seat ${res.locals.reservation.people}`,
    });
  }

  next();
}

/**
 * occupies a table with a reservation_id and changes reservation status to "seated"
 */
async function seatTable(req, res) {
  await service.occupyTable(
    res.locals.table.table_id,
    res.locals.reservation.reservation_id
  );
  await service.updateReservationStatus(
    res.locals.reservation.reservation_id,
    "seated"
  );

  res.json(200).json({ data: { status: "seated" } });
}

/**
 * Finish/clear a table at the restaurant
 */
async function clearTable(req, res) {
  await service.updateReservationStatus(
    res.locals.table.reservation_id,
    "finished"
  );
  await service.freeTable(res.locals.table.table_id);

  res.status(200).json({ data: { status: "finished " } });
}

/**
 * validates that a table is "occupied" (used before clearing a table)
 */
async function validateTableIsSeated(req, res, next) {
  if (res.locals.table.status !== "occupied") {
    return next({
      status: 400,
      message: "this table is not occupied",
    });
  }
  next();
}

/**
 * validates then stores a reservation if it exists by its id
 * returns next()
 */
async function validateReservation(req, res, next) {
  const { reservation_id } = req.body.data;

  if (!reservation_id) {
    return next({
      status: 400,
      message: `reservation_id field must be included in the body`,
    });
  }

  const reservation = await service.readReservation(Number(reservation_id));

  if (!reservation) {
    return next({
      status: 404,
      message: `reservation_id ${reservation_id} does not exist`,
    });
  }

  res.locals.reservation = reservation;

  next();
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(create),
  ],
  seatTable: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateTable),
    asyncErrorBoundary(validateReservation),
    asyncErrorBoundary(validateSeat),
    asyncErrorBoundary(seatTable),
  ],
  clearTable: [
    asyncErrorBoundary(validateTable),
    asyncErrorBoundary(validateTableIsSeated),
    asyncErrorBoundary(clearTable),
  ],
};
