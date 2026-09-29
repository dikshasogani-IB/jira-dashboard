let allTickets = [];

let globalFilters = {
    status: "ALL",
    priority: "ALL",
    type: "ALL",
    assignee: "ALL"
};

let localFilters = {
    kpiStatus: "ALL",

    statusChart: "ALL",
    priorityChart: "ALL",
    typeChart: "ALL",
    assigneeChart: "ALL",

    recentStatus: "ALL",

    tableStatus: "ALL",
    tablePriority: "ALL",
    tableType: "ALL"
};

const chartColors = [
    "#4f81bd",
    "#e67e22",
    "#27ae60",
    "#9b59b6",
    "#e74c3c",
    "#16a085",
    "#34495e",
    "#f1c40f"
];


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    setupEventListeners();

    loadTickets();

});


// =====================================================
// LOAD TICKETS
// =====================================================

async function loadTickets() {

    try {

        const response = await fetch("/tickets");

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        allTickets = Array.isArray(data)
            ? data
            : (Array.isArray(data.tickets) ? data.tickets : []);

        console.log("Tickets loaded:", allTickets.length);

        populateFilterOptions();

        resetLocalFilters();

        renderDashboard();

    } catch (error) {

        console.error("Error loading tickets:", error);

    }
}


// =====================================================
// EVENT LISTENERS
// =====================================================

function setupEventListeners() {

    // Search
    const searchInput =
        document.getElementById("search-input");

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            renderDashboard();

        });

    }


    // Refresh
    const refreshButton =
        document.getElementById("refresh-button");

    if (refreshButton) {

        refreshButton.addEventListener("click", async () => {

            refreshButton.disabled = true;

            refreshButton.textContent = "Refreshing...";

            await loadTickets();

            refreshButton.disabled = false;

            refreshButton.textContent = "Refresh";

        });

    }


    // Global filters

    const globalStatus =
        document.getElementById("global-status");

    if (globalStatus) {

        globalStatus.addEventListener("change", () => {

            globalFilters.status =
                globalStatus.value;

            renderDashboard();

        });

    }


    const globalPriority =
        document.getElementById("global-priority");

    if (globalPriority) {

        globalPriority.addEventListener("change", () => {

            globalFilters.priority =
                globalPriority.value;

            renderDashboard();

        });

    }


    const globalType =
        document.getElementById("global-type");

    if (globalType) {

        globalType.addEventListener("change", () => {

            globalFilters.type =
                globalType.value;

            renderDashboard();

        });

    }


    const globalAssignee =
        document.getElementById("global-assignee");

    if (globalAssignee) {

        globalAssignee.addEventListener("change", () => {

            globalFilters.assignee =
                globalAssignee.value;

            renderDashboard();

        });

    }


    // Clear global filters

    const clearGlobal =
        document.getElementById("clear-global-filters");

    if (clearGlobal) {

        clearGlobal.addEventListener("click", () => {

            globalFilters = {
                status: "ALL",
                priority: "ALL",
                type: "ALL",
                assignee: "ALL"
            };

            setSelectValue("global-status", "ALL");
            setSelectValue("global-priority", "ALL");
            setSelectValue("global-type", "ALL");
            setSelectValue("global-assignee", "ALL");

            renderDashboard();

        });

    }


    // KPI cards

    document.querySelectorAll(".kpi-card")
        .forEach(card => {

            card.addEventListener("click", () => {

                const value =
                    card.dataset.kpiFilter || "ALL";

                localFilters.kpiStatus = value;

                renderTable();

            });

        });


    // Local chart filters

    setupLocalFilter(
        "status-local-filter",
        "statusChart"
    );

    setupLocalFilter(
        "priority-local-filter",
        "priorityChart"
    );

    setupLocalFilter(
        "type-local-filter",
        "typeChart"
    );

    setupLocalFilter(
        "assignee-local-filter",
        "assigneeChart"
    );


    // Recently updated filter

    setupLocalFilter(
        "recent-local-filter",
        "recentStatus"
    );


    // Table filters

    setupLocalFilter(
        "table-status-filter",
        "tableStatus"
    );

    setupLocalFilter(
        "table-priority-filter",
        "tablePriority"
    );

    setupLocalFilter(
        "table-type-filter",
        "tableType"
    );


    // Close drawer

    const closeDrawer =
        document.getElementById("close-drawer");

    if (closeDrawer) {

        closeDrawer.addEventListener("click", () => {

            closeTicketDrawer();

        });

    }


    // Click outside drawer

    const drawer =
        document.getElementById("ticket-drawer");

    if (drawer) {

        drawer.addEventListener("click", (event) => {

            if (event.target === drawer) {

                closeTicketDrawer();

            }

        });

    }

}


