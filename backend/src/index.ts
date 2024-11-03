import server from "./server";

server.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT} 🚀 || http://localhost:${process.env.PORT}`
  );
});
