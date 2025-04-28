from netvars import setNetVar, getNetVar, http_get, initNet
initNet("iPhone Anna", "annaaaaa")

#user01

setNetVar("planteam-user01-username", "Anna")
setNetVar("planteam-user01-log1", "placeholder")
setNetVar("planteam-user01-log2", "placeholder")
setNetVar("planteam-user01-log3", "placeholder")
setNetVar("planteam-user01-plantbox", "plantbox01")
setNetVar("planteam-user01-coaster", "coaster01")

#user02

setNetVar("planteam-user02-username", "Kathrin")
setNetVar("planteam-user02-log1", "placeholder")
setNetVar("planteam-user02-log2", "placeholder")
setNetVar("planteam-user02-log3", "placeholder")
setNetVar("planteam-user02-plantbox", "plantbox01")
setNetVar("planteam-user02-coaster", "coaster02")

#plantbox01

setNetVar("planteam-plantbox01-owner", "placeholder")
setNetVar("planteam-plantbox01-ping1", "placeholder")
setNetVar("planteam-plantbox01-ping2", "placeholder")
setNetVar("planteam-plantbox01-moisture", "")
setNetVar("planteam-plantbox01-tank", "placeholder")
setNetVar("planteam-plantbox01-wateringPermission", "placeholder")
setNetVar("planteam-plantbox01-waterer", "placeholder")
setNetVar("planteam-plantbox01-tankMin", "placeholder")

#coaster01
setNetVar("planteam-coaster01-owner", "user01")
setNetVar("planteam-coaster01-plantbox", "plantbox01")

#coaster02
setNetVar("planteam-coaster02-owner", "user02")
setNetVar("planteam-coaster02-plantbox", "plantbox02")

 

