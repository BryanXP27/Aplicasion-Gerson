import { POST } from '../app/api/pedidos/route';
import { DELETE } from '../app/api/pedidos/[id]/route';
import { NextRequest } from 'next/server';
import { prisma } from '../lib/prisma';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import * as authMiddleware from '../lib/middleware-auth';

// 1. Mock de Prisma
jest.mock('../lib/prisma', () => {
  const { mockDeep } = require('jest-mock-extended');
  return {
    __esModule: true,
    prisma: mockDeep()
  };
});
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

// 2. Mock de Autenticación
jest.mock('../lib/middleware-auth', () => ({
  requireAuth: jest.fn(),
  Rol: { ADMIN: 'ADMIN', MESERO: 'MESERO', COCINERO: 'COCINERO', CAJERO: 'CAJERO' },
  EstadoPedido: { EN_PREPARACION: 'EN_PREPARACION', EN_PROCESO: 'EN_PROCESO', LISTO_PARA_RECOGER: 'LISTO_PARA_RECOGER', SERVIDO: 'SERVIDO', CANCELADO: 'CANCELADO' },
  EstadoMesa: { LIBRE: 'Libre', OCUPADA: 'Ocupada' }
}));

describe('Automatización de Pruebas de Caja Blanca - Pedidos (Jest)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Simular sesión activa de administrador por defecto
    (authMiddleware.requireAuth as jest.Mock).mockResolvedValue({
      session: { id: '1', rol: 'ADMIN' }
    });
  });

  // CP-01
  it('testRegistrarPedido_datosValidos_deberiaCrearPedidoEnPreparacion', async () => {
    // Arrange (Preparar)
    const reqData = {
      mesaId: "5",
      tipoServicio: "mesa",
      detalles: [{ productoId: "1", cantidad: 2, precioUnitario: 15 }]
    };
    const req = new NextRequest('http://localhost/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(reqData)
    });

    const mockPedidoCreado = { id_pedido: 100, id_mesa: 5, fecha_pedido: new Date(), estado_pedido: 'EN_PREPARACION' };
    prismaMock.pedidos.create.mockResolvedValue(mockPedidoCreado as any);
    
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = prismaMock;
      tx.$queryRaw.mockResolvedValue([
        { id_produc: 1, stock_produc: 10, controlar_stock: true, nombre_produc: 'Pollo' }
      ] as any);
      
      tx.detallepedido.create.mockResolvedValue({ 
        id_detalle: 1, 
        subtotal: 30 
      } as any);
      
      return await callback(tx);
    });

    prismaMock.pedidos.update.mockResolvedValue({} as any);
    prismaMock.mesas.update.mockResolvedValue({} as any);

    // Act (Actuar)
    const res = await POST(req);
    const data = await res.json();

    // Assert (Afirmar)
    expect(res.status).toBe(200);
    expect(data.id).toBe('100');
    expect(data.estado).toBe('EN_PREPARACION');
    expect(prismaMock.pedidos.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        estado_pedido: 'EN_PREPARACION'
      })
    }));
  });

  // CP-02
  it('testRegistrarPedido_cantidadInvalida_deberiaRechazarSinCrearPedido', async () => {
    // Arrange (Preparar)
    // Pasamos un arreglo de detalles vacío, lo cual es considerado inválido para crear un pedido
    const reqData = {
      mesaId: "5",
      tipoServicio: "mesa",
      detalles: []
    };
    const req = new NextRequest('http://localhost/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(reqData)
    });

    // Act (Actuar)
    const res = await POST(req);
    const data = await res.json();

    // Assert (Afirmar)
    expect(res.status).toBe(400);
    expect(data.error).toBe('Detalles del pedido son requeridos');
    expect(prismaMock.pedidos.create).not.toHaveBeenCalled(); // No debe haberse creado nada en BD
  });

  // CP-03
  it('testRegistrarPedido_variosProductos_deberiaCalcularTotalComoSumaDeSubtotales', async () => {
    // Arrange (Preparar)
    const reqData = {
      mesaId: "5",
      tipoServicio: "mesa",
      detalles: [
        { productoId: "1", cantidad: 2, precioUnitario: 10 }, // subtotal = 20
        { productoId: "2", cantidad: 1, precioUnitario: 15 }  // subtotal = 15
      ]
    };
    const req = new NextRequest('http://localhost/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(reqData)
    });

    prismaMock.pedidos.create.mockResolvedValue({ id_pedido: 101, id_mesa: 5 } as any);
    
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = prismaMock;
      // Simulamos que el queryRaw funciona
      tx.$queryRaw.mockResolvedValue([{ id_produc: 1, stock_produc: 10, controlar_stock: false }] as any);
      
      // Simulamos que la BD nos devuelve los detalles creados con los subtotales correctos
      return [
        { id_detalle: 1, subtotal: 20 },
        { id_detalle: 2, subtotal: 15 }
      ];
    });

    // Act (Actuar)
    const res = await POST(req);
    const data = await res.json();

    // Assert (Afirmar)
    // El total debe ser 20 + 15 = 35
    expect(res.status).toBe(200);
    expect(data.total).toBe(35);
    // Verificar que el update final del pedido guarda el total calculado
    expect(prismaMock.pedidos.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_pedido: 101 },
      data: expect.objectContaining({ total: 35 })
    }));
  });

  // CP-04
  it('testCancelarPedido_pedidoEnPreparacion_deberiaDevolverStockYLiberarMesa', async () => {
    // Arrange (Preparar)
    const pedidoId = '100';
    const req = new NextRequest(`http://localhost/api/pedidos/${pedidoId}`, {
      method: 'DELETE'
    });
    
    // Mockear la existencia del pedido (Mesa 5, Estado EN_PREPARACION)
    const mockPedido = {
      id_pedido: 100,
      id_mesa: 5,
      estado_pedido: 'EN_PREPARACION',
      mesas: { id_mesa: 5, numero_mesa: 5 }
    };
    prismaMock.pedidos.findUnique.mockResolvedValue(mockPedido as any);

    // Simulamos la transacción de cancelación
    prismaMock.$transaction.mockImplementation(async (callback) => {
      const tx = prismaMock;
      
      // Simular que el pedido tenía un detalle con 2 items que deben devolverse al stock
      tx.detallepedido.findMany.mockResolvedValue([
        { id_detalle: 1, id_pedido: 100, id_produc: 1, cantidad: 2 } as any
      ]);

      // Simular no pollos devueltos para simplificar
      tx.detalle_pollos_pedido.findMany.mockResolvedValue([]);
      
      return await callback(tx);
    });

    // Act (Actuar)
    // NextRequest pasa los params como una Promise en app router v14/15
    const res = await DELETE(req, { params: Promise.resolve({ id: pedidoId }) });
    const data = await res.json();

    // Assert (Afirmar)
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // 1. Debe haber devuelto el stock (increment)
    expect(prismaMock.productos.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_produc: 1 },
      data: { stock_produc: { increment: 2 } }
    }));

    // 2. Debe haber actualizado el estado a CANCELADO
    expect(prismaMock.pedidos.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_pedido: 100 },
      data: { estado_pedido: 'CANCELADO' }
    }));

    // 3. Debe haber liberado la mesa
    expect(prismaMock.mesas.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id_mesa: 5 },
      data: { estado_mesa: 'Libre' }
    }));
  });
});
