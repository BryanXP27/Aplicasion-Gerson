import { hashPassword, verifyPassword, createToken, verifyToken, JWTPayload } from '../lib/auth';

describe('Auth Utilities (lib/auth.ts)', () => {
  describe('Password Hashing', () => {
    it('should hash a password and verify it correctly', async () => {
      const password = 'mySuperSecretPassword123!';
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // The hash should not be the plain text password
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toBeDefined();

      // Verify with correct password
      const isMatch = await verifyPassword(password, hashedPassword);
      expect(isMatch).toBe(true);

      // Verify with incorrect password
      const isWrongMatch = await verifyPassword('wrongPassword', hashedPassword);
      expect(isWrongMatch).toBe(false);
    });
  });

  describe('JWT Token Management', () => {
    const mockPayload: JWTPayload = {
      id: '1',
      nombre: 'Admin User',
      email: 'admin@example.com',
      rol: 'ADMIN'
    };

    it('should create and verify a valid token', async () => {
      // Create token
      const token = await createToken(mockPayload);
      expect(typeof token).toBe('string');
      
      const parts = token.split('.');
      expect(parts).toHaveLength(3); // Header.Payload.Signature

      // Verify token
      const decodedPayload = await verifyToken(token);
      expect(decodedPayload).toBeDefined();
      expect(decodedPayload?.id).toBe(mockPayload.id);
      expect(decodedPayload?.nombre).toBe(mockPayload.nombre);
      expect(decodedPayload?.email).toBe(mockPayload.email);
      expect(decodedPayload?.rol).toBe(mockPayload.rol);
    });

    it('should return null for an invalid token', async () => {
      const invalidToken = 'this.is.not.a.valid.token';
      const decodedPayload = await verifyToken(invalidToken);
      
      expect(decodedPayload).toBeNull();
    });
  });
});
