const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const {WebhookClient} = require('dialogflow-fulfillment');
const axios = require("axios");
const port = process.env.PORT || 3000;

// for parsing json
app.use(
  bodyParser.json({
    limit: "20mb",
  })
);
// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: "20mb",
  })
);
// connection with dialogflow
app.post("/webhook", express.json() ,function (req, res) {
  const agent = new WebhookClient({ request:req, response:res });
  console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
// Response to: intent to consult (ConsultarNumero)
  async function ConsultarDBTel(agent){
    let phoneNumber = agent.parameters["phoneNumber"];
    let answer = await axios.get("https://sheet.best/api/sheets/343fc56d-7c0c-4682-babc-45c80aedd5a4/phoneNumber/"+ phoneNumber);
    let phones = answer.data;
    if (phones.length>0){
      	let telefono = phones[0];
      	agent.add("⚠️ El número que ingresaste se encuentra:\n"+telefono.Estado+"\n🗓️Fecha del reporte:\n"+telefono.FechaReporte+"\n🔍Razón del reporte:\n"+telefono.RazonDelReporte);
      	agent.add("Te recomiendo no compartir tú información personal, debido a que el número telefónico que consultaste presenta reportes.\n Cuidate 🤗 ");
    }	else{
      agent.add("El número que ingresaste no tiene ningún reporte");
      agent.add("¿Quieres reportar el número?")
    }
  }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('ConsultarNumero', ConsultarDBTel);
  agent.handleRequest(intentMap);
});

app.use("/messenger", require("./Facebook/facebookBot"));

//server running
app.get("/", (req, res) => {
  return res.send("Chatbot Funcionando 🤖🤖🤖");
});

app.listen(port, () => {
  console.log(`Escuchando peticiones en el puerto ${port}`);
});
