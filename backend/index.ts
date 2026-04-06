import { createServer } from "http";

import app from "./src/server";

const httpServer = createServer(app);

httpServer.listen(7711, () => {
  console.log(`Server is running on port ${7711}`);
});
