# 💰 Ahorro Diario (Ionic App)

**Ahorro Diario** es una aplicación móvil multiplataforma desarrollada con **Ionic + Angular**, diseñada para ayudar a los usuarios a gestionar sus finanzas personales.

---

## ⚙️ Requerimientos previos

Asegúrate de tener instalado lo siguiente en tu entorno local (Windows recomendado):

- [Node.js](https://nodejs.org/en/) versión **18 o superior**
- [Ionic CLI](https://ionicframework.com/docs/cli)  
  ```bash
  npm install -g @ionic/cli


📁 Estructura del proyecto

ahorro-diario/
│
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── profile/         # RF-01 Gestión de Perfil
│   │   │   ├── transactions/    # RF-02 Registro de Transacciones
│   │   │   ├── summary/         # RF-03 Resumen Financiero
│   │   │   ├── alerts/          # RF-04 Sistema de Alertas
│   │   │   └── history/         # RF-05 Historial de Transacciones
│   │   ├── tabs/                # Navegación principal (Tabs)
│   │   └── app.routes.ts        # Rutas globales
│   ├── assets/                  # Recursos estáticos
│   └── theme/                   # Estilos globales
│
├── package.json
├── package-lock.json
├── angular.json
├── .eslintrc.json
└── README.md

🚀 Cómo ejecutar el proyecto

1. Clonar el repositorio
2. Instalar dependencias
        npm install

3. Ingresar al proyecto y en la terminal ejecutar
        ionic serve