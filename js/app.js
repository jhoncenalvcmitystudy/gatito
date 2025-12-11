let device, server, uartService, uartRX;
let conectado = false;
let bloqueoBoton = false;

// Elementos
const statusLabel = document.getElementById("status");
const btnConectar = document.getElementById("btnConectar");
const btnActivar = document.getElementById("btnActivar");
const btnEnviarHora = document.getElementById("btnEnviarHora");

btnConectar.addEventListener("click", conectarBluetooth);
btnActivar.addEventListener("click", enviarActivacion);
btnEnviarHora.addEventListener("click", enviarHorario);

// ==== 1) Conectar Bluetooth ====
async function conectarBluetooth() {
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [UART_SERVICE]
    });

    server = await device.gatt.connect();
    uartService = await server.getPrimaryService(UART_SERVICE);
    uartRX = await uartService.getCharacteristic(UART_RX);

    conectado = true;
    statusLabel.innerText = "Estado: Conectado ✔";

  } catch (error) {
    statusLabel.innerText = "Error al conectar";
    console.error(error);
  }
}


// ==== 2) Enviar ACTIVACIÓN ====
async function enviarActivacion() {
  if (!conectado) return alert("Primero conecta al ESP32");

  if (bloqueoBoton) return alert("Espera 3 segundos…");

  bloqueoBoton = true;
  setTimeout(() => bloqueoBoton = false, 3000);

  const data = new TextEncoder().encode("ON");

  try {
    await uartRX.writeValue(data);
    alert("Señal enviada");
  } catch (err) {
    alert("Error enviando señal");
  }
}


// ==== 3) Enviar horario HH-MM ====
async function enviarHorario() {
  if (!conectado) return alert("Primero conecta al ESP32");

  const hora = document.getElementById("hora").value;

  if (!hora) return alert("Selecciona un horario");

  // Convertir de HH:MM a HH-MM
  const msg = hora.replace(":", "-");
  const data = new TextEncoder().encode(msg);

  try {
    await uartRX.writeValue(data);
    alert("Horario enviado: " + msg);
  } catch (err) {
    alert("Error enviando horario");
  }
}
