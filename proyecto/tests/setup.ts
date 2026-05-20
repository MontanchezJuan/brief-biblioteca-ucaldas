import { closeDatabase } from "../src/infrastructure/sqlite/connection";
import { resetDatabase } from "../src/infrastructure/sqlite/migrate-seed";

process.env.SQLITE_PATH = ":memory:";

beforeEach(() => {
  resetDatabase();
});

afterAll(() => {
  closeDatabase();
});
