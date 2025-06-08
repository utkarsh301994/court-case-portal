
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
document.getElementById("caseForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const values = [
      
      formData.get("caseNo"),
      formData.get("filingDate"),
      formData.get("petitioner"),
      formData.get("opponent"),
      formData.get("section"),
      formData.get("officer"),
      formData.get("mouza"),
      formData.get("khatian"),
      formData.get("jl"),
      formData.get("dag"),
      formData.get("area"),
      formData.get("nextDate"),
      formData.get("advocate")
    ];

    const tbody = document.querySelector("#caseTable tbody");
    const tr = document.createElement("tr");

    values.forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
    form.reset(); // Clear form
  });
