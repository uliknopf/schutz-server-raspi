// proxyserver.js für Raspberrypi (localhost).
//als Zulieferer für Anfragen vom Internet, als Schutz für
//Node-red Server.
//GET liefert unter meinURL die Daten
//nur 1  request-Anfrage pro Sekunde erlaubt.
// falsche Anfragen -> IP Adresse wird "verbannt".

//Benötigte Module http und fs 
const http = require('http');
// Zur Dateischreibung
const fs=require('fs');
//Datei schwarzeListe
const ipdatei= './blacklist.txt';

//prüft ob Datei schwarzeListe existiert und legt sie bei Bedarf neu an
fs.stat(ipdatei, (err, stat) => {
	if (err) {
		fs.open(ipdatei, 'w', function (err, file) {
			if (err) throw err;
		}); 
	}
});
//Funktion:  IP-Adressen, die ignoriert werden sollen, in Datei schreiben
async function appendToFile(data) { 
	try {
		await fs.promises.appendFile(ipdatei, data, { flag: 'a' });
	} catch (error) {
		console.error(`Fehlermeldung: {error.message}`);
	}
}
//Daten, werden von node-red angefordert ,
// oder hier die eigenen Daten bereitstellen
async function fetchy(){
	try{
		let response = await fetch('http://127.0.0.1:1880/daten');
		let result = await response.text();
		return result;
	}catch (error){
		return 'Probleme mit den Daten'
	}
}
//leeres Objekt erstellen, um den Zeitpunkt einer Server-Anfrage zu speichern
const ipZeitinfo = {};
// leeres Objekt erstellen, um "böse" IP-Adresse zu markieren
const ipBanList = {};
// Zeitintervall definieren
const timeFrame = 1000; // 1 Sekunde

const server = http.createServer((req, res) => {
	// IP-Adresse ermitteln
	const ipAddress = req.socket.remoteAddress;
	// Zeitmessung beginnen
	const zeit = new Date();
	const now = zeit.getTime();
	// Checke API-Methode und URL
	if (req.method === 'GET' && req.url === '/meinURL' ) {
		// Checke, ob IP-Adresse schon als "böse" gemeldet ist
		// oder ob mehr als einmal pro Sekunde ein Request gestellt wurde
		if (ipZeitinfo[ipAddress] && ((now - ipZeitinfo[ipAddress] < timeFrame)||ipBanList[ipAddress])) {
			//setze IP-Banned-Liste auf true
			ipBanList[ipAddress] = true;
			// Die Antwort des Servers an den "bösen" - Daten liefern
			res.statusCode = 403;// Verboten
			res.end('NoNo');
		} else {
			// Update Zeitmessung des letzten Requests
			ipZeitinfo[ipAddress] = now;
			//Die Antwort des Servers an den "guten" - Daten liefern
			fetchy().then(databaseAnswer=>{
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(databaseAnswer);
			});
		}
	} else if (req.method === 'GET' && req.url === '/unsagbarSchwereURL'){ //Abbruchbedingung des Servers
		server.close();
		res.statusCode = 200; // beenden
		res.end('ByeBye');
	}else { // alle anderen Anfragen sind falsch und zu ignorieren
		ipBanList[ipAddress] = true;
		// ZeitStempel erstellen
		const zeitString=zeit.toString();
		// Text erstellen, der in die Datei SchwarzeListe geschrieben wird
		const listContent = ipAddress+", "+zeitString+", "+req.method+", "+req.url+"\n";
		// in die Datei schreiben
		appendToFile(listContent);
		// Sicherheits-Schutzmaßnahme: Server beendet Dienst, wenn
		//die Datei zu groß wird (ca. 100 IP-Einträge)
		let stat=fs.statSync(ipdatei);
		if (stat.size>10000){server.close();} //Abbruchbedingung 
		res.writeHead(403,{'Content-Type':'text/plain'});
		res.end('NoNo');
	}
});
const port = 9000;
server.listen(port, () => {
console.log(`Server läuft auf Port: ${port}`);
});