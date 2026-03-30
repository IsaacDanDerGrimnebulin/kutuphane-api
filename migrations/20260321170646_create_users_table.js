/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.string("id", 21).primary();
    table.string("email").unique().notNullable();
    table.string("password_hash", 255).notNullable();
    table.boolean("is_active").defaultTo(true);
    table.enu("role", ["user", "author", "admin"]).defaultTo("user");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
