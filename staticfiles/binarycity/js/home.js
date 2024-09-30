
// Function to toggle form visibility
function toggleForm(formId) {
    var form = document.getElementById(formId);
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block";
    } else {
        form.style.display = "none";
    }
}

function openTab(evt, tabName) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function generateClientCode(name) {
    const words = name.split(' ');
    let code = '';
    words.forEach(word => {
        code += word[0].toUpperCase();
    });
    code += Math.floor(1000 + Math.random() * 9000);
    return code;
}

function updateClientCode() {
    const nameInput = document.getElementById('clientName');
    const codeInput = document.getElementById('clientCode');
    codeInput.value = generateClientCode(nameInput.value);
}

function submitClientForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/create_client/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            addClientToTable(data);
            toggleForm('clientForm');
            event.target.reset();
            populateClientDropdown();
        }
    });
}

function submitContactForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/create_contact/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            addContactToTable(data);
            toggleForm('contactForm');
            event.target.reset();
        }
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

let clientSortColumn = 'name';
let clientSortDirection = 'asc';
let contactSortColumn = 'name';
let contactSortDirection = 'asc';

function loadClients() {
    fetch(`/get_clients/?sort=${clientSortColumn}&direction=${clientSortDirection}`)
        .then(response => response.json())
        .then(clients => {
            const tableBody = document.querySelector('#clientTable tbody');
            const tableHead = document.querySelector('#clientTable thead');
            tableBody.innerHTML = '';
            tableHead.innerHTML = `
                <tr>
                    <th onclick="sortClients('name')" style="cursor: pointer;">Name ${getSortIndicator('name', clientSortColumn, clientSortDirection)}</th>
                    <th onclick="sortClients('client_code')">Client Code ${getSortIndicator('client_code', clientSortColumn, clientSortDirection)}</th>
                    <th onclick="sortClients('linked_contacts')">No. of Linked Contacts ${getSortIndicator('linked_contacts', clientSortColumn, clientSortDirection)}</th>
                    <th>Action</th>
                </tr>
            `;
            clients.forEach(client => addClientToTable(client));
        });
}

function sortClients(column) {
    if (column === clientSortColumn) {
        clientSortDirection = clientSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        clientSortColumn = column;
        clientSortDirection = 'asc';
    }
    loadClients();
}


function loadContacts() {
    fetch(`/get_contacts/?sort=${contactSortColumn}&direction=${contactSortDirection}`)
        .then(response => response.json())
        .then(contacts => {
            const tableBody = document.querySelector('#contactTable tbody');
            const tableHead = document.querySelector('#contactTable thead');
            tableBody.innerHTML = '';
            tableHead.innerHTML = `
                <tr>
                    <th onclick="sortContacts('name')">Name ${getSortIndicator('name', contactSortColumn, contactSortDirection)}</th>
                    <th onclick="sortContacts('surname')">Surname ${getSortIndicator('surname', contactSortColumn, contactSortDirection)}</th>
                    <th onclick="sortContacts('email')">Email Address ${getSortIndicator('email', contactSortColumn, contactSortDirection)}</th>
                    <th onclick="sortContacts('linked_clients')">No. of Linked Clients ${getSortIndicator('linked_clients', contactSortColumn, contactSortDirection)}</th>
                    <th>Action</th>
                </tr>
            `;
            contacts.forEach(contact => addContactToTable(contact));
        });
}

function sortContacts(column) {
    if (column === contactSortColumn) {
        contactSortDirection = contactSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        contactSortColumn = column;
        contactSortDirection = 'asc';
    }
    loadContacts();
}

function getSortIndicator(column, currentSortColumn, currentSortDirection) {
    if (column === currentSortColumn) {
        return currentSortDirection === 'asc' ? '▲' : '▼';
    }
    return '';
}


function addClientToTable(client) {
    const tableBody = document.querySelector('#clientTable tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${client.name}</td>
        <td>${client.client_code}</td>
        <td>${client.linked_contacts}</td>
        <td>
            <button onclick="editClient(${client.id}, this)">Edit</button>
            <button onclick="deleteClient(${client.id}, this)">Delete</button>
        </td>
    `;
}

function addContactToTable(contact) {
    const tableBody = document.querySelector('#contactTable tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.surname}</td>
        <td>${contact.email}</td>
        <td>${contact.linked_clients}</td>
        <td>
            <button onclick="editContact(${contact.id}, this)">Edit</button>
            <button onclick="deleteContact(${contact.id}, this)">Delete</button>
        </td>
    `;
}

function editClient(id, button) {
    const row = button.closest('tr');
    const cells = row.cells;
    const name = cells[0].innerText;
    const clientCode = cells[1].innerText;

    row.innerHTML = `
        <td><input type="text" value="${name}"></td>
        <td>${clientCode}</td>
        <td>${cells[2].innerText}</td>
        <td>
            <div class="edit-buttons">
                <button onclick="saveClientEdit(${id}, this)">Save</button>
                <button onclick="cancelEdit(this)">Cancel</button>
            </div>
        </td>
    `;
    row.classList.add('edit-mode');
}

function editContact(id, button) {
    const row = button.closest('tr');
    const cells = row.cells;
    const name = cells[0].innerText;
    const surname = cells[1].innerText;
    const email = cells[2].innerText;

    fetch(`/get_contact/${id}/`)
        .then(response => response.json())
        .then(contact => {
            row.innerHTML = `
                <td><input type="text" value="${name}"></td>
                <td><input type="text" value="${surname}"></td>
                <td><input type="email" value="${email}"></td>
                <td>
                    <select id="editContactClient">
                        <option value="">Select a client</option>
                    </select>
                </td>
                <td>
                    <div class="edit-buttons">
                        <button onclick="saveContactEdit(${id}, this)">Save</button>
                        <button onclick="cancelEdit(this)">Cancel</button>
                    </div>
                </td>
            `;
            row.classList.add('edit-mode');

            const clientDropdown = row.querySelector('#editContactClient');
            populateClientDropdown(clientDropdown, contact.client_id);
        });
}

function saveClientEdit(id, button) {
    const row = button.closest('tr');
    const name = row.cells[0].querySelector('input').value;
    const clientCode = row.cells[1].innerText;

    fetch(`/update_client/${id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name: name, client_code: clientCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.client_code}</td>
                <td>${data.linked_contacts}</td>
                <td>
                    <button onclick="editClient(${data.id}, this)">Edit</button>
                    <button onclick="deleteClient(${data.id}, this)">Delete</button>
                </td>
            `;
            row.classList.remove('edit-mode');
        }
    });
}

