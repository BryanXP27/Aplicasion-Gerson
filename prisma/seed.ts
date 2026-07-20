import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed mínimo...')

  console.log('🗑️  Limpiando datos existentes...')
  await prisma.detalle_pollos_pedido.deleteMany()
  await prisma.pedidos_delivery.deleteMany()
  await prisma.detallepedido.deleteMany()
  await prisma.pedidos.deleteMany()
  await prisma.ingresos.deleteMany()
  await prisma.gastos.deleteMany()
  await prisma.inventario_pollos.deleteMany()
  await prisma.usuarios.deleteMany()
  await prisma.mesas.deleteMany()
  await prisma.productos.deleteMany()

  // --- 1. Crear usuarios ---
  console.log('👥 Creando usuarios...')
  const usuariosData = [
    { nombre_user: 'Administrador', apellido_user: 'Sistema', correo_user: 'admin@gerson.com', dni_user: '12345678', telefono_user: '987654321', rol: 'ADMIN', password: 'Admin123!' },
    { nombre_user: 'Mesero', apellido_user: 'Prueba', correo_user: 'mesero@gerson.com', dni_user: '87654321', telefono_user: '912345678', rol: 'MESERO', password: 'Mesero123!' },
    { nombre_user: 'Cocinero', apellido_user: 'Jefe', correo_user: 'cocinero@gerson.com', dni_user: '11111111', telefono_user: '911111111', rol: 'COCINERO', password: 'Cocinero123!' },
    { nombre_user: 'Cajero', apellido_user: 'Caja', correo_user: 'cajero@gerson.com', dni_user: '22222222', telefono_user: '922222222', rol: 'CAJERO', password: 'Cajero123!' },
  ]

  for (const usuario of usuariosData) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10)
    await prisma.usuarios.create({
      data: {
        nombre_user: usuario.nombre_user,
        apellido_user: usuario.apellido_user,
        correo_user: usuario.correo_user,
        dni_user: usuario.dni_user,
        telefono_user: usuario.telefono_user,
        rol: usuario.rol,
        contrasena: hashedPassword,
      },
    })
    console.log(`  ✓ ${usuario.correo_user} (${usuario.rol})`)
  }

  // --- 2. Crear mesas ---
  console.log('\n🪑 Creando mesas...')
  for (let i = 1; i <= 10; i++) {
    await prisma.mesas.create({
      data: { numero_mesa: i, capacidad_mesa: 4, estado_mesa: 'LIBRE' },
    })
  }
  console.log('  ✓ 10 mesas creadas')

  // --- 3. Crear productos ---
  console.log('\n🍗 Creando productos...')
  const productosData = [
    { nombre_produc: 'Pollo Rostizado 1/4', descripcion_produc: 'Pollo fresco rostizado al carbón', precio_produc: 8.50, categoria_produc: 'Pollo', stock_produc: 100, controlar_stock: false },
    { nombre_produc: 'Pollo Rostizado 1/2', descripcion_produc: 'Media gallina rostizada al carbón', precio_produc: 15.00, categoria_produc: 'Pollo', stock_produc: 100, controlar_stock: false },
    { nombre_produc: 'Pollo Rostizado Completo', descripcion_produc: 'Pollo completo fresco rostizado', precio_produc: 25.00, categoria_produc: 'Pollo', stock_produc: 100, controlar_stock: false },
    { nombre_produc: 'Papas Fritas', descripcion_produc: 'Papas fritas caseras', precio_produc: 2.50, categoria_produc: 'Acompañamientos', stock_produc: 200, controlar_stock: true },
    { nombre_produc: 'Ensalada de Lechuga', descripcion_produc: 'Ensalada fresca con lechuga, tomate y cebolla', precio_produc: 3.00, categoria_produc: 'Ensaladas', stock_produc: 100, controlar_stock: true },
    { nombre_produc: 'Refresco Coca Cola', descripcion_produc: 'Bebida gaseosa', precio_produc: 1.50, categoria_produc: 'Bebidas', stock_produc: 300, controlar_stock: true },
  ]

  for (const producto of productosData) {
    await prisma.productos.create({
      data: {
        nombre_produc: producto.nombre_produc,
        descripcion_produc: producto.descripcion_produc,
        precio_produc: producto.precio_produc,
        categoria_produc: producto.categoria_produc,
        stock_produc: producto.stock_produc,
        controlar_stock: producto.controlar_stock,
        vencimiento_produc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })
    console.log(`  ✓ ${producto.nombre_produc} (S/. ${producto.precio_produc.toFixed(2)})`)
  }

  console.log('\n✅ Seed completado exitosamente!')
  console.log('\n📋 Usuarios creados:')
  console.log('  admin@gerson.com    | Admin123!    | ADMIN')
  console.log('  mesero@gerson.com   | Mesero123!   | MESERO')
  console.log('  cocinero@gerson.com | Cocinero123! | COCINERO')
  console.log('  cajero@gerson.com   | Cajero123!   | CAJERO')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
