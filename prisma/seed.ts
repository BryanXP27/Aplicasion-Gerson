<<<<<<< HEAD
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
=======
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e

const prisma = new PrismaClient()

async function main() {
<<<<<<< HEAD
  console.log('🌱 Iniciando seed de datos...')

  // Limpiar datos existentes (opcional)
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.usuarios.deleteMany({})
  await prisma.mesas.deleteMany({})
  await prisma.productos.deleteMany({})

  // Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...')
  
  const usuarios = [
    {
      nombre_user: 'Administrador',
      apellido_user: 'Sistema',
      correo_user: 'admin@gerson.com',
      dni_user: '12345678',
      telefono_user: '0987654321',
      rol: 'Admin',
      password: 'Admin123!',
    },
    {
      nombre_user: 'Mesero',
      apellido_user: 'Prueba',
      correo_user: 'mesero@gerson.com',
      dni_user: '87654321',
      telefono_user: '0912345678',
      rol: 'Mesero',
      password: 'Mesero123!',
    },
    {
      nombre_user: 'Cocinero',
      apellido_user: 'Jefe',
      correo_user: 'cocinero@gerson.com',
      dni_user: '11111111',
      telefono_user: '0911111111',
      rol: 'Cocinero',
      password: 'Cocinero123!',
    },
    {
      nombre_user: 'Cajero',
      apellido_user: 'Caja',
      correo_user: 'cajero@gerson.com',
      dni_user: '22222222',
      telefono_user: '0922222222',
      rol: 'Cajero',
      password: 'Cajero123!',
    },
  ]

  for (const usuario of usuarios) {
    // Hash de la contraseña
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(usuario.password, saltRounds)

    const created = await prisma.usuarios.create({
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

    console.log(`✓ Usuario creado: ${created.correo_user} (${created.rol})`)
    console.log(`  📧 Email: ${created.correo_user}`)
    console.log(`  🔐 Password: ${usuario.password}`)
  }

  // Crear mesas de prueba
  console.log('\n🪑 Creando mesas...')
  
  for (let i = 1; i <= 10; i++) {
    const mesa = await prisma.mesas.create({
      data: {
        numero_mesa: i,
        capacidad_mesa: 4,
        estado_mesa: 'Libre',
      },
    })
    console.log(`✓ Mesa ${mesa.numero_mesa} creada (capacidad: ${mesa.capacidad_mesa})`)
  }

  // Crear productos de prueba
  console.log('\n🍗 Creando productos...')
  
  const productos = [
    {
      nombre_produc: 'Pollo Rostizado 1/4',
      descripcion_produc: 'Pollo fresco rostizado al carbón',
      precio_produc: 8.50,
      categoria_produc: 'Pollo',
      stock_produc: 50,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Pollo Rostizado 1/2',
      descripcion_produc: 'Media gallina rostizada al carbón',
      precio_produc: 15.00,
      categoria_produc: 'Pollo',
      stock_produc: 40,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Pollo Rostizado Completo',
      descripcion_produc: 'Pollo completo fresco rostizado',
      precio_produc: 25.00,
      categoria_produc: 'Pollo',
      stock_produc: 30,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Papas Fritas',
      descripcion_produc: 'Papas fritas caseras',
      precio_produc: 2.50,
      categoria_produc: 'Acompañamientos',
      stock_produc: 100,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Ensalada de Lechuga',
      descripcion_produc: 'Ensalada fresca con lechuga, tomate y cebolla',
      precio_produc: 3.00,
      categoria_produc: 'Ensaladas',
      stock_produc: 60,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Refresco Coca Cola',
      descripcion_produc: 'Bebida gaseosa',
      precio_produc: 1.50,
      categoria_produc: 'Bebidas',
      stock_produc: 200,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Cerveza Pilsener',
      descripcion_produc: 'Cerveza fría',
      precio_produc: 2.00,
      categoria_produc: 'Bebidas',
      stock_produc: 150,
      vencimiento_produc: new Date('2026-12-31'),
    },
    {
      nombre_produc: 'Jugo Natural',
      descripcion_produc: 'Jugo fresco de frutas',
      precio_produc: 2.50,
      categoria_produc: 'Bebidas',
      stock_produc: 80,
      vencimiento_produc: new Date('2026-12-31'),
    },
  ]

  for (const producto of productos) {
    const created = await prisma.productos.create({
      data: {
        nombre_produc: producto.nombre_produc,
        descripcion_produc: producto.descripcion_produc,
        precio_produc: producto.precio_produc,
        categoria_produc: producto.categoria_produc,
        stock_produc: producto.stock_produc,
        vencimiento_produc: producto.vencimiento_produc,
        controlar_stock: true,
      },
    })
    console.log(
      `✓ Producto creado: ${created.nombre_produc} (S/. ${Number(created.precio_produc).toFixed(2)})`
    )
  }

  console.log('\n✅ Seed de datos completado exitosamente!')
  console.log('\n📋 Usuarios creados:')
  console.log('─'.repeat(60))
  console.log('Email                    | Password       | Rol')
  console.log('─'.repeat(60))
  console.log('admin@gerson.com         | Admin123!      | Admin')
  console.log('mesero@gerson.com        | Mesero123!     | Mesero')
  console.log('cocinero@gerson.com      | Cocinero123!   | Cocinero')
  console.log('cajero@gerson.com        | Cajero123!     | Cajero')
  console.log('─'.repeat(60))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
=======
  console.log("Iniciando seeding de usuarios...")

  // Crear usuarios de prueba con bcryptjs
  const adminPassword = await bcrypt.hash("Admin123!", 10)
  const meseroPassword = await bcrypt.hash("Mesero123!", 10)
  const cocineroPassword = await bcrypt.hash("Cocinero123!", 10)

  // Verificar si ya existe el admin
  const existingAdmin = await prisma.usuarios.findUnique({
    where: { correo_user: "admin@gerson.com" },
  })

  if (existingAdmin) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingAdmin.id_user },
      data: { contrasena: adminPassword },
    })
    console.log("✓ Usuario admin actualizado con nueva contraseña")
  } else {
    const admin = await prisma.usuarios.create({
      data: {
        nombre_user: "Admin",
        apellido_user: "Gerson",
        correo_user: "admin@gerson.com",
        contrasena: adminPassword,
        rol: "Admin",
      },
    })
    console.log("✓ Usuario Admin creado:", admin.correo_user)
  }

  // Crear mesero de prueba
  const existingMesero = await prisma.usuarios.findUnique({
    where: { correo_user: "mesero@gerson.com" },
  })

  if (existingMesero) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingMesero.id_user },
      data: { contrasena: meseroPassword },
    })
    console.log("✓ Usuario mesero actualizado con nueva contraseña")
  } else {
    const mesero = await prisma.usuarios.create({
      data: {
        nombre_user: "Juan",
        apellido_user: "Mesero",
        correo_user: "mesero@gerson.com",
        contrasena: meseroPassword,
        rol: "Mesero",
      },
    })
    console.log("✓ Usuario Mesero creado:", mesero.correo_user)
  }

  // Crear cocinero de prueba
  const existingCocinero = await prisma.usuarios.findUnique({
    where: { correo_user: "cocinero@gerson.com" },
  })

  if (existingCocinero) {
    // Actualizar con contraseña correcta
    await prisma.usuarios.update({
      where: { id_user: existingCocinero.id_user },
      data: { contrasena: cocineroPassword },
    })
    console.log("✓ Usuario cocinero actualizado con nueva contraseña")
  } else {
    const cocinero = await prisma.usuarios.create({
      data: {
        nombre_user: "Carlos",
        apellido_user: "Cocinero",
        correo_user: "cocinero@gerson.com",
        contrasena: cocineroPassword,
        rol: "Cocinero",
      },
    })
    console.log("✓ Usuario Cocinero creado:", cocinero.correo_user)
  }

  console.log("\n✓ Seeding completado!")
  console.log("\nCredenciales de prueba:")
  console.log("═══════════════════════════════════════")
  console.log("Admin:")
  console.log("  Email: admin@gerson.com")
  console.log("  Contraseña: Admin123!")
  console.log("─────────────────────────────────────")
  console.log("Mesero:")
  console.log("  Email: mesero@gerson.com")
  console.log("  Contraseña: Mesero123!")
  console.log("─────────────────────────────────────")
  console.log("Cocinero:")
  console.log("  Email: cocinero@gerson.com")
  console.log("  Contraseña: Cocinero123!")
  console.log("═══════════════════════════════════════")

  // Crear mesas de prueba
  console.log("\n\nCreando mesas de prueba...")
  const existingMesas = await (prisma as any).mesas.findMany()
  
  if (existingMesas.length === 0) {
    for (let i = 1; i <= 6; i++) {
      await (prisma as any).mesas.create({
        data: {
          numero_mesa: i,
          capacidad_mesa: 4,
          estado_mesa: "Libre",
        },
      })
    }
    console.log("✓ 6 mesas creadas")
  } else {
    console.log(`✓ Ya existen ${existingMesas.length} mesas`)
  }

  // Crear productos de prueba
  console.log("\nCreando productos de prueba...")
  const existingProductos = await (prisma as any).productos.findMany()
  
  if (existingProductos.length === 0) {
    const productos = [
      { nombre: "Pollo a la Brasa", precio: 25.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Medio Pollo", precio: 18.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Cuarto de Pollo", precio: 12.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Arroz con Pollo", precio: 20.00, categoria: "Platos", diasVencimiento: 30 },
      { nombre: "Papas Fritas", precio: 8.00, categoria: "Acompañamientos", diasVencimiento: 7 },
      { nombre: "Ensalada", precio: 10.00, categoria: "Acompañamientos", diasVencimiento: 3 },
      { nombre: "Gaseosa Pequeña", precio: 3.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Gaseosa Grande", precio: 5.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Agua", precio: 2.00, categoria: "Bebidas", diasVencimiento: 365 },
      { nombre: "Cerveza", precio: 8.00, categoria: "Bebidas", diasVencimiento: 180 },
    ]

    for (const producto of productos) {
      const vencimiento = new Date()
      vencimiento.setDate(vencimiento.getDate() + producto.diasVencimiento)
      
      await (prisma as any).productos.create({
        data: {
          nombre_produc: producto.nombre,
          precio_produc: producto.precio,
          categoria_produc: producto.categoria,
          estado_produc: "Activo",
          vencimiento_produc: vencimiento,
        },
      })
    }
    console.log(`✓ ${productos.length} productos creados`)
  } else {
    console.log(`✓ Ya existen ${existingProductos.length} productos`)
  }

  console.log("\n═══════════════════════════════════════")
  console.log("✅ Seeding completado exitosamente!")
  console.log("═══════════════════════════════════════")
}

main()
  .catch((e) => {
    console.error("Error en seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
>>>>>>> 6ca1d5ea6b7d57cb64a864fbec055783162f736e