function saveContactEdit(id, button) {
    const row = button.closest('tr');
    const name = row.cells[0].querySelector('input').value;
    const surname = row.cells[1].querySelector('input').value;
    const email = row.cells[2].querySelector('input').value;
    const clientId = row.cells[3].querySelector('select').value;

    fetch(`/update_contact/${id}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ name, surname, email, client_id: clientId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.surname}</td>
                <td>${data.email}</td>
                <td>${data.linked_clients}</td>
                <td>
                    <button onclick="editContact(${data.id}, this)">Edit</button>
                    <button onclick="deleteContact(${data.id}, this)">Delete</button>
                </td>
            `;
            row.classList.remove('edit-mode');
        }
    });
}

function cancelEdit(button) {
    const row = button.closest('tr');
    row.classList.remove('edit-mode');
    if (row.closest('table').id === 'clientTable') {
        loadClients();
    } else {
        loadContacts();
    }
}

function deleteClient(id, button) {
    if (confirm('Are you sure you want to delete this client?')) {
        fetch(`/delete_client/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                button.closest('tr').remove();
                populateClientDropdown();
            }
        });
    }
}

function deleteContact(id, button) {
    if (confirm('Are you sure you want to delete this contact?')) {
        fetch(`/delete_contact/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                button.closest('tr').remove();
            }
        });
    }
}

function populateClientDropdown(dropdown = document.getElementById('contactClient'), selectedClientId = null) {
    fetch('/get_clients/')
        .then(response => response.json())
        .then(clients => {
            dropdown.innerHTML = '<option value="">Select a client</option>';
            clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                if (client.id === selectedClientId) {
                    option.selected = true;
                }
                dropdown.appendChild(option);
            });
        });
}

// Load clients and contacts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadClients();
    loadContacts();
    populateClientDropdown();
});
function addClientToTable(client) {
    const tableBody = document.querySelector('#clientTable tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${client.name}</td>
        <td>${client.client_code}</td>
        <td class="linked-info-cell" onclick="showLinkedContacts(${client.id})">${client.linked_contacts}</td>
        <td>
            <button onclick="editClient(${client.id}, this)">Edit</button>
            <button onclick="deleteClient(${client.id}, this)">Delete</button>
        </td>
    `;
}

function addContactToTable(contact) {
    const tableBody = document.querySelector('#contactTable tbody');
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.surname}</td>
        <td>${contact.email}</td>
        <td class="linked-info-cell" onclick="showLinkedClients(${contact.id})">${contact.linked_clients}</td>
        <td>
            <button onclick="editContact(${contact.id}, this)">Edit</button>
            <button onclick="deleteContact(${contact.id}, this)">Delete</button>
        </td>
    `;
}

function showLinkedContacts(clientId) {
    fetch(`/get_linked_contacts/${clientId}/`)
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Linked Contacts</h2>';
            if (data.contacts.length > 0) {
                content += `
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                data.contacts.forEach(contact => {
                    content += `
                        <tr>
                            <td>${contact.name}</td>
                            <td>${contact.surname}</td>
                            <td>${contact.email}</td>
                        </tr>
                    `;
                });
                content += '</tbody></table>';
            } else {
                content += '<p>No linked contacts found.</p>';
            }
            showPopup(content);
        });
}

function showLinkedClients(contactId) {
    fetch(`/get_linked_clients/${contactId}/`)
        .then(response => response.json())
        .then(data => {
            let content = '<h2>Linked Clients</h2>';
            if (data.clients.length > 0) {
                content += `
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Client Code</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                data.clients.forEach(client => {
                    content += `
                        <tr>
                            <td>${client.name}</td>
                            <td>${client.client_code}</td>
                        </tr>
                    `;
                });
                content += '</tbody></table>';
            } else {
                content += '<p>No linked clients found.</p>';
            }
            showPopup(content);
        });
}

function showPopup(content) {
    document.getElementById('popupContent').innerHTML = content;
    document.getElementById('popupOverlay').style.display = 'block';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}
   