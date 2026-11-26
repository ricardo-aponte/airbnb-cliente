```markdown
# Airbnb Cliente — Aplicación Móvil de Reservas

Aplicación móvil híbrida para **Clientes** del ecosistema de reservas de alojamientos (estilo Airbnb), desarrollada con **Ionic**, **Angular (Standalone)** y **Capacitor**, conectada a la API REST compartida.

---

## Funcionalidades Principales

* **Autenticación de Clientes:** Inicio de sesión y registro con persistencia de sesión en `localStorage` y protección de rutas mediante *Guards* (`authGuard` y `guestGuard`).
* **Buscador Principal:** Búsqueda por ciudad, fecha de llegada, fecha de salida y cantidad de huéspedes, con limpieza automática de filtros al iniciar o cerrar sesión.
* **Búsqueda Avanzada:** Filtrado opcional por nombre, descripción, capacidad de huéspedes, habitaciones, camas, baños, vehículos de parqueo, precio por noche y disponibilidad de Wi-Fi.
* **Resultados en Lista y Mapa:** Alternancia bidireccional entre **Vista de Lista** y **Vista de Mapa** interactiva con marcadores de precio y tarjeta de vista previa usando **Leaflet** + OpenStreetMap.
* **Detalle del Alojamiento:** Galería fotográfica con miniaturas interactivas, descripción, capacidad, servicios (Wi-Fi y parqueo) y datos del anfitrión.
* **Confirmación de Reserva (Checkout):** Ajuste de fechas en tiempo real y desglose automático de costos (subtotal por noches, costo de limpieza, 10% de tarifa de servicio y total).
* **Mis Reservas:** Historial de reservas realizadas por el cliente con actualización mediante *pull-to-refresh*.

---

## Stack Tecnológico

| Tecnología | Uso |
| :--- | :--- |
| **Angular** (Standalone Components) | Framework principal, enrutamiento y formularios reactivos |
| **Ionic (`@ionic/angular` v9)** | Componentes de interfaz móvil |
| **Capacitor (`@capacitor/android`)** | Empaquetado y ejecución nativa en Android |
| **Leaflet** | Mapas interactivos sin dependencia de API Keys de pago |
| **TypeScript / RxJS** | Tipado fuerte y consumo asíncrono de la API REST |

---

## Estructura del Proyecto

```text
src/
├── main.ts
└── app/
    ├── app.routes.ts
    ├── core/
    │   ├── constants/        # Configuración de URL base y formateo de imágenes
    │   ├── guards/           # authGuard y guestGuard
    │   └── utils/            # Conversión numérica y cálculo de noches/fechas
    ├── models/               # Interfaces: Usuario, Lugar, Foto, Reserva, Busqueda
    ├── services/             # AuthService, LugaresService, ReservasService
    └── pages/
        ├── auth/             # LoginPage y RegistroPage
        ├── home/             # Buscador principal
        ├── busqueda-avanzada/# Formulario de filtros avanzados
        ├── resultados/       # Vista de Lista y Vista de Mapa (Leaflet)
        ├── detalle-lugar/    # Galería e información del alojamiento
        ├── confirmar-reserva/# Cálculo de costos y envío de reserva
        └── mis-reservas/     # Historial de reservas del cliente

```

---

## Endpoints Consumidos

URL Base: `https://api.airbnbmob2.online/api`

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `POST` | `/cliente/login` | Inicio de sesión de cliente |
| `POST` | `/cliente/registro` | Registro de nuevo cliente |
| `POST` | `/lugares/search` | Búsqueda simple de alojamientos |
| `POST` | `/lugares/advancedsearch` | Búsqueda con filtros avanzados |
| `GET` | `/lugares/:id` | Detalle completo de un alojamiento |
| `POST` | `/reservas` | Creación de una nueva reserva |
| `GET` | `/reservas/cliente/:id` | Historial de reservas del cliente |

---

## Instalación y Ejecución

### Requisitos previos

* Node.js (v18 o superior) y npm
* Ionic CLI (`npm install -g @ionic/cli`)
* Android Studio (para compilar y ejecutar en emulador o dispositivo físico)

### 1. Instalar dependencias

```bash
git clone <URL_DEL_REPOSITORIO>
cd airbnb-cliente
npm install --legacy-peer-deps

```

### 2. Ejecutar en el navegador (Desarrollo)

```bash
ionic serve

```

La aplicación quedará disponible en `http://localhost:8100`.

### 3. Compilar y ejecutar en Android (Capacitor)

```bash
ionic build
npx cap sync android
npx cap open android

```

Una vez abierto en **Android Studio**, esperar a que finalice la sincronización de Gradle, seleccionar un emulador o dispositivo conectado y presionar **Run (`▶`)**.

```