/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("profiles", (table) => {
    table.string("id", 21).primary();
    table
      .string("user_id")
      .notNullable()
      .unique()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("username").unique().notNullable();
    table.string("first_name");
    table.string("last_name");
    table.text("bio");
    table.string("avatar_url");
    table.string("banner_url");
    table.date("birth_date");
    table.timestamps(true, true);

    // index
    table.index("user_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("profiles");
};
