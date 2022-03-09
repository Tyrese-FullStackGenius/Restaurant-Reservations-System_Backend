const knex = require("../db/connection");

function list() {
  return knex("tables").select("*");
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecord) => createdRecord[0]);
}

function read(table_id) {
  return knex("tables")
    .select("*")
    .where({ table_id }).first();
}

function readReservation(reservation_id) {
  return knex("reservations")
    .select("*")
    .where({ reservation_id }).first();
}

function occupyTable(table_id, reservation_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id: reservation_id, status: "occupied" });
}

function freeTable(table_id) {
  return knex("tables")
    .where({ table_id })
    .update({ reservation_id: null, status: "free" });
}

function updateReservationStatus(reservation_id, status) {
  return knex("reservations")
    .where({ reservation_id })
    .update({ status: status });
}

module.exports = {
  list,
  create,
  read,
  readReservation,
  occupyTable,
  freeTable,
  updateReservationStatus,
};
