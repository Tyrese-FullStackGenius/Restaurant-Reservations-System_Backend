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
            message: `table id ${table_id} does not exist`
        });
    }

    res.locals.table = table;

    next();
}

/**
 * occupies a table with a reservation_id and changes reservation status to "seated"
 */
async function seatTable(req, res) {
    await service.occupyTable(res.locals.table.table_id, res.locals.reservation.reservation_id);
    await service.updateReservationStatus(res.locals.reservation.reservation_id, "seated");

    res.json(200).json({ data: { status: "seated" } });
}

async function clearTable(req, res) {
    await service.updateReservationStatus(res.locals.table.reservation_id, "finished");
    await service.freeTable(res.locals.tabe.table_id);

    res.status(200).json({ data: { status: "finished "} });
}

async function validateReservation(req, res, next) {
    const { reservation_id } = req.body.data;

    if (!reservation_id) {
        return next({
            status: 400,
            message: `reservation_id field must be included in the body`
        });
    }

    const reservation = await service.readReservation(Number(reservation_id));

    if (!reservation) {
        return next({
            status: 404,
            message: `reservation_id ${reservation_id} does not exist`
        });
    }

    res.locals.reservation = reservation;
    
    next();
}


module.exports = {
  list: asyncErrorBoundary(list),
  create: asyncErrorBoundary(create),
  seatTable: [asyncErrorBoundary(validateTable), asyncErrorBoundary(validateReservation), asyncErrorBoundary(seatTable)],
  clearTable: [asyncErrorBoundary(validateTable), asyncErrorBoundary(clearTable)]
};
