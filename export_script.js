import fs from "fs";
import Papa from "papaparse";
import { defaultFigures } from "./src/data/figures.js"; // Needs to be compiled or run with tsx/vite-node

const headers = ["id", "name", "title", "category", "socialLink", "featured", "slug", "story", "publishedDate", "imageUrl"];

const csv = Papa.unparse({
  fields: headers,
  data: defaultFigures
});

fs.writeFileSync("data_awal_mekarhub.csv", csv);
console.log("File data_awal_mekarhub.csv berhasil dibuat!");
