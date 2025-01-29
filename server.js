import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT;

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

let cards = [];
let currentCard = {};

const fetchCards = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM cards", (err, res) => {
            if (err) {
                console.error("Error executing query", err.stack);
                reject(err);
            } else {
                cards = res.rows;
                resolve(cards);
            }
        });
    });
};

fetchCards().then(() => {
    console.log("Cards loaded");
});

async function nextCard() {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomCard = cards[randomIndex];
    currentCard = randomCard;

    cards.splice(randomIndex, 1);
}

app.get("/", async (req, res) => {
    const startCard = {
        pic: '/images/0.png',
        name: 'การ์ดเริ่มเกม',
        detail: 'กดที่การ์ดเพื่อเริ่มเล่น'
    };

    res.render("index.ejs", { card: startCard, remainingCards: cards.length });
});

app.get("/next-card", async (req, res) => {
    try {
        await nextCard();
        res.render("index.ejs", { card: currentCard, remainingCards: cards.length });
    } catch (err) {
        res.status(500).send("Error fetching next card.");
    }
});

app.get("/reset", async (req, res) => {
    try {
        await fetchCards();
        currentCard = {};
        await nextCard();
        res.render("index.ejs", {
            card: currentCard,
            remainingCards: cards.length
        });
    } catch (err) {
        res.status(500).send("Error resetting the deck.");
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
