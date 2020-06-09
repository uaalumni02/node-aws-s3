import express from "express";
import "dotenv/config";
import cors from "cors";
const app = express();
const { log, error } = console;

const port = process.env.PORT || 3000;
const router = express.Router();

//import routes
import profile from './api/profile';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware to utilize routes
router.use("/file", profile);

app.use("/api", router);

app.listen(port, () => log("server is running"));
export default app;
