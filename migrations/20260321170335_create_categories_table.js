/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("categories", (table) => {
    table.string("id", 21).primary();
    table.string("title").notNullable().unique();
    table.string("slug").notNullable().unique();
    table.text("description");
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
  return knex.schema.dropTable("categories");
};
