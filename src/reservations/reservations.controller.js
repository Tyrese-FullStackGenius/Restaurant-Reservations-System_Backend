const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;

  const reservations = await service.list(date, mobile_number);

  const response = reservations.filter(
    (reservation) => reservation.status !== "finished"
  );

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
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (const field of requiredFields) {
    if (!req.body.data.hasOwnProperty(field) || req.body.data[field] === "") {
      return next({
        status: 400,
        message: `Field required: '${field}'`,
      });
    }
  }

  if (
    Number.isNaN(
      Date.parse(
        `${req.body.data.reservation_date} ${req.body.data.reservation_time}`
      )
    )
  ) {
    return next({
      status: 400,
      message:
        "'reservation_date' or 'reservation_time' field are in incorrect format",
    });
  }

  if (typeof req.body.data.people !== "number") {
    return next({
      status: 400,
      message: "'people' field must be a number",
    });
  }

  if (req.body.data.people < 1) {
    return next({
      status: 400,
      message: "'people' filed must be at least 1",
    });
  }

  if (req.body.data.status && req.body.data.status !== "booked") {
    return next({
      status: 400,
      message: `'status' field cannot be ${req.body.data.status}`,
    });
  }

  next();
}

/**
 * validates the reservation_date and reservation_time to fit the restaurant's schedule
 */
async function validateDate(req, res, next) {
  const reservedDate = new Date(
    `${req.body.data.reservation_date}T${req.body.data.reservation_time}:00.000`
  );
  const todaysDate = new Date();

  if (reservedDate.getUTCDay() === 2) {
    return next({
      status: 400,
      message: "'reservation_date' field: restaurant is closed on tuesday",
    });
  }

  if (reservedDate < todaysDate) {
    return next({
      status: 400,
      message:
        "'reservation_date' and 'reservation_time' field must be in the future",
    });
  }

  if (
    reservedDate.getHours() < 10 ||
    (reservedDate.getHours() === 10 && reservedDate.getMinutes() < 30)
  ) {
    return next({
      status: 400,
      message: "'reservation_time; field: restaurant is not open until 10:30AM",
    });
  }

  if (
    reservedDate.getHours() > 22 ||
    (reservedDate.getHours() === 22 && reservedDate.getMinutes() >= 30)
  ) {
    return next({
      status: 400,
      message: "'reservation_time' field: restaurant is closed after 10:30PM",
    });
  }

  if (
    reservedDate.getHours() > 21 ||
    (reservedDate.getHours() === 21 && reservedDate.getMinutes() > 30)
  ) {
    return next({
      status: 400,
      message:
        "'reservation_time' field: reservation must be made at least an hour before closing (10:30PM)",
    });
  }

  next();
}

/**
 * Create reservation handler
 */
async function create(req, res) {
  req.body.data.status = "booked";

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
      message: `reservation id ${reservation_id} does not exist`,
    });
  }

  res.locals.reservation = reservation;

  next();
}

/**
 * validates the status in the request body
 * making sure required info is being passed in for updating the status
 */
async function validateUpdateStatus(req, res, next) {
  if (!req.body.data.status) {
    return next({
      status: 400,
      message: "body must include a status field",
    });
  }

  if (
    req.body.data.status !== "booked" &&
    req.body.data.status !== "seated" &&
    req.body.data.status !== "finished" &&
    req.body.data.status !== "cancelled"
  ) {
    return next({
      status: 400,
      message: `'status' field cannot be ${req.body.data.status}`,
    });
  }

  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: "a 'finished' reservation cannot be updated",
    });
  }

  next();
}

/**
 * Read handler for a specified reservation
 */
async function read(req, res) {
  res.status(200).json({ data: res.locals.reservation });
}

/**
 * Update handler for a reservations status
 */
 async function updateStatus(req, res) {
	await service.update(res.locals.reservation.reservation_id, req.body.data.status);

	res.status(200).json({ data: { status: req.body.data.status } });
}

/**
 * Update/Edit handler for a full reservation
 */
async function update(req, res) {
  const response = await service.update(
    res.locals.reservation.reservation_id,
    req.body.data
  );

  res.status(200).json({ data: response });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(validateReservation), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateReservation),
    asyncErrorBoundary(validateBody),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(validateData),
    asyncErrorBoundary(validateReservation),
    asyncErrorBoundary(validateUpdateStatus),
    asyncErrorBoundary(updateStatus),
  ],
};
