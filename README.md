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
- `F`: pantalla completa; `N`: notas del ponente; `R`: reiniciar la escena interactiva. En el expediente, `R` también restablece la simulación del servidor.
- Los botones visibles también permiten navegar. Dentro de un campo de texto, las teclas de navegación no cambian de escena.

## Hilo de la charla

1. Dejar correr la portada con lluvia de letras. Alterna cinco segundos de caracteres aleatorios con cinco segundos del nombre **Dr. Francisco Javier Cuadros Romero** y **ITICs**. Pulsa `→` para comenzar la charla.
2. Abrir con una pregunta sobre cómo se encuentra una falla.
3. Resolver juntos el mensaje César `PLUD OD GLUHFFLRQ` (desplazamiento de tres; respuesta: `MIRA LA DIRECCION`). Se usa el alfabeto A–Z sin tildes ni Ñ para mantener la mecánica simple.
4. Mostrar la sesión ficticia de Alex y su expediente 104. Pedir predicciones antes de consultar 105. La ruta vulnerable devuelve el registro de Sam, aunque la sesión sigue siendo la de Alex.
5. En la escena corregida, pulsar **Aplicar corrección y consultar**. El servidor responde HTTP 403 para el expediente 105. Recargar la URL antigua `/api/vulnerable/expedientes/105` en otra pestaña: también responde HTTP 403, pues ya no hay una ruta que salte la comprobación. La ruta de 104 sigue funcionando. **Reiniciar simulación** en la escena anterior permite repetir el antes y el después.
6. Conectar la actividad con campos profesionales y cerrar con tres recursos de práctica, además de dos rutas para avanzar.

Todos los nombres y datos del expediente son inventados. La ruta vulnerable es **intencional** y está disponible solo para la demostración en el servidor local. Al aplicar la corrección, también esa ruta comprueba el propietario, por sesión. En otra pestaña del mismo navegador, el cambio se observa al recargar. Una sesión nueva de otro navegador comienza en el estado vulnerable para poder repetir la práctica. La sesión es ficticia y fija al usuario Alex, no es un ejemplo de autenticación para producción.

## Guía rápida para el ponente

Avanza según las respuestas del auditorio: la parte de preguntas empieza después del cierre, en el minuto 40. En la demostración, primero pulsa **Iniciar sesión ficticia**, luego consulta 104, escucha predicciones y consulta 105. En la escena corregida aplica la corrección y consulta 105 de nuevo. Si la red del lugar falla, la presentación y el servidor siguen funcionando.

La lluvia digital en `static/matrix.js` es una implementación original con Canvas y `requestAnimationFrame`, inspirada en el patrón de columnas y estelas de [este ejemplo abierto](https://github.com/Project30Hub/Matrix-Digital-Rain). No requiere librerías ni recursos externos. Si el navegador tiene activada la preferencia de movimiento reducido, muestra una portada estática con el nombre.

Los enlaces externos son referencias para abrir **después** de la conferencia, desde una conexión disponible. No son necesarios para usar esta aplicación. Ensaya la proyección a pantalla completa y aumenta el zoom del navegador si la pantalla queda lejos del público.

## Verificar

```bash
python3 -m unittest discover -s tests -v
```
