const knex = require("../db/connection");

function list(date, mobile_number) {
    if (date) {
        return knex("reservations")
            .select("*")
            .where({ reservation_date: date })
            .orderBy("reservation_time", "asc");
    }

    if (mobile_number) {
        return knex("reservations")
            .select("*")
            .where("mobile_number", "like", `${mobile_number}%`);
    }

    return knex("reservations")
        .select("*");
}

function create(reservation) {
    return knex("reservations")
        .insert(reservation)
        .returning("*");
}

function read(reservation_id) {
    return knex("reservations")
        .where({ reservation_id })
        .first();
}

function update(reservation_id, reservation) {
    return knex("reservations")
        .where({ reservation_id })
        .update({ ...reservation })
        .returning("*");
}

function updateStatus(reservation_id, status) {
    return knex("reservations")
        .where({ reservation_id })
        .update({ status: status })
}


module.exports = {
    list,
    create,
    read,
    update,
    updateStatus
}