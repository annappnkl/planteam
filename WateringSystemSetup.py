from machine import Pin, ADC, PWM
import time
from time import sleep
from netvars import setNetVar, getNetVar, http_get, initNet
initNet("iPhone Anna", "annaaaaa")

analogPin = ADC(0)
ledWateringRequired = Pin(14, Pin.OUT)
global wateringRequired
waterPump = Pin(5, Pin.OUT)

def wateringRequirement():
    moistureVal = analogPin.read()
    setNetVar("planteam-plantbox01-moisture", moistureVal)
    print(analogVal)
    if moistureVal>500:
      ledWateringRequired(1)
      waterPump(0)
      setNetVar("planteam-plantbox01-wateringPermission", True)
    else:
      wateringRequired = 0
      ledWateringRequired(0)
      waterPump(1)
      setNetVar("planteam-plantbox01-wateringPermission", False)

while True:
  wateringRequirement()
  sleep(2)



