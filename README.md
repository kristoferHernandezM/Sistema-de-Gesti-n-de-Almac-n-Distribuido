# 🏭 Sistema de Gestión de Almacén Distribuido - Ironclad Logistics

## 📌 Descripción
Sistema distribuido para la gestión de inventario que permite registrar, rastrear y administrar en tiempo real el flujo de mercancía entre múltiples sucursales.

El sistema está basado en una arquitectura de microservicios, donde cada nodo opera de manera independiente y se comunica mediante APIs REST.

---

## 🎯 Objetivo
- Implementar un sistema distribuido funcional
- Permitir comunicación entre nodos con IPs reales
- Garantizar sincronización y consistencia de datos
- Implementar replicación y tolerancia a fallos

---

## 🧱 Arquitectura

El sistema está compuesto por los siguientes servicios:

- **Gateway** → Punto de entrada
- **Auth Service** → Autenticación de usuarios
- **Inventory Service** → Gestión de inventario
- **Transactions Service** → Entradas y salidas
- **Reports Service** → Reportes y analítica
- **Database** → Base de datos distribuida (MongoDB)

---

## 🖥️ Tecnologías utilizadas

- Node.js + Express
- MongoDB
- Docker / Docker Compose
- HTML + Tailwind CSS
- REST APIs

---

## 📁 Estructura del proyecto
Sistema_distribuido_inventario/
├── frontend/
├── gateway/
├── service-auth/
├── service-inventory/
├── service-transactions/
├── service-reports/
├── database/
├── docs/
└── docker-compose.yml