// =====================================================
// LOCAL FILTER HELPER
// =====================================================

function setupLocalFilter(elementId, filterName) {

    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.addEventListener("change", () => {

        localFilters[filterName] =
            element.value;

        renderDashboard();

    });

}


// =====================================================
// POPULATE FILTER OPTIONS
// =====================================================

function populateFilterOptions() {

    const statuses =
        uniqueValues(allTickets, "status");

    const priorities =
        uniqueValues(allTickets, "priority");

    const types =
        uniqueValues(allTickets, "type");

    const assignees =
        uniqueValues(allTickets, "assignee");


    populateSelect(
        "global-status",
        statuses,
        "All"
    );

    populateSelect(
        "global-priority",
        priorities,
        "All"
    );

    populateSelect(
        "global-type",
        types,
        "All"
    );

    populateSelect(
        "global-assignee",
        assignees,
        "All"
    );


    populateSelect(
        "status-local-filter",
        statuses,
        "All"
    );

    populateSelect(
        "priority-local-filter",
        priorities,
        "All"
    );

    populateSelect(
        "type-local-filter",
        types,
        "All"
    );

    populateSelect(
        "assignee-local-filter",
        assignees,
        "All"
    );


    populateSelect(
        "table-status-filter",
        statuses,
        "All Status"
    );

    populateSelect(
        "table-priority-filter",
        priorities,
        "All Priorities"
    );

    populateSelect(
        "table-type-filter",
        types,
        "All Types"
    );


    const recentFilter =
        document.getElementById(
            "recent-local-filter"
        );

    if (recentFilter) {

        recentFilter.innerHTML = `
            <option value="ALL">
                All Status
            </option>
            ${statuses.map(value => `
                <option value="${escapeHtml(value)}">
                    ${escapeHtml(value)}
                </option>
            `).join("")}
        `;

    }

}


function populateSelect(
    elementId,
    values,
    allLabel
) {

    const select =
        document.getElementById(elementId);

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "ALL";
    allOption.textContent = allLabel;

    select.appendChild(allOption);


    values.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

}


function uniqueValues(tickets, field) {

    return [
        ...new Set(
            tickets
                .map(ticket => ticket[field])
                .filter(value =>
                    value !== null &&
                    value !== undefined &&
                    String(value).trim() !== ""
                )
                .map(value => String(value))
        )
    ].sort();

}


// =====================================================
// RESET LOCAL FILTERS
// =====================================================

function resetLocalFilters() {

    localFilters = {
        kpiStatus: "ALL",

        statusChart: "ALL",
        priorityChart: "ALL",
        typeChart: "ALL",
        assigneeChart: "ALL",

        recentStatus: "ALL",

        tableStatus: "ALL",
        tablePriority: "ALL",
        tableType: "ALL"
    };

}


// =====================================================
// GLOBAL FILTERING
// =====================================================

