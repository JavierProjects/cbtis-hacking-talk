# Ciberseguridad desde cero

Presentación y demostraciones para una conferencia de 40 minutos más 15 minutos de preguntas, dirigida a estudiantes de 1.º y 3.º semestre de CBTIS. Todo funciona localmente, sin instalar paquetes ni conectarse a internet.

## Iniciar

Desde la carpeta del repositorio:

```bash
python3 server.py
```

Abre **http://127.0.0.1:8765** en el navegador. Si el puerto está ocupado: `PORT=8766 python3 server.py`. Requiere Python 3.9 o posterior y un navegador moderno. En Windows también puede funcionar `py -3 server.py`.

El servidor escucha únicamente en `127.0.0.1`: la audiencia mira el proyector; no necesita conectarse a la red. No abras `static/index.html` directamente porque la demostración del expediente requiere las rutas del servidor.

## Controles

- `→`, `Espacio` o `PageDown`: escena siguiente.
- `←` o `PageUp`: escena anterior.
- `F`: pantalla completa; `N`: notas del ponente; `R`: reiniciar la escena interactiva.
- Los botones visibles también permiten navegar. Dentro de un campo de texto, las teclas de navegación no cambian de escena.

## Hilo de la charla

1. Abrir con una pregunta sobre cómo se encuentra una falla.
2. Resolver juntos el mensaje César `PLUD OD GLUHFFLRQ` (desplazamiento de tres; respuesta: `MIRA LA DIRECCION`). Se usa el alfabeto A–Z sin tildes ni Ñ para mantener la mecánica simple.
3. Mostrar la sesión ficticia de Alex y su expediente 104. Pedir predicciones antes de consultar 105. La ruta vulnerable devuelve el registro de Sam, aunque la sesión sigue siendo la de Alex.
4. Repetir en la ruta corregida: el servidor responde HTTP 403 para el expediente 105. Explicar que la comprobación debe aplicarse a cada expediente solicitado.
5. Conectar la actividad con campos profesionales y cerrar con tres recursos de práctica, además de dos rutas para avanzar.

Todos los nombres y datos del expediente son inventados. La ruta vulnerable es **intencional** y está disponible solo para la demostración en el servidor local. El acceso protegido sí verifica permisos en el servidor; no se trata de una mera animación visual. La sesión es ficticia y fija al usuario Alex, no es un ejemplo de autenticación para producción.

## Guía rápida para el ponente

El marcador superior indica los minutos de referencia dentro de los 40. Avanza según las respuestas del auditorio: la parte de preguntas empieza después del cierre, en el minuto 40. En la demostración, primero pulsa **Iniciar sesión ficticia**, luego consulta 104, escucha predicciones y consulta 105. En la escena corregida consulta 105 de nuevo. Si la red del lugar falla, la presentación y el servidor siguen funcionando.

Los enlaces externos son referencias para abrir **después** de la conferencia, desde una conexión disponible. No son necesarios para usar esta aplicación. Ensaya la proyección a pantalla completa y aumenta el zoom del navegador si la pantalla queda lejos del público.

## Verificar

```bash
python3 -m unittest discover -s tests -v
```
