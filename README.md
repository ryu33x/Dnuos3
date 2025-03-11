Sintetizador Modular
Este proyecto es un sintetizador modular basado en la Web Audio API, que permite a los usuarios generar y manipular sonidos en tiempo real. El sintetizador incluye un oscilador, un LFO (Low-Frequency Oscillator) y controles para ajustar la frecuencia, la intensidad y el tipo de onda. Además, permite crear secuencias de notas, reproducirlas y grabarlas en un archivo de audio.

Características
Oscilador: Genera ondas de sonido con frecuencia ajustable.

LFO: Modula la amplitud del oscilador para crear efectos de vibrato.

Tipos de onda: Soporta ondas seno, cuadrada, diente de sierra y triangular.

Secuencias: Permite definir secuencias de notas con duraciones específicas.

Grabación: Graba la secuencia de notas en un archivo WAV para su descarga.

Generación de patrones: Genera automáticamente patrones de notas aleatorios.

Visualización: Incluye una animación de partículas que reacciona a la frecuencia del oscilador.

Estructura del Proyecto
El proyecto consta de dos archivos principales:

index.html: Contiene la estructura HTML y los estilos CSS para la interfaz de usuario.

synth.js: Contiene la lógica del sintetizador, incluyendo la manipulación de la Web Audio API y la gestión de eventos.

Uso
Interfaz de Usuario
Frecuencia Oscilador: Control deslizante para ajustar la frecuencia del oscilador (50-1000 Hz).

Frecuencia LFO: Control deslizante para ajustar la frecuencia del LFO (0.1-20 Hz).

Intensidad LFO: Control deslizante para ajustar la intensidad del LFO (0-1).

Tipo de Onda: Menú desplegable para seleccionar el tipo de onda (seno, cuadrada, diente de sierra, triangular).

Secuencia: Área de texto para ingresar una secuencia de notas en formato frecuencia,duración.

Duración mínima del bucle: Campo de entrada para definir la duración mínima de la grabación en segundos.

Botones:

Tocar: Reproduce una nota con la frecuencia actual del oscilador.

Parar: Detiene la reproducción o grabación.

Tocar Canción: Reproduce la secuencia de notas ingresada.

Generar Patrón: Genera una secuencia de notas aleatoria.

Grabar y Descargar: Graba la secuencia de notas y la descarga como un archivo WAV.

Funcionalidades
Reproducción de notas: Al hacer clic en "Tocar", se reproduce una nota con la frecuencia actual del oscilador.

Reproducción de secuencias: Al hacer clic en "Tocar Canción", se reproduce la secuencia de notas ingresada en el área de texto.

Grabación: Al hacer clic en "Grabar y Descargar", se graba la secuencia de notas y se descarga como un archivo WAV.

Generación de patrones: Al hacer clic en "Generar Patrón", se genera una secuencia de notas aleatoria.

Requisitos
Navegador web moderno con soporte para Web Audio API (Chrome, Firefox, Edge, etc.).

Instalación
No se requiere instalación. Simplemente abre el archivo index.html en un navegador web.

Ejecución
Clona o descarga el repositorio.

Abre el archivo index.html en tu navegador.

Utiliza los controles para ajustar los parámetros del sintetizador y reproducir o grabar sonidos.

Contribuciones
Las contribuciones son bienvenidas. Si deseas mejorar el proyecto, por favor abre un issue o envía un pull request.
Desarrollado con Grok3