function getGlobalTickets() {

    const searchInput =
        document.getElementById("search-input");

    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";


    return allTickets.filter(ticket => {

        // Status
        if (
            globalFilters.status !== "ALL" &&
            ticket.status !== globalFilters.status
        ) {
            return false;
        }


        // Priority
        if (
            globalFilters.priority !== "ALL" &&
            ticket.priority !== globalFilters.priority
        ) {
            return false;
        }


        // Type
        if (
            globalFilters.type !== "ALL" &&
            ticket.type !== globalFilters.type
        ) {
            return false;
        }


        // Assignee
        if (
            globalFilters.assignee !== "ALL" &&
            ticket.assignee !== globalFilters.assignee
        ) {
            return false;
        }


        // Search
        if (searchText !== "") {

            const searchableText = [

                ticket.jira_key,
                ticket.summary,
                ticket.status,
                ticket.priority,
                ticket.type,
                ticket.assignee,
                ticket.group

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            if (!searchableText.includes(searchText)) {

                return false;

            }

        }


        return true;

    });

}


// =====================================================
// MAIN DASHBOARD
// =====================================================

function renderDashboard() {

    const tickets =
        getGlobalTickets();


    renderKPIs(tickets);

    renderStatusChart(tickets);

    renderPriorityChart(tickets);

    renderTypeChart(tickets);

    renderAssigneeChart(tickets);

    renderRecentlyUpdated(tickets);

    renderTable(tickets);

}


// =====================================================
// KPI
// =====================================================

function renderKPIs(tickets) {

    const total =
        tickets.length;

    const open =
        tickets.filter(
            ticket => ticket.status === "Open"
        ).length;

    const incoming =
        tickets.filter(
            ticket => ticket.status === "Incoming"
        ).length;

    const accepted =
        tickets.filter(
            ticket => ticket.status === "Accepted"
        ).length;


    setText(
        "total-tickets",
        total
    );

    setText(
        "open-tickets",
        open
    );

    setText(
        "incoming-tickets",
        incoming
    );

    setText(
        "accepted-tickets",
        accepted
    );

}


// =====================================================
// STATUS CHART
// =====================================================

function renderStatusChart(tickets) {

    const data =
        buildChartData(
            tickets,
            "status"
        );


    renderDonut(
        "status-chart",
        data,
        "label",
        localFilters.statusChart
    );


    renderChartDetails(
        "status-chart",
        tickets,
        "status",
        localFilters.statusChart,
        "Status"
    );

}


// =====================================================
// PRIORITY CHART
// =====================================================

function renderPriorityChart(tickets) {

    const data =
        buildChartData(
            tickets,
            "priority"
        );


    renderDonut(
        "priority-chart",
        data,
        "label",
        localFilters.priorityChart
    );


    renderChartDetails(
        "priority-chart",
        tickets,
        "priority",
        localFilters.priorityChart,
        "Priority"
    );

}


// =====================================================
// TYPE CHART
// =====================================================

function renderTypeChart(tickets) {

    const data =
        buildChartData(
            tickets,
            "type"
        );


    renderDonut(
        "type-chart",
        data,
        "label",
        localFilters.typeChart
    );


    renderChartDetails(
        "type-chart",
        tickets,
        "type",
        localFilters.typeChart,
        "Type"
    );

}


// =====================================================
// ASSIGNEE CHART
// =====================================================

function renderAssigneeChart(tickets) {

    const data =
        buildChartData(
            tickets,
            "assignee"
        );


    renderDonut(
        "assignee-chart",
        data,
        "label",
        localFilters.assigneeChart
    );


    renderChartDetails(
        "assignee-chart",
        tickets,
        "assignee",
        localFilters.assigneeChart,
        "Resource"
    );

}


// =====================================================
// BUILD CHART DATA
// =====================================================

function buildChartData(tickets, field) {

    const counts = {};

    tickets.forEach(ticket => {

        let value =
            ticket[field];

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            value = "Unknown";

        }

        value = String(value);

        if (!counts[value]) {

            counts[value] = 0;

        }

        counts[value]++;

    });


    return Object.entries(counts)
        .map(([label, count]) => ({
            label: label,
            count: count
        }))
        .sort((a, b) => b.count - a.count);

}


// =====================================================
// DONUT CHART
// =====================================================

