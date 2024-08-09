import pg from "pg";
import env from "dotenv";

env.config();

export default class Database {
    // Using a connection pool instead of a single client
    private static pool: pg.Pool | null = null;

    public static get db(): pg.Pool {
        if (!Database.pool) {
            console.log("Initializing database connection pool.");
            Database.pool = new pg.Pool({
                user: process.env.PG_USER,
                host: process.env.PG_HOST,
                database: process.env.PG_DATABASE,
                password: process.env.PG_PASSWORD,
                port: parseInt(process.env.PG_PORT || '5432'),
                max: 10, // Maximum number of clients in the pool
                idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            });

            Database.pool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
                process.exit(-1);
            });
        }
        return Database.pool;
    }

    // Optional: Method to gracefully shut down the pool
    public static async close(): Promise<void> {
        if (Database.pool) {
            console.log("Closing database connection pool.");
            await Database.pool.end();
            Database.pool = null;
        }
    }
}

// Example usage:
(async () => {
    try {
        const pool = Database.db;
        const client = await pool.connect();
        console.log('Database connected');
        // Perform database operations...
        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Database connection error:', err);
    }

    // Gracefully close the pool when the app is shutting down
    process.on('SIGINT', async () => {
        await Database.close();
        process.exit();
    });
})();