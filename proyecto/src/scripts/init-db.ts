import { closeDatabase, initializeDatabase } from "../infrastructure/sqlite/connection";

initializeDatabase();
closeDatabase();
