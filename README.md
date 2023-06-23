# Capstone: Restaurant Reservation System Backend

- code for the back end of the final capstone project in the Thinkful curriculum.

### Restaurant Reservations-System-Back-End - created with PostgreSQL, Express, Node.js (with npm packages) --> using HTML5, JavaScript, Bootstrap
### --> A full-stack restaurant reservation system for restaurant operators to use to keep track of reservations and tables at the restaurant given restaurant schedule as parameters.

# API Documentation

## /reservations

### GET: ?date=YYYY-MM-DD

> Returns a list of reservations made for a given date.

### GET: ?mobile_number={mobile-number} 
> Returns a full or partial phone number matched to a reservation(s)

### POST

** All requests that send a reservation object will have data validation to pass.
> - First name and last name have no constraints.
> - The mobile number must be in a hyphenated format. xxx-xxxx or xxx-xxx-xxxx.
> - The date must be in the format YYYY-MM-DD. Also, the date must occur either on the current day or in the future.
> - The time must be in 24H (HH:MM) format. Also, if the date property is on today's date, the time must not have passed on that day when the request is made.
> - People must be an integer greater than 0.
> - Returns status 201 and the created reservation object.

___

## /reservations/:reservation_id

### GET
> If the reservation defined by it's reservation_id in the request URL exists, it returns the reservation object.

### PUT
> Returns status 200 and the updated reservation.

___

## /reservations/:reservation_id/status

### PUT
> Returns status 200 and an updated status for a reservation

___

## /tables

### GET
> Returns a list of all tables for the restaurant in the database

### POST

> - table_name does not need to include a # sign, but it must be a string greater than one character.
> - capacity must be an integer greater than 0.
> - reservation_id is optional, but if one is passed, it must be the ID of a reservation that does exist in the database.
> - Returns 201 and the created table.

___

## /tables/:table_id

### GET
> If the table defined by its table_id in the request URL exists, it returns the reservation object.

___

## /tables/:table_id/seat

### PUT
> - If the table_id passed in the parameters exists, the reservation_id passed in the body exists, and the table is currently not occupied as well as the reservation belonging to the reservation_id is only booked, and **not** seated, finished, or canceled: the table will be updated with the reservation_id.
> - When the table is updated with a reservation_id, that means the reservation is now seated at a table. Accordingly, the reservation's status will also be updated to reflect its "seated" status.
> - Returns status 200 and the updated reservation, not the table.

### DELETE
> - If the table exists, and the table has a reservation_id property that is not null or undefined, the table's reservation_id property will be set to 'free'.
> - Returns status 200 and the updated reservation object associated with the change to the table.
