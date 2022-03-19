const knex = require("../db/connection");

function list(date, mobile_number) {
  if (date) {
    return knex("reservations")
      .select("*")
      .where({ reservation_date: date })
      .orderBy("reservation_time");
  }

  if (mobile_number) {
    return knex("reservations")
      .whereRaw(
        "translate(mobile_number, '() -', '') like ?",
        `%${mobile_number.replace(/\D/g, "")}%`
      )
      .orderBy("reservation_date");
  }

  return knex("reservations").select("*");
}

function create(reservation) {
  return knex("reservations").insert(reservation).returning("*");
}

function read(reservation_id) {
  return knex("reservations").where({ reservation_id }).first();
}

function update(reservation_id, newReservation) {
  return knex("reservations")
    .where({ reservation_id })
    .update(newReservation)
    .returning("*");
}

function updateStatus(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status: status })
    .returning("status");
}

module.exports = {
  list,
  create,
  read,
  update,
  updateStatus,
};
