// === UUIDS BLE (de tu ESP32) ===
const SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const RX_CHAR_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"; // APP → ESP32
const TX_CHAR_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"; // ESP32 → APP

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


// ==== 1) Conectar BLE ====
async function conectarBluetooth() {
  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ name: "DispensadorBT" }],
      optionalServices: [SERVICE_UUID]
    });

    server = await device.gatt.connect();
    uartService = await server.getPrimaryService(SERVICE_UUID);
    uartRX = await uartService.getCharacteristic(RX_CHAR_UUID);

    conectado = true;
    statusLabel.innerText = "Estado: Conectado ✔";

  } catch (error) {
    console.error(error);
    statusLabel.innerText = "Error al conectar";
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


// ==== 3) Enviar horario (HH-MM) ====
async function enviarHorario() {
  if (!conectado) return alert("Primero conecta al ESP32");

  const hora = document.getElementById("hora").value;

  if (!hora) return alert("Selecciona un horario");

  const msg = hora.replace(":", "-");
  const data = new TextEncoder().encode(msg);

  try {
    await uartRX.writeValue(data);
    alert("Horario enviado: " + msg);
  } catch (err) {
    alert("Error enviando horario");
  }
}