function renderDonut(
    containerId,
    data,
    labelKey,
    selectedValue
) {

    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }


    container.innerHTML = "";


    // IMPORTANT:
    // Always make sure data is an ARRAY.
    // This fixes your data.reduce() error.

    if (!Array.isArray(data)) {

        console.error(
            "renderDonut expected array:",
            data
        );

        return;

    }


    if (data.length === 0) {

        container.innerHTML = `
            <div class="no-chart-data">
                No data available
            </div>
        `;

        return;

    }


    const total =
        data.reduce(
            (sum, item) =>
                sum + Number(item.count || 0),
            0
        );


    if (total === 0) {

        container.innerHTML = `
            <div class="no-chart-data">
                No data available
            </div>
        `;

        return;

    }


    const wrapper =
        document.createElement("div");

    wrapper.className =
        "donut-wrapper";


    const donut =
        document.createElement("div");

    donut.className =
        "donut";


    let currentPercent = 0;

    const segments = [];


    data.forEach((item, index) => {

        const count =
            Number(item.count || 0);

        const percent =
            (count / total) * 100;

        const start =
            currentPercent;

        const end =
            currentPercent + percent;


        segments.push({

            name:
                String(item[labelKey]),

            count:
                count,

            percent:
                percent,

            start:
                start,

            end:
                end,

            color:
                chartColors[
                    index % chartColors.length
                ]

        });


        currentPercent =
            end;

    });


    // Create gradient

    const gradient =
        segments.map(segment => {

            return `${segment.color} ${segment.start}% ${segment.end}%`;

        }).join(", ");


    donut.style.background =
        `conic-gradient(${gradient})`;


    // -------------------------------
    // CENTER
    // -------------------------------

    const center =
        document.createElement("div");

    center.className =
        "donut-center";


    const totalElement =
        document.createElement("div");

    totalElement.className =
        "donut-total";


    const labelElement =
        document.createElement("div");

    labelElement.className =
        "donut-label";


    if (
        selectedValue &&
        selectedValue !== "ALL"
    ) {

        const selected =
            segments.find(
                segment =>
                    segment.name === selectedValue
            );


        if (selected) {

            totalElement.textContent =
                selected.count;

            labelElement.textContent =
                selected.name;

        } else {

            totalElement.textContent =
                total;

            labelElement.textContent =
                "Tickets";

        }

    } else {

        totalElement.textContent =
            total;

        labelElement.textContent =
            "Tickets";

    }


    center.appendChild(
        totalElement
    );

    center.appendChild(
        labelElement
    );


    donut.appendChild(
        center
    );


    wrapper.appendChild(
        donut
    );


    // -------------------------------
    // LEGEND
    // -------------------------------

    const legend =
        document.createElement("div");

    legend.className =
        "chart-legend";


    segments.forEach(segment => {

        const item =
            document.createElement("div");

        item.className =
            "legend-item";


        if (
            selectedValue ===
            segment.name
        ) {

            item.classList.add(
                "selected-legend"
            );

        }


        const dot =
            document.createElement("span");

        dot.className =
            "legend-dot";

        dot.style.background =
            segment.color;


        const name =
            document.createElement("span");

        name.className =
            "legend-name";

        name.textContent =
            segment.name;


        const count =
            document.createElement("span");

        count.className =
            "legend-count";

        count.textContent =
            segment.count;


        const percent =
            document.createElement("span");

        percent.className =
            "legend-percent";

        percent.textContent =
            `${segment.percent.toFixed(1)}%`;


        item.appendChild(dot);

        item.appendChild(name);

        item.appendChild(count);

        item.appendChild(percent);


        // Legend click

        item.addEventListener(
            "click",
            () => {

                selectChartSegment(
                    containerId,
                    segment.name
                );

            }
        );


        legend.appendChild(
            item
        );

    });


    wrapper.appendChild(
        legend
    );


    container.appendChild(
        wrapper
    );


    // -------------------------------
    // PIE HOVER
    // -------------------------------

    donut.addEventListener(
        "mousemove",
        event => {

            const rect =
                donut.getBoundingClientRect();


            const centerX =
                rect.left +
                rect.width / 2;


            const centerY =
                rect.top +
                rect.height / 2;


            const x =
                event.clientX -
                centerX;


            const y =
                event.clientY -
                centerY;


            const distance =
                Math.sqrt(
                    x * x +
                    y * y
                );


            // Ignore center hole

            if (distance < 55) {

                removeChartTooltip();

                return;

            }


            let angle =
                Math.atan2(y, x) *
                180 /
                Math.PI;


            angle += 90;


            if (angle < 0) {

                angle += 360;

            }


            const position =
                (angle / 360) * 100;


            const segment =
                segments.find(
                    item =>
                        position >= item.start &&
                        position < item.end
                );


            if (!segment) {
                return;
            }


            showChartTooltip(
                event.clientX,
                event.clientY,
                segment.name,
                segment.count,
                segment.percent
            );

        }
    );


    donut.addEventListener(
        "mouseleave",
        () => {

            removeChartTooltip();

        }
    );


    // -------------------------------
    // PIE CLICK
    // -------------------------------

    donut.addEventListener(
        "click",
        event => {

            const rect =
                donut.getBoundingClientRect();


            const centerX =
                rect.left +
                rect.width / 2;


            const centerY =
                rect.top +
                rect.height / 2;


            const x =
                event.clientX -
                centerX;


            const y =
                event.clientY -
                centerY;


            const distance =
                Math.sqrt(
                    x * x +
                    y * y
                );


            // Don't select center

            if (distance < 55) {
                return;
            }


            let angle =
                Math.atan2(y, x) *
                180 /
                Math.PI;


            angle += 90;


            if (angle < 0) {
                angle += 360;
            }


            const position =
                (angle / 360) * 100;


            const segment =
                segments.find(
                    item =>
                        position >= item.start &&
                        position < item.end
                );


            if (!segment) {
                return;
            }


            removeChartTooltip();


            selectChartSegment(
                containerId,
                segment.name
            );

        }
    );

}


