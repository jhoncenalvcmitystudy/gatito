// === UUID del servicio BLE UART ===
const SERVICE_UUID   = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const RX_CHAR_UUID   = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; // ESP32 recibe
const TX_CHAR_UUID   = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // ESP32 envía

let device, server, uartService, uartRX, uartTX;
let conectado = false;
let bloqueoBoton = false;

// Elementos UI
const statusLabel = document.getElementById("status");
const btnConectar = document.getElementById("btnConectar");
const btnActivar = document.getElementById("btnActivar");
const btnEnviarHora = document.getElementById("btnEnviarHora");

btnConectar.addEventListener("click", conectarBluetooth);
btnActivar.addEventListener("click", enviarActivacion);
btnEnviarHora.addEventListener("click", enviarHorario);


// ===============================================================
// 1) CONECTAR AL ESP32 VIA BLE (NORDIC UART)
// ===============================================================
async function conectarBluetooth() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [SERVICE_UUID] }]
    });

    server = await device.gatt.connect();

    uartService = await server.getPrimaryService(SERVICE_UUID);

    uartRX = await uartService.getCharacteristic(RX_CHAR_UUID); // escribir
    uartTX = await uartService.getCharacteristic(TX_CHAR_UUID); // leer

    // Activar notificaciones desde el ESP32
    await uartTX.startNotifications();
    uartTX.addEventListener("characteristicvaluechanged", (event) => {
      let value = new TextDecoder().decode(event.target.value);
      console.log("Desde ESP32:", value);
    });

    conectado = true;
    statusLabel.innerText = "Estado: Conectado ✔";

  } catch (error) {
    console.error(error);
    statusLabel.innerText = "Error al conectar";
  }
}


// ===============================================================
// 2) ENVIAR "ON" AL ESP32
// ===============================================================
async function enviarActivacion() {
  if (!conectado) return alert("Primero conecta al ESP32");

  if (bloqueoBoton) return alert("Espera 3 segundos…");

  bloqueoBoton = true;
  setTimeout(() => bloqueoBoton = false, 3000);

  try {
    const data = new TextEncoder().encode("ON");
    await uartRX.writeValue(data);
    alert("Señal enviada");
  } catch (err) {
    alert("Error enviando señal");
  }
}


// ===============================================================
// 3) ENVIAR HORARIO EN FORMATO HH-MM
// ===============================================================
async function enviarHorario() {
  if (!conectado) return alert("Primero conecta al ESP32");

  const hora = document.getElementById("hora").value;
  if (!hora) return alert("Selecciona un horario");

  const msg = hora.replace(":", "-");  // HH:MM → HH-MM
  const data = new TextEncoder().encode(msg);

  try {
    await uartRX.writeValue(data);
    alert("Horario enviado: " + msg);
  } catch (err) {
    alert("Error enviando horario");
  }
}
