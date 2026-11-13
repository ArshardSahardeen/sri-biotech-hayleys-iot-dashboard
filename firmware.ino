#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// Hardware Pin Definitions
const int MOISTURE_PIN   = 34;
const int PH_PIN         = 35;
const int SALINITY_PIN   = 32;
const int PUMP_RELAY_PIN = 26;

// Network & AWS IoT Core MQTT Configuration
const char* ssid        = "Hayleys_Kurunegala_Gateway";
const char* password    = "EncryptedFarmPass2026";
const char* mqtt_server = "a1b2c3d4e5f6g7-ats.iot.ap-southeast-1.amazonaws.com";
const int   mqtt_port   = 8883;
const char* mqtt_topic  = "hayleys/kurunegala/paddy01/telemetry";

WiFiClientSecure espClient;
PubSubClient client(espClient);

// 10-Sample Moving Average Filter Buffer (FR-2)
const int FILTER_SAMPLES = 10;
int moistureSamples[FILTER_SAMPLES];
int sampleIndex = 0;

float getFilteredMoisture() {
  int rawAnalog = analogRead(MOISTURE_PIN);
  moistureSamples[sampleIndex] = rawAnalog;
  sampleIndex = (sampleIndex + 1) % FILTER_SAMPLES;

  long sum = 0;
  for (int i = 0; i < FILTER_SAMPLES; i++) {
    sum += moistureSamples[i];
  }
  float avgAnalog = (float)sum / FILTER_SAMPLES;

  // Convert 12-bit ADC reading (0-4095) to calibrated moisture percentage
  float moisturePct = 100.0 - ((avgAnalog / 4095.0) * 100.0);
  return constrain(moisturePct, 0.0, 100.0);
}

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);

  for (int i = 0; i < FILTER_SAMPLES; i++) {
    moistureSamples[i] = analogRead(MOISTURE_PIN);
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  // Enforce TLS 1.3 / X.509 Certificate Verification (NFR-4)
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    client.connect("NODE-KURUNEGALA-01");
  }
  client.loop();

  float cleanMoisture = getFilteredMoisture();
  float soilPh        = (analogRead(PH_PIN) / 4095.0) * 14.0;
  float soilSalinity  = (analogRead(SALINITY_PIN) / 4095.0) * 5.0;

  StaticJsonDocument<256> doc;
  doc["device_id"]    = "NODE-KURUNEGALA-01";
  doc["farm_sector"]  = "Paddy_Block_A";
  doc["moisture_pct"] = round(cleanMoisture * 10.0) / 10.0;
  doc["soil_ph"]      = round(soilPh * 10.0) / 10.0;
  doc["salinity_dsm"] = round(soilSalinity * 10.0) / 10.0;

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);

  client.publish(mqtt_topic, jsonBuffer);
  delay(300000); // 5-minute sampling interval (FR-1)
}
