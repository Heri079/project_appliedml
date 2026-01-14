const express = require('express');
const path = require('path');
const app = express();

// Middleware para parsear JSON en POST
app.use(express.json());

// Middleware para loguear todos los accesos
app.use((req, res, next) => {
    console.log(`Acceso: ${req.method} ${req.url} desde IP ${req.ip} en ${new Date().toISOString()}`);
    next();
});

// Servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para recibir datos extraídos (conteo de caras e interacciones)
app.post('/api/send-data', (req, res) => {
    const data = req.body;
    console.log('Datos recibidos del usuario:', data);
    res.send({ message: 'Datos recibidos exitosamente' });
});

// Ruta principal: Sirve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});