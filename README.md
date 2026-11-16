# 🔥 Infierno (versión para celulares)

Versión web instalable (PWA) de **Infierno**, el juego de cartas solitario diseñado por Martin Sgattoni
([losjuegosdemartin.com](https://www.losjuegosdemartin.com)). Es la misma lógica que `infierno_python/`,
rehecha en HTML/CSS/JS para jugar con el celular en vertical. Sin publicidad y funciona sin internet.

## Probarlo en la compu

```bash
cd infierno_mobile
python3 -m http.server 8000
```

Y abrir http://localhost:8000 (en Chrome, con las herramientas de desarrollo en modo celular).

## Publicarlo

Son archivos estáticos: se puede publicar igual que El Impostor, en GitHub Pages
(repositorio → Settings → Pages → rama `main`, carpeta raíz). Para instalarse como app
tiene que servirse por **https**.

## Instalar la aplicación en el celular

### Android
1. Abrí la página del juego en **Chrome**.
2. Tocá el menú **⋮** (arriba a la derecha).
3. Elegí **Instalar app** (o **Agregar a pantalla principal**).
4. Confirmá con **Instalar**.

### iPhone
1. Abrí la página del juego en **Safari**.
2. Tocá **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elegí **Agregar a inicio** y tocá **Agregar**.

La pantalla de inicio del juego tiene el botón **📲 Cómo instalar la app** con estos mismos pasos.

## Cómo se juega

Ver el botón **📜 Cómo se juega** en la app, o el README de `infierno_python/`.

## Estructura

```
infierno_mobile/
├── index.html      # Pantallas y diálogos
├── styles.css      # Estilos
├── cards.js        # Datos: cartas y niveles
├── app.js          # Lógica del juego y dibujo
├── sw.js           # Cache para jugar sin conexión
├── manifest.json   # Datos para instalarla como app
└── assets/         # Cartas (WebP reducidas desde infierno_python/images), fondo e íconos
```

## Para quien mantiene el juego

Cada vez que se publica un cambio, subí el número de `CACHE` en `sw.js` (por ejemplo de
`infierno-v1` a `infierno-v2`) para que los celulares descarguen los archivos nuevos.
La partida en curso se guarda en el celular (`localStorage`) y se puede continuar desde el inicio.
