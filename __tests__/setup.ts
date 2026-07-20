/**
 * Setup archivo para Jest
 * Ejecuta antes de todos los tests
 */

// Mock environment variables para tests
process.env = { ...process.env, NODE_ENV: 'test', DATABASE_URL: 'postgresql://test:test@localhost:5432/test', JWT_SECRET: 'test-secret-key', PORT: '3000' };

// Aumentar timeout para tests de BD
jest.setTimeout(30000);
