const tasks = [
    
];

function generateTaskList() {
    const taskListElement = document.getElementById("task-list");
    taskListElement.innerHTML = ''; // Clear the list before regenerating

    tasks.forEach(task => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description.split('.')[0]}...</p>
            <button onclick="showDetails(${task.id})">Details ${task.id}</button>
        `;
        taskListElement.appendChild(taskElement);
    });
}

function showDetails(taskId) {
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) {
        alert("Task not found!");
        return; //Stop execution if task is not found
    }
    document.getElementById("taskTitle").textContent = task.title;
    document.getElementById("taskDescription").textContent = task.description;
    document.getElementById("taskAchieved").checked = task.achieved === 1; // reflect achieved status
    document.getElementById("taskAchieved").value = task.id; //Store the task id for the button
    document.getElementById("taskId").value = task.id; //Store the task id for the button
}


function toggleEdit() {
    const title = document.getElementById("taskTitle");
    const description = document.getElementById("taskDescription");
    const editButton = document.getElementById("editButton");
    const taskId = document.getElementById("taskId").value;
    const achievedCheckbox = document.getElementById("taskAchieved");

    if (editButton.textContent === "Edit") {
        title.contentEditable = "true";
        title.style.border = "1px solid #00d9ff";
        title.style.padding = "5px";
        description.contentEditable = "true";
        description.style.border = "1px solid #00d9ff";
        description.style.padding = "5px";
        achievedCheckbox.style.display = 'inline-block'; // Show the checkbox
        editButton.textContent = "Submit";
    } else {
        title.contentEditable = "false";
        title.style.border = "none";
        title.style.padding = "0";
        description.contentEditable = "false";
        description.style.border = "none";
        description.style.padding = "0";
        achievedCheckbox.style.display = 'none'; // Hide the checkbox after submit
        editButton.textContent = "Edit";
        // Send updated data to the server
        saveTaskChanges(taskId);

    }
}

async function saveTaskChanges(taskId) {
    const title = document.getElementById("taskTitle").textContent;
    const description = document.getElementById("taskDescription").textContent;
    const achieved = document.getElementById("taskAchieved").checked ? 1 : 0;

    try {
        const response = await fetch('script.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'edit', id: taskId, title, description, achieved })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            // Refresh the task list (optional, but good for updating the UI)
            fetchTasks();

        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error saving task changes:", error);
        alert("An error occurred while saving task changes.");
    }
}

async function deleteTask() {
    const taskId = document.getElementById("taskId").value; // Ensure this gets the correct task ID
    if (confirm("Are you sure you want to delete this task?")) {
        try {
            const payload = { action: 'delete', id: taskId }; // Include 'action' field
            const response = await fetch('script.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) // Ensure payload is serialized correctly
            });

            // Debug the raw response to catch issues
            const rawText = await response.text();
            console.log("Raw Response:", rawText);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = JSON.parse(rawText); // Parse response
            if (data.success) {
                alert(data.message);
                fetchTasks(); // Refresh the task list
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("An error occurred while deleting the task.");
        }
    }
}

async function toggleAchieved() {
    const taskId = document.getElementById("taskId").value;
    const achieved = document.getElementById("taskAchieved").checked ? 1 : 0;
    try {
        const response = await fetch('script.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggleAchieved', id: taskId, achieved })
        });
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            fetchTasks();// refresh task list
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error toggling achieved status:', error);
        alert('An error occurred while toggling achieved status.');
    }
}

async function fetchTasks() {
    try {
        const response = await fetch('script.php');
        const data = await response.json();
        tasks.length = 0; //clear the array before adding new data
        tasks.push(...data);
        generateTaskList();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        alert("An error occurred while fetching tasks.");
    }
    console.log(tasks);
}

document.addEventListener("DOMContentLoaded", fetchTasks);
