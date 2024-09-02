# schutz-server-raspi
Eigener vorgelagerter Server mit Node.js, zum Schutz des Node-RED-Servers auf dem Raspberrypi.<br>
### Du verwendest Node-RED auf dem Raspberrypi für Sensoren im Haus und möchtest ab und zu auch von außerhalb des lokalen Netzwerkes auf den Node-RED-Server zugreifen? ###
Zur Übung soll mit internen Modulen ein HTTP-Server erstellt werden, der die Zeitdifferenz zweier Server-Anfragen von gleicher IP-Adresse ermittelt und bei Unterschreitung des zeitlichen Abstandes, die gewünschte Antwort (Resource) verweigert. Es werden Anfragen, die nicht der GET-Methode und der URL='/meinURL' entspricht, auf die schwarze Liste gesetzt. Die schwarze Liste wird in eine Datei geschrieben und gilt als Log-Datei. Wenn eine Anfrage die Bedingungen erfüllt, werden mit dem Fetch-Befehl vom Node-Red-Server Daten abgerufen und der Anfrage als Antwort zurückgesendet. Somit schütze ich meinen Node-Red-Server vor direkten Zugriff von außerhalb des eigenen Netzwerkes.
Zusammenfassend kann man sagen:
1. zu schnelle Anfragen hintereinander werden gebremst und
2. falsche URL-Anfragen werden in die schwarze Liste geschrieben (geloggt).<br>

Interessant zu beobachten ist die Tatsache, daß die Schwarze Liste , die der Server anlegt (gebannte IP-Adressen), in der Woche um ca. 4 IP-Adressen anwächst. Im Internet kann man Infos zu diesen IP-Adressen bekommen [link Website criminalip][1]. Diese IP-Adressen sind wenig vertrauenserweckend, unabhängig vom Land (USA, China, Niederlande, England, Japan, ...).<br>
Das Projekt ist nicht für den Einsatz in der Produktion gedacht, es ist nur für die Entwicklung gedacht, als Lehre und zum Ausprobieren wie ein Http-Server funktioniert.<br>

![Infos zur IP-Adresse](./ipInfo.png)

[1]: https://www.criminalip.io/
