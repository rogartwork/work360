const bcrypt = require('bcryptjs');

async function main() {
  const hash = "$2b$10$Up5fxLbWJlQX947EYaLsheWCO3BPpj8utD29pBGf5B20k775LTh3m";
  const password = "123";
  const match = await bcrypt.compare(password, hash);
  console.log("Match for '123':", match);
}
main();
