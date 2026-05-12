import { resetDatabase } from "../src/infrastructure/memory/database";

beforeEach(() => {
  resetDatabase();
});
