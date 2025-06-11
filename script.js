
const SHEET_ID = '17n3ZUF89kBzxGcrW5aLW3cK44wFOQuuuEfaOhkFXLDU'; // Replace with your actual Sheet ID
const SHEET_NAME = 'MP/C CASE';
const API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_NAME}`;
function addLandEntry() {
  const container = document.getElementById("landDetailsContainer");
  const newEntry = document.createElement("div");
  newEntry.classList.add("land-entry");
  newEntry.innerHTML = `
    
    <input type="number" placeholder="Khatian No." name="khatian[]" min="0">
    <input type="number" placeholder="JL No." name="jl[]" min="0" required>
    <input type="number" placeholder="Dag No." name="dag[]" min="0" required>
    <input type="number" step="0.01" placeholder="Area" name="area[]" min="0">
  `;
  container.appendChild(newEntry);
}

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
  
    const filingDate = formData.get("filingDate");
    const nextDate = formData.get("nextDate");
    const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

    const caseNo = formData.get("caseNo").trim();
    const khatians = formData.getAll("khatian[]");
    const jls = formData.getAll("jl[]");
    const dags = formData.getAll("dag[]");
    const areas = formData.getAll("area[]");
  
    const tbody = document.querySelector("#caseTable tbody");
    const existingRows = tbody.querySelectorAll("tr");
    const errors = [];
    
    // ✅ 1. Case No. should be unique
    for (let row of existingRows) {
      const existingCaseNo = row.children[0]?.textContent.trim();
      if (existingCaseNo === caseNo) {
        errors.push(`Duplicate Case No: ${caseNo} already exists.`);
        break;
      }
    }

    // ✅ 2. Filing Date must be today's date
    //if (filingDate !== today) {
     // errors.push(`Filing Date must be today's date: ${today}`);
   // }

    // ✅ 3. Next Date must be after Filing Date
    if (nextDate && new Date(nextDate) <= new Date(filingDate)) {
      errors.push(`Next Date must be after Filing Date.`);
    }
    for (let i = 0; i < dags.length; i++) {
        // ✅ 4. JL No + Dag No must be unique combination
        for (let row of existingRows) {
          const existingJL = row.children[8]?.textContent.trim();
          const existingDag = row.children[9]?.textContent.trim();
          if (existingJL === jls[i] && existingDag === dags[i]) {
            errors.push(`Combination of JL No. ${jls[i]} and Dag No. ${dags[i]} already exists.`);
            break;
          }
        }
  
        // Optional basic type checks
        //const area = formData.get("area");
        //if (area && (isNaN(area) || area < 0)) {
        //  errors.push("Area must be a positive number.");
        //}
    
        if (errors.length > 0) {
          alert(errors.join("\n"));
          return;
        }
      
      
       // ✅ Passed all checks — now insert
        const values = [
          caseNo,
          filingDate,
          formData.get("petitioner"),
          formData.get("opponent"),
          formData.get("section"),
          formData.get("officer"),
          formData.get("mouza"),
          khatians[i],
          jls[i],
          dags[i],
          areas[i],
          nextDate,
          formData.get("advocate")
        ];
  
    
        //const tbody = document.querySelector("#caseTable tbody");
        const tr = document.createElement("tr");
    
        values.forEach(val => {
          const td = document.createElement("td");
          td.textContent = val;
          tr.appendChild(td);
        });
  
        tbody.appendChild(tr);
    }
    form.reset(); // Clear form
    document.getElementById("landDetailsContainer").innerHTML = `
    <div class="land-entry">
      <input type="text" name="mouza[]" placeholder="Mouza" required>
      <input type="text" name="khatian[]" placeholder="Khatian No." required>
      <input type="text" name="jl[]" placeholder="JL No." required>
      <input type="text" name="dag[]" placeholder="Dag No." required>
    </div>`;
  });
