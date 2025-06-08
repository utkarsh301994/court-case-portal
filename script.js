
const SHEET_ID = '17n3ZUF89kBzxGcrW5aLW3cK44wFOQuuuEfaOhkFXLDU'; // Replace with your actual Sheet ID
const SHEET_NAME = 'MP/C CASE';
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_NAME}`;

fetch(API_URL)
  .then(res => res.text())
  .then(rep => {
    const json = JSON.parse(rep.substr(47).slice(0, -2));
    const table = document.querySelector("#caseTable tbody");
    const rows = json.table.rows;

    rows.forEach(row => {
      const tr = document.createElement("tr");
      row.c.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell ? cell.v : "";
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
  });
    const filters = document.querySelectorAll("thead input");

    filters.forEach((input, colIndex) => {
      input.addEventListener("keyup", () => {
        const table = document.querySelector("#caseTable");
        const tbody = table.querySelector("tbody");
        const rows = tbody.querySelectorAll("tr");

        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          let show = true;

          filters.forEach((filterInput, i) => {
            const filterVal = filterInput.value.toLowerCase().trim();
            const cellText = (cells[i]?.textContent || "").toLowerCase();

            if (filterVal && !cellText.includes(filterVal)) {
              show = false;
            }
          });

          row.style.display = show ? "" : "none";
        });
      });
    });

