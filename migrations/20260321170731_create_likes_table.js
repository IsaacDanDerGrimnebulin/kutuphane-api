/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("likes", (table) => {
    table.string("user_id", 21).notNullable();
    table.string("review_id", 21).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // constraints
    table.unique(["user_id", "review_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("likes");
};
