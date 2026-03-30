/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("authors", (table) => {
    table.string("id", 21).primary();
    table.string("full_name").notNullable();
    table.string("slug").notNullable().unique();
    table.text("bio");
    table.date("born").notNullable();
    table.date("die");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);

    // indexes
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("authors");
};
