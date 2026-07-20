-- CreateEnum
CREATE TYPE "EstadoMesa" AS ENUM ('LIBRE', 'OCUPADA', 'RESERVADA');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('EN_PREPARACION', 'EN_PROCESO', 'LISTO_PARA_RECOGER', 'SERVIDO', 'PAGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'MESERO', 'COCINERO', 'CAJERO');

-- CreateEnum
CREATE TYPE "TipoFinanza" AS ENUM ('INGRESO', 'EGRESO');

-- CreateTable
CREATE TABLE "detalle_pedidos" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingresos" (
    "id_ingreso" SERIAL NOT NULL,
    "fecha_ingreso" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(12,2) NOT NULL,
    "descripcion" VARCHAR(255) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "cliente" VARCHAR(100),
    "metodo_pago" VARCHAR(50) NOT NULL,
    "comprobante" VARCHAR(255),
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Registrado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingresos_pkey" PRIMARY KEY ("id_ingreso")
);

-- CreateTable
CREATE TABLE "gastos" (
    "id_gasto" SERIAL NOT NULL,
    "fecha_gasto" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(12,2) NOT NULL,
    "categoria" VARCHAR(50) NOT NULL,
    "proveedor" VARCHAR(100),
    "descripcion" VARCHAR(255) NOT NULL,
    "comprobante" VARCHAR(255),
    "metodo_pago" VARCHAR(50) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Registrado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "gastos_pkey" PRIMARY KEY ("id_gasto")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id_factura" SERIAL NOT NULL,
    "numero_factura" VARCHAR(50) NOT NULL,
    "fecha_emision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_pagado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" VARCHAR(50),
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "cuentas_por_cobrar" (
    "id_cobro" SERIAL NOT NULL,
    "cliente" VARCHAR(100) NOT NULL,
    "deuda_total" DECIMAL(12,2) NOT NULL,
    "deuda_vencida" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_por_cobrar_pkey" PRIMARY KEY ("id_cobro")
);

-- CreateTable
CREATE TABLE "cuentas_por_pagar" (
    "id_pago" SERIAL NOT NULL,
    "proveedor" VARCHAR(100) NOT NULL,
    "deuda_total" DECIMAL(12,2) NOT NULL,
    "deuda_pendiente" DECIMAL(12,2) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuentas_por_pagar_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id_presupuesto" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_usado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "categoria" VARCHAR(50) NOT NULL,
    "fecha_inicio" TIMESTAMP(6) NOT NULL,
    "fecha_fin" TIMESTAMP(6) NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id_presupuesto")
);

-- CreateTable
CREATE TABLE "movimientos_caja" (
    "id_movimiento" SERIAL NOT NULL,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" VARCHAR(20) NOT NULL,
    "concepto" VARCHAR(100) NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "saldo_anterior" DECIMAL(12,2) NOT NULL,
    "saldo_nuevo" DECIMAL(12,2) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimientos_caja_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id_insumo" SERIAL NOT NULL,
    "nombre_insu" VARCHAR(100) NOT NULL,
    "unidadmedida_insu" VARCHAR(20) NOT NULL,
    "stock_act_insu" DECIMAL(10,2) DEFAULT 0,
    "stock_min_insu" DECIMAL(10,2) DEFAULT 0,
    "vencimiento_insu" DATE NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id_insumo")
);

-- CreateTable
CREATE TABLE "mesas" (
    "id_mesa" SERIAL NOT NULL,
    "numero_mesa" INTEGER NOT NULL,
    "capacidad_mesa" INTEGER NOT NULL,
    "estado_mesa" VARCHAR(20) DEFAULT 'Libre',

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("id_mesa")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id_pedido" SERIAL NOT NULL,
    "fecha_pedido" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_user" INTEGER NOT NULL,
    "id_mesa" INTEGER NOT NULL,
    "estado_pedido" VARCHAR(20) DEFAULT 'En preparacion',
    "observaciones" TEXT,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "productos" (
    "id_produc" SERIAL NOT NULL,
    "nombre_produc" VARCHAR(100) NOT NULL,
    "descripcion_produc" TEXT,
    "precio_produc" DECIMAL(10,2) NOT NULL,
    "categoria_produc" VARCHAR(20) NOT NULL,
    "estado_produc" VARCHAR(20) DEFAULT 'Activo',
    "vencimiento_produc" DATE NOT NULL,
    "stock_produc" INTEGER NOT NULL DEFAULT 0,
    "controlar_stock" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id_produc")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_user" SERIAL NOT NULL,
    "nombre_user" VARCHAR(100) NOT NULL,
    "apellido_user" VARCHAR(100) NOT NULL,
    "dni_user" VARCHAR(20),
    "telefono_user" VARCHAR(20),
    "correo_user" VARCHAR(100),
    "rol" VARCHAR(20) NOT NULL,
    "contrasena" VARCHAR(255) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "detallepedido" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "id_produc" INTEGER,
    "nombre_produc_personalizado" VARCHAR(255),
    "cantidad" SMALLINT NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detallepedido_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "pedidos_delivery" (
    "id_delivery" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "numero_telefono" VARCHAR(20) NOT NULL,
    "nombre_cliente" VARCHAR(100) NOT NULL,
    "direccion" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_delivery_pkey" PRIMARY KEY ("id_delivery")
);

-- CreateTable
CREATE TABLE "inventario_pollos" (
    "id_inventario" SERIAL NOT NULL,
    "fecha" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pollos_totales" INTEGER NOT NULL DEFAULT 0,
    "pechos_disponibles" INTEGER NOT NULL DEFAULT 0,
    "piernas_disponibles" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventario_pollos_pkey" PRIMARY KEY ("id_inventario")
);

-- CreateTable
CREATE TABLE "detalle_pollos_pedido" (
    "id_detalle" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "tipo_presa" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detalle_pollos_pedido_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateIndex
CREATE INDEX "gastos_id_user_idx" ON "gastos"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_factura_key" ON "facturas"("numero_factura");

-- CreateIndex
CREATE UNIQUE INDEX "mesas_numero_mesa_key" ON "mesas"("numero_mesa");

-- CreateIndex
CREATE INDEX "pedidos_fecha_pedido_idx" ON "pedidos"("fecha_pedido");

-- CreateIndex
CREATE INDEX "pedidos_estado_pedido_idx" ON "pedidos"("estado_pedido");

-- CreateIndex
CREATE INDEX "pedidos_id_user_idx" ON "pedidos"("id_user");

-- CreateIndex
CREATE INDEX "pedidos_id_mesa_idx" ON "pedidos"("id_mesa");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_user_key" ON "usuarios"("dni_user");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_user_key" ON "usuarios"("correo_user");

-- CreateIndex
CREATE INDEX "detallepedido_id_pedido_idx" ON "detallepedido"("id_pedido");

-- CreateIndex
CREATE INDEX "detallepedido_id_produc_idx" ON "detallepedido"("id_produc");

-- CreateIndex
CREATE INDEX "detallepedido_estado_idx" ON "detallepedido"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_delivery_id_pedido_key" ON "pedidos_delivery"("id_pedido");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_pollos_fecha_key" ON "inventario_pollos"("fecha");

-- AddForeignKey
ALTER TABLE "gastos" ADD CONSTRAINT "gastos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("id_mesa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuarios"("id_user") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepedido" ADD CONSTRAINT "detallepedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallepedido" ADD CONSTRAINT "detallepedido_id_produc_fkey" FOREIGN KEY ("id_produc") REFERENCES "productos"("id_produc") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedidos_delivery" ADD CONSTRAINT "pedidos_delivery_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedidos"("id_pedido") ON DELETE CASCADE ON UPDATE NO ACTION;

