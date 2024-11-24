const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

// Middlewares
server.use(middlewares);

// Rota para o JSON Server
server.use("/api", router);

// Rota estática para o frontend
const express = require("express");
server.use(express.static("public"));

// Start do servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`JSON Server está rodando na porta ${PORT}`);
});