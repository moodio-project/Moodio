exports.up = function(knex) {
    return knex.schema.alterTable('users', function(table) {
      table.string('password').nullable();
      table.string('email').alter(); // Make sure email exists
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('users', function(table) {
      table.dropColumn('password');
    });
  };
  