// =====================================================
// CHART SELECTION
// =====================================================

function selectChartSegment(
    containerId,
    value
) {

    const filterMap = {

        "status-chart":
            "statusChart",

        "priority-chart":
            "priorityChart",

        "type-chart":
            "typeChart",

        "assignee-chart":
            "assigneeChart"

    };


    const filterName =
        filterMap[containerId];


    if (!filterName) {
        return;
    }


    // Click same slice again
    // -> clear selection

    if (
        localFilters[filterName] ===
        value
    ) {

        localFilters[filterName] =
            "ALL";

    } else {

        localFilters[filterName] =
            value;

    }


    renderDashboard();

}



// =====================================================
// CHART DETAIL DATA
// Shows ONLY Jira IDs when a pie slice is selected
// =====================================================

function renderChartDetails(
    chartId,
    tickets,
    field,
    selectedValue,
    title
) {

    const detailsId =
        `${chartId}-details`;


    let details =
        document.getElementById(detailsId);


    // Create details container automatically
    // if it does not already exist.

    if (!details) {

        details =
            document.createElement("div");

        details.id =
            detailsId;

        details.className =
            "chart-details";


        const chart =
            document.getElementById(chartId);


        if (chart) {

            chart.parentElement.appendChild(
                details
            );

        }

    }


    if (!details) {
        return;
    }


    // Clear previous details

    details.innerHTML = "";


    // Nothing selected
    // Keep the detail area hidden.

    if (
        !selectedValue ||
        selectedValue === "ALL"
    ) {

        details.style.display = "none";

        return;

    }


    // Find tickets belonging to
    // the selected chart segment.

    const matchingTickets =
        tickets.filter(ticket => {

            const value =
                ticket[field] || "Unknown";

            return String(value) ===
                String(selectedValue);

        });


    if (matchingTickets.length === 0) {

        details.innerHTML = `
            <div class="chart-details-empty">
                No tickets found.
            </div>
        `;

        details.style.display = "block";

        return;

    }


    // =================================================
    // HEADING
    // =================================================

    const heading =
        document.createElement("div");

    heading.className =
        "chart-details-heading";


    heading.innerHTML = `
        <strong>
            ${escapeHtml(selectedValue)}
        </strong>

        <span>
            ${matchingTickets.length}
            ticket${matchingTickets.length !== 1 ? "s" : ""}
        </span>
    `;


    details.appendChild(
        heading
    );


    // =================================================
    // JIRA ID LIST
    // =================================================

    const list =
        document.createElement("div");

    list.className =
        "chart-details-list";


    matchingTickets.forEach(ticket => {

        const row =
            document.createElement("div");

        row.className =
            "chart-detail-ticket";


        // Create Jira link

        const jiraLink =
            document.createElement("a");


        jiraLink.className =
            "chart-ticket-key";


        jiraLink.textContent =
            ticket.jira_key || "-";


        // Open actual Jira URL

        if (ticket.jira_url) {

            jiraLink.href =
                ticket.jira_url;

            jiraLink.target =
                "_blank";

            jiraLink.rel =
                "noopener noreferrer";

        }
        else {

            jiraLink.href =
                "#";

            jiraLink.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                }
            );

        }


        row.appendChild(
            jiraLink
        );


        list.appendChild(
            row
        );

    });


    details.appendChild(
        list
    );


    // Show details only after
    // a chart segment is selected.

    details.style.display = "block";

}

