/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("books", (table) => {
    table.string("id", 21).primary(); // nanoid, primary
    table
      .string("author_id", 21)
      .notNullable()
      .references("id")
      .inTable("authors")
      .onUpdate("CASCADE");

    table
      .string("category_id", 21)
      .notNullable()
      .references("id")
      .inTable("categories")
      .onUpdate("CASCADE");

    table.string("title").notNullable();
    table.string("description").notNullable();
    table.string("cover_url");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);

    // indexes
    table.index("author_id");
    table.index("category_id");
    table.index("created_at");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("books");
};
