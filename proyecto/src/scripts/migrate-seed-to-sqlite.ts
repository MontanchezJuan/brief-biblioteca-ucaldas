import { closeDatabase } from "../infrastructure/sqlite/connection";
import { migrateSeedToSQLite } from "../infrastructure/sqlite/migrate-seed";

migrateSeedToSQLite({ clearExisting: true });
closeDatabase();
