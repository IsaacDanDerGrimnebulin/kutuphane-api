/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("reviews", (table) => {
    table.string("id", 21).primary(); // nanoid, primary
    table
      .string("book_id", 21)
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE") // risky
      .onUpdate("CASCADE");

    table
      .string("user_id", 21)
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.text("content").notNullable();
    table.integer("rating").checkBetween([1, 5]);
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);

    // constraints
    table.unique(["user_id", "book_id"]);
    // index
    table.index("book_id");
    table.index("user_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("reviews");
};
