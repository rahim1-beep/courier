const bcrypt = require('bcrypt');

async function test() {
  const hash = '$2b$10$Mf51.XvG0r1eGCJHtMUo/.RSvGgyQxAfQQ9.s5gIeO9EtTAtbfn2y';
  const match = await bcrypt.compare('admin123', hash);
  console.log('Match?', match);
}

test();