// =====================================================
// TOOLTIP
// =====================================================

function showChartTooltip(
    x,
    y,
    name,
    count,
    percent
) {

    removeChartTooltip();


    const tooltip =
        document.createElement("div");

    tooltip.id =
        "active-chart-tooltip";

    tooltip.className =
        "chart-tooltip";


    tooltip.innerHTML = `
        <strong>
            ${escapeHtml(name)}
        </strong>
        <br>
        ${count} tickets
        <br>
        ${percent.toFixed(1)}%
    `;


    document.body.appendChild(
        tooltip
    );


    tooltip.style.left =
        `${x + 12}px`;

    tooltip.style.top =
        `${y + 12}px`;

}


function removeChartTooltip() {

    const tooltip =
        document.getElementById(
            "active-chart-tooltip"
        );


    if (tooltip) {

        tooltip.remove();

    }

}


// =====================================================
// RECENTLY UPDATED
// =====================================================

function renderRecentlyUpdated(tickets) {

    const container =
        document.getElementById(
            "recent-tickets"
        );


    if (!container) {
        return;
    }


    let filtered =
        [...tickets];


    if (
        localFilters.recentStatus !==
        "ALL"
    ) {

        filtered =
            filtered.filter(
                ticket =>
                    ticket.status ===
                    localFilters.recentStatus
            );

    }


    filtered.sort(
        (a, b) =>
            new Date(
                b.updated_at || 0
            ) -
            new Date(
                a.updated_at || 0
            )
    );


    const recent =
        filtered.slice(0, 5);


    container.innerHTML = "";


    if (recent.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No recently updated tickets.
            </div>
        `;

        return;

    }


    recent.forEach(ticket => {

        const item =
            document.createElement("div");

        item.className =
            "recent-ticket";


        item.innerHTML = `

            <div>

                <button
                    class="recent-key"
                    type="button"
                >
                    ${escapeHtml(
                        ticket.jira_key || "-"
                    )}
                </button>

                <div class="recent-summary">
                    ${escapeHtml(
                        ticket.summary || "-"
                    )}
                </div>

            </div>

            <div class="recent-date">

                ${formatDate(
                    ticket.updated_at
                )}

            </div>
        `;


        const key =
            item.querySelector(
                ".recent-key"
            );


        if (key) {

            key.addEventListener(
                "click",
                () => {

                    openTicketDrawer(ticket);

                }
            );

        }


        container.appendChild(
            item
        );

    });

}


// =====================================================
// TABLE
// =====================================================


function renderTable(
    providedTickets = null
) {

    const tbody =
        document.getElementById(
            "ticket-table-body"
        );


    if (!tbody) {
        return;
    }


    let tickets =
        providedTickets ||
        getGlobalTickets();


    // =================================================
    // KPI FILTER
    // =================================================

    if (
        localFilters.kpiStatus !==
        "ALL"
    ) {

        tickets =
            tickets.filter(
                ticket =>
                    ticket.status ===
                    localFilters.kpiStatus
            );

    }


    // =================================================
    // TABLE STATUS FILTER
    // =================================================

    if (
        localFilters.tableStatus !==
        "ALL"
    ) {

        tickets =
            tickets.filter(
                ticket =>
                    ticket.status ===
                    localFilters.tableStatus
            );

    }


    // =================================================
    // TABLE PRIORITY FILTER
    // =================================================

    if (
        localFilters.tablePriority !==
        "ALL"
    ) {

        tickets =
            tickets.filter(
                ticket =>
                    ticket.priority ===
                    localFilters.tablePriority
            );

    }


    // =================================================
    // TABLE TYPE FILTER
    // =================================================

    if (
        localFilters.tableType !==
        "ALL"
    ) {

        tickets =
            tickets.filter(
                ticket =>
                    ticket.type ===
                    localFilters.tableType
            );

    }


    // =================================================
    // SORT BY UPDATED DATE
    // =================================================

    tickets.sort(
        (a, b) =>
            new Date(
                b.updated_at || 0
            ) -
            new Date(
                a.updated_at || 0
            )
    );


    // =================================================
    // UPDATE TICKET COUNT
    // =================================================

    const countElement =
        document.getElementById(
            "filtered-count"
        );


    if (countElement) {

        countElement.textContent =
            `${tickets.length} tickets`;

    }


    // =================================================
    // CLEAR OLD TABLE DATA
    // =================================================

    tbody.innerHTML = "";


    // =================================================
    // NO TICKETS
    // =================================================

    if (tickets.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-table"
                >
                    No tickets found.
                </td>
            </tr>
        `;

        return;

    }


    // =================================================
    // CREATE TABLE ROWS
    // =================================================

    tickets.forEach(ticket => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <!-- Jira Key -->

            <td>

                ${
                    ticket.jira_url
                        ? `
                            <a
                                class="table-ticket-key"
                                href="${escapeAttribute(
                                    ticket.jira_url
                                )}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                ${escapeHtml(
                                    ticket.jira_key || "-"
                                )}
                            </a>
                        `
                        : `
                            <span
                                class="table-ticket-key"
                            >
                                ${escapeHtml(
                                    ticket.jira_key || "-"
                                )}
                            </span>
                        `
                }

            </td>


            <!-- Summary -->

            <td>
                ${escapeHtml(
                    ticket.summary || "-"
                )}
            </td>


            <!-- Status -->

            <td>
                ${escapeHtml(
                    ticket.status || "-"
                )}
            </td>


            <!-- Priority -->

            <td>
                ${escapeHtml(
                    ticket.priority || "-"
                )}
            </td>


            <!-- Type -->

            <td>
                ${escapeHtml(
                    ticket.type || "-"
                )}
            </td>


            <!-- Assignee -->

            <td>
                ${escapeHtml(
                    ticket.assignee || "-"
                )}
            </td>


            <!-- Updated -->

            <td>
                ${formatDate(
                    ticket.updated_at
                )}
            </td>

        `;


        // =================================================
        // ADD ROW TO TABLE
        // =================================================

        tbody.appendChild(
            row
        );

    });

}

// =====================================================
// TICKET DRAWER
// =====================================================

function openTicketDrawer(ticket) {

    const drawer =
        document.getElementById(
            "ticket-drawer"
        );


    const details =
        document.getElementById(
            "ticket-details"
        );


    if (!drawer || !details) {
        return;
    }


    details.innerHTML = `

        <div class="ticket-detail-row">
            <strong>Jira Key</strong>
            <span>
                ${escapeHtml(
                    ticket.jira_key || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Summary</strong>
            <span>
                ${escapeHtml(
                    ticket.summary || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Status</strong>
            <span>
                ${escapeHtml(
                    ticket.status || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Priority</strong>
            <span>
                ${escapeHtml(
                    ticket.priority || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Type</strong>
            <span>
                ${escapeHtml(
                    ticket.type || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Assignee</strong>
            <span>
                ${escapeHtml(
                    ticket.assignee || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Creator</strong>
            <span>
                ${escapeHtml(
                    ticket.creator || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Reporter</strong>
            <span>
                ${escapeHtml(
                    ticket.reporter || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Group</strong>
            <span>
                ${escapeHtml(
                    ticket.group || "-"
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Created</strong>
            <span>
                ${formatDate(
                    ticket.created_at
                )}
            </span>
        </div>

        <div class="ticket-detail-row">
            <strong>Updated</strong>
            <span>
                ${formatDate(
                    ticket.updated_at
                )}
            </span>
        </div>

        ${
            ticket.jira_url
                ? `
                    <div class="ticket-detail-link">
                        <a
                            href="${escapeAttribute(
                                ticket.jira_url
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open in Jira
                        </a>
                    </div>
                `
                : ""
        }

    `;


    drawer.classList.add(
        "open"
    );

}


function closeTicketDrawer() {

    const drawer =
        document.getElementById(
            "ticket-drawer"
        );


    if (drawer) {

        drawer.classList.remove(
            "open"
        );

    }

}


// =====================================================
// HELPERS
// =====================================================

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;

    }

}


function setSelectValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.value =
            value;

    }

}


function formatDate(value) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {
        return String(value);
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}