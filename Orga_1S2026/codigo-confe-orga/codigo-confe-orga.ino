#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Adafruit_BMP085.h>

#define BUZZER  8
#define BOTON   7  

LiquidCrystal_I2C lcd(0x27, 16, 2);
Adafruit_BMP085 bmp;

unsigned long tiempoSaludo = 0;  // momento en que se presionó el botón
bool mostrandoSaludo = false;    // flag para saber si el saludo está activo

void setup() {
  pinMode(BUZZER, OUTPUT);
  pinMode(BOTON, INPUT_PULLUP);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("CONFERENCIA ORGA");
  lcd.setCursor(0, 1);
  lcd.print("    1S2026      ");

  tone(BUZZER, 1000); delay(200);
  noTone(BUZZER);     delay(100);
  tone(BUZZER, 1200); delay(200);
  noTone(BUZZER);

  delay(2000);

  if (!bmp.begin()) {
    lcd.clear();
    lcd.print("ERROR: BMP180");
    while (1);
  }

  lcd.clear();
}

void loop() {
  unsigned long ahora = millis();

  // Detectar botón presionado (LOW por INPUT_PULLUP)
  if (digitalRead(BOTON) == LOW && !mostrandoSaludo) {
    mostrandoSaludo = true;
    tiempoSaludo = ahora;
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(" Hola Estudiante");
    lcd.setCursor(0, 1);
    lcd.print(" Bienvenido! :) ");
  }

  // Pasados 5 segundos, volver a los datos del sensor
  if (mostrandoSaludo && (ahora - tiempoSaludo >= 5000)) {
    mostrandoSaludo = false;
    lcd.clear();
  }

  // Mostrar sensor solo si no hay saludo activo
  if (!mostrandoSaludo) {
    float temp = bmp.readTemperature();
    long  pres = bmp.readPressure();
    float alt  = bmp.readAltitude(101325);

    lcd.setCursor(0, 0);
    lcd.print("T:");
    lcd.print(temp, 1);
    lcd.print("C P:");
    lcd.print(pres / 100);
    lcd.print("hP");

    lcd.setCursor(0, 1);
    lcd.print("Alt: ");
    lcd.print(alt, 1);
    lcd.print(" m   ");

    delay(1500);
  }
}