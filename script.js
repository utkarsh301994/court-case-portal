const supabaseUrl = 'https://lrllzxsiavbqdksvxlao.supabase.co'; // your URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybGx6eHNpYXZicWRrc3Z4bGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4ODcyMDYsImV4cCI6MjA2NTQ2MzIwNn0._vP4HPl3Jl49kMXMxzgCdVIa2NAwuKUTolCMRIOATQM'; // your anon key
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);


function addLandEntry() {
  const container = document.getElementById("landDetailsContainer");
  const newEntry = document.createElement("div");
  newEntry.classList.add("land-entry");
  newEntry.innerHTML = `
      <input type="text" placeholder="JL No." name="jl[]" required>
      <input type="text" placeholder="Dag No." name="dag[]" required>
      <input type="text" placeholder="Khatian No." name="khatian[]" >
      <input type="text" placeholder="Area" name="area[]" >
  `;
  container.appendChild(newEntry);
}

async function loadCases() {
  const { data, error } = await supabaseClient
    .from('cases') // your table name
    .select('*');

  if (error) {
    console.error('Error fetching data:', error.message);
    return;
  }

  const tbody = document.querySelector("#caseTable tbody");
  tbody.innerHTML = ""; // Clear existing rows if any

  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.case_no || ""}</td>
      <td>${row.section || ""}</td>
      <td>${row.petitioner || ""}</td>
      <td>${row.respondent || ""}</td>
      <td>${row.filing_date || ""}</td>
      <td>${row.next_date || ""}</td>
      <td>${row.advocate || ""}</td>
      <td>${row.officer || ""}</td>
      <td>${row.mouza || ""}</td>
      <td>${row.jl_no || ""}</td>
      <td>${row.dag_no || ""}</td>
      <td>${row.khatian || ""}</td>
      <td>${row.area || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

loadCases(); // Call on page load
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
document.getElementById("caseForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
  
    const filing_date = formData.get("filing_date");
    const next_date = formData.get("next_date");
    const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'
    const section = formData.get("section");
    const petitioner = formData.get("petitioner");
    const respondent = formData.get("respondent");
    const advocate = formData.get("advocate");
    const officer = formData.get("officer");
    const mouza = formData.get("mouza");
    const case_no = formData.get("case_no").trim();
    const khatians = formData.getAll("khatian[]");
    const jls = formData.getAll("jl[]");
    const dags = formData.getAll("dag[]");
    const areas = formData.getAll("area[]");
  
    const { data: existingCases, error: fetchError } = await supabase
      .from("cases")
      .select("case_no")
      .eq("case_no", case_no);
    
    if (fetchError) {
      console.error("Error checking for duplicate case:", fetchError.message);
      alert("Could not verify if case already exists.");
      return;
    }
    
    if (existingCases.length > 0) {
      alert(`Duplicate Case No: ${case_no} already exists in database.`);
      return;
    }

    // ✅ 2. Filing Date must be today's date
    //if (filing_date !== today) {
     // errors.push(`Filing Date must be today's date: ${today}`);
   // }

    // ✅ 3. Next Date must be after Filing Date
    if (next_date && new Date(next_date) <= new Date(filing_date)) {
      errors.push(`Next Date must be after Filing Date.`);
    }
    for (let i = 0; i < dags.length; i++) {
        const jl = jls[i].trim();
        const dag = dags[i].trim();
        const area = areas[i].trim();
        const khatian = khatians[i].trim();
        // Check in Supabase if this JL+Dag combo already exists
        const { data: duplicateRows, error: checkError } = await supabaseClient
          .from("cases")
          .select("id")
          .eq("jl_no", jl)
          .eq("dag_no", dag);
      
        if (checkError) {
          console.error("Supabase check error:", checkError);
          errors.push("Error checking JL No. and Dag No. uniqueness.");
        } else if (duplicateRows.length > 0) {
          errors.push(`Combination of JL No. ${jl} and Dag No. ${dag} already exists in database.`);
        }
      
        if (errors.length > 0) {
          alert(errors.join("\n"));
          return;
        }
  
        // Optional basic type checks
        //const area = formData.get("area");
        //if (area && (isNaN(area) || area < 0)) {
        //  errors.push("Area must be a positive number.");
        //}
    
        
      
      
       // 🔽 INSERT INTO SUPABASE
        const { data, error } = await supabaseClient.from("cases").insert([
          {
            case_no: case_no,
            section: section,
            petitioner: petitioner,
            opponent: respondent,
            filing_date: filing_date,
            next_date: next_date,
            advocate: advocate,
            officer: officer,
            mouza: mouza,
            khatian_no: khatian,
            jl_no: jl,
            dag_no: dag,
            area: area,
          }
        ]);
    
        if (error) {
          console.error("Insertion error:", error.message);
          alert("Failed to add case: " + error.message);
          return;
        }
      }
    alert("Case(s) added successfully!");
    form.reset(); // Clear form
    document.getElementById("landDetailsContainer").innerHTML = `
    <div class="land-entry">
      <input type="text" name="jl[]" placeholder="JL No." required>
      <input type="text" name="dag[]" placeholder="Dag No." required>
      <input type="text" name="khatian[]" placeholder="Khatian No.">
      <input type="text" placeholder="Area" name="area[]">
    </div>`;
  loadCases(); // Refresh the table
  });
