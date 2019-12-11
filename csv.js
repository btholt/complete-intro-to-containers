const fs = require("fs").promises;
const path = require("path");
const fm = require("front-matter");
const mdDir = process.env.MARKDOWN_DIR || path.join(__dirname, "lessons/");
const outputPath =
  process.env.OUTPUT_FILE || path.join(__dirname, "public/lessons.csv");

async function createCsv() {
  console.log(`making the markdown files into a CSV from ${mdDir}`);

  // get paths
  const allFiles = await fs.readdir(mdDir);
  const files = allFiles.filter(filePath => filePath.endsWith(".md"));

  // read paths, get buffers
  const buffers = await Promise.all(
    files.map(filePath => fs.readFile(path.join(mdDir, filePath)))
  );

  // make buffers strings
  const contents = buffers.map(content => content.toString());

  // make strings objects
  let frontmatters = contents.map(fm);

  // find all attribute keys
  const seenAttributes = new Set();
  frontmatters.forEach(item => {
    Object.keys(item.attributes).forEach(attr => seenAttributes.add(attr));
  });
  const attributes = Array.from(seenAttributes.values());

  if (attributes.includes("order")) {
    frontmatters = frontmatters.sort(
      (a, b) => a.attributes.order - b.attributes.order
    );
  }

  // get all data into an array
  let rows = frontmatters.map(item => {
    const row = attributes.map(attr =>
      item.attributes[attr] ? JSON.stringify(item.attributes[attr]) : ""
    );
    return row;
  });

  // header row must be first row
  rows.unshift(attributes);

  // join into CSV string
  const csv = rows.map(row => row.join(",")).join("\n");

  // write file out
  await fs.writeFile(outputPath, csv);

  console.log(`Wrote ${rows.length} rows to ${outputPath}`);
}

createCsv();
