// Job Class
class Job {
    constructor(jobTitle, jobType, jobLevel, jobSkills, jobPosted, jobDetails) {
        this.jobTitle = jobTitle;
        this.jobType = jobType;
        this.jobLevel = jobLevel;
        this.jobSkills = jobSkills;
        this.jobPosted = jobPosted;
        this.jobDetails = jobDetails;
    }

    
    getDetails() {
        return `
        <strong>Title:</strong> ${this.jobTitle} <br>
        <strong>Type:</strong> ${this.jobType} <br>
        <strong>Level:</strong> ${this.jobLevel} <br>
        <strong>Skills:</strong> ${this.jobSkills.join(", ")} <br>
        <strong>Posted:</strong> ${this.jobPosted} <br>
        <strong>Details:</strong> ${this.jobDetails}
        `;
    }
}

// Global Variables
let jobData = [];
const jobContainer = document.getElementById("jobListings");
const errorContainer = document.getElementById("errorMessages");

// Load JSON Data
document.getElementById("fileInput").addEventListener("change", (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
            try {
                const parsedData = JSON.parse(e.target.result);

                // Updated to match JSON structure
                jobData = parsedData.map(
                    (job) =>
                        new Job(
                            job["Title"], 
                            job["Type"], 
                            job["Level"], 
                            job["Skill"] ? job["Skill"].split(",") : [], 
                            job["Posted"], 
                            job["Details"]
                        )
                );
                populateDropdowns();
                renderJobs(jobData);
                errorContainer.textContent = ""; // Clear error messages
            } catch (err) {
                console.error("Error parsing JSON:", err);
                errorContainer.textContent = "Invalid JSON file. Please try again and upload a valid file.";
            }
        };
        fileReader.readAsText(uploadedFile);
    }
});


function populateDropdowns() {
    const typeDropdown = document.getElementById("typeFilter");
    const levelDropdown = document.getElementById("levelFilter");
    const skillDropdown = document.getElementById("skillFilter");

    const jobTypes = [...new Set(jobData.map((job) => job.jobType))];
    const jobLevels = [...new Set(jobData.map((job) => job.jobLevel))];
    const jobSkills = [...new Set(jobData.flatMap((job) => job.jobSkills))];

    populateFilterDropdown(typeDropdown, jobTypes);
    populateFilterDropdown(levelDropdown, jobLevels);
    populateFilterDropdown(skillDropdown, jobSkills);
}

// Display of jobs
function renderJobs(filteredJobData) {
    jobContainer.innerHTML = "";
    if (filteredJobData.length === 0) {
        jobContainer.textContent = "Found no jobs that match your criteria.";
        return;
    }
    filteredJobData.forEach((job) => {
        const jobElement = document.createElement("div");
        jobElement.classList.add("job");
        jobElement.innerHTML = `<h3>${job.jobTitle}</h3><p>${job.jobType} - ${job.jobLevel}</p>`;
        jobElement.addEventListener("click", () => {
            alert(job.getDetails());
        });
        jobContainer.appendChild(jobElement);
    });
}


document.getElementById("typeFilter").addEventListener("change", applyFilters);
document.getElementById("levelFilter").addEventListener("change", applyFilters);
document.getElementById("skillFilter").addEventListener("change", applyFilters);


function populateFilterDropdown(dropdown, items) {
    dropdown.innerHTML = `<option value="">All</option>`;
    items.forEach((item) => {
        const optionElement = document.createElement("option");
        optionElement.value = item;
        optionElement.textContent = item;
        dropdown.appendChild(optionElement);
    });
}

function applyFilters() {
    const selectedType = document.getElementById("typeFilter").value;
    const selectedLevel = document.getElementById("levelFilter").value;
    const selectedSkill = document.getElementById("skillFilter").value;

    const filteredJobs = jobData.filter((job) => {
        return (
            (selectedType === "" || job.jobType === selectedType) &&
            (selectedLevel === "" || job.jobLevel === selectedLevel) &&
            (selectedSkill === "" || job.jobSkills.includes(selectedSkill))
        );
    });

    renderJobs(filteredJobs);
}

// Sorting of jobs
document.getElementById("sortByTitle").addEventListener("click", () => {
    jobData.sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
    renderJobs(jobData);
});

document.getElementById("sortByTime").addEventListener("click", () => {
    jobData.sort((a, b) => parseJobPostedTime(b.jobPosted) - parseJobPostedTime(a.jobPosted));
    renderJobs(jobData);
});

function parseJobPostedTime(posted) {
    const [value, unit] = posted.split(" ");
    const timeMultiplier = unit.startsWith("minute") ? 1 : unit.startsWith("hour") ? 60 : 1440;
    return parseInt(value) * timeMultiplier;
}
