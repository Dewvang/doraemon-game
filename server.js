import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config(); // เพิ่มการโหลดค่า .env

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

db.connect(err => {
    if (err) {
        console.error("Error connecting to database", err.stack);
    } else {
        console.log("Connected to database");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // ใช้ public folder สำหรับ static files

let cards = [];

// ดึงข้อมูลจากฐานข้อมูลและเก็บในตัวแปร cards
db.query("SELECT * FROM cards", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        cards = res.rows;
    }
    db.end(); // ปิดการเชื่อมต่อหลังจากดึงข้อมูลเสร็จ
});

// การแสดงผลข้อมูลในหน้า index.ejs
app.get("/", async (req, res) => {
    const card = await nextCard();
    res.render("index", { card });
});

// ฟังก์ชั่นที่จะเลือกการ์ดแบบสุ่ม
async function nextCard() {
    if (cards.length === 0) {
        return null; // หากยังไม่มีข้อมูลการ์ด
    }
    const randomcard = cards[Math.floor(Math.random() * cards.length)];
    return randomcard; // คืนค่าการ์ดที่สุ่มเลือก
